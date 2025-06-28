// back-end/services/aiGradingService.js

const TimedExamAttempt = require('../models/TimedExamAttempt');
const { fetchGeminiWithConfig, processStepOutput } = require('../utils/promptHelpers');

/**
 * Creates a specific grading prompt for a free-text sub-question.
 * @param {object} questionData - Contains original question data and user's answer.
 * @returns {string} - The generated prompt text for the AI.
 */
function createGradingPrompt(originalSq, userAnswer) {
    const modelAnswerHint = originalSq.correctAnswer 
        ? `The model answer is: "${originalSq.correctAnswer}". Grade the user's answer based on correctness and similarity to the model answer.`
        : `No specific model answer was provided. Grade the user's answer based on general correctness, logic, and scientific accuracy relevant to the question's topic.`;

    return `
You are a strict but fair AI grading assistant for Moroccan Baccalaureate level exams.
Your task is to evaluate the user's answer to the following free-text question.

Question: "${originalSq.text}"
User's Answer: "${userAnswer}"
${modelAnswerHint}

Maximum points for this sub-question: ${originalSq.points}.
Based on your evaluation, provide a score and brief feedback.

STRICT JSON OUTPUT FORMAT (JSON only, no other text or markdown):
{
  "awardedPoints": number,
  "feedback": "string (A concise explanation for the score, e.g., 'Correct answer.', 'Partially correct, you missed...', 'Incorrect because...')"
}
`;
}

/**
 * Grades a full exam attempt, using AI for complex/free-text questions.
 * @param {string} attemptId - The ID of the TimedExamAttempt document.
 * @returns {Promise<Document>} - The updated and saved exam attempt document.
 */
async function gradeExamAttemptByAI(attemptId) {
    console.log(`[GRADING_SERVICE] Starting grading for attemptId: ${attemptId}`);
    const examAttempt = await TimedExamAttempt.findById(attemptId);
    if (!examAttempt) throw new Error(`Exam attempt ${attemptId} not found for grading.`);
    if (examAttempt.status !== 'in-progress') {
        console.warn(`[GRADING_SERVICE] Attempt ${attemptId} is already finalized (${examAttempt.status}). Skipping grading.`);
        return examAttempt;
    }

    let overallRawScore = 0;

    for (const problem of examAttempt.problems) {
        let problemScore = 0;
        for (const sqAnswer of problem.subQuestionAnswers) {
            const originalSq = problem.subQuestionsData.find(osq => osq.difficultyOrder === sqAnswer.subQuestionOrderInProblem);
            if (!originalSq) {
                console.warn(`[GRADING_SERVICE] Original subQuestion not found for order ${sqAnswer.subQuestionOrderInProblem}. Skipping.`);
                continue;
            }

            let awardedPointsForSq = 0;
            let feedbackForSq = "Grading not performed.";
            const userAnswer = sqAnswer.userAnswer;

            // --- بداية منطق التصحيح الجديد ---
            
            // تحقق أولاً إذا كان المستخدم قد أجاب
            if (!userAnswer || userAnswer.trim() === '') {
                awardedPointsForSq = 0;
                feedbackForSq = "No answer provided.";
            } else {
                // استخدمنا `originalSq.type` الذي أضفناه في الحل السابق
                switch (originalSq.type) {
                    case 'mcq':
                    case 'true_false':
                        // تصحيح فوري ومباشر لهذه الأنواع
                        if (userAnswer.trim().toLowerCase() === originalSq.correctAnswer?.trim().toLowerCase()) {
                            awardedPointsForSq = originalSq.points;
                            feedbackForSq = "Correct answer.";
                        } else {
                            awardedPointsForSq = 0;
                            feedbackForSq = `Incorrect. The correct answer was: "${originalSq.correctAnswer}".`;
                        }
                        console.log(`[GRADING_SERVICE] Direct grading for ${originalSq.type}. User: '${userAnswer}', Correct: '${originalSq.correctAnswer}'. Score: ${awardedPointsForSq}`);
                        break;
                    
                    case 'free_text':
                        // هذا النوع فقط يتم إرساله للذكاء الاصطناعي
                        console.log(`[GRADING_SERVICE] AI grading for free_text sub-question order ${sqAnswer.subQuestionOrderInProblem}`);
                        const prompt = createGradingPrompt(originalSq, userAnswer);
                        try {
                            const rawResponse = await fetchGeminiWithConfig(prompt, { temperature: 0.2, maxOutputTokens: 300 });
                            const gradingResult = await processStepOutput(rawResponse);
                            
                            awardedPointsForSq = Number(gradingResult.awardedPoints) || 0;
                            feedbackForSq = gradingResult.feedback || "Graded by AI.";
                        } catch (e) {
                            console.error(`[GRADING_SERVICE_CATCH] AI grading error for sub-question in attempt ${attemptId}: ${e.message}`);
                            awardedPointsForSq = 0;
                            feedbackForSq = "An error occurred during AI grading for this question.";
                        }
                        break;

                    default:
                        // للأنواع المستقبلية التي لم تعالج بعد
                        console.warn(`[GRADING_SERVICE] Unhandled question type '${originalSq.type}'. Skipping grading.`);
                        feedbackForSq = "This question type is not currently graded automatically.";
                        break;
                }
            }
            // --- نهاية منطق التصحيح الجديد ---

            sqAnswer.awardedPoints = Math.max(0, Math.min(awardedPointsForSq, originalSq.points)); // ضمان عدم تجاوز النقاط
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
    
    examAttempt.status = 'completed'; // تم التصحيح
    
    await examAttempt.save();
    console.log(`[GRADING_SERVICE] Grading COMPLETED for attemptId: ${attemptId}. Final score: ${examAttempt.overallRawScore}/${examAttempt.overallTotalPossibleRawScore}`);
    return examAttempt;
}

module.exports = {
    gradeExamAttemptByAI,
};