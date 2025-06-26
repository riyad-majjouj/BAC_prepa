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
    defaultGenerationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
    defaultModelType: 'gemini-1.5-flash-latest',
    defaultStepDelayMs: 1500,

    steps: [
        {
            name: 'prepare_problem_scope',
            processor: (context, previousOutputs) => {
                // --- *** بداية التصحيح *** ---
                // لم نعد بحاجة للبحث في curriculumData. نستخدم كائن الدرس مباشرةً.
                const { lesson } = context; 

                if (!lesson || !lesson.titreLecon) {
                    console.warn(`[PC_EXAM_PREP_WARN] Invalid lesson object in context. Using fallback.`);
                    return { focusedSubTopics: ["concepts généraux"], totalPointsForProblem: 5, domain: "Physique", isChallengeProblem: Math.random() < 0.5 };
                }

                const domain = lesson.domaine || "Physique";
                const subTopics = selectRandomSubTopics(lesson.paragraphes, 3);
                
                let suggestedPoints;
                if (domain === "Chimie") {
                    suggestedPoints = (Math.random() * 3) + 4.5;
                } else {
                    suggestedPoints = (Math.random() * 2.5) + 3.5;
                }
                
                suggestedPoints = Math.round(suggestedPoints * 4) / 4;
                console.log(`[PC_EXAM_PREP] For ${domain} lesson "${lesson.titreLecon}", focusing on: [${subTopics.join(', ')}]. Suggested points: ${suggestedPoints}`);
                return { focusedSubTopics: subTopics, totalPointsForProblem: suggestedPoints, domain: domain, isChallengeProblem: Math.random() < 0.5 };
                // --- *** نهاية التصحيح *** ---
            }
        },
        {
            name: 'generate_exam_problem',
            promptGenerator: (context, previousOutputs) => {
                const { lesson } = context; // نستخدم lesson مباشرةً
                const { focusedSubTopics, totalPointsForProblem, domain, isChallengeProblem } = previousOutputs.prepare_problem_scope;

                const challengeInstruction = isChallengeProblem 
                    ? `INSTRUCTION SPÉCIALE DE DIFFICULTÉ : Cet exercice doit être un DÉFI. Créez un scénario non standard qui oblige l'élève à combiner plusieurs lois ou à analyser une situation complexe.`
                    : `DIFFICULTÉ : L'exercice doit être d'un niveau standard pour l'Examen National (exigeant mais juste).`;

                return `
Vous êtes un concepteur de sujets pour le Baccalauréat National Marocain, filière Sciences Mathématiques.
Votre mission est de créer UN SEUL exercice de ${domain} qui reflète le style et la rigueur des examens nationaux.

LIGNES DIRECTRICES :
1.  **Contexte Riche et Cohérent :** L'exercice doit commencer par un texte de présentation détaillé.
2.  **Qualité des Questions :** ${challengeInstruction}
3.  **Barème :** Le total des points est EXACTEMENT ${totalPointsForProblem} points.
4.  **Formatage :** Utilisez LaTeX (\\\\( ... \\\\) et \\\\\[ ... \\\\\]). Ne dépendez pas de graphiques.

SUJET DE L'EXERCICE :
- **Domaine :** ${domain}
- **Thème Principal :** "${lesson.titreLecon}"
- **Concepts à intégrer :** ${focusedSubTopics.join(', ')}.

INSPIRATION (Qualité attendue) :
- **Exemple Chimie :** Étude d'une solution d'acide, puis sa réaction avec une autre base, puis son estérification.
- **Exemple Mécanique :** Chute d'une balle en deux phases (libre, puis avec frottement), en utilisant la méthode d'Euler.

FORMAT DE SORTIE JSON STRICT (UNIQUEMENT l'objet JSON) :
\`\`\`json
{
  "problemTitle": "Exercice de ${domain} : ${lesson.titreLecon}",
  "text": "Le texte de présentation détaillé de l'exercice ici...",
  "subQuestions": [
    {
      "text": "1. Établir l'équation différentielle...",
      "difficultyOrder": 1,
      "points": 1.0
    },
    {
      "text": "2. Déterminer une expression...",
      "difficultyOrder": 2,
      "points": 0.75
    }
  ],
  "totalPoints": ${totalPointsForProblem},
  "lesson": "${lesson.titreLecon}"
}
\`\`\`
`;
            }
        }
    ],

    finalAggregator: (context, allStepsOutputs) => {
        const problemData = allStepsOutputs.generate_exam_problem;
        const { lesson } = context;

        if (!problemData || !problemData.text || !Array.isArray(problemData.subQuestions) || typeof problemData.totalPoints !== 'number') {
            throw new Error("Erreur interne: les données générées sont incomplètes.");
        }
        let calculatedPoints = problemData.subQuestions.reduce((sum, sq) => sum + (Number(sq.points) || 0), 0);
        calculatedPoints = Math.round(calculatedPoints * 100) / 100;
        if (Math.abs(calculatedPoints - problemData.totalPoints) > 0.1) {
            problemData.totalPoints = calculatedPoints;
        }
        problemData.subQuestions.sort((a, b) => a.difficultyOrder - b.difficultyOrder).forEach((sq, index) => {
            sq.difficultyOrder = index + 1;
        });
        return { ...problemData, lesson: lesson.titreLecon };
    }
};