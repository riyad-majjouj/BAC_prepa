// back-end/prompts/2BAC/SPC/2BAC_spc_svt/examPrompt_2bac_spc_svt.js

module.exports = {
    examConfig: {
        numberOfProblems: 2, // 1 Restitution, 1 Raisonnement
        timeLimitMinutes: 90,
    },
    type: 'multi-step',
    defaultGenerationConfig: { temperature: 0.65, maxOutputTokens: 8192 },
    defaultModelType: 'gemini-1.5-flash-latest',

    steps: [
        {
            name: 'determine_problem_type',
            processor: (context) => {
                const { problemIndex } = context; // Assuming orchestrator passes the problem index
                const problemType = (problemIndex === 0) ? 'Restitution des connaissances' : 'Raisonnement scientifique simple';
                return { problemType };
            }
        },
        {
            name: 'generate_svt_problem',
            promptGenerator: (context, previousOutputs) => {
                const { lesson, trackName } = context;
                const { problemType } = previousOutputs.determine_problem_type;

                if (problemType === 'Restitution des connaissances') {
                    // [MODIFIED] Prompt asks for `examItems`
                    return `
Vous êtes un concepteur de sujets de SVT pour le baccalauréat marocain (filière ${trackName}).
TÂCHE: Créez un exercice de **Restitution des connaissances** (5 points) sur la leçon : "${lesson.titreLecon}".
FORMAT DE SORTIE JSON STRICT:
\`\`\`json
{
  "problemTitle": "Restitution des connaissances : ${lesson.titreLecon}",
  "examItems": [
    { "itemType": "instruction", "text": "Cet exercice évalue la restitution des connaissances." },
    { "itemType": "question", "text": "1. Définir les termes suivants : cellule, mitose.", "points": 2.0, "difficultyOrder": 1, "questionType": "free_text" },
    { "itemType": "question", "text": "2. Citez deux rôles de la membrane plasmique.", "points": 1.0, "difficultyOrder": 2, "questionType": "free_text" },
    { "itemType": "question", "text": "3. Indiquez si les propositions sont Vraies ou Fausses.", "points": 2.0, "difficultyOrder": 3, "questionType": "true_false" }
  ],
  "totalPointsForProblem": 5.0
}
\`\`\`
Répondez UNIQUEMENT avec l'objet JSON.`;
                } else { // Raisonnement scientifique simple
                    // [MODIFIED] Prompt asks for `examItems`
                    return `
Vous êtes un concepteur de sujets de SVT pour le baccalauréat marocain (filière ${trackName}).
TÂCHE: Créez un exercice de **Raisonnement scientifique** (5 points) sur la leçon : "${lesson.titreLecon}".
L'exercice doit se baser sur 1 ou 2 documents simples décrits textuellement.
FORMAT DE SORTIE JSON STRICT:
\`\`\`json
{
  "problemTitle": "Raisonnement scientifique : ${lesson.titreLecon}",
  "examItems": [
    { "itemType": "paragraph", "text": "Pour comprendre un aspect de la réponse immunitaire, on propose les données suivantes. Document 1: un texte décrivant une expérience sur des souris..." },
    { "itemType": "question", "text": "1. À partir du document 1, décrivez les résultats de l'expérience.", "points": 2.0, "difficultyOrder": 1, "questionType": "free_text" },
    { "itemType": "question", "text": "2. Expliquez le phénomène observé en vous basant sur vos connaissances.", "points": 2.0, "difficultyOrder": 2, "questionType": "free_text" },
    { "itemType": "question", "text": "3. Déduisez le type d'immunité mise en jeu.", "points": 1.0, "difficultyOrder": 3, "questionType": "free_text" }
  ],
  "totalPointsForProblem": 5.0
}
\`\`\`
Répondez UNIQUEMENT avec l'objet JSON.`;
                }
            }
        }
    ],

    // [MODIFIED] This aggregator builds the `problemItems` structure.
    finalAggregator: (context, allStepsOutputs) => {
        const aiOutput = allStepsOutputs.generate_svt_problem;
        if (!aiOutput || !Array.isArray(aiOutput.examItems)) {
            throw new Error("Erreur: données générées pour le problème de SVT (SPC) sont incomplètes.");
        }
        
        const problemItems = [];
        let questionCounter = 0;

        aiOutput.examItems.forEach(item => {
            if (item.itemType === 'paragraph' || item.itemType === 'instruction') {
                problemItems.push({ itemType: 'content', contentType: item.itemType, text: item.text });
            } else if (item.itemType === 'question') {
                questionCounter++;
                problemItems.push({
                    itemType: 'question',
                    text: item.text,
                    points: item.points || 0,
                    orderInProblem: item.difficultyOrder || questionCounter,
                    questionType: item.questionType || 'free_text',
                    correctAnswer: item.answer,
                });
            }
        });

        const calculatedTotalPoints = problemItems.reduce((sum, item) => item.itemType === 'question' ? sum + (Number(item.points) || 0) : sum, 0);

        return {
            problemTitle: aiOutput.problemTitle,
            problemItems: problemItems,
            totalPoints: Math.round(calculatedTotalPoints * 100) / 100,
            lesson: context.lesson.titreLecon
        };
    }
};