// back-end/prompts/2BAC/SM/2BAC_sm_pc/examPrompt_2bac_sm_pc.js

const { getRandomFromArray } = require('../../../../utils/aiGeneralQuestionGeneratorShared');

function selectRandomSubTopics(lessonParagraphs, count) {
    if (!lessonParagraphs || lessonParagraphs.length === 0) return [];
    const shuffled = [...lessonParagraphs].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count).map(p => (typeof p === 'string' ? p : p.text || ''));
}

module.exports = {
    examConfig: {
        numberOfProblems: 4,
        timeLimitMinutes: 240,
    },

    type: 'multi-step',
    defaultGenerationConfig: { temperature: 0.7, maxOutputTokens: 8192 },
    defaultModelType: 'gemini-1.5-flash-latest',
    defaultStepDelayMs: 1500,

    steps: [
        {
            name: 'prepare_problem_scope',
            processor: (context, previousOutputs) => {
                const { lesson } = context;
                if (!lesson || !lesson.titreLecon) {
                    return { focusedSubTopics: ["concepts généraux"], totalPointsForProblem: 5, domain: "Physique", isChallengeProblem: Math.random() < 0.5 };
                }
                const domain = lesson.domaine || "Physique";
                const subTopics = selectRandomSubTopics(lesson.paragraphes, 3);
                let suggestedPoints = (domain === "Chimie") ? ((Math.random() * 3) + 4.5) : ((Math.random() * 2.5) + 3.5);
                suggestedPoints = Math.round(suggestedPoints * 4) / 4;
                return { focusedSubTopics: subTopics, totalPointsForProblem: suggestedPoints, domain: domain, isChallengeProblem: Math.random() < 0.5 };
            }
        },
        {
            name: 'generate_exam_problem',
            promptGenerator: (context, previousOutputs) => {
                const { lesson } = context;
                const { focusedSubTopics, totalPointsForProblem, domain, isChallengeProblem } = previousOutputs.prepare_problem_scope;
                const challengeInstruction = isChallengeProblem ? `INSTRUCTION SPÉCIALE : Cet exercice doit être un DÉFI.` : `DIFFICULTÉ : Niveau standard de l'Examen National.`;

                // [MODIFIED] The prompt now asks for a list of items.
                return `
Vous êtes un concepteur de sujets pour le Baccalauréat National Marocain, filière Sciences Mathématiques.
Votre mission est de créer UN SEUL exercice de ${domain}.

LIGNES DIRECTRICES :
1.  **Contexte Riche :** L'exercice doit commencer par un texte de présentation détaillé (dans un item de type "paragraph").
2.  **Difficulté :** ${challengeInstruction}
3.  **Barème :** Le total des points est EXACTEMENT ${totalPointsForProblem} points.
4.  **Formatage LaTeX OBLIGATOIRE :** Utilisez '$' pour les maths. Dans JSON, chaque '\\' doit être doublé (e.g., "\\\\frac{a}{b}").

SUJET :
- **Domaine :** ${domain}
- **Thème Principal :** "${lesson.titreLecon}"
- **Concepts à intégrer :** ${focusedSubTopics.join(', ')}.

FORMAT DE SORTIE JSON STRICT (UNIQUEMENT l'objet JSON) :
\`\`\`json
{
  "problemTitle": "Exercice de ${domain} : ${lesson.titreLecon}",
  "examItems": [
    {
      "itemType": "paragraph",
      "text": "Le texte de présentation détaillé de l'exercice ici. Il peut contenir des données numériques comme la masse $m = 50g$ ou la constante $k = 10 N/m$..."
    },
    {
      "itemType": "question",
      "text": "1. Établir l'équation différentielle du mouvement en utilisant la deuxième loi de Newton.",
      "difficultyOrder": 1,
      "points": 1.0,
      "answer": "L'application de la deuxième loi de Newton donne $m a_x = -k x$, donc $\\\ddot{x} + \\\\frac{k}{m} x = 0$."
    },
    {
      "itemType": "question",
      "text": "2. Déterminer l'expression de la période propre $T_0$ de l'oscillateur.",
      "difficultyOrder": 2,
      "points": 0.75,
      "answer": "La période propre est $T_0 = 2\\\\pi \\\\sqrt{\\\\frac{m}{k}}$."
    }
  ],
  "totalPointsForProblem": ${totalPointsForProblem}
}
\`\`\`
`;
            }
        }
    ],

    // [MODIFIED] This aggregator builds the `problemItems` structure.
    finalAggregator: (context, allStepsOutputs) => {
        const aiOutput = allStepsOutputs.generate_exam_problem;
        const { lesson } = context;

        if (!aiOutput || !Array.isArray(aiOutput.examItems) || aiOutput.examItems.length === 0) {
            throw new Error("Erreur interne: les données générées pour le problème de PC sont incomplètes.");
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
                    questionType: 'free_text',
                    correctAnswer: item.answer || 'No model answer provided.',
                });
            }
        });

        const calculatedTotalPoints = problemItems.reduce((sum, item) => {
            return item.itemType === 'question' ? sum + (Number(item.points) || 0) : sum;
        }, 0);
        
        const finalPoints = Math.round(calculatedTotalPoints * 100) / 100;
        
        return {
            problemTitle: aiOutput.problemTitle || `Exercice de ${lesson.domaine}`,
            problemItems: problemItems,
            totalPoints: finalPoints,
        };
    }
};