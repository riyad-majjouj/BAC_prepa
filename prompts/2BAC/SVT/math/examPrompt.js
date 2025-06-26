module.exports = {
    examConfig: {
        numberOfProblems: 2, // Typiquement 2 exercices simples
        timeLimitMinutes: 90, // 1h30
    },
    type: 'multi-step',
    defaultGenerationConfig: { temperature: 0.5, maxOutputTokens: 2048 },
    defaultModelType: 'gemini-1.5-flash-latest',

    steps: [
        {
            name: 'prepare_problem_scope',
            processor: (context) => {
                const { lesson } = context;
                const subTopics = (lesson.paragraphes || []).sort(() => 0.5 - Math.random()).slice(0, 2);
                let suggestedPoints = 2.5; // Examen sur 5 points, donc 2.5 par exercice
                return {
                    focusedSubTopics: subTopics.map(p => typeof p === 'string' ? p : p.text || ''),
                    totalPointsForProblem: suggestedPoints,
                };
            }
        },
        {
            name: 'generate_exam_problem',
            promptGenerator: (context, previousOutputs) => {
                const { lesson, trackName } = context;
                const { totalPointsForProblem } = previousOutputs.prepare_problem_scope;
                return `
Vous êtes un concepteur de problèmes de mathématiques pour le Baccalauréat Marocain, filière ${trackName} (SVT).
Votre mission est de créer UN SEUL exercice très simple de type examen national.

LIGNES DIRECTRICES :
1.  **Simplicité :** Les questions doivent être des applications directes du cours.
2.  **Barème :** Le total des points est EXACTEMENT ${totalPointsForProblem} points.
3.  **Sujet :** Le problème doit porter sur : "${lesson.titreLecon}"

FORMAT DE SORTIE JSON STRICT (UNIQUEMENT l'objet JSON) :
\`\`\`json
{
  "problemTitle": "Exercice de mathématiques : ${lesson.titreLecon}",
  "text": "On considère la fonction f définie par f(x) = ...",
  "subQuestions": [
    { "text": "1. Calculer la limite de f en +\\infty.", "difficultyOrder": 1, "points": 0.75 },
    { "text": "2. Calculer f'(x).", "difficultyOrder": 2, "points": 1.0 },
    { "text": "3. Dresser le tableau de variations.", "difficultyOrder": 3, "points": 0.75 }
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
        if (!problemData || !problemData.text) {
            throw new Error("Erreur: données générées pour le problème de maths (SVT) sont incomplètes.");
        }
        let calculatedPoints = (problemData.subQuestions || []).reduce((sum, sq) => sum + (Number(sq.points) || 0), 0);
        problemData.totalPoints = Math.round(calculatedPoints * 100) / 100;
        return { ...problemData, lesson: context.lesson.titreLecon };
    }
};