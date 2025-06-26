// back-end/prompts/2BAC/SM/2BAC_sm_svt/examPrompt_2bac_sm_svt.js

module.exports = {
    examConfig: {
        numberOfProblems: 4, // 1 Restitution, 3 Raisonnement
        timeLimitMinutes: 180, // 3 heures
    },

    type: 'multi-step',
    defaultGenerationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
    defaultModelType: 'gemini-1.5-flash-latest',

    steps: [
        {
            name: 'prepare_problem_type',
            processor: (context, previousOutputs) => {
                const { lesson } = context;
                const isFirstProblem = !previousOutputs || Object.keys(previousOutputs).length === 0; // Check if it's the first problem being generated
                let problemType;
                
                // For SVT, the first problem is ALWAYS knowledge restitution.
                // We'll handle this logic in aiTimedExamGenerator instead to be more robust.
                // Here, we can randomly decide, and the generator will pick the right lesson.
                // A better approach is to pass the problem index or a flag. Let's assume the generator will handle it.
                // For now, let's just make it random, assuming the lesson passed dictates the type.

                const lessonTitleLower = lesson.titreLecon.toLowerCase();
                if (lessonTitleLower.includes('statistiques') || lessonTitleLower.includes('génétique')) {
                    problemType = 'Raisonnement (Génétique)';
                } else {
                    problemType = Math.random() < 0.3 ? 'Restitution des connaissances' : 'Raisonnement (Analyse de documents)';
                }
                
                console.log(`[SVT_EXAM_PREP] For lesson "${lesson.titreLecon}", selected problem type: ${problemType}`);
                return { problemType: problemType };
            }
        },
        {
            name: 'generate_svt_problem',
            promptGenerator: (context, previousOutputs) => {
                const { lesson } = context;
                const { problemType } = previousOutputs.prepare_problem_type;

                if (problemType === 'Restitution des connaissances') {
                    // Prompt to generate a knowledge restitution exercise
                    return `
Vous êtes un concepteur de sujets de SVT pour le baccalauréat marocain (filière SM).
TÂCHE: Créez la PARTIE I (Restitution des connaissances) d'un examen. Cette partie doit porter EXCLUSIVEMENT sur la leçon : "${lesson.titreLecon}".
Elle doit contenir 4 ou 5 questions variées (Définitions, QCM, Vrai/Faux avec justification, Schéma à légender textuellement, etc.).
Le barème total de cette partie doit être de 5 points, répartis logiquement.

FORMAT DE SORTIE JSON STRICT:
\`\`\`json
{
  "problemTitle": "Restitution des connaissances : ${lesson.titreLecon}",
  "text": "Ce premier exercice évalue la restitution organisée des connaissances.",
  "subQuestions": [
    {"text": "1. Définir les termes suivants : ...", "points": 1.0, "difficultyOrder": 1},
    {"text": "2. Citez deux caractéristiques de ...", "points": 1.0, "difficultyOrder": 2},
    {"text": "3. Pour chacune des propositions suivantes, reportez le numéro et indiquez si elle est Vraie ou Fausse :\\n a) ...\\n b) ...", "points": 2.0, "difficultyOrder": 3},
    {"text": "4. Reliez chaque élément du groupe 1 à la définition qui lui convient dans le groupe 2.", "points": 1.0, "difficultyOrder": 4}
  ],
  "totalPoints": 5.0,
  "lesson": "${lesson.titreLecon}"
}
\`\`\`
Répondez UNIQUEMENT avec l'objet JSON.`;
                } else {
                    // Prompt to generate a scientific reasoning exercise
                    const isGenetics = problemType === 'Raisonnement (Génétique)';
                    const geneticsInstruction = isGenetics 
                        ? "Cet exercice doit être un problème classique de génétique (lois de Mendel, gènes liés/indépendants, ou hérédité liée au sexe). Il doit présenter des résultats de croisements et demander à l'élève de les interpréter, de déduire les modes de transmission et de vérifier ses hypothèses par un échiquier de croisement."
                        : "Cet exercice doit présenter une situation problème (ex: une maladie, un phénomène physiologique) accompagnée de 2 à 3 documents (textes, résultats d'expériences décrits textuellement). Les questions doivent guider l'élève à travers l'analyse, l'interprétation, la comparaison et la déduction.";
                    
                    return `
Vous êtes un concepteur de sujets de SVT pour le baccalauréat marocain (filière SM).
TÂCHE: Créez la PARTIE II (Raisonnement scientifique) d'un examen. Cet exercice doit porter sur la leçon : "${lesson.titreLecon}".
${geneticsInstruction}
L'exercice doit comporter 3 à 4 questions qui guident l'analyse.
Le barème total de cet exercice doit être de 5 points.

FORMAT DE SORTIE JSON STRICT:
\`\`\`json
{
  "problemTitle": "Raisonnement scientifique et communication : ${lesson.titreLecon}",
  "text": "Le contexte du problème et la description des documents sont présentés ici. Exemple : 'Document 1: Résultats d'une expérience mesurant la concentration de l'ATP et de la phosphocréatine dans un muscle avant et après un effort...'",
  "subQuestions": [
    {"text": "1. À partir de l'analyse du document 1, décrivez l'évolution de...", "points": 1.25, "difficultyOrder": 1},
    {"text": "2. En exploitant les documents 2 et 3, expliquez le mécanisme de...", "points": 1.75, "difficultyOrder": 2},
    {"text": "3. Déduisez la relation entre les phénomènes observés.", "points": 1.0, "difficultyOrder": 3},
    {"text": "4. Réalisez un schéma de synthèse simple décrivant ...", "points": 1.0, "difficultyOrder": 4}
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
        if (!problemData || !problemData.text || !Array.isArray(problemData.subQuestions)) {
            throw new Error("Erreur interne : les données générées pour le problème de SVT sont incomplètes.");
        }
        // Validation des points
        let calculatedPoints = problemData.subQuestions.reduce((sum, sq) => sum + (Number(sq.points) || 0), 0);
        problemData.totalPoints = Math.round(calculatedPoints * 100) / 100;
        
        return { ...problemData, lesson: context.lesson.titreLecon };
    }
};