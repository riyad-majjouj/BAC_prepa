module.exports = {
    examConfig: {
        numberOfProblems: () => (Math.random() < 0.5 ? 4 : 5),
        timeLimitMinutes: 180, // 3 heures pour SPC
    },
    type: 'multi-step',
    defaultGenerationConfig: { temperature: 0.6, maxOutputTokens: 4096 },
    defaultModelType: 'gemini-1.5-flash-latest',

    steps: [
        {
            name: 'prepare_problem_scope',
            processor: (context) => {
                const { lesson } = context;
                const subTopics = (lesson.paragraphes || []).sort(() => 0.5 - Math.random()).slice(0, 3).map(p => typeof p === 'string' ? p : p.text || '');
                let suggestedPoints;
                const lowerCaseLesson = (lesson.titreLecon || '').toLowerCase();

                if (lowerCaseLesson.includes('étude de fonctions')) {
                    suggestedPoints = (Math.random() * 3) + 6; // 6-9 points
                } else if (lowerCaseLesson.includes('complexes') || lowerCaseLesson.includes('probabilités')) {
                    suggestedPoints = (Math.random() * 2) + 3; // 3-5 points
                } else {
                    suggestedPoints = (Math.random() * 2) + 4; // 4-6 points
                }
                
                return {
                    focusedSubTopics: subTopics,
                    totalPointsForProblem: Math.round(suggestedPoints * 2) / 2, // Points par 0.5
                };
            }
        },
        {
            name: 'generate_exam_problem',
            promptGenerator: (context, previousOutputs) => {
                const { academicLevelName, trackName, lesson } = context;
                const { focusedSubTopics, totalPointsForProblem } = previousOutputs.prepare_problem_scope;
                const subTopicsText = focusedSubTopics && focusedSubTopics.length > 0
                    ? `Le problème doit s'articuler autour des concepts suivants : ${focusedSubTopics.join(', ')}.`
                    : "Le problème doit couvrir les aspects fondamentaux de ce chapitre.";

                return `
Vous êtes un concepteur de problèmes de mathématiques pour le Baccalauréat Marocain, filière ${trackName} (Sciences Physiques).
Votre mission est de créer UN SEUL exercice de type examen national.

LIGNES DIRECTRICES :
1.  **Cohérence :** Les questions doivent s'enchaîner logiquement.
2.  **Difficulté :** Niveau standard pour un élève de SPC, axé sur l'application des méthodes du cours.
3.  **Barème :** Le total des points pour cet exercice est EXACTEMENT ${totalPointsForProblem} points. Répartissez-les judicieusement (ex: 0.5, 0.75, 1).
4.  **Formatage :** Utilisez LaTeX pour les maths : \\( ... \\) et \\\[ ... \\\]

SUJET :
- **Thème Principal :** "${lesson.titreLecon}"
- **Concepts à intégrer :** ${subTopicsText}

FORMAT DE SORTIE JSON STRICT (UNIQUEMENT l'objet JSON) :
\`\`\`json
{
  "problemTitle": "Exercice sur ${lesson.titreLecon}",
  "text": "Partie I: On considère la fonction f définie par ...",
  "subQuestions": [
    { "text": "1. a) Calculer la limite de f en +\\infty.", "difficultyOrder": 1, "points": 0.5 },
    { "text": "1. b) Étudier la branche infinie.", "difficultyOrder": 2, "points": 0.5 },
    { "text": "2. a) Montrer que f'(x) = ... et étudier son signe.", "difficultyOrder": 3, "points": 1.0 },
    { "text": "2. b) Dresser le tableau de variations.", "difficultyOrder": 4, "points": 0.5 }
  ],
  "totalPoints": ${totalPointsForProblem},
  "lesson": "${lesson.titreLecon}"
}
\`\`\`
Vérifiez que la somme des points est rigoureusement égale à "totalPoints".`;
            }
        }
    ],
    finalAggregator: (context, allStepsOutputs) => {
        const problemData = allStepsOutputs.generate_exam_problem;
        if (!problemData || !problemData.text || !Array.isArray(problemData.subQuestions)) {
            throw new Error("Erreur: données générées pour le problème de maths (SPC) sont incomplètes.");
        }
        let calculatedPoints = problemData.subQuestions.reduce((sum, sq) => sum + (Number(sq.points) || 0), 0);
        problemData.totalPoints = Math.round(calculatedPoints * 100) / 100;
        return { ...problemData, lesson: context.lesson.titreLecon };
    }
};