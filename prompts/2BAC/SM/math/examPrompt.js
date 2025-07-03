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
    defaultGenerationConfig: { temperature: 0.65, maxOutputTokens: 4096 },
    defaultModelType: 'gemini-1.5-flash-latest',
    defaultStepDelayMs: 1500,

    steps: [
        {
            name: 'prepare_problem_scope',
            processor: (context, previousOutputs) => {
                const { lessonTitle, curriculumData } = context;

                if (!curriculumData || !Array.isArray(curriculumData)) {
                    return { focusedSubTopics: ["concepts généraux"], totalPointsForProblem: 4, isChallengeProblem: Math.random() < 0.4 };
                }
                const lesson = curriculumData.find(l => l.titreLecon === lessonTitle);
                if (!lesson) {
                    return { focusedSubTopics: ["concepts généraux"], totalPointsForProblem: 4, isChallengeProblem: Math.random() < 0.4 };
                }

                const subTopics = selectRandomSubTopics(lesson.paragraphes, 3);
                let suggestedPoints;
                const lowerCaseLesson = lessonTitle.toLowerCase();
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
                    isChallengeProblem: Math.random() < 0.4
                };
            }
        },
        {
            name: 'generate_exam_problem',
            description: 'Generates a full exam-style math problem with sub-questions, mimicking Moroccan national exams.',
            promptGenerator: (context, previousOutputs) => {
                const { academicLevelName, trackName, lessonTitle } = context;
                const { focusedSubTopics, totalPointsForProblem, isChallengeProblem } = previousOutputs.prepare_problem_scope;

                const challengeInstruction = isChallengeProblem 
                    ? `INSTRUCTION SPÉCIALE : Ce problème doit être un DÉFI intellectuel, non conventionnel et difficile, pour tester les meilleurs élèves.`
                    : `DIFFICULTÉ : Le problème doit être d'un niveau standard pour l'Examen National (exigeant mais juste).`;

                const subTopicsText = focusedSubTopics && focusedSubTopics.length > 0
                    ? `Le problème doit s'articuler autour des concepts suivants : ${focusedSubTopics.join(', ')}.`
                    : "Le problème doit couvrir les aspects fondamentaux de ce chapitre.";

                // --- *** بداية التعديل على البرومبت لتبسيطه قليلاً *** ---
                return `
Vous êtes un concepteur de problèmes de mathématiques pour le Baccalauréat Marocain, filière ${trackName}.
Votre mission est de créer UN SEUL exercice (problème) qui reflète le style et la rigueur des examens nationaux.

LIGNES DIRECTRICES :
1.  **Cohérence :** Les questions doivent s'enchaîner logiquement. Le résultat d'une question peut être utilisé dans la suivante.
2.  **Difficulté :** ${challengeInstruction}
3.  **Barème :** Le total des points pour cet exercice est EXACTEMENT ${totalPointsForProblem} points. Répartissez-les judicieusement (ex: 0.25, 0.5, 0.75).
4.  **Formatage :**EXIGENCE ABSOLUE POUR LE FORMATAGE MATHÉMATIQUE (LaTeX pour JSON):
1.  **Délimiteurs OBLIGATOIRES :**
    - Utilisez \`$ ... $\` pour TOUTE expression mathématique en ligne (inline), comme une variable ($f$), un nombre ($3$), une appartenance ($x \\in H$).
    - Utilisez \`$$ ... $$\` pour TOUTE expression mathématique en bloc (display), comme les fractions, les intégrales, les limites.

2.  **Échappement OBLIGATOIRE des backslashs :**
    - À l'intérieur du JSON généré, chaque backslash (\\) d'une commande LaTeX DOIT être doublé (échappé) pour être valide.
    - EXEMPLE CORRECT : Pour obtenir $\\implies$, vous devez écrire "\\\\implies" dans la chaîne de caractères du JSON. Pour $\\in$, vous devez écrire "\\\\in".

3.  **EXEMPLES À SUIVRE SCRUPULEUSEMENT :**
    - Appartenance : "Si $x \\in H$ et $y \\in H$..."
    - Implication : "L'assertion $(1) \\implies (2)$ est vraie."
    - Limite : "Calculer $$\\lim_{x \\to +\\infty} (\\sqrt{x^2+x} - x)$$"
    - Fraction : "$$f(x) = \\frac{x^2 - 4}{x - 2}$$"

4.  Cette règle s'applique à TOUS les champs du JSON : "question", "options", et "correctAnswer".

SUJET :
- **Thème Principal :** "${lessonTitle}"
- **Concepts à intégrer :** ${subTopicsText}

FORMAT DE SORTIE JSON STRICT (UNIQUEMENT l'objet JSON, sans aucun autre texte avant ou après) :
\`\`\`json
{
  "problemTitle": "Problème sur ${lessonTitle}",
  "text": "Partie A - On considère la fonction \\(g\\) définie sur \\(]0, +\\infty[\\) par \\(g(x) = x^2 - \\ln(x)\\).",
  "subQuestions": [
    {
      "text": "1. a) Calculer \\(\\lim_{x \\to 0^+} g(x)\\).",
      "difficultyOrder": 1,
      "points": 0.5
    },
    {
      "text": "1. b) Montrer que \\(g\\) est croissante et dresser son tableau de variations.",
      "difficultyOrder": 2,
      "points": 0.75
    },
    {
      "text": "2. En déduire que \\(g(x) > 0\\) pour tout \\(x \\in ]0, +\\infty[\\).",
      "difficultyOrder": 3,
      "points": 0.5
    }
  ],
  "totalPoints": ${totalPointsForProblem},
  "lesson": "${lessonTitle}"
}
\`\`\`
Vérifiez que la somme des points dans "subQuestions" est rigoureusement égale à "totalPoints".
`;
                // --- *** نهاية التعديل على البرومبت *** ---
            }
        }
    ],

    finalAggregator: (context, allStepsOutputs) => {
        const problemData = allStepsOutputs.generate_exam_problem;

        if (!problemData || !problemData.text || !Array.isArray(problemData.subQuestions) || typeof problemData.totalPoints !== 'number') {
             // التحقق من الحقول الأساسية
            console.error("[MATH_EXAM_AGGREGATOR] Missing or invalid critical data from the generation step:", problemData);
            throw new Error("Erreur interne: les données générées pour le problème de maths sont incomplètes.");
        }

        let calculatedPoints = problemData.subQuestions.reduce((sum, sq) => sum + (Number(sq.points) || 0), 0);
        calculatedPoints = Math.round(calculatedPoints * 100) / 100;

        if (Math.abs(calculatedPoints - problemData.totalPoints) > 0.1) {
            console.warn(`[MATH_EXAM_AGGREGATOR_WARN] Points mismatch. Stated: ${problemData.totalPoints}, Calculated: ${calculatedPoints}. Adjusting totalPoints.`);
            problemData.totalPoints = calculatedPoints;
        }

        problemData.subQuestions.sort((a, b) => a.difficultyOrder - b.difficultyOrder).forEach((sq, index) => {
            sq.difficultyOrder = index + 1;
        });

        return {
            problemTitle: problemData.problemTitle || `Exercice sur ${context.lessonTitle}`,
            text: problemData.text,
            subQuestions: problemData.subQuestions,
            totalPoints: problemData.totalPoints,
            lesson: problemData.lesson || context.lessonTitle,
        };
    }
};