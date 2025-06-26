// back-end/prompts/2BAC/[SM, SPC, SVT]/svt/examPrompt.js 
// (Adjust path based on your actual structure, e.g., /2BAC/SVT/svt/examPrompt.js)

module.exports = {
    examConfig: {
        numberOfReasoningProblems: 2, // Example: 1 restitution + 2 reasoning = 3 problems total
        restitutionPoints: 5,
        // Points for each reasoning problem, should sum to (20 - restitutionPoints)
        reasoningProblemPoints: [7.5, 7.5], // Example for 2 reasoning problems
        // If numberOfReasoningProblems = 3, then reasoningProblemPoints could be [5, 5, 5]
        timeLimitMinutes: 180, // 3 heures
        examTitle: (context) => `SVT - ${context.academicLevelName} ${context.trackName}`, // Dynamic title
        generalInstructions: (context) => `Épreuve de Sciences de la Vie et de la Terre pour ${context.academicLevelName} ${context.trackName}.
Durée : 3 heures. Barème indicatif sur 20 points.
Lisez attentivement chaque question. La clarté de la rédaction et la rigueur du raisonnement scientifique seront prises en compte.`
    },

    type: 'multi-step',
    defaultGenerationConfig: { temperature: 0.6, maxOutputTokens: 4096 }, // Reduced maxOutputTokens
    defaultModelType: 'gemini-1.5-flash-latest', // Use flash to reduce quota/cost
    defaultStepDelayMs: 2500, // Increased delay slightly

    steps: [
        {
            name: 'prepare_problem_meta_svt', // Unique step name
            processor: (context, previousOutputs) => {
                const { lesson, problemIndex, examConfigOverall } = context;
                let problemType = 'Raisonnement scientifique'; // Default
                let specificPoints;

                if (problemIndex === 0) { // First problem is always Restitution
                    problemType = 'Restitution des connaissances';
                    specificPoints = examConfigOverall.restitutionPoints || 5;
                } else {
                    // For reasoning problems, points are taken from the array
                    const reasoningProblemIndex = problemIndex - 1; // 0-indexed for the array
                    specificPoints = (examConfigOverall.reasoningProblemPoints && examConfigOverall.reasoningProblemPoints[reasoningProblemIndex])
                                     ? examConfigOverall.reasoningProblemPoints[reasoningProblemIndex]
                                     : ( (20 - (examConfigOverall.restitutionPoints || 5)) / (examConfigOverall.numberOfReasoningProblems || 2) ); // Fallback calculation

                    // Determine a more specific reasoning type if possible from lesson title
                    const lessonTitleLower = lesson.titreLecon ? lesson.titreLecon.toLowerCase() : "";
                    if (lessonTitleLower.includes('génétique des populations') || lessonTitleLower.includes('lois statistiques')) {
                        problemType = 'Raisonnement (Génétique/Stats)';
                    } else if (lessonTitleLower.includes('immunologie') || lessonTitleLower.includes('géologie') || lessonTitleLower.includes('énergie')) {
                         problemType = 'Raisonnement (Analyse de documents)';
                    }
                    // Add more else if for other specific reasoning types if needed
                }
                
                console.log(`[SVT_EXAM_PREP_STEP] For problemIndex ${problemIndex}, lesson "${lesson.titreLecon || 'N/A'}", selected problem type: ${problemType}, points: ${specificPoints}`);
                return { problemType: problemType, problemTotalPoints: specificPoints };
            }
        },
        {
            name: 'generate_svt_problem_content_simplified', // Unique step name
            // modelType: 'gemini-1.5-flash-latest', // Ensured by defaultModelType
            promptGenerator: (context, previousOutputs) => {
                const { lesson } = context; // lesson is the specific lesson object for THIS problem
                const { problemType, problemTotalPoints } = previousOutputs.prepare_problem_meta_svt;

                let taskDescription = `Vous êtes un concepteur de sujets de SVT pour le baccalauréat marocain.
TÂCHE: Créez UN exercice de SVT de type "${problemType}" portant EXCLUSIVEMENT sur la leçon : "${lesson.titreLecon}".
L'exercice doit contenir environ 3 à 5 sous-questions variées et un total de ${problemTotalPoints} points.
Les sous-questions doivent évaluer la compréhension et l'application des concepts clés de la leçon.
`;

                if (problemType === 'Restitution des connaissances') {
                    taskDescription += `Pour la restitution, incluez des formats comme :
- Définitions (question_format: "free_text").
- QCM simples directs (question_format: "mcq", 4 options, 1 correcte).
- Vrai/Faux avec demande de correction des propositions fausses (question_format: "true_false_justify").
- Mettre en relation des éléments (question_format: "matching_pairs").
- Compléter un tableau récapitulatif simple (question_format: "table_completion").
`;
                } else { // Raisonnement Scientifique
                    taskDescription += `Pour le raisonnement, présentez une situation problème concise.
Si des documents sont nécessaires, décrivez-les TEXTUELLEMENT de manière claire et exploitable (pas de génération d'images).
Les questions doivent guider l'analyse des documents (s'ils existent) et le raisonnement.
Variez les formats des sous-questions si pertinent : "free_text" pour analyse/explication, "table_completion" pour synthétiser des données, "true_false_justify" pour évaluer l'interprétation.
`;
                }

                // Simplified JSON output structure, AI needs to be more autonomous
                const jsonOutputStructure = `
FORMAT JSON STRICT (UNIQUEMENT L'OBJET JSON, SANS AUCUN TEXTE AVANT OU APRÈS):
\`\`\`json
{
  "problemTitle": "Titre concis pour l'exercice (ex: ${problemType} - ${lesson.titreLecon})",
  "problemText": "Introduction au problème et description textuelle des documents (si applicable). Si pas d'intro, laisser vide.",
  "problemLesson": "${lesson.titreLecon}",
  "subQuestions": [
    {
      "text": "Texte de la sous-question 1. (Ex: Définir le terme X.)",
      "question_format": "free_text", 
      // --- Pour les autres formats, l'IA doit fournir les champs spécifiques ---
      // "mcq": ajouter "options": ["A", "B", "C", "D"], "correct_answer": "OptionCorrecte"
      // "true_false_justify": ajouter "correct_answer_details": {"is_true": true/false, "correction": "Correction si faux..."}
      // "matching_pairs": ajouter "group_a_items": [], "group_b_items": [], "correct_matches": []
      // "table_completion": ajouter "table_data": {"headers": [], "rows_structure": [{"Col1_expected": null, ...}], "correct_full_table": [{...}]}
      "points": 1.5, // L'IA doit ajuster les points
      "difficultyOrder": 1
    }
    // ... L'IA doit générer 2 à 4 autres sous-questions pertinentes.
    // La somme des points de toutes les sous-questions DOIT être ${problemTotalPoints}.
  ],
  "totalPoints": ${problemTotalPoints}
}
\`\`\`
CONSIGNES IMPORTANTES POUR L'IA:
1.  Générez le nombre approprié de sous-questions (3 à 5) pour atteindre ${problemTotalPoints} points.
2.  Pour chaque sous-question, choisissez un "question_format" pertinent parmi: "free_text", "mcq", "true_false_justify", "matching_pairs", "table_completion".
3.  Si vous utilisez un format autre que "free_text", fournissez IMPÉRATIVEMENT les champs additionnels requis (comme "options" et "correct_answer" pour "mcq", etc., comme indiqué dans les commentaires de l'exemple JSON).
4.  Assurez la clarté, la pertinence scientifique, et la conformité au programme marocain.
5.  Le JSON doit être valide.
`;
                return `${taskDescription}\n${jsonOutputStructure}\nGénérez le JSON.`;
            }
        }
    ],

    finalAggregator: (context, allStepsOutputs) => {
        const problemData = allStepsOutputs.generate_svt_problem_content_simplified; // Match step name

        if (!problemData || typeof problemData.problemText !== 'string' || !Array.isArray(problemData.subQuestions) || problemData.subQuestions.length === 0) {
            console.error("[SVT_EXAM_AGGREGATOR_ERROR] Données de problème invalides ou vides:", problemData);
            throw new Error("Données de problème SVT générées par l'IA invalides ou vides.");
        }

        let calculatedSubQuestionPoints = 0;
        problemData.subQuestions.forEach((sq, index) => {
            sq.points = Number(sq.points);
            if (isNaN(sq.points) || sq.points <= 0) {
                sq.points = 0.5; // Default small points
            }
            if (!sq.question_format) {
                sq.question_format = 'free_text';
            }
            sq.difficultyOrder = sq.difficultyOrder || index + 1;
            calculatedSubQuestionPoints += sq.points;
        });

        // Recalculate totalPoints based on subQuestions to ensure consistency
        problemData.totalPoints = Math.round(calculatedSubQuestionPoints * 100) / 100;
        
        problemData.problemLesson = problemData.problemLesson || (context.lesson ? context.lesson.titreLecon : "Non spécifié");
        
        console.log(`[SVT_EXAM_AGGREGATOR] Aggregated problem: "${problemData.problemTitle}", Total Points (recalced): ${problemData.totalPoints}`);
        return problemData;
    }
};