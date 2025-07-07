// --- back-end/services/aiGradingService.js ---

const TimedExamAttempt = require('../models/TimedExamAttempt');
const { fetchGeminiWithConfig } = require('../utils/promptHelpers');
const { processStepOutput } = require('../utils/aiGeneralQuestionGeneratorShared');

/**
 * Creates the prompt for batch grading AI-graded questions within a single problem.
 * @param {Array} problemContent - The array of content items for context.
 * @param {Array} questionsToGrade - The questions needing AI grading.
 * @returns {object} An object containing the text prompt.
 */
function createBatchGradingPrompt(problemContent, questionsToGrade) {
    // Build the context from all content items in the problem
    const contextText = problemContent
        .map(item => {
            if (item.contentType === 'image' && item.aiDescription) {
                return `FIGURE/IMAGE DESCRIPTION: ${item.aiDescription}`;
            }
            return item.text || '';
        })
        .join('\n\n');

    const contextSection = contextText.trim()
        ? `
First, here is the main context for the entire problem. The questions you are grading might refer to this context.

--- PROBLEM CONTEXT START ---
${contextText}
--- PROBLEM CONTEXT END ---
`
        : "The sub-questions below are standalone.";

    const questionsList = questionsToGrade.map(({ originalQuestion, userAnswer }) => {
        let userAnswerString = '';
        if (typeof userAnswer === 'object' && userAnswer !== null) {
            userAnswerString = JSON.stringify(userAnswer);
        } else {
            userAnswerString = userAnswer || '';
        }

        return `
  {
    "subQuestionOrder": ${originalQuestion.orderInProblem},
    "questionText": "${originalQuestion.text.replace(/"/g, '\\"')}",
    "maxPoints": ${originalQuestion.points},
    "modelAnswerHint": "${(String(originalQuestion.correctAnswer || 'N/A')).replace(/"/g, '\\"')}",
    "userAnswer": "${userAnswerString.replace(/"/g, '\\"')}"
  }
`;
    }).join(',\n');

    const textPrompt = `
You are a strict but fair AI grading assistant for Moroccan Baccalaureate exams.
Your task is to evaluate a batch of user answers for several sub-questions belonging to a single larger problem.

${contextSection}

You must evaluate each sub-question independently based on its specific text AND the full problem context provided above.

Here is the list of sub-questions and the user's answers to grade:
[
${questionsList}
]

Provide your evaluation in a STRICT JSON ARRAY FORMAT ONLY. Do not include any other text or markdown.
The format for each item in the array must be:
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
    console.log(`[GRADING_SERVICE] Starting grading for attemptId: ${attemptId}`);
    const examAttempt = await TimedExamAttempt.findById(attemptId);
    if (!examAttempt) throw new Error(`Exam attempt ${attemptId} not found.`);
    
    if (examAttempt.status !== 'in-progress' && examAttempt.status !== 'submitted') {
        console.warn(`[GRADING_SERVICE] Attempt ${attemptId} already processed (${examAttempt.status}). Skipping.`);
        return examAttempt;
    }
    
    examAttempt.status = 'submitted'; // Mark as submitted while grading
    await examAttempt.save();

    let overallRawScore = 0;

    for (const problem of examAttempt.problems) {
        let problemScore = 0;
        const questionsForAIGrading = [];
        
        // Create a map of answers for quick lookup
        const answersMap = new Map(problem.subQuestionAnswers.map(ans => [ans.subQuestionOrderInProblem, ans]));

        // Separate auto-gradable questions from AI-gradable ones
        problem.problemItems.forEach(item => {
            if (item.itemType !== 'question' || !item.orderInProblem) return;

            const originalQuestion = item;
            const sqAnswer = answersMap.get(item.orderInProblem);

            if (!sqAnswer) { // Should not happen if submit logic is correct
                console.warn(`[GRADING_SERVICE] Answer not found for question order ${item.orderInProblem}`);
                return;
            }

            const userAnswer = sqAnswer.userAnswer;
            if (!userAnswer || (typeof userAnswer === 'string' && userAnswer.trim() === '') || (typeof userAnswer === 'object' && userAnswer !== null && Object.keys(userAnswer).length === 0)) {
                sqAnswer.awardedPoints = 0;
                sqAnswer.aiFeedback = "No answer provided.";
            } else {
                // Auto-grading logic
                let isAutoGraded = true;
                switch (originalQuestion.questionType) {
                    case 'mcq':
                    case 'true_false':
                        sqAnswer.awardedPoints = String(userAnswer).trim().toLowerCase() === String(originalQuestion.correctAnswer).trim().toLowerCase()
                            ? originalQuestion.points
                            : 0;
                        sqAnswer.aiFeedback = sqAnswer.awardedPoints > 0 ? "Correct answer." : `Incorrect. The correct answer was: "${originalQuestion.correctAnswer}".`;
                        break;
                    
                    case 'matching_pairs':
                        const userMatches = userAnswer || {};
                        const correctMatches = originalQuestion.correct_matches || {};
                        const totalPairs = Object.keys(correctMatches).length;
                        let correctCount = 0;
                        if (totalPairs > 0) {
                            for (const keyA in correctMatches) {
                                if (userMatches[keyA] === correctMatches[keyA]) correctCount++;
                            }
                            sqAnswer.awardedPoints = (correctCount / totalPairs) * originalQuestion.points;
                            sqAnswer.aiFeedback = `You correctly matched ${correctCount} out of ${totalPairs} pairs.`;
                        } else {
                            sqAnswer.awardedPoints = 0;
                            sqAnswer.aiFeedback = "No correct matches were defined.";
                        }
                        break;

                    case 'fill_table':
                        const userTableAnswers = userAnswer || {};
                        const correctTableAnswers = originalQuestion.correct_answers_table || {};
                        const totalCells = Object.keys(correctTableAnswers).length;
                        let correctCells = 0;
                        if (totalCells > 0) {
                            for (const cellKey in correctTableAnswers) {
                                if ((userTableAnswers[cellKey] || "").trim().toLowerCase() === (correctTableAnswers[cellKey] || "").trim().toLowerCase()) {
                                    correctCells++;
                                }
                            }
                            sqAnswer.awardedPoints = (correctCells / totalCells) * originalQuestion.points;
                            sqAnswer.aiFeedback = `You correctly filled ${correctCells} out of ${totalCells} cells.`;
                        } else {
                            sqAnswer.awardedPoints = 0;
                            sqAnswer.aiFeedback = "No editable cells were defined.";
                        }
                        break;
                    
                    default: // free_text and others needing AI
                        isAutoGraded = false;
                        questionsForAIGrading.push({ originalQuestion, userAnswer });
                        break;
                }
            }
        });

        // Batch-process questions needing AI grading
        if (questionsForAIGrading.length > 0) {
            console.log(`[GRADING_SERVICE] Batching ${questionsForAIGrading.length} questions for AI grading in problem ${problem.problemOrderInExam}.`);
            
            const problemContent = problem.problemItems.filter(item => item.itemType === 'content');
            const promptData = createBatchGradingPrompt(problemContent, questionsForAIGrading);
            
            try {
                const rawResponse = await fetchGeminiWithConfig(promptData.textPrompt, { temperature: 0.2 }, 'gemini-1.5-flash-latest');
                const gradingResults = await processStepOutput(rawResponse);

                if (!Array.isArray(gradingResults)) throw new Error("AI response was not a valid JSON array.");

                const resultsMap = new Map(gradingResults.map(r => [r.subQuestionOrder, r]));
                
                questionsForAIGrading.forEach(({ originalQuestion }) => {
                    const sqAnswer = answersMap.get(originalQuestion.orderInProblem);
                    const result = resultsMap.get(originalQuestion.orderInProblem);
                    if (sqAnswer && result) {
                        sqAnswer.awardedPoints = Math.max(0, Math.min(Number(result.awardedPoints) || 0, originalQuestion.points));
                        sqAnswer.aiFeedback = result.feedback || "Graded by AI.";
                    } else if (sqAnswer) {
                        sqAnswer.awardedPoints = 0;
                        sqAnswer.aiFeedback = "AI grading result was missing for this question.";
                    }
                });
            } catch (e) {
                console.error(`[GRADING_SERVICE_CATCH] AI batch grading error: ${e.message}`);
                questionsForAIGrading.forEach(({ originalQuestion }) => {
                    const sqAnswer = answersMap.get(originalQuestion.orderInProblem);
                    if (sqAnswer) {
                        sqAnswer.awardedPoints = 0;
                        sqAnswer.aiFeedback = `AI Grading Error: Could not process evaluation.`;
                    }
                });
            }
        }
        
        // Calculate final score for the problem
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