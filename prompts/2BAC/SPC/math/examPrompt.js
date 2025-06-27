// prompts/2BAC/SM/math/examPrompt.js (أو المسار الخاص بـ SPC)

module.exports = {
    examConfig: {
        numberOfProblems: () => (Math.random() < 0.5 ? 4 : 5),
        timeLimitMinutes: 180, 
    },
    type: 'multi-step',
    defaultGenerationConfig: { temperature: 0.6, maxOutputTokens: 4096 },
    defaultModelType: 'gemini-1.5-flash-latest',

    steps: [
        {
            name: 'prepare_problem_scope',
            processor: (context) => {
                const { lesson } = context;

                // --- START: هذا هو الإصلاح الرئيسي ---
                // استخدم lesson.conceptsCles بدلاً من lesson.paragraphes
                const subTopics = (lesson.conceptsCles || [])
                    .sort(() => 0.5 - Math.random()) // اختر مفاهيم عشوائية
                    .slice(0, 3); // خذ 3 منها كحد أقصى للتركيز عليها
                // --- END: نهاية الإصلاح الرئيسي ---

                let suggestedPoints;
                const lowerCaseLesson = (lesson.titreLecon || '').toLowerCase();

                if (lowerCaseLesson.includes('étude de fonctions') || lowerCaseLesson.includes('analyse')) {
                    suggestedPoints = (Math.random() * 3) + 7; // 7-10 points for a full analysis problem
                } else if (lowerCaseLesson.includes('complexes') || lowerCaseLesson.includes('arithmétique')) {
                    suggestedPoints = (Math.random() * 2) + 3; // 3-5 points
                } else {
                    suggestedPoints = (Math.random() * 2) + 4; // 4-6 points
                }
                
                return {
                    focusedSubTopics: subTopics,
                    totalPointsForProblem: Math.round(suggestedPoints * 2) / 2,
                };
            }
        },
        {
            name: 'generate_exam_problem',
            promptGenerator: (context, previousOutputs) => {
                const { academicLevelName, trackName, lesson } = context;
                const { focusedSubTopics, totalPointsForProblem } = previousOutputs.prepare_problem_scope;

                // الآن subTopicsText ستحتوي على مفاهيم حقيقية ومتنوعة
                const subTopicsText = focusedSubTopics && focusedSubTopics.length > 0
                    ? `Le problème doit s'articuler spécifiquement autour des concepts suivants : ${focusedSubTopics.join('; ')}.`
                    : "Le problème doit couvrir les aspects fondamentaux de ce chapitre.";

                // تم إضافة lesson.domaine لتوفير سياق أفضل للذكاء الاصطناعي
                return `
Vous êtes un concepteur expert de problèmes de mathématiques pour le Baccalauréat Marocain, filière ${trackName}.
Votre mission est de créer UN SEUL exercice de type examen national.

LIGNES DIRECTRICES :
1.  **Cohérence :** Les questions doivent s'enchaîner logiquement et explorer les concepts en profondeur.
2.  **Difficulté :** Niveau standard pour un élève de ${trackName}, axé sur l'application des méthodes du cours.
3.  **Barème :** Le total des points pour cet exercice est EXACTEMENT ${totalPointsForProblem} points. Répartissez-les judicieusement (ex: 0.5, 0.75, 1, 1.25).
4.  **Formatage :** Utilisez LaTeX pour les expressions mathématiques. Exemples : \\( f(x) = \\frac{1}{x} \\) et \\\[ \\lim_{x \\to \\infty} f(x) = 0 \\\]

SUJET :
- **Domaine :** ${lesson.domaine || 'Mathématiques Générales'}
- **Thème Principal :** "${lesson.titreLecon}"
- **Concepts à intégrer :** ${subTopicsText}

FORMAT DE SORTIE JSON STRICT (UNIQUEMENT l'objet JSON) :
\`\`\`json
{
  "problemTitle": "Exercice : ${lesson.titreLecon}",
  "text": "Le texte de l'exercice commence ici. Il peut être divisé en plusieurs parties (Partie A, Partie B, etc.). Par exemple : Soit \\(f\\) la fonction définie sur \\( \\mathbb{R} \\) par \\( f(x) = ... \\)",
  "subQuestions": [
    { "text": "1. a) Calculer la limite de \\(f\\) en \\(+\\infty\\).", "difficultyOrder": 1, "points": 0.75 },
    { "text": "1. b) Étudier la branche infinie de la courbe \\( (C_f) \\).", "difficultyOrder": 2, "points": 0.5 },
    { "text": "2. a) Montrer que pour tout \\(x\\) de \\( D_f \\), \\( f'(x) = ... \\) et étudier son signe.", "difficultyOrder": 3, "points": 1.0 },
    { "text": "2. b) Dresser le tableau de variations de \\(f\\).", "difficultyOrder": 4, "points": 0.75 }
  ],
  "totalPoints": ${totalPointsForProblem},
  "lesson": "${lesson.titreLecon}"
}
\`\`\`
Vérifiez que la somme des points des sous-questions est rigoureusement égale à "totalPoints". La structure JSON doit être parfaite.`;
            }
        }
    ],
    // finalAggregator يبقى كما هو
    finalAggregator: (context, allStepsOutputs) => {
        const problemData = allStepsOutputs.generate_exam_problem;
        if (!problemData || !problemData.text || !Array.isArray(problemData.subQuestions) || problemData.subQuestions.length === 0) {
             throw new Error("Erreur: données générées pour le problème de maths sont incomplètes ou vides.");
        }
        
        // التحقق من وجود نص في كل سؤال فرعي
        problemData.subQuestions.forEach((sq, index) => {
            if (!sq || typeof sq.text !== 'string' || sq.text.trim() === '') {
                throw new Error(`AI generation failed: A math sub-question (index ${index}) was generated without text.`);
            }
        });

        let calculatedPoints = problemData.subQuestions.reduce((sum, sq) => sum + (Number(sq.points) || 0), 0);
        
        if (Math.abs(calculatedPoints - problemData.totalPoints) > 0.1) {
            console.warn(`[MATH_EXAM_AGGREGATOR_WARN] Points mismatch. Stated: ${problemData.totalPoints}, Calculated: ${calculatedPoints}. Adjusting totalPoints.`);
            problemData.totalPoints = Math.round(calculatedPoints * 100) / 100;
        }

        return { ...problemData, lesson: context.lesson.titreLecon };
    }
};