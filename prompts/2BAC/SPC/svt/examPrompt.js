// L'examen de SVT pour SPC est plus simple. Typiquement 2 exercices.
// 1. Restitution des connaissances
// 2. Raisonnement simple basé sur des documents
module.exports = {
    examConfig: {
        numberOfProblems: 2,
        timeLimitMinutes: 90, // 1h30
    },
    type: 'multi-step',
    defaultGenerationConfig: { temperature: 0.65, maxOutputTokens: 4096 },
    defaultModelType: 'gemini-1.5-flash-latest',

    steps: [
        {
            name: 'determine_problem_type',
            processor: (context, previousOutputs) => {
                // Pour SPC, le premier exercice est la restitution, le deuxième le raisonnement.
                // On suppose que le générateur d'examen appelle les leçons dans le bon ordre.
                const problemIndex = Object.keys(previousOutputs).length;
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
                    return `
Vous êtes un concepteur de sujets de SVT pour le baccalauréat marocain (filière ${trackName}).
TÂCHE: Créez un exercice de **Restitution des connaissances** (5 points) portant sur la leçon : "${lesson.titreLecon}".
Il doit contenir 2-3 questions variées (Définitions, QCM, Vrai/Faux).
FORMAT DE SORTIE JSON STRICT:
\`\`\`json
{
  "problemTitle": "Restitution des connaissances : ${lesson.titreLecon}",
  "text": "Cet exercice évalue la restitution des connaissances.",
  "subQuestions": [
    {"text": "1. Définir les termes suivants : ...", "points": 2.0, "difficultyOrder": 1},
    {"text": "2. Citez deux caractéristiques de ...", "points": 1.0, "difficultyOrder": 2},
    {"text": "3. Indiquez si les propositions suivantes sont Vraies ou Fausses : ...", "points": 2.0, "difficultyOrder": 3}
  ],
  "totalPoints": 5.0,
  "lesson": "${lesson.titreLecon}"
}
\`\`\`
Répondez UNIQUEMENT avec l'objet JSON.`;
                } else { // Raisonnement scientifique simple
                    return `
Vous êtes un concepteur de sujets de SVT pour le baccalauréat marocain (filière ${trackName}).
TÂCHE: Créez un exercice de **Raisonnement scientifique** (5 points) basé sur 1 ou 2 documents simples décrits textuellement, portant sur la leçon : "${lesson.titreLecon}".
Les questions doivent guider l'élève dans l'analyse.
FORMAT DE SORTIE JSON STRICT:
\`\`\`json
{
  "problemTitle": "Raisonnement scientifique : ${lesson.titreLecon}",
  "text": "Pour comprendre..., on propose les données suivantes. Document 1: un texte décrivant une expérience simple...",
  "subQuestions": [
    {"text": "1. À partir du document 1, décrivez...", "points": 2.0, "difficultyOrder": 1},
    {"text": "2. Expliquez le phénomène observé...", "points": 2.0, "difficultyOrder": 2},
    {"text": "3. Déduisez...", "points": 1.0, "difficultyOrder": 3}
  ],
  "totalPoints": 5.0,
  "lesson": "${lesson.titreLecon}"
}
\`\`\`
Répondez UNIQUEMENT avec l'objet JSON.`;
                }
            }
        }
    ],
    finalAggregator: (context, allStepsOutputs) => {
        const problemData = allStepsOutputs.generate_svt_problem;
        if (!problemData || !problemData.text) {
            throw new Error("Erreur: données générées pour le problème de SVT (SPC) sont incomplètes.");
        }
        let calculatedPoints = (problemData.subQuestions || []).reduce((sum, sq) => sum + (Number(sq.points) || 0), 0);
        problemData.totalPoints = Math.round(calculatedPoints * 100) / 100;
        return { ...problemData, lesson: context.lesson.titreLecon };
    }
};