// back-end/services/aiGradingService.js
const TimedExamAttempt = require('../models/TimedExamAttempt');
const { fetchGeminiWithConfig, processStepOutput } = require('../utils/promptHelpers');

/**
 * Creates a specific grading prompt for a given sub-question type.
 * @param {object} questionData - Contains original question data and user's answer.
 * @returns {string|null} - The generated prompt text, or null if AI grading is not needed.
 */
function createGradingPrompt(questionData) {
    const { originalSq, userAnswer } = questionData;
    let specificInstructions = "";

    // --- التحسين الدفاعي ---
    // إذا كان نوع السؤال غير محدد، افترض أنه نص حر لضمان محاولة التصحيح
    const format = originalSq.question_format || 'free_text';

    switch (format) {
        case 'free_text':
            specificInstructions = `
Question Context: A free-text question asking for an explanation or calculation.
Question: "${originalSq.text}"
Model Answer/Criteria: "${originalSq.correct_answer || 'No specific model answer was provided, grade based on general correctness.'}"
User's Answer: "${userAnswer}"
Task: Evaluate the user's answer for correctness, completeness, and scientific accuracy based on the model answer and general knowledge of the topic.`;
            break;
        
        case 'table_completion':
            specificInstructions = `
Question Context: A table completion task.
Task Description: "${originalSq.text}"
Table Structure to be filled: ${JSON.stringify(originalSq.table_data?.rows_structure)}
User's Filled Answers (as a map of cellKey: value): ${JSON.stringify(userAnswer)}
Correct Full Table for reference: ${JSON.stringify(originalSq.table_data?.correct_full_table)}
Task: Compare the user's filled data with the correct full table. Award points based on the number of correctly filled cells. Provide feedback on which cells were incorrect.`;
            break;

        case 'matching_pairs':
            specificInstructions = `
Question Context: A matching pairs task.
Task Description: "${originalSq.text}"
Group A Items: ${JSON.stringify(originalSq.group_a_items)}
Group B Items: ${JSON.stringify(originalSq.group_b_items)}
User's Matches (array of {item_a, selected_b}): ${JSON.stringify(userAnswer)}
Correct Matches for reference: ${JSON.stringify(originalSq.correct_matches)}
Task: Evaluate how many pairs the user matched correctly. Award partial points proportionally.`;
            break;

        case 'true_false_justify':
             const userAnswerObj = (typeof userAnswer === 'object' && userAnswer !== null) ? userAnswer : {};
             const userChoice = userAnswerObj.choice;
             const userJustification = userAnswerObj.justification || "";
             const correctChoice = originalSq.correct_answer_details?.is_true;
             const modelJustification = originalSq.correct_answer_details?.correction || originalSq.correct_answer_details?.justification_quote || 'No model justification provided.';
             const choiceIsCorrect = userChoice === correctChoice;

             if (!userJustification.trim()) {
                 return null; 
             }
             specificInstructions = `
Question Context: Grading the justification for a True/False question.
Proposition: "${originalSq.text}"
The correct choice was: ${correctChoice}. The user chose: ${userChoice} (This choice was ${choiceIsCorrect ? 'CORRECT' : 'INCORRECT'}).
User's Justification: "${userJustification}"
Model Justification/Correction: "${modelJustification}"
Task: Evaluate ONLY the user's justification. Is it scientifically correct and relevant, even if their initial T/F choice was wrong? The maximum points for the entire question is ${originalSq.points}. Assume the choice part is worth 40% and justification is 60%. Grade the justification out of the available 60% of points.`;
            break;

        // الحالة default لم تعد ضرورية بعد الآن بسبب المعالجة الدفاعية أعلاه
        default:
            // في حالة وجود نوع غير متوقع ولكنه ليس نصًا حرًا، يمكننا إرجاع null
            // ولكن مع الافتراض الأولي، هذا القسم لن يتم الوصول إليه غالبًا
             console.warn(`[AI_GRADING_SERVICE] Unhandled question format '${format}' for sub-question. Skipping AI prompt generation.`);
            return null;
    }

    return `
You are a strict but fair AI grading assistant for Moroccan Baccalaureate level exams.
${specificInstructions}
Maximum points for THIS entire sub-question: ${originalSq.points}.
Based on your evaluation, provide a score and brief feedback. For justification tasks, score only the justification part.

STRICT JSON OUTPUT FORMAT (JSON only, no other text):
{
  "awardedPoints": number,
  "feedback": "string (A concise explanation for the score, e.g., 'Correct answer.', 'Partially correct, you missed...', 'Incorrect because...')"
}
`;
}

/**
 * Grades a full exam attempt, using AI for complex question types.
 * @param {string} attemptId - The ID of the TimedExamAttempt document.
 * @returns {Promise<Document>} - The updated and saved exam attempt document.
 */
async function gradeExamAttemptByAI(attemptId) {
    console.log(`[AI_GRADING_SERVICE] Starting AI grading for attemptId: ${attemptId}`);
    const examAttempt = await TimedExamAttempt.findById(attemptId);
    if (!examAttempt) throw new Error(`Exam attempt ${attemptId} not found for grading.`);
    if (examAttempt.status === 'completed' || examAttempt.status === 'grading-failed' || examAttempt.status === 'timed-out') {
        console.warn(`[AI_GRADING_SERVICE] Attempt ${attemptId} is already finalized. Skipping grading.`);
        return examAttempt;
    }

    let overallRawScore = 0;

    for (const problem of examAttempt.problems) {
        let problemScore = 0;
        for (const sqAnswer of problem.subQuestionAnswers) {
            const originalSq = problem.subQuestionsData.find(osq => osq.difficultyOrder === sqAnswer.subQuestionOrderInProblem);
            if (!originalSq) {
                console.warn(`[AI_GRADING_SERVICE] Original subQuestion not found for order ${sqAnswer.subQuestionOrderInProblem}. Skipping.`);
                continue;
            }

            let awardedPointsForSq = 0;
            // غيرنا القيمة الافتراضية لتكون أوضح في حالة حدوث خطأ
            let feedbackForSq = "Grading not applicable or skipped for this question.";
            
            if (originalSq.question_format === 'mcq') {
                const correctAnswer = originalSq.correct_answer;
                const userAnswer = sqAnswer.userAnswer;
                if (Array.isArray(correctAnswer)) { 
                    if (Array.isArray(userAnswer) && userAnswer.length === correctAnswer.length && userAnswer.every(val => correctAnswer.includes(val))) {
                        awardedPointsForSq = originalSq.points;
                        feedbackForSq = "Correct answers selected.";
                    } else {
                        feedbackForSq = `Incorrect. The correct answers were: ${correctAnswer.join(', ')}.`;
                    }
                } else if (typeof correctAnswer === 'string') {
                    if (typeof userAnswer === 'string' && userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase()) {
                        awardedPointsForSq = originalSq.points;
                        feedbackForSq = "Correct answer selected.";
                    } else {
                        feedbackForSq = `Incorrect. The correct answer was: "${correctAnswer}".`;
                    }
                }
            } else {
                const prompt = createGradingPrompt({ originalSq, userAnswer: sqAnswer.userAnswer });
                
                if (prompt) {
                    console.log(`[AI_GRADING_SERVICE] Grading sub-question order ${sqAnswer.subQuestionOrderInProblem} (format: ${originalSq.question_format}) for attempt ${attemptId}`);
                    try {
                        const rawResponse = await fetchGeminiWithConfig(prompt, { temperature: 0.2, maxOutputTokens: 300 });
                        const gradingResult = await processStepOutput(rawResponse);
                        
                        awardedPointsForSq = Number(gradingResult.awardedPoints) || 0;
                        feedbackForSq = gradingResult.feedback || "Graded by AI.";

                        if (originalSq.question_format === 'true_false_justify') {
                            const userAnswerObj = (typeof sqAnswer.userAnswer === 'object' && sqAnswer.userAnswer !== null) ? sqAnswer.userAnswer : {};
                            if (userAnswerObj.choice === originalSq.correct_answer_details?.is_true) {
                                awardedPointsForSq += (originalSq.points * 0.4);
                            }
                        }
                    } catch (e) {
                        console.error(`[AI_GRADING_CATCH] AI grading error for sub-question in attempt ${attemptId}: ${e.message}`);
                        feedbackForSq = "AI grading failed for this question.";
                    }
                } else if (!sqAnswer.userAnswer) {
                    feedbackForSq = "No answer provided.";
                    awardedPointsForSq = 0;
                } else if (originalSq.question_format === 'true_false_justify') {
                    const userAnswerObj = (typeof sqAnswer.userAnswer === 'object' && sqAnswer.userAnswer !== null) ? sqAnswer.userAnswer : {};
                     if (userAnswerObj.choice === originalSq.correct_answer_details?.is_true) {
                        awardedPointsForSq = originalSq.points * 0.4;
                        feedbackForSq = "Choice is correct, but no justification was provided.";
                    } else {
                         feedbackForSq = `Choice is incorrect (correct was ${originalSq.correct_answer_details?.is_true}). No justification provided.`;
                    }
                }
            }

            sqAnswer.awardedPoints = Math.max(0, Math.min(awardedPointsForSq, originalSq.points));
            sqAnswer.aiFeedback = feedbackForSq.trim();
            problemScore += sqAnswer.awardedPoints;
        }
        problem.problemRawScore = Math.round(problemScore * 100) / 100;
        overallRawScore += problem.problemRawScore;
    }

    examAttempt.overallRawScore = Math.round(overallRawScore * 100) / 100;
    if (examAttempt.overallTotalPossibleRawScore > 0) {
        examAttempt.overallScoreOutOf20 = Math.round((examAttempt.overallRawScore / examAttempt.overallTotalPossibleRawScore) * 20 * 100) / 100;
    } else {
        examAttempt.overallScoreOutOf20 = 0;
    }
    
    // تحديد الحالة النهائية بناءً على الوقت
    const timeTakenSeconds = (examAttempt.endTime.getTime() - examAttempt.startTime.getTime()) / 1000;
    if (timeTakenSeconds > (examAttempt.timeLimitMinutes * 60) + 15) {
        examAttempt.status = 'timed-out';
    } else {
        examAttempt.status = 'completed'; // Grading is done
    }
    
    await examAttempt.save();
    console.log(`[AI_GRADING_SERVICE] AI grading COMPLETED for attemptId: ${attemptId}. Final score: ${examAttempt.overallRawScore}/${examAttempt.overallTotalPossibleRawScore}`);
    return examAttempt;
}

module.exports = {
    gradeExamAttemptByAI,
};