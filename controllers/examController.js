// back-end/controllers/examController.js
const mongoose = require('mongoose');
const TimedExamAttempt = require('../models/TimedExamAttempt');
const Question = require('../models/Question'); // Assume it's needed for other functions or future use
const AcademicLevel = require('../models/AcademicLevel');
const Track = require('../models/Track');
const Subject = require('../models/Subject');
const { generateFullExamSetData } = require('../utils/aiTimedExamGenerator');
const { setGeminiApiUrl, GEMINI_API_KEY, extractCleanJsonString: extractCleanJsonStringShared } = require('../utils/aiGeneralQuestionGeneratorShared');

const DEFAULT_NUMBER_OF_PROBLEMS = 4;
const DEFAULT_TIME_LIMIT_MINUTES_FULL_EXAM = 120;

const mapLevelToArabic = (levelApiValue) => {
    const mapping = { 'Facile': 'سهل', 'Moyen': 'متوسط', 'Difficile': 'صعب' };
    return mapping[levelApiValue] || levelApiValue;
};
const mapLevelToApiValue = (levelDbValue) => {
    const mapping = { 'سهل': 'Facile', 'متوسط': 'Moyen', 'صعب': 'Difficile' };
    return mapping[levelDbValue] || levelDbValue;
};

async function gradeSubQuestionAnswerWithAI(problemContext, subQuestionText, subQuestionPoints, userAnswerText, subjectName, language = "fr") {
    const currentGeminiApiUrlForGrading = setGeminiApiUrl('gemini-1.5-flash-latest');

    console.log(`[AI_GRADE_SUB_Q] Grading: Context="${problemContext ? problemContext.substring(0,30) : 'N/A'}...", SubQ: "${subQuestionText ? subQuestionText.substring(0,30) : 'N/A'}...", UserAns: "${userAnswerText ? userAnswerText.substring(0,30) : 'N/A'}...", Points: ${subQuestionPoints}`);

    if (!GEMINI_API_KEY || !currentGeminiApiUrlForGrading) {
        console.error("[AI_GRADE_FATAL] Missing API Key or URL for grading.");
        return { awardedPoints: 0, feedback: "Grading service configuration error." };
    }
    if (!userAnswerText || userAnswerText.trim() === "") {
        return { awardedPoints: 0, feedback: language === "ar" ? "لم يقدم الطالب إجابة." : "No answer provided by the student." };
    }

    const langInstructionForFeedback = language === "ar" ? "التقييم يجب أن يكون حصريًا باللغة العربية الفصحى."
                                       : language === "en" ? "The feedback MUST BE EXCLUSIVELY IN ENGLISH."
                                       : "Le feedback doit être EXCLUSIVEMENT EN FRANÇAIS.";

    const gradingPrompt = `
You are an expert AI grader for ${subjectName} exams (Moroccan curriculum), focusing on ${language === "ar" ? "Arabic" : "French"} language content.
Your task is to evaluate the student's answer to the sub-question, considering the overall problem context.

Problem Context (énoncé principal du problème): "${problemContext}"

Sub-Question (Barème: ${subQuestionPoints} points): "${subQuestionText}"

Student's Answer: "${userAnswerText}"

GRADING CRITERIA:
- Accuracy and correctness of the information.
- Completeness of the answer regarding what the sub-question asks.
- Clarity and coherence of the explanation or calculation.
- Relevance of the answer to the sub-question and problem context.

INSTRUCTIONS:
1.  Provide concise and constructive feedback (2-4 sentences maximum). This feedback should help the student understand their mistakes or areas for improvement.
2.  Award points based on the quality of the answer, from 0 to ${subQuestionPoints}. Be fair and consistent. Partial credit is allowed and encouraged for partially correct or incomplete answers.
3.  ${langInstructionForFeedback}

STRICT OUTPUT FORMAT (JSON object ONLY. Do NOT wrap the JSON in markdown backticks like \`\`\`json ... \`\`\`):
{
  "awardedPoints": <number_from_0_to_${subQuestionPoints}>,
  "feedback": "Your concise feedback here, in the specified language."
}
Example of a good feedback if the answer is partially correct:
"Votre démarche est correcte pour la première partie, mais vous avez omis de considérer l'effet de X. L'application de la formule Y aurait permis d'obtenir le résultat complet." (Award partial points)

Example if incorrect:
"L'approche utilisée n'est pas adaptée pour résoudre cette question. Il fallait plutôt appliquer le théorème de Z et considérer les conditions initiales..." (Award 0 or few points depending on any marginal correctness)
`;

    let rawResponseBodyTextForErrorLogging = "";
    try {
        const fetchOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: gradingPrompt }] }],
                generationConfig: { temperature: 0.3, maxOutputTokens: 768, responseMimeType: "application/json" },
                safetySettings: [
                    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                    { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                    { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                    { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                ]
            }),
        };
        const response = await fetch(currentGeminiApiUrlForGrading, fetchOptions);
        rawResponseBodyTextForErrorLogging = await response.text();

        if (!response.ok) {
            console.error(`[AI_GRADE_SUB_Q_ERROR] Gemini API request FAILED. Status: ${response.status}. Body: ${rawResponseBodyTextForErrorLogging.substring(0, 300)}`);
            return { awardedPoints: 0, feedback: `AI grading service error (Status: ${response.status}). Response: ${rawResponseBodyTextForErrorLogging.substring(0,100)}` };
        }
        
        let gradingResult;
        try {
            console.log("[AI_GRADE_SUB_Q_DEBUG] Raw response body for grading:", rawResponseBodyTextForErrorLogging);
            const parsedJsonResponse = JSON.parse(rawResponseBodyTextForErrorLogging);

            if (typeof parsedJsonResponse.awardedPoints === 'number' && typeof parsedJsonResponse.feedback === 'string') {
                gradingResult = parsedJsonResponse;
            } else if (parsedJsonResponse.candidates && parsedJsonResponse.candidates[0]?.content?.parts?.[0]?.text) {
                let aiTextContent = parsedJsonResponse.candidates[0].content.parts[0].text;
                console.log("[AI_GRADE_SUB_Q_DEBUG] Text content from Gemini structure:", aiTextContent);
                const markdownMatch = aiTextContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/s);
                if (markdownMatch && markdownMatch[1]) {
                    aiTextContent = markdownMatch[1].trim();
                }
                gradingResult = JSON.parse(aiTextContent);
            } else if (parsedJsonResponse.promptFeedback?.blockReason) {
                console.error(`[AI_GRADE_SUB_Q_BLOCKED] Prompt BLOCKED. Reason: ${parsedJsonResponse.promptFeedback.blockReason}`);
                return { awardedPoints: 0, feedback: `AI grading blocked. Reason: ${parsedJsonResponse.promptFeedback.blockReason}` };
            } else {
                 throw new Error("Unexpected API response structure after initial parse.");
            }

        } catch (initialParseError) {
            console.warn(`[AI_GRADE_SUB_Q_WARN] Initial JSON.parse failed ('${initialParseError.message}'). Attempting to extract from potential markdown block in raw text: ${rawResponseBodyTextForErrorLogging.substring(0,100)}...`);
            try {
                const cleanJsonString = extractCleanJsonStringShared(rawResponseBodyTextForErrorLogging);
                gradingResult = JSON.parse(cleanJsonString);
                console.log("[AI_GRADE_SUB_Q_DEBUG] Successfully parsed using extractCleanJsonStringShared.");
            } catch (fallbackParseError) {
                console.error(`[AI_GRADE_SUB_Q_JSON_EXTRACT_FAIL_FINAL] Failed to extract or parse JSON content even with fallback. Error: ${fallbackParseError.message}. Raw response: ${rawResponseBodyTextForErrorLogging.substring(0,500)}`);
                return { awardedPoints: 0, feedback: "AI grading response format error (could not parse JSON)." };
            }
        }

        if (!gradingResult || typeof gradingResult.awardedPoints !== 'number' || typeof gradingResult.feedback !== 'string' || gradingResult.awardedPoints < 0 || gradingResult.awardedPoints > subQuestionPoints) {
            console.error("[AI_GRADE_SUB_Q_MALFORMED] Grading JSON from AI is malformed, points out of range, or structure incorrect. Data:", gradingResult, "Raw text was:", rawResponseBodyTextForErrorLogging.substring(0,300));
            return { awardedPoints: 0, feedback: "Automated grading failed to process the AI response format. Please check server logs." };
        }
        console.log(`[AI_GRADE_SUB_Q_SUCCESS] SubQ Graded. Points: ${gradingResult.awardedPoints}/${subQuestionPoints}, Feedback: ${gradingResult.feedback.substring(0,50)}...`);
        return gradingResult;

    } catch (error) {
        console.error(`[AI_GRADE_SUB_Q_CATCH_ERROR] Error during AI grading: ${error.message}. Raw AI Response (start): ${rawResponseBodyTextForErrorLogging.substring(0,300)}`);
        console.error(error.stack);
        return { awardedPoints: 0, feedback: `Error during automated grading: ${error.message.substring(0,100)}` };
    }
}

// 1. Start a new Timed Exam (Full Exam with Multiple Problems)
const startExam = async (req, res) => {
    const userId = req.user._id;
    const { academicLevelId, trackId, subjectId, difficulty: difficultyApiValue } = req.body;

    const numberOfProblems = parseInt(req.body.numberOfProblems) || DEFAULT_NUMBER_OF_PROBLEMS;
    const timeLimitMinutes = parseInt(req.body.timeLimitMinutes) || DEFAULT_TIME_LIMIT_MINUTES_FULL_EXAM;

    console.log(`[EXAM_CTRL_START_FULL_EXAM] User ${userId} starting. Params: Lvl=${academicLevelId}, Trk=${trackId}, Sub=${subjectId}, DiffAPI=${difficultyApiValue}, NumProblems=${numberOfProblems}, Time=${timeLimitMinutes}min`);

    if (!academicLevelId || !trackId || !subjectId || !difficultyApiValue) {
        return res.status(400).json({ message: "Academic level, track, subject, and difficulty are required." });
    }
    const difficultyForDb = mapLevelToArabic(difficultyApiValue);
    if (!['سهل', 'متوسط', 'صعب'].includes(difficultyForDb)) {
        return res.status(400).json({ message: "Invalid difficulty value." });
    }

    try {
        const generatedProblemsData = await generateFullExamSetData(
            academicLevelId,
            trackId,
            subjectId,
            difficultyApiValue,
            numberOfProblems
        );

        if (!generatedProblemsData || generatedProblemsData.length === 0) {
            console.error("[EXAM_CTRL_START_FULL_EXAM_ERROR] No problems data was generated for the exam.");
            return res.status(500).json({ message: "Failed to generate any problems data for the exam. Please try again." });
        }

        console.log(`[EXAM_CTRL_START_FULL_EXAM] Successfully generated data for ${generatedProblemsData.length} problems.`);

        let overallTotalPossibleRawScore = 0;
        const problemsForAttempt = generatedProblemsData.map((problemData, index) => {
            if (typeof problemData.totalPoints !== 'number' || problemData.totalPoints <= 0) {
                console.warn(`[EXAM_CTRL_START_WARN] Problem data (index: ${index}) has invalid or zero totalPoints: ${problemData.totalPoints}. Recalculating from subQuestions.`);
                problemData.totalPoints = problemData.subQuestions.reduce((sum, sq) => sum + (sq.points || 0), 0);
                if (problemData.totalPoints === 0 && problemData.subQuestions.length > 0) {
                     console.error(`Problem data (index: ${index}) STILL has 0 total points after recalculation. Problem text: ${problemData.text.substring(0,50)}... This problem might be invalid.`);
                }
            }
            overallTotalPossibleRawScore += problemData.totalPoints;

            const initialSubQAnswers = problemData.subQuestions.map(sq => ({
                subQuestionText: sq.text,
                subQuestionOrderInProblem: sq.difficultyOrder,
                subQuestionPoints: sq.points,
                userAnswer: null,
                aiFeedback: null, // Match with how it's stored in TimedExamAttempt model
                awardedPoints: 0,
            }));

            return {
                problemTitle: problemData.problemTitle,
                problemText: problemData.text,
                problemLesson: problemData.lesson,
                subQuestionsData: problemData.subQuestions, // Store original AI sub-question data
                orderInExam: index + 1,
                subQuestionAnswers: initialSubQAnswers,
                problemRawScore: 0,
                problemTotalPossibleRawScore: problemData.totalPoints,
            };
        });

        const newAttempt = new TimedExamAttempt({
            user: userId,
            academicLevel: academicLevelId,
            track: trackId,
            subject: subjectId,
            difficulty: difficultyForDb,
            problems: problemsForAttempt,
            overallTotalPossibleRawScore,
            timeLimitMinutes,
            status: 'in-progress',
            startTime: new Date(),
            config: {
                numberOfProblems: generatedProblemsData.length,
                difficultyApiValue: difficultyApiValue,
            }
        });

        const savedAttempt = await newAttempt.save();
        console.log(`[EXAM_CTRL_START_FULL_EXAM_SUCCESS] TimedExamAttempt ${savedAttempt._id} created. Overall Possible Score: ${savedAttempt.overallTotalPossibleRawScore}`);

        // Prepare data for the frontend, ensuring each problem has a unique problemId
        const problemsForDisplay = savedAttempt.problems.map(attemptedProblemInDb => {
            // attemptedProblemInDb is an element from the problems array in TimedExamAttempt
            // Mongoose automatically assigns an _id to each subdocument in an array.
            if (!attemptedProblemInDb._id) {
                // This should ideally not happen if the schema is set up correctly for subdocuments.
                // However, to be safe, we log it.
                console.warn(`[EXAM_CTRL_START_WARN] Sub-document for problem order ${attemptedProblemInDb.orderInExam} is missing its own _id. This is unexpected. Falling back to order-based ID.`);
            }
            return {
                // *** USE THE SUBDOCUMENT'S _ID AS PROBLEM ID ***
                problemId: attemptedProblemInDb._id ? attemptedProblemInDb._id.toString() : `problem_order_${attemptedProblemInDb.orderInExam}`,
                problemOrderInExam: attemptedProblemInDb.orderInExam,
                problemTitle: attemptedProblemInDb.problemTitle,
                problemText: attemptedProblemInDb.problemText,
                problemLesson: attemptedProblemInDb.problemLesson,
                problemTotalPossibleScore: attemptedProblemInDb.problemTotalPossibleRawScore,
                subQuestions: attemptedProblemInDb.subQuestionsData.map(sqFromModel => ({
                    // If subQuestionsData elements also have _id (they should if they are proper subdocuments defined in schema)
                    // _id: sqFromModel._id ? sqFromModel._id.toString() : undefined, // Can be added if needed by frontend
                    text: sqFromModel.text,
                    orderInProblem: sqFromModel.difficultyOrder,
                    points: sqFromModel.points,
                })).sort((a, b) => a.orderInProblem - b.orderInProblem),
            };
        }).sort((a,b) => a.problemOrderInExam - b.problemOrderInExam);

        res.status(201).json({
            examAttemptId: savedAttempt._id,
            problems: problemsForDisplay, // Now contains problemId
            timeLimitMinutes: savedAttempt.timeLimitMinutes,
            startTime: savedAttempt.startTime,
            overallTotalPossibleRawScore: savedAttempt.overallTotalPossibleRawScore,
        });

    } catch (error) {
        console.error('[EXAM_CTRL_START_FULL_EXAM_CATCH_ERROR] Error starting exam:', error.message, error.stack);
        if (error.message.includes("AI Service Error") || error.message.includes("Failed to generate any problems data")) {
            return res.status(503).json({ message: `AI Service Error during exam generation: ${error.message}`});
        }
        res.status(500).json({ message: 'Internal Server Error while starting exam.', error: error.message });
    }
};

// ... (submitExam, getExamResults, and other functions remain the same)
// Ensure they are included in your actual file.

const submitExam = async (req, res) => {
    const userId = req.user._id;
    const { examAttemptId } = req.params;
    const { problemAnswers } = req.body;

    console.log(`[EXAM_CTRL_SUBMIT_FULL_EXAM] User ${userId} submitting exam ${examAttemptId}. Received ${problemAnswers ? problemAnswers.length : 0} problem answer sets.`);

    if (!mongoose.Types.ObjectId.isValid(examAttemptId)) {
        return res.status(400).json({ message: "Invalid exam attempt ID format." });
    }
    if (!Array.isArray(problemAnswers)) {
        return res.status(400).json({ message: "problemAnswers should be an array." });
    }

    try {
        const attempt = await TimedExamAttempt.findById(examAttemptId)
            .populate('subject', 'name language');

        if (!attempt) return res.status(404).json({ message: "Exam attempt not found." });
        if (attempt.user.toString() !== userId.toString()) return res.status(403).json({ message: "Not authorized." });
        if (attempt.status !== 'in-progress') return res.status(400).json({ message: `Exam already ${attempt.status}.` });

        attempt.endTime = new Date();
        let overallRawScoreFromGrading = 0;
        const gradingPromises = [];
        let gradingFailedOverall = false;

        for (const attemptedProblem of attempt.problems) {
            // Frontend sends problemOrderInExam. Find the matching answer set.
            const userAnswerSetForThisProblem = problemAnswers.find(pa => pa.problemOrderInExam === attemptedProblem.orderInExam);

            if (userAnswerSetForThisProblem && Array.isArray(userAnswerSetForThisProblem.subQuestionAnswers)) {
                for (const subQUserAnswer of userAnswerSetForThisProblem.subQuestionAnswers) {
                    const subQAttemptSlot = attemptedProblem.subQuestionAnswers.find(
                        slot => slot.subQuestionOrderInProblem === subQUserAnswer.orderInProblem
                    );
                    const originalSubQuestionData = attemptedProblem.subQuestionsData.find(
                        origSq => origSq.difficultyOrder === subQUserAnswer.orderInProblem
                    );

                    if (subQAttemptSlot && originalSubQuestionData) {
                        subQAttemptSlot.userAnswer = subQUserAnswer.userAnswer ? subQUserAnswer.userAnswer.trim() : null;
                        
                        const gradingLanguage = attempt.subject.language || 
                                                (attempt.subject.name.toLowerCase().includes("arab") ||
                                                 attempt.subject.name.toLowerCase().includes("islamia") ||
                                                 attempt.subject.name.toLowerCase().includes("tarikh") ||
                                                 attempt.subject.name.toLowerCase().includes("joghrafia") ||
                                                 attempt.subject.name.toLowerCase().includes("falsafa") ? "ar" : "fr");

                        const promise = gradeSubQuestionAnswerWithAI(
                            attemptedProblem.problemText,
                            originalSubQuestionData.text,
                            originalSubQuestionData.points,
                            subQAttemptSlot.userAnswer,
                            attempt.subject.name,
                            gradingLanguage
                        ).then(gradingResult => {
                            subQAttemptSlot.awardedPoints = gradingResult.awardedPoints;
                            subQAttemptSlot.aiFeedback = gradingResult.feedback;
                            if (gradingResult.feedback && gradingResult.feedback.toLowerCase().includes("error") && !gradingResult.feedback.toLowerCase().includes("service error") && !gradingResult.feedback.toLowerCase().includes("configuration error")) {
                                console.warn(`AI Grading for SubQ (Order ${subQAttemptSlot.subQuestionOrderInProblem}, Problem Order ${attemptedProblem.orderInExam}) might have an issue mentioned in feedback: ${gradingResult.feedback.substring(0,100)}`);
                            }
                        }).catch(err => {
                            console.error(`[EXAM_CTRL_SUBMIT_GRADING_CATCH] Error grading SubQ (Order ${subQAttemptSlot.subQuestionOrderInProblem}, Problem Order ${attemptedProblem.orderInExam}): ${err.message}`);
                            subQAttemptSlot.awardedPoints = 0;
                            subQAttemptSlot.aiFeedback = "Automated grading encountered an unexpected error.";
                            gradingFailedOverall = true;
                        });
                        gradingPromises.push(promise);
                    } else {
                        if (!subQAttemptSlot) console.warn(`Slot for subQ order ${subQUserAnswer.orderInProblem} not found in attempt.problems[problemOrder:${attemptedProblem.orderInExam}].subQuestionAnswers`);
                        if (!originalSubQuestionData) console.warn(`Original data for subQ order ${subQUserAnswer.orderInProblem} not found in attempt.problems[problemOrder:${attemptedProblem.orderInExam}].subQuestionsData`);
                    }
                }
            }
        }

        if (gradingPromises.length > 0) {
            console.log(`[EXAM_CTRL_SUBMIT_FULL_EXAM] Waiting for ${gradingPromises.length} AI sub-question gradings...`);
            await Promise.all(gradingPromises);
            console.log(`[EXAM_CTRL_SUBMIT_FULL_EXAM] All AI sub-question gradings completed.`);
        }

        for (const attemptedProblem of attempt.problems) {
            let currentProblemScore = 0;
            for (const subQAttempt of attemptedProblem.subQuestionAnswers) {
                currentProblemScore += (typeof subQAttempt.awardedPoints === 'number' ? subQAttempt.awardedPoints : 0);
            }
            attemptedProblem.problemRawScore = currentProblemScore;
            overallRawScoreFromGrading += currentProblemScore;
        }

        attempt.overallRawScore = overallRawScoreFromGrading;
        if (attempt.overallTotalPossibleRawScore > 0) {
            attempt.overallScoreOutOf20 = Math.round((attempt.overallRawScore / attempt.overallTotalPossibleRawScore) * 20 * 100) / 100;
        } else {
            attempt.overallScoreOutOf20 = 0;
        }

        const timeTakenMs = attempt.endTime.getTime() - attempt.startTime.getTime();
        const timeLimitMs = attempt.timeLimitMinutes * 60 * 1000;

        if (gradingFailedOverall && attempt.status === 'in-progress') {
            attempt.status = 'grading-failed';
        } else if (timeTakenMs > timeLimitMs && attempt.status === 'in-progress') {
            attempt.status = 'timed-out';
        } else if (attempt.status === 'in-progress') {
            attempt.status = 'completed';
        }

        const savedAttempt = await attempt.save();
        console.log(`[EXAM_CTRL_SUBMIT_FULL_EXAM_SUCCESS] Exam ${savedAttempt._id} submitted. Overall Score: ${savedAttempt.overallRawScore}/${savedAttempt.overallTotalPossibleRawScore} (~${savedAttempt.overallScoreOutOf20}/20). Status: ${savedAttempt.status}`);

        res.status(200).json({
            message: "Exam submitted successfully. Results are being processed.",
            examAttemptId: savedAttempt._id,
            overallRawScore: savedAttempt.overallRawScore,
            overallTotalPossibleRawScore: savedAttempt.overallTotalPossibleRawScore,
            overallScoreOutOf20: savedAttempt.overallScoreOutOf20,
            status: savedAttempt.status
        });

    } catch (error) {
        console.error('[EXAM_CTRL_SUBMIT_FULL_EXAM_CATCH_ERROR] Error submitting exam:', error.message, error.stack);
        if (error.message.includes("AI Service Error")) {
             return res.status(503).json({ message: `AI Validation Service Error during submission: ${error.message}`});
        }
        res.status(500).json({ message: 'Internal Server Error while submitting exam.', error: error.message });
    }
};

const getExamResults = async (req, res) => {
    const userId = req.user._id;
    const { examAttemptId } = req.params;
    console.log(`[EXAM_CTRL_RESULTS_FULL_EXAM] User ${userId} fetching results for exam ${examAttemptId}.`);

    if (!mongoose.Types.ObjectId.isValid(examAttemptId)) {
        return res.status(400).json({ message: "Invalid exam attempt ID format." });
    }

    try {
        const attempt = await TimedExamAttempt.findById(examAttemptId)
            .populate('academicLevel', 'name')
            .populate('track', 'name')
            .populate('subject', 'name language')
            .lean();

        if (!attempt) return res.status(404).json({ message: "Exam attempt not found." });
        if (attempt.user.toString() !== userId.toString()) return res.status(403).json({ message: "Not authorized." });
        if (attempt.status === 'in-progress') return res.status(400).json({ message: "Exam is still in progress. Submit it first to see results." });

        const problemsForResults = attempt.problems.map(attemptedProblem => {
            return {
                problemId: attemptedProblem._id ? attemptedProblem._id.toString() : `problem_order_${attemptedProblem.orderInExam}`, // *** أضفنا problemId هنا أيضًا للاتساق ***
                problemOrderInExam: attemptedProblem.orderInExam,
                problemTitle: attemptedProblem.problemTitle,
                problemText: attemptedProblem.problemText,
                problemLesson: attemptedProblem.problemLesson,
                problemTotalPossibleRawScore: attemptedProblem.problemTotalPossibleRawScore,
                problemRawScore: attemptedProblem.problemRawScore,
                subQuestionAttempts: attemptedProblem.subQuestionAnswers.map(sqAttempt => {
                    const originalSubQ = attemptedProblem.subQuestionsData.find(
                        orig => orig.difficultyOrder === sqAttempt.subQuestionOrderInProblem
                    );
                    return {
                        text: originalSubQ ? originalSubQ.text : sqAttempt.subQuestionText,
                        orderInProblem: sqAttempt.subQuestionOrderInProblem,
                        pointsPossible: originalSubQ ? originalSubQ.points : sqAttempt.subQuestionPoints,
                        userAnswer: sqAttempt.userAnswer,
                        aiFeedback: sqAttempt.aiFeedback,
                        awardedPoints: sqAttempt.awardedPoints,
                    };
                }).sort((a,b) => a.orderInProblem - b.orderInProblem),
            };
        }).sort((a,b) => a.problemOrderInExam - b.problemOrderInExam);


        const resultPayload = {
            _id: attempt._id,
            user: attempt.user,
            academicLevel: attempt.academicLevel,
            track: attempt.track,
            subject: attempt.subject,
            difficulty: attempt.difficulty,
            config: attempt.config,
            overallRawScore: attempt.overallRawScore,
            overallTotalPossibleRawScore: attempt.overallTotalPossibleRawScore,
            overallScoreOutOf20: attempt.overallScoreOutOf20,
            timeLimitMinutes: attempt.timeLimitMinutes,
            startTime: attempt.startTime,
            endTime: attempt.endTime,
            status: attempt.status,
            problems: problemsForResults // الآن يحتوي على problemId لكل تمرين
        };

        console.log(`[EXAM_CTRL_RESULTS_FULL_EXAM_SUCCESS] Results for exam ${attempt._id}. Score: ${resultPayload.overallRawScore}/${resultPayload.overallTotalPossibleRawScore}`);
        res.status(200).json(resultPayload);

    } catch (error) {
        console.error('[EXAM_CTRL_RESULTS_FULL_EXAM_CATCH_ERROR] Error fetching exam results:', error.message, error.stack);
        res.status(500).json({ message: 'Internal Server Error while fetching exam results.', error: error.message });
    }
};


module.exports = {
    startExam,
    submitExam,
    getExamResults,
};