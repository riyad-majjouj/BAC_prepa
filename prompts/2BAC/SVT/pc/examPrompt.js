module.exports = {
    examConfig: {
        numberOfProblems: 3, // 1 Chimie, 2 Physique
        timeLimitMinutes: 120, // 2 heures
    },
    type: 'multi-step',
    defaultGenerationConfig: { temperature: 0.6, maxOutputTokens: 4096 },
    defaultModelType: 'gemini-1.5-flash-latest',

    steps: [
        {
            name: 'prepare_problem_scope',
            processor: (context) => {
                const { lesson } = context;
                const domain = lesson.domaine || "Physique";
                const subTopics = (lesson.paragraphes || []).sort(() => 0.5 - Math.random()).slice(0, 2);
                
                // En SVT, la chimie est sur 7 points, les 13 points restants sont pour la physique.
                let suggestedPoints = (domain === "Chimie") ? 7 : (13 / 2); // 6.5 points pour chaque exo de physique
                suggestedPoints += (Math.random() - 0.5); // Ajoute une petite variation de +/- 0.5

                return {
                    focusedSubTopics: subTopics.map(p => typeof p === 'string' ? p : p.text || ''),
                    totalPointsForProblem: Math.round(suggestedPoints * 2) / 2, // Arrondi au 0.25 ou 0.5 le plus proche
                    domain: domain
                };
            }
        },
        {
            name: 'generate_exam_problem',
            promptGenerator: (context, previousOutputs) => {
                const { lesson, trackName } = context;
                const { focusedSubTopics, totalPointsForProblem, domain } = previousOutputs.prepare_problem_scope;

                return `
Vous êtes un concepteur de sujets pour le Baccalauréat Marocain, filière ${trackName} (Sciences de la Vie et de la Terre).
Votre mission est de créer UN SEUL exercice de ${domain} qui reflète le style et la rigueur d'un examen national pour la filière SVT. L'exercice doit être clair et axé sur l'application directe des connaissances.

LIGNES DIRECTRICES :
1.  **Contexte Clair :** L'exercice doit commencer par un texte de présentation simple et direct.
2.  **Barème :** Le total des points est EXACTEMENT ${totalPointsForProblem} points.
3.  **Formatage :** Utilisez LaTeX (\\\\( ... \\\\) et \\\\\[ ... \\\\\]) pour les formules.

SUJET DE L'EXERCICE :
- **Domaine :** ${domain}
- **Thème Principal :** "${lesson.titreLecon}"
- **Concepts à intégrer :** ${focusedSubTopics.join(', ')}.

FORMAT DE SORTIE JSON STRICT (UNIQUEMENT l'objet JSON) :
\`\`\`json
{
  "problemTitle": "Exercice de ${domain} : ${lesson.titreLecon}",
  "text": "Le texte de présentation de l'exercice ici. Exemple: On étudie le mouvement d'un skieur sur une piste...",
  "subQuestions": [
    { "text": "1. Appliquer la deuxième loi de Newton pour trouver l'expression de l'accélération.", "difficultyOrder": 1, "points": 1.5 },
    { "text": "2. En déduire l'équation horaire de la vitesse.", "difficultyOrder": 2, "points": 1.0 }
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
        if (!problemData || !problemData.text || !Array.isArray(problemData.subQuestions)) {
            throw new Error("Erreur: les données générées pour le problème de PC (SVT) sont incomplètes.");
        }
        let calculatedPoints = problemData.subQuestions.reduce((sum, sq) => sum + (Number(sq.points) || 0), 0);
        problemData.totalPoints = Math.round(calculatedPoints * 100) / 100;
        return { ...problemData, lesson: context.lesson.titreLecon };
    }
};