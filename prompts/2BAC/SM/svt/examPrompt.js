// back-end/prompts/2BAC/SM/2BAC_sm_svt/examPrompt_2bac_sm_svt.js

module.exports = {
    examConfig: {
        numberOfProblems: 4, // 1 Restitution, 3 Raisonnement
        timeLimitMinutes: 180,
    },

    type: 'multi-step',
    defaultGenerationConfig: { temperature: 0.7, maxOutputTokens: 8192 },
    defaultModelType: 'gemini-1.5-flash-latest',

    steps: [
        {
            name: 'prepare_problem_type',
            processor: (context) => {
                const { lesson, problemIndex } = context; // Assuming orchestrator passes problemIndex
                let problemType = 'Raisonnement (Analyse de documents)'; // Default
                if (problemIndex === 0) {
                    problemType = 'Restitution des connaissances';
                } else {
                    const lessonTitleLower = lesson.titreLecon.toLowerCase();
                    if (lessonTitleLower.includes('statistiques') || lessonTitleLower.includes('génétique')) {
                        problemType = 'Raisonnement (Génétique)';
                    }
                }
                return { problemType };
            }
        },
        {
            name: 'generate_svt_problem',
            promptGenerator: (context, previousOutputs) => {
                const { lesson } = context;
                const { problemType } = previousOutputs.prepare_problem_type;

                if (problemType === 'Restitution des connaissances') {
                    // [MODIFIED] Prompt asks for `examItems`
                    return `
Vous êtes un concepteur de sujets de SVT pour le baccalauréat marocain (SM).
TÂCHE: Créez la PARTIE I (Restitution des connaissances) sur la leçon : "${lesson.titreLecon}".
Le barème est de 5 points.
FORMAT DE SORTIE JSON STRICT:
\`\`\`json
{
  "problemTitle": "Restitution des connaissances : ${lesson.titreLecon}",
  "examItems": [
    { "itemType": "instruction", "text": "Le premier exercice évalue la restitution des connaissances." },
    { "itemType": "question", "text": "1. Définir les termes suivants : ...", "points": 1.0, "difficultyOrder": 1, "questionType": "free_text" },
    { "itemType": "question", "text": "2. Citez deux caractéristiques de ...", "points": 1.0, "difficultyOrder": 2, "questionType": "free_text" },
    { "itemType": "question", "text": "3. Pour chacune des propositions suivantes, reportez le numéro et indiquez si elle est Vraie ou Fausse :\\n a) ...\\n b) ...", "points": 2.0, "difficultyOrder": 3, "questionType": "true_false_justify" },
    { "itemType": "question", "text": "4. Reliez chaque élément du groupe 1 à sa définition.", "points": 1.0, "difficultyOrder": 4, "questionType": "matching_pairs" }
  ],
  "totalPointsForProblem": 5.0
}
\`\`\`
Répondez UNIQUEMENT avec l'objet JSON.`;
                } else {
                    // [MODIFIED] Prompt asks for `examItems`
                    const geneticsInstruction = problemType === 'Raisonnement (Génétique)' 
                        ? "Cet exercice est un problème classique de génétique (lois de Mendel, etc.)."
                        : "Cet exercice présente une situation problème avec des documents (décrits textuellement).";
                    
                    return `
Vous êtes un concepteur de sujets de SVT pour le baccalauréat marocain (SM).
TÂCHE: Créez la PARTIE II (Raisonnement scientifique) sur la leçon : "${lesson.titreLecon}".
${geneticsInstruction}
Le barème est de 5 points.
FORMAT DE SORTIE JSON STRICT:
\`\`\`json
{
  "problemTitle": "Raisonnement scientifique : ${lesson.titreLecon}",
  "examItems": [
    { "itemType": "paragraph", "text": "Le contexte du problème et la description des documents (Document 1, Document 2) sont présentés ici." },
    { "itemType": "question", "text": "1. À partir du document 1, décrivez l'évolution de...", "points": 1.25, "difficultyOrder": 1, "questionType": "free_text" },
    { "itemType": "question", "text": "2. En exploitant les documents, expliquez le mécanisme de...", "points": 1.75, "difficultyOrder": 2, "questionType": "free_text" },
    { "itemType": "question", "text": "3. Déduisez la relation entre les phénomènes observés.", "points": 1.0, "difficultyOrder": 3, "questionType": "free_text" }
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
            throw new Error("Erreur interne : les données générées pour le problème de SVT sont incomplètes.");
        }
        
        const problemItems = [];
        let questionCounter = 0;

        aiOutput.examItems.forEach(item => {
            if (item.itemType === 'paragraph' || item.itemType === 'instruction') {
                problemItems.push({
                    itemType: 'content',
                    contentType: item.itemType,
                    text: item.text,
                });
            } else if (item.itemType === 'question') {
                questionCounter++;
                problemItems.push({
                    itemType: 'question',
                    text: item.text,
                    points: item.points || 0,
                    orderInProblem: item.difficultyOrder || questionCounter,
                    questionType: item.questionType || 'free_text',
                    correctAnswer: item.answer, // Can be undefined
                    options: item.options,
                    group_a_items: item.groupA,
                    group_b_items: item.groupB,
                });
            }
        });

        const calculatedTotalPoints = problemItems.reduce((sum, item) => {
            return item.itemType === 'question' ? sum + (Number(item.points) || 0) : sum;
        }, 0);

        return {
            problemTitle: aiOutput.problemTitle,
            problemItems: problemItems,
            totalPoints: Math.round(calculatedTotalPoints * 100) / 100,
        };
    }
};