// back-end/services/aiGradingService.js
const TimedExamAttempt = require('../models/TimedExamAttempt');
const { fetchGeminiWithConfig, processStepOutput } = require('../utils/promptHelpers'); // نفترض وجود هذه

// --- دالات مساعدة للبرومبتات (سيتم ملؤها لاحقًا) ---

function generateFreeTextGradingPrompt(questionText, userAnswer, correctAnswerExample, maxPoints) {
    // TODO: Implement prompt
    return `TASK: Grade the user's answer for a free-text question.
Question: "${questionText}"
User Answer: "${userAnswer}"
Model Answer/Criteria: "${correctAnswerExample}"
Maximum Points: ${maxPoints}.
Output JSON: {"awardedPoints": number, "feedback": "string"}`;
}

function generateTableCompletionGradingPrompt(questionText, tableStructure, userAnswer, correctTable, maxPoints) {
    // tableStructure: { headers, rows_structure }
    // userAnswer: Record<cellKey, string>
    // correctTable: Array of objects representing the fully correct table
    // TODO: Implement prompt
    return `TASK: Grade a table completion task.
Question: "${questionText}"
Table Structure (student was asked to fill nulls): ${JSON.stringify(tableStructure)}
User's Filled Table Data: ${JSON.stringify(userAnswer)}
Correct Full Table: ${JSON.stringify(correctTable)}
Maximum Points: ${maxPoints}.
Output JSON: {"awardedPoints": number, "feedback": "string for overall table, or per cell feedback"}`;
}

function generateMatchingPairsGradingPrompt(questionText, groupA, groupB, userAnswer, correctMatches, maxPoints) {
    // userAnswer: Array<{item_a: string, selected_b: string | null}>
    // correctMatches: Array<{item_a: string, item_b: string}>
    // TODO: Implement prompt
    return `TASK: Grade a matching pairs task.
Question: "${questionText}"
Group A: ${JSON.stringify(groupA)}
Group B: ${JSON.stringify(groupB)}
User's Matches: ${JSON.stringify(userAnswer)}
Correct Matches: ${JSON.stringify(correctMatches)}
Maximum Points: ${maxPoints}.
Output JSON: {"awardedPoints": number, "feedback": "string"}`;
}

function generateTrueFalseJustificationGradingPrompt(propositionText, userChoice, userJustification, correctChoice, modelJustification, maxPoints) {
    // userChoice: boolean (or string "true"/"false")
    // correctChoice: boolean
    // TODO: Implement prompt. Especially for the justification part.
    let feedbackForChoice = "";
    let pointsForChoice = 0;
    if ( (typeof userChoice === 'boolean' && userChoice === correctChoice) || 
         (typeof userChoice === 'string' && userChoice.toLowerCase() === String(correctChoice).toLowerCase()) ) {
        feedbackForChoice = "The True/False choice is correct.";
        pointsForChoice = maxPoints * 0.4; // 40% for correct choice
    } else {
        feedbackForChoice = `The True/False choice is incorrect. The correct choice was ${correctChoice}.`;
        pointsForChoice = 0;
    }

    return `TASK: Grade the justification for a True/False question. The True/False choice itself was ${userChoice} (Correct is ${correctChoice}).
Proposition: "${propositionText}"
User's Justification: "${userJustification}"
Model Justification (if available): "${modelJustification || 'N/A'}"
Maximum Points for Justification: ${maxPoints * 0.6}.
Base points for T/F choice: ${pointsForChoice}.
Output JSON: {"awardedPointsForJustification": number, "feedbackOnJustification": "string"}`;
}


// --- الدالة الرئيسية للتصحيح ---
async function gradeExamAttemptByAI(attemptId) {
    console.log(`[AI_GRADING_SERVICE] Starting AI grading for attemptId: ${attemptId}`);
    const examAttempt = await TimedExamAttempt.findById(attemptId);

    if (!examAttempt) {
        console.error(`[AI_GRADING_SERVICE] Exam attempt ${attemptId} not found.`);
        throw new Error(`Exam attempt ${attemptId} not found for grading.`);
    }
    if (examAttempt.status !== 'grading' && examAttempt.status !== 'in-progress') { // يمكن أن يكون 'in-progress' إذا فشل الإرسال السابق قبل تغيير الحالة
        console.warn(`[AI_GRADING_SERVICE] Exam attempt ${attemptId} is not in 'grading' or 'in-progress' status. Current status: ${examAttempt.status}. Skipping grading.`);
        // قد ترغب في إرجاع المحاولة كما هي أو رمي خطأ يعتمد على منطق عملك
        return examAttempt;
    }

    let overallRawScoreFromAI = 0;

    for (const problem of examAttempt.problems) {
        let problemScoreFromAI = 0;
        for (const sqAnswer of problem.subQuestionAnswers) {
            const originalSq = problem.subQuestionsData.find(osq => osq.difficultyOrder === sqAnswer.subQuestionOrderInProblem);

            if (!originalSq) {
                console.warn(`[AI_GRADING_SERVICE] Original subQuestion not found for order ${sqAnswer.subQuestionOrderInProblem} in problem "${problem.problemTitle}". Skipping this sub-answer.`);
                sqAnswer.aiFeedback = "Error: Original question data missing for grading.";
                sqAnswer.awardedPoints = 0;
                continue;
            }

            // إذا كان السؤال بسيطًا وتم تصحيحه جزئيًا في الكنترولر، يمكن تخطيه هنا أو إعادة تقييمه
            // حاليًا، سنفترض أننا نعيد تقييم كل شيء يحتاج إلى AI
            if (sqAnswer.question_format === 'mcq') { // MCQ يتم تصحيحه في الكنترولر عادةً
                // awardedPoints يجب أن تكون قد حُسبت بالفعل في examController
                // يمكننا تركها كما هي أو إضافة feedback
                 if(sqAnswer.awardedPoints === originalSq.points) {
                    sqAnswer.aiFeedback = sqAnswer.aiFeedback || "Correct answer selected.";
                 } else {
                    sqAnswer.aiFeedback = sqAnswer.aiFeedback || `Incorrect. The correct option was "${originalSq.correct_answer}".`;
                 }
            } else if (sqAnswer.question_format === 'free_text') {
                if (sqAnswer.userAnswer && typeof sqAnswer.userAnswer === 'string' && sqAnswer.userAnswer.trim() !== "") {
                    const prompt = generateFreeTextGradingPrompt(originalSq.text, sqAnswer.userAnswer, originalSq.correct_answer, originalSq.points);
                    try {
                        const rawResponse = await fetchGeminiWithConfig(prompt, { temperature: 0.3, maxOutputTokens: 256 });
                        const gradingResult = await processStepOutput(rawResponse);
                        sqAnswer.awardedPoints = Math.max(0, Math.min(Number(gradingResult.awardedPoints) || 0, originalSq.points));
                        sqAnswer.aiFeedback = gradingResult.feedback || "Graded by AI.";
                    } catch (e) {
                        console.error(`[AI_GRADING_SERVICE] Error grading free_text for sqOrder ${sqAnswer.subQuestionOrderInProblem}: ${e.message}`);
                        sqAnswer.aiFeedback = "AI grading failed for this question.";
                        sqAnswer.awardedPoints = 0;
                    }
                } else {
                    sqAnswer.aiFeedback = "No answer provided.";
                    sqAnswer.awardedPoints = 0;
                }
            } else if (sqAnswer.question_format === 'true_false_justify') {
                let pointsForChoice = 0;
                let choiceCorrect = false;
                const userAnswerChoice = (typeof sqAnswer.userAnswer === 'object' && sqAnswer.userAnswer !== null) ? sqAnswer.userAnswer.choice : null;
                const userAnswerJustification = (typeof sqAnswer.userAnswer === 'object' && sqAnswer.userAnswer !== null) ? sqAnswer.userAnswer.justification : "";

                if ( (typeof userAnswerChoice === 'boolean' && userAnswerChoice === originalSq.correct_answer_details?.is_true) ||
                     (typeof userAnswerChoice === 'string' && userAnswerChoice.toLowerCase() === String(originalSq.correct_answer_details?.is_true).toLowerCase()) ) {
                    pointsForChoice = originalSq.points * 0.4; // 40% for correct choice
                    choiceCorrect = true;
                }

                if (userAnswerJustification && userAnswerJustification.trim() !== "") {
                    const prompt = generateTrueFalseJustificationGradingPrompt(
                        originalSq.text, userAnswerChoice, userAnswerJustification,
                        originalSq.correct_answer_details?.is_true,
                        originalSq.correct_answer_details?.correction || originalSq.correct_answer_details?.justification_quote,
                        originalSq.points
                    );
                    try {
                        const rawResponse = await fetchGeminiWithConfig(prompt, { temperature: 0.3, maxOutputTokens: 300 });
                        const gradingResult = await processStepOutput(rawResponse);
                        const pointsForJustification = Math.max(0, Math.min(Number(gradingResult.awardedPointsForJustification) || 0, originalSq.points * 0.6));
                        sqAnswer.awardedPoints = pointsForChoice + pointsForJustification;
                        sqAnswer.aiFeedback = `Choice: ${choiceCorrect ? 'Correct' : 'Incorrect'}. Justification: ${gradingResult.feedbackOnJustification || "AI feedback."}`;
                    } catch (e) {
                        console.error(`[AI_GRADING_SERVICE] Error grading true_false_justify for sqOrder ${sqAnswer.subQuestionOrderInProblem}: ${e.message}`);
                        sqAnswer.awardedPoints = pointsForChoice; // امنح نقاط الاختيار فقط إذا فشل تقييم التعليل
                        sqAnswer.aiFeedback = `Choice: ${choiceCorrect ? 'Correct' : 'Incorrect'}. Justification grading failed.`;
                    }
                } else {
                    sqAnswer.awardedPoints = pointsForChoice;
                    sqAnswer.aiFeedback = `Choice: ${choiceCorrect ? 'Correct' : 'Incorrect'}. No justification provided.`;
                }


            } else if (sqAnswer.question_format === 'matching_pairs') {
                 if (sqAnswer.userAnswer && Array.isArray(sqAnswer.userAnswer) && sqAnswer.userAnswer.length > 0) {
                    const prompt = generateMatchingPairsGradingPrompt(
                        originalSq.text, originalSq.group_a_items, originalSq.group_b_items,
                        sqAnswer.userAnswer, originalSq.correct_matches, originalSq.points
                    );
                    try {
                        const rawResponse = await fetchGeminiWithConfig(prompt, {temperature: 0.2, maxOutputTokens: 200});
                        const gradingResult = await processStepOutput(rawResponse);
                        sqAnswer.awardedPoints = Math.max(0, Math.min(Number(gradingResult.awardedPoints) || 0, originalSq.points));
                        sqAnswer.aiFeedback = gradingResult.feedback || "Graded by AI.";
                    } catch (e) {
                        console.error(`[AI_GRADING_SERVICE] Error grading matching_pairs for sqOrder ${sqAnswer.subQuestionOrderInProblem}: ${e.message}`);
                        sqAnswer.aiFeedback = "AI grading failed.";
                        sqAnswer.awardedPoints = 0;
                    }
                } else {
                    sqAnswer.aiFeedback = "No matches provided.";
                    sqAnswer.awardedPoints = 0;
                }
            } else if (sqAnswer.question_format === 'table_completion') {
                 if (sqAnswer.userAnswer && typeof sqAnswer.userAnswer === 'object' && Object.keys(sqAnswer.userAnswer).length > 0) {
                    const prompt = generateTableCompletionGradingPrompt(
                        originalSq.text, originalSq.table_data, // table_data from original question has {headers, rows_structure}
                        sqAnswer.userAnswer, // User's filled cells
                        originalSq.table_data?.correct_full_table, // Correct full table from original question
                        originalSq.points
                    );
                     try {
                        const rawResponse = await fetchGeminiWithConfig(prompt, {temperature: 0.2, maxOutputTokens: 512});
                        const gradingResult = await processStepOutput(rawResponse);
                        sqAnswer.awardedPoints = Math.max(0, Math.min(Number(gradingResult.awardedPoints) || 0, originalSq.points));
                        sqAnswer.aiFeedback = gradingResult.feedback || "Graded by AI.";
                    } catch (e) {
                        console.error(`[AI_GRADING_SERVICE] Error grading table_completion for sqOrder ${sqAnswer.subQuestionOrderInProblem}: ${e.message}`);
                        sqAnswer.aiFeedback = "AI grading failed.";
                        sqAnswer.awardedPoints = 0;
                    }
                } else {
                    sqAnswer.aiFeedback = "No table data provided.";
                    sqAnswer.awardedPoints = 0;
                }
            }
            // TODO: Add grading logic for 'gap_filling_multiple_choice' if needed by AI

            // تأكد من أن النقاط لا تتجاوز الحد الأقصى للسؤال الفرعي
            sqAnswer.awardedPoints = Math.max(0, Math.min(sqAnswer.awardedPoints, originalSq.points));
            problemScoreFromAI += sqAnswer.awardedPoints;
        }
        problem.problemRawScore = Math.round(problemScoreFromAI * 100) / 100;
        overallRawScoreFromAI += problem.problemRawScore;
    }

    examAttempt.overallRawScore = Math.round(overallRawScoreFromAI * 100) / 100;
    if (examAttempt.overallTotalPossibleRawScore > 0) {
        examAttempt.overallScoreOutOf20 = Math.round((examAttempt.overallRawScore / examAttempt.overallTotalPossibleRawScore) * 20 * 100) / 100;
    } else {
        examAttempt.overallScoreOutOf20 = 0;
    }
    examAttempt.status = 'completed'; // تم الانتهاء من التصحيح

    await examAttempt.save();
    console.log(`[AI_GRADING_SERVICE] AI grading completed for attemptId: ${attemptId}. Final score: ${examAttempt.overallRawScore}/${examAttempt.overallTotalPossibleRawScore}`);
    return examAttempt; // إرجاع المحاولة المحدثة
}

module.exports = {
    gradeExamAttemptByAI,
};