// back-end/prompts/2BAC/SM/2BAC_sm_Math/examPrompt_2bac_sm_math.js

const { getRandomFromArray } = require('../../../../utils/aiGeneralQuestionGeneratorShared');

function selectRandomSubTopics(lessonParagraphs, count) {
    if (!lessonParagraphs || lessonParagraphs.length === 0) return [];
    const shuffled = [...lessonParagraphs].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count).map(p => (typeof p === 'string' ? p : p.text || ''));
}

module.exports = {
    examConfig: {
        numberOfProblems: () => (Math.random() < 0.5 ? 4 : 5),
        timeLimitMinutes: 240,
    },

    type: 'multi-step',
    defaultGenerationConfig: { temperature: 0.8, maxOutputTokens: 8192 }, // Increased temperature slightly for more creativity
    defaultModelType: 'gemini-1.5-flash-latest',

    steps: [
        {
            name: 'prepare_problem_scope',
            processor: (context, previousOutputs) => {
                const { lesson } = context;

                if (!lesson || !lesson.titreLecon) {
                    return { 
                        focusedSubTopics: ["concepts généraux"], 
                        totalPointsForProblem: 4, 
                        isChallengeProblem: Math.random() < 0.4,
                        randomSeed: Math.random() // <-- NOUVEAU: Ajout d'une graine aléatoire
                    };
                }

                const subTopics = selectRandomSubTopics(lesson.paragraphes, 3);
                let suggestedPoints;
                const lowerCaseLesson = lesson.titreLecon.toLowerCase();

                if (lowerCaseLesson.includes('étude de fonctions') || lowerCaseLesson.includes('analyse') || lowerCaseLesson.includes('calcul intégral')) {
                    suggestedPoints = (Math.random() * 4) + 7; // 7-11 points
                } else if (lowerCaseLesson.includes('complexes') || lowerCaseLesson.includes('arithmétique') || lowerCaseLesson.includes('structures')) {
                    suggestedPoints = (Math.random() * 2) + 3; // 3-5 points
                } else {
                    suggestedPoints = (Math.random() * 3) + 4; // 4-7 points
                }
                
                suggestedPoints = Math.round(suggestedPoints * 4) / 4;

                return {
                    focusedSubTopics: subTopics,
                    totalPointsForProblem: suggestedPoints,
                    isChallengeProblem: Math.random() < 0.4,
                    randomSeed: Math.random() // <-- NOUVEAU: Ajout d'une graine aléatoire
                };
            }
        },
        {
            name: 'generate_exam_problem',
            description: 'Generates a full exam-style math problem with sub-questions, mimicking Moroccan national exams.',
            promptGenerator: (context, previousOutputs) => {
                const { lesson } = context;
                const { focusedSubTopics, totalPointsForProblem, isChallengeProblem, randomSeed } = previousOutputs.prepare_problem_scope;

                const challengeInstruction = isChallengeProblem 
                    ? `INSTRUCTION SPÉCIALE : Ce problème doit être un DÉFI intellectuel, non conventionnel et difficile.`
                    : `DIFFICULTÉ : Le problème doit être d'un niveau standard pour l'Examen National.`;

                const subTopicsText = focusedSubTopics && focusedSubTopics.length > 0
                    ? `Le problème doit s'articuler autour des concepts suivants : ${focusedSubTopics.join(', ')}.`
                    : "Le problème doit couvrir les aspects fondamentaux de ce chapitre.";
                
                // <-- MODIFIÉ: Instructions beaucoup plus fortes pour la créativité
                return `
Vous êtes un concepteur expert de problèmes de mathématiques pour le Baccalauréat Marocain, filière Sciences Mathématiques.
Votre mission est de créer UN SEUL exercice (problème) cohérent et **original**.

LIGNES DIRECTRICES :
1.  **Originalité et Créativité :** C'est la règle la plus importante. Vous devez générer un problème **entièrement nouveau** à chaque exécution. Ne réutilisez JAMAIS les mêmes fonctions, suites, ou valeurs numériques. Variez les contextes (géométrique, analyse pure, etc.) et les formes des fonctions. Utilisez cette graine aléatoire comme inspiration pour la nouveauté : ${randomSeed}.
2.  **Cohérence :** Les questions doivent s'enchaîner logiquement. Souvent, le résultat d'une question est utilisé dans la suivante.
3.  **Difficulté :** ${challengeInstruction}
4.  **Barème :** Le total des points pour toutes les questions doit être EXACTEMENT ${totalPointsForProblem} points.
5.  **Formatage LaTeX OBLIGATOIRE :** TOUTE expression mathématique (variables, nombres, formules, symboles) doit être entourée de '$'. Dans le JSON, chaque '\\' doit être échappé (e.g., "\\\\frac{a}{b}").

SUJET :
- **Thème Principal :** "${lesson.titreLecon}"
- **Concepts à intégrer :** ${subTopicsText}

FORMAT DE SORTIE JSON STRICT (UNIQUEMENT l'objet JSON) :
L'exemple ci-dessous est un **modèle structurel**, vous devez créer le contenu mathématique réel vous-même.

\`\`\`json
{
  "problemTitle": "Problème d'analyse sur ${lesson.titreLecon}",
  "examItems": [
    {
      "itemType": "instruction",
      "text": "Partie A : Introduction de la première partie (par exemple, la définition d'une fonction auxiliaire $g$, ou d'une suite $u_n$)."
    },
    {
      "itemType": "question",
      "text": "1. a) Première sous-question simple (par ex., calculer une limite, vérifier une condition initiale, calculer $g'(x)$).",
      "difficultyOrder": 1,
      "points": 0.5
    },
    {
      "itemType": "question",
      "text": "1. b) Deuxième sous-question qui s'appuie sur la précédente (par ex., déduire le signe de $g(x)$ à partir de son tableau de variation).",
      "difficultyOrder": 2,
      "points": 0.75
    },
    {
      "itemType": "instruction",
      "text": "Partie B : Introduction de la deuxième partie, utilisant les résultats de la Partie A (par ex., étude de la fonction principale $f$ ou analyse de la convergence de la suite)."
    },
    {
      "itemType": "question",
      "text": "2. a) Question de calcul ou de démonstration dans cette nouvelle partie.",
      "difficultyOrder": 3,
      "points": 1.0
    }
  ],
  "totalPointsForProblem": ${totalPointsForProblem}
}
\`\`\`
Rappel final : Soyez créatif et assurez-vous que la somme des points de vos questions est rigoureusement égale à ${totalPointsForProblem}.
`;
            }
        }
    ],

    // Le finalAggregator reste le même, il est bien conçu.
    finalAggregator: (context, allStepsOutputs) => {
        const aiOutput = allStepsOutputs.generate_exam_problem;

        if (!aiOutput || !Array.isArray(aiOutput.examItems) || aiOutput.examItems.length === 0) {
            console.error("[MATH_SM_AGGREGATOR] AI output is missing or has an invalid 'examItems' array:", aiOutput);
            throw new Error("Erreur interne: les données générées par l'IA pour le problème de maths sont invalides.");
        }

        const problemItems = [];
        let questionCounter = 0;

        aiOutput.examItems.forEach(item => {
            if (item.itemType === 'instruction' || item.itemType === 'paragraph') {
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
                    correctAnswer: item.answer || 'La correction détaillée dépend de la méthode suivie.',
                });
            }
        });

        const calculatedTotalPoints = problemItems.reduce((sum, item) => {
            return item.itemType === 'question' ? sum + (Number(item.points) || 0) : sum;
        }, 0);
        
        const finalPoints = Math.round(calculatedTotalPoints * 100) / 100;

        if (Math.abs(finalPoints - aiOutput.totalPointsForProblem) > 0.15) { 
            console.warn(`[MATH_SM_AGGREGATOR_WARN] Points mismatch. AI Stated: ${aiOutput.totalPointsForProblem}, Calculated: ${finalPoints}. Using calculated value.`);
        }

        return {
            problemTitle: aiOutput.problemTitle || `Exercice sur ${context.lesson.titreLecon}`,
            problemItems: problemItems,
            problemTotalPossibleRawScore: finalPoints,
        };
    }
};