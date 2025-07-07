// back-end/prompts/2BAC/SPC/2BAC_spc_math/examPrompt_2bac_spc_math.js

module.exports = {
    examConfig: {
        timeLimitMinutes: 180,
    },
    type: 'multi-step',
    defaultGenerationConfig: { temperature: 0.8, maxOutputTokens: 8192 },
    defaultModelType: 'gemini-1.5-flash-latest',

    steps: [
        {
            name: 'prepare_problem_scope_from_state',
            processor: (context) => {
                const { examState } = context;
                if (!examState || !examState.blueprint) throw new Error("Exam state or blueprint is missing.");
                
                const { blueprint, problemCounter } = examState;
                const currentProblemBlueprint = blueprint.problems[problemCounter];
                if (!currentProblemBlueprint) throw new Error(`Could not find blueprint for problem index ${problemCounter}.`);
                
                return { problemBlueprint: currentProblemBlueprint };
            }
        },
        {
            name: 'generate_exam_problem_from_blueprint',
            promptGenerator: (context, previousOutputs) => {
                const { problemBlueprint } = previousOutputs.prepare_problem_scope_from_state;
                const { problemTitle, totalPointsForProblem, domain, coreTopics, questionStructure } = problemBlueprint;
                const randomSeed = Math.floor(Date.now() * Math.random());

                // [MODIFIED] The prompt now asks for a list of items.
                return `
Vous êtes un concepteur expert d'épreuves de mathématiques pour le Baccalauréat Marocain, filière Sciences Physiques (SPC).
Votre mission : créer **UN SEUL exercice** en suivant SCRUPULEUSEMENT le plan détaillé ci-dessous.
Utilisez cette "graine d'inspiration" pour garantir l'originalité : **${randomSeed}**.

---
**PLAN DÉTAILLÉ DE L'EXERCICE**
---
**Titre :** ${problemTitle}
**Domaine :** ${domain}
**Points :** ${totalPointsForProblem} pts.
**Sujets Clés :** ${coreTopics.join(', ')}.

**STRUCTURE OBLIGATOIRE DES QUESTIONS :**
${questionStructure}
---
**RÈGLES IMPÉRATIVES**
---
1.  **CRÉATIVITÉ :** Variez les fonctions et les valeurs numériques.
2.  **INTERDICTION :** Ne demandez JAMAIS de "tracer" ou "construire" un graphique.
3.  **BARÈME :** La somme des points doit être **EXACTEMENT ${totalPointsForProblem}**.
4.  **FORMATAGE LaTeX OBLIGATOIRE :** TOUT ce qui est mathématique doit être entre '$'. Dans JSON, chaque '\\' doit être doublé (e.g., "\\\\frac{x}{2}").

---
**FORMAT DE SORTIE JSON STRICT (UNIQUEMENT l'objet JSON) :**
---
\`\`\`json
{
  "problemTitle": "${problemTitle}",
  "examItems": [
    {
      "itemType": "instruction",
      "text": "Partie A : On considère la fonction $g$ définie par $g(x) = ...$"
    },
    {
      "itemType": "question",
      "text": "1. a) Calculer la limite de $g$ en $+\\\\infty$.",
      "difficultyOrder": 1,
      "points": 0.5,
      "answer": "La limite est $+\\\\infty$ par opérations sur les limites."
    },
    {
      "itemType": "question",
      "text": "1. b) Étudier les variations de $g$.",
      "difficultyOrder": 2,
      "points": 0.75,
      "answer": "La dérivée $g'(x)$ est positive, donc $g$ est croissante."
    }
  ],
  "totalPointsForProblem": ${totalPointsForProblem}
}
\`\`\`
Maintenant, générez l'exercice.
`;
            }
        }
    ],

    // [MODIFIED] This aggregator builds the `problemItems` structure.
    finalAggregator: (context, allStepsOutputs) => {
        const aiOutput = allStepsOutputs.generate_exam_problem_from_blueprint;
        const currentState = context.examState;

        if (!aiOutput || !Array.isArray(aiOutput.examItems) || aiOutput.examItems.length === 0) {
            throw new Error("Erreur: Les données générées pour le problème de maths (SPC) sont incomplètes.");
        }

        const problemItems = [];
        let questionCounter = 0;

        aiOutput.examItems.forEach(item => {
            if (item.itemType === 'instruction' || item.itemType === 'paragraph') {
                problemItems.push({
                    itemType: 'content',
                    contentType: item.itemType,
                    text: item.text
                });
            } else if (item.itemType === 'question') {
                questionCounter++;
                problemItems.push({
                    itemType: 'question',
                    text: item.text,
                    points: item.points || 0,
                    orderInProblem: item.difficultyOrder || questionCounter,
                    questionType: 'free_text',
                    correctAnswer: item.answer || "No model answer provided.",
                });
            }
        });

        const calculatedTotalPoints = problemItems.reduce((sum, item) => item.itemType === 'question' ? sum + (Number(item.points) || 0) : sum, 0);
        const finalPoints = Math.round(calculatedTotalPoints * 100) / 100;
        
        if (Math.abs(finalPoints - aiOutput.totalPointsForProblem) > 0.1) {
            console.warn(`[MATH_SPC_AGGREGATOR_WARN] Points mismatch. Stated: ${aiOutput.totalPointsForProblem}, Calculated: ${finalPoints}. Using calculated value.`);
        }

        const problemData = {
            problemTitle: aiOutput.problemTitle,
            problemItems: problemItems,
            totalPoints: finalPoints,
            lesson: context.problemBlueprint?.domain || 'Mathématiques'
        };

        const newState = {
            ...currentState,
            problemCounter: currentState.problemCounter + 1,
        };

        return {
            problemData: problemData,
            newState: newState,
        };
    }
};