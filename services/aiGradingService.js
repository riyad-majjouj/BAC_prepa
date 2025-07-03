// --- back-end/services/aiGradingService.js ---

const TimedExamAttempt = require('../models/TimedExamAttempt');
const { fetchGeminiWithConfig } = require('../utils/promptHelpers');
const { processStepOutput } = require('../utils/aiGeneralQuestionGeneratorShared');

function createBatchGradingPrompt(problemContext, questionsToGrade) {
    const problemText = problemContext.problemText || "";
    const contextSection = problemText && problemText.trim() !== '\u200B'
        ? `
First, here is the main context for the entire problem. 
The question you are grading might refer to a "graph" or "figure". If so, the following context IS that graph/figure, described in text by the instructor. You must treat this description as the definitive source of information.

--- PROBLEM CONTEXT / FIGURE DESCRIPTION START ---
${problemText.replace(/\[IMAGE:.*?\]/g, '(Image displayed to student)')}
--- PROBLEM CONTEXT / FIGURE DESCRIPTION END ---
`
        : "The sub-questions below are standalone.";

    const questionsList = questionsToGrade.map(({ originalSq, userAnswer }) => {
        // --- START MODIFICATION FOR COMPLEX ANSWERS ---
        // Convert user answer object to a string for the prompt
        let userAnswerString = '';
        if (typeof userAnswer === 'object' && userAnswer !== null) {
            userAnswerString = JSON.stringify(userAnswer);
        } else {
            userAnswerString = userAnswer || '';
        }
        // --- END MODIFICATION ---

        return `
  {
    "subQuestionOrder": ${originalSq.difficultyOrder},
    "questionText": "${originalSq.text.replace(/"/g, '\\"')}",
    "maxPoints": ${originalSq.points},
    "modelAnswerHint": "${(originalSq.correctAnswer || 'N/A').replace(/"/g, '\\"')}",
    "userAnswer": "${userAnswerString.replace(/"/g, '\\"')}"
  }
`
    }).join(',\n');

    const textPrompt = `
You are a strict but fair AI grading assistant for Moroccan Baccalaureate level exams.
Your task is to evaluate a batch of user answers for several sub-questions that are all part of a single larger problem.

${contextSection}

You must evaluate each sub-question independently based on its specific text AND the full problem context provided above.

Here is the list of sub-questions and the user's answers to grade:
[
${questionsList}
]

STRICT JSON ARRAY OUTPUT FORMAT (A JSON array only, no other text or markdown):
[
  {
    "subQuestionOrder": number,
    "awardedPoints": number,
    "feedback": "string (A concise explanation for the score for THIS specific question)"
  }
]
`;
    return { textPrompt };
}


async function gradeExamAttemptByAI(attemptId) {
    console.log(`[GRADING_SERVICE] Starting efficient grading for attemptId: ${attemptId}`);
    const examAttempt = await TimedExamAttempt.findById(attemptId);
    if (!examAttempt) throw new Error(`Exam attempt ${attemptId} not found for grading.`);
    
    if (examAttempt.status !== 'in-progress' && examAttempt.status !== 'submitted') {
        console.warn(`[GRADING_SERVICE] Attempt ${attemptId} is already completed (${examAttempt.status}). Skipping grading.`);
        return examAttempt;
    }
    
    examAttempt.status = 'submitted';
    await examAttempt.save();

    let overallRawScore = 0;

    for (const problem of examAttempt.problems) {
        let problemScore = 0;
        const freeTextQuestionsForBatch = [];

        for (const sqAnswer of problem.subQuestionAnswers) {
            const originalSq = problem.subQuestionsData.find(osq => osq.difficultyOrder === sqAnswer.subQuestionOrderInProblem);
            if (!originalSq) {
                sqAnswer.awardedPoints = 0;
                sqAnswer.aiFeedback = "Internal error: Original question data not found.";
                continue;
            }
            if (!sqAnswer.userAnswer || (typeof sqAnswer.userAnswer === 'string' && sqAnswer.userAnswer.trim() === '') || (typeof sqAnswer.userAnswer === 'object' && sqAnswer.userAnswer !== null && Object.keys(sqAnswer.userAnswer).length === 0)) {
                sqAnswer.awardedPoints = 0;
                sqAnswer.aiFeedback = "No answer provided.";
            } else {
                // =========================================================
                // ---> START OF MAJOR MODIFICATION: AUTOGRADING LOGIC
                // =========================================================
                switch (originalSq.type) {
                    case 'mcq':
                    case 'true_false':
                        const userAnswerTrimmed = String(sqAnswer.userAnswer).trim().toLowerCase();
                        const correctAnswerTrimmed = String(originalSq.correctAnswer).trim().toLowerCase();
                        if (userAnswerTrimmed === correctAnswerTrimmed) {
                            sqAnswer.awardedPoints = originalSq.points;
                            sqAnswer.aiFeedback = "Correct answer.";
                        } else {
                            sqAnswer.awardedPoints = 0;
                            sqAnswer.aiFeedback = `Incorrect. The correct answer was: "${originalSq.correctAnswer}".`;
                        }
                        break;
                    
                    // --- NEW CASE: matching_pairs (Autograded) ---
                    case 'matching_pairs':
                        const userMatches = sqAnswer.userAnswer || {}; // e.g., { "A": "1", "B": "3" }
                        const correctMatches = originalSq.correct_matches || {};
                        let correctCount = 0;
                        const totalPairs = Object.keys(correctMatches).length;

                        if (totalPairs > 0) {
                            for (const keyA in correctMatches) {
                                // Check if user provided a match for this key and if it's correct
                                if (userMatches[keyA] && userMatches[keyA] === correctMatches[keyA]) {
                                    correctCount++;
                                }
                            }
                            // Award points proportionally
                            sqAnswer.awardedPoints = (correctCount / totalPairs) * originalSq.points;
                            sqAnswer.aiFeedback = `You correctly matched ${correctCount} out of ${totalPairs} pairs.`;
                        } else {
                            sqAnswer.awardedPoints = 0;
                            sqAnswer.aiFeedback = "No correct matches were defined for this question.";
                        }
                        break;

                    // --- NEW CASE: fill_table (Autograded) ---
                    case 'fill_table':
                        const userTableAnswers = sqAnswer.userAnswer || {}; // e.g., { "0-1": "30", "1-1": "Blue" }
                        const correctTableAnswers = originalSq.correct_answers_table || {};
                        let correctCells = 0;
                        const totalEditableCells = Object.keys(correctTableAnswers).length;

                        if (totalEditableCells > 0) {
                            for (const cellKey in correctTableAnswers) { // cellKey is "row-col" e.g. "0-1"
                                // Compare answers, trimming strings for flexibility
                                const userAnswerCell = (userTableAnswers[cellKey] || "").trim();
                                const correctAnswerCell = (correctTableAnswers[cellKey] || "").trim();
                                if (userAnswerCell.toLowerCase() === correctAnswerCell.toLowerCase()) {
                                    correctCells++;
                                }
                            }
                            // Award points proportionally
                            sqAnswer.awardedPoints = (correctCells / totalEditableCells) * originalSq.points;
                            sqAnswer.aiFeedback = `You correctly filled ${correctCells} out of ${totalEditableCells} cells.`;
                        } else {
                            sqAnswer.awardedPoints = 0;
                            sqAnswer.aiFeedback = "No editable cells were defined for this question.";
                        }
                        break;
                    
                    // --- AI Graded Questions ---
                    case 'free_text':
                    case 'true_false_justify':
                        freeTextQuestionsForBatch.push({ originalSq, userAnswer: sqAnswer.userAnswer, sqAnswerRef: sqAnswer });
                        break;

                    default:
                        // Types not currently graded (e.g., titles)
                        sqAnswer.awardedPoints = 0;
                        sqAnswer.aiFeedback = "This question type is not graded.";
                        break;
                }
                // =========================================================
                // ---> END OF MAJOR MODIFICATION
                // =========================================================
            }
        }

        if (freeTextQuestionsForBatch.length > 0) {
            console.log(`[GRADING_SERVICE] Batching ${freeTextQuestionsForBatch.length} free-text questions for AI grading.`);
            
            const promptData = createBatchGradingPrompt(problem, freeTextQuestionsForBatch.map(item => ({
                originalSq: item.originalSq,
                userAnswer: item.userAnswer
            })));
            
            const modelToUse = 'gemini-1.5-flash-latest';
            
            try {
                const rawResponse = await fetchGeminiWithConfig(
                    promptData.textPrompt, 
                    { temperature: 0.2, maxOutputTokens: 2048 }, 
                    modelToUse
                ); 
                const gradingResults = await processStepOutput(rawResponse);

                if (!Array.isArray(gradingResults)) {
                    throw new Error("AI did not return a valid JSON array for the batch grading.");
                }

                const resultsMap = new Map(gradingResults.map(r => [r.subQuestionOrder, r]));

                for (const { originalSq, sqAnswerRef } of freeTextQuestionsForBatch) {
                    const result = resultsMap.get(originalSq.difficultyOrder);
                    if (result) {
                        sqAnswerRef.awardedPoints = Math.max(0, Math.min(Number(result.awardedPoints) || 0, originalSq.points));
                        sqAnswerRef.aiFeedback = result.feedback || "Graded by AI.";
                    } else {
                        sqAnswerRef.awardedPoints = 0;
                        sqAnswerRef.aiFeedback = "AI grading result was missing for this question.";
                        console.warn(`[GRADING_SERVICE] Missing result for subQuestionOrder ${originalSq.difficultyOrder}.`);
                    }
                }
            } catch (e) {
                console.error(`[GRADING_SERVICE_CATCH] AI batch grading error for problem: ${e.message}`);
                for (const { sqAnswerRef } of freeTextQuestionsForBatch) {
                    sqAnswerRef.awardedPoints = 0;
                    sqAnswerRef.aiFeedback = `AI Grading Error: ${e.message}`;
                }
            }
        }

        problemScore = problem.subQuestionAnswers.reduce((sum, sq) => sum + (sq.awardedPoints || 0), 0);
        problem.problemRawScore = Math.round(problemScore * 100) / 100;
        overallRawScore += problem.problemRawScore;
    }

    examAttempt.overallRawScore = Math.round(overallRawScore * 100) / 100;
    if (examAttempt.overallTotalPossibleRawScore > 0) {
        examAttempt.overallScoreOutOf20 = Math.round((examAttempt.overallRawScore / examAttempt.overallTotalPossibleRawScore) * 20 * 100) / 100;
    } else {
        examAttempt.overallScoreOutOf20 = 0;
    }
    
    examAttempt.status = 'completed';
    
    await examAttempt.save();
    console.log(`[GRADING_SERVICE] Grading COMPLETED for attemptId: ${attemptId}. Final score: ${examAttempt.overallRawScore}/${examAttempt.overallTotalPossibleRawScore}`);
    
    return examAttempt;
}

module.exports = {
    gradeExamAttemptByAI,
};