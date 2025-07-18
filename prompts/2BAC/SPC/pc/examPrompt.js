// back-end/prompts/2BAC/SPC/2BAC_spc_pc/examPrompt_2bac_spc_pc.js

const { getRandomFromArray } = require('../../../../utils/aiGeneralQuestionGeneratorShared');

function selectRandomSubTopics(lessonParagraphs, count) {
    if (!lessonParagraphs || lessonParagraphs.length === 0) return [];
    const shuffled = [...lessonParagraphs].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count).map(p => (typeof p === 'string' ? p : p.text || ''));
}

module.exports = {
    examConfig: {
        numberOfProblems: 3, // 1 Chimie, 2 Physique
        timeLimitMinutes: 180, // 3 heures
    },
    type: 'multi-step',
    defaultGenerationConfig: { temperature: 0.65, maxOutputTokens: 8192 },
    defaultModelType: 'gemini-1.5-flash-latest',

    steps: [
        {
            name: 'prepare_problem_scope',
            processor: (context) => {
                const { lesson } = context;
                const domain = lesson.domaine || "Physique";
                const subTopics = selectRandomSubTopics(lesson.paragraphes, 2);
                
                // En SPC, la chimie est sur 7 points, les 13 points restants sont pour la physique.
                let suggestedPoints = (domain === "Chimie") ? 7 : (13 / 2); // 6.5 points for each physics exercise
                suggestedPoints += (Math.random() - 0.5); // Adds a small variation of +/- 0.5

                return {
                    focusedSubTopics: subTopics,
                    totalPointsForProblem: Math.round(suggestedPoints * 2) / 2, // Rounds to nearest 0.25 or 0.5
                    domain: domain
                };
            }
        },
        {
            name: 'generate_exam_problem',
            promptGenerator: (context, previousOutputs) => {
                const { lesson, trackName } = context;
                const { focusedSubTopics, totalPointsForProblem, domain } = previousOutputs.prepare_problem_scope;

                // [MODIFIED] The prompt now asks for a list of items.
                return `
Vous êtes un concepteur de sujets pour le Baccalauréat Marocain, filière ${trackName} (Sciences Physiques).
Votre mission : créer UN SEUL exercice de ${domain} de niveau standard.

LIGNES DIRECTRICES :
1.  **Contexte Clair :** Commencez par un texte de présentation (item de type "paragraph").
2.  **Barème :** Le total des points est EXACTEMENT ${totalPointsForProblem} points.
3.  **Formatage LaTeX :** TOUT ce qui est mathématique doit être entre '$'. Dans JSON, chaque '\\' doit être doublé (e.g., "$a_x = -g$").

SUJET :
- **Domaine :** ${domain}
- **Thème :** "${lesson.titreLecon}"
- **Concepts à intégrer :** ${focusedSubTopics.join(', ')}.

FORMAT DE SORTIE JSON STRICT (UNIQUEMENT l'objet JSON) :
\`\`\`json
{
  "problemTitle": "Exercice de ${domain} : ${lesson.titreLecon}",
  "examItems": [
    {
      "itemType": "paragraph",
      "text": "Le texte de présentation de l'exercice ici. Exemple: On étudie la chute d'une bille dans un fluide..."
    },
    {
      "itemType": "question",
      "text": "1. Appliquer la deuxième loi de Newton pour trouver l'expression de l'accélération.",
      "difficultyOrder": 1,
      "points": 1.5,
      "answer": "La deuxième loi de Newton $\\\\Sigma \\\\vec{F}_{ext} = m \\\\vec{a}_G$ projetée sur l'axe vertical donne..."
    },
    {
      "itemType": "question",
      "text": "2. En déduire l'équation horaire de la vitesse $v(t)$.",
      "difficultyOrder": 2,
      "points": 1.0,
      "answer": "Par intégration de l'accélération, on trouve $v(t) = a t + v_0$."
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
        if (!aiOutput || !Array.isArray(aiOutput.examItems)) {
            throw new Error("Erreur: les données générées pour le problème de PC (SPC) sont incomplètes.");
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
                    questionType: 'free_text',
                    correctAnswer: item.answer || 'No model answer provided.',
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