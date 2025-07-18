// back-end/prompts/1BAC/SX-SM/1BAC_SX-SM_frensh/examPrompt_1BAC_SX-SM_frensh.js

const NOVELS_1BAC = ["La Boîte à Merveilles", "Antigone", "Le Dernier Jour d'un Condamné"];
const LANGUAGE_LESSONS_1BAC = [
    "Les figures de style", "La focalisation", "Les registres de langue",
    "Le discours direct, indirect et indirect libre", "Les temps verbaux du récit", "Les champs lexicaux"
];
const PRODUCTION_ECRITE_THEMES_1BAC = {
    "La Boîte à Merveilles": ["L'enfance et la solitude", "La superstition", "Les relations familiales"],
    "Antigone": ["Le conflit entre la loi divine et la loi humaine", "Le devoir et la conscience", "La solitude du héros"],
    "Le Dernier Jour d'un Condamné": ["L'inhumanité de la peine de mort", "L'angoisse face à la mort", "La critique du système judiciaire"]
};

function getRandomElement(arr) { if (!arr || arr.length === 0) return null; return arr[Math.floor(Math.random() * arr.length)]; }
function getRandomElements(arr, count) { if (!arr || arr.length === 0) return []; const shuffled = [...arr].sort(() => 0.5 - Math.random()); return shuffled.slice(0, count); }

module.exports = {
    type: 'multi-step',
    defaultGenerationConfig: { temperature: 0.6, maxOutputTokens: 4096 },
    defaultModelType: 'gemini-1.5-flash-latest',

    steps: [
        {
            name: 'prepare_exam_elements',
            description: 'Selects random elements for the exam.',
            processor: () => {
                const selectedNovel = getRandomElement(NOVELS_1BAC);
                const selectedLanguageLessons = getRandomElements(LANGUAGE_LESSONS_1BAC, 2);
                const essayThemesForNovel = PRODUCTION_ECRITE_THEMES_1BAC[selectedNovel] || Object.values(PRODUCTION_ECRITE_THEMES_1BAC).flat();
                const selectedEssayTheme = getRandomElement(essayThemesForNovel);
                return { selectedNovel, selectedLanguageLessons, selectedEssayTheme };
            }
        },
        {
            name: 'generate_full_french_exam',
            description: 'Generates a complete French exam based on selected elements.',
            promptGenerator: (context, previousOutputs) => {
                const novel = previousOutputs.prepare_exam_elements?.selectedNovel;
                const langLessons = previousOutputs.prepare_exam_elements?.selectedLanguageLessons || [];
                const essayTheme = previousOutputs.prepare_exam_elements?.selectedEssayTheme;

                return `
Vous êtes un concepteur expert d'examens régionaux de français pour le niveau ${context.academicLevelName} au Maroc.
Votre tâche est de créer une épreuve complète, divisée en deux parties : I. Étude de texte (10 points) et II. Production écrite (10 points).

**EXIGENCES DE L'ÉPREUVE :**

1.  **I. Étude de texte (10 points) :**
    -   Générez un extrait littéraire UNIQUE et significatif (environ 150 mots) de l'œuvre : **"${novel}"**.
    -   Créez 8 à 10 questions variées basées sur cet extrait. Les questions doivent couvrir :
        -   La compréhension globale (situer le passage, identifier les personnages).
        -   L'analyse de figures de style.
        -   Des questions sur les leçons de langue suivantes : **${langLessons.join(', ')}**.
        -   Des questions de réaction personnelle/jugement critique.
    -   Distribuez les 10 points sur ces questions.

2.  **II. Production écrite (10 points) :**
    -   Formulez UN SEUL sujet de production écrite (essai argumentatif) basé sur le thème suivant : **"${essayTheme}"**. Le thème est inspiré de l'œuvre "${novel}".

**FORMAT DE SORTIE JSON STRICT :**
Répondez UNIQUEMENT avec un objet JSON. La structure doit contenir une clé \`"problemItems"\` qui est un tableau de tous les composants de l'examen dans l'ordre.

\`\`\`json
{
  "problemTitle": "Épreuve de Français - Régional (Exemple)",
  "problemItems": [
    {
      "itemType": "content",
      "contentType": "subheading",
      "text": "I. ÉTUDE DE TEXTE (10 points)"
    },
    {
      "itemType": "content",
      "contentType": "paragraph",
      "text": "L'extrait littéraire de '${novel}' que vous avez généré est placé ici..."
    },
    {
      "itemType": "question",
      "text": "1. Pour situer ce passage, répondez aux questions suivantes : ...",
      "points": 2,
      "orderInProblem": 1,
      "questionType": "free_text",
      "correctAnswer": "Réponse modèle concise..."
    },
    {
      "itemType": "content",
      "contentType": "subheading",
      "text": "II. PRODUCTION ÉCRITE (10 points)"
    },
    {
      "itemType": "question",
      "text": "Sujet : Traitez le sujet suivant en vous appuyant sur votre lecture de l'œuvre et vos connaissances : (Sujet généré sur le thème '${essayTheme}')...",
      "points": 10,
      "orderInProblem": 11,
      "questionType": "free_text",
      "correctAnswer": "Critères de notation : respect de la consigne, cohérence de l'argumentation, correction de la langue."
    }
  ]
}
\`\`\`
Assurez-vous que \`orderInProblem\` est séquentiel et unique pour chaque question.
`;
            },
        }
    ],

    finalAggregator: (context, allStepsOutputs) => {
        const aiOutput = allStepsOutputs.generate_full_french_exam;
        
        if (!aiOutput || !Array.isArray(aiOutput.problemItems)) {
            console.error("[FRENCH_EXAM_AGGREGATOR] Missing or invalid 'problemItems' from AI output:", aiOutput);
            throw new Error("Erreur interne : L'IA n'a pas pu générer la structure de l'épreuve de français.");
        }

        const totalPoints = aiOutput.problemItems.reduce((sum, item) => {
            return item.itemType === 'question' ? sum + (item.points || 0) : sum;
        }, 0);

        return {
            problemTitle: aiOutput.problemTitle || `Épreuve Régionale de Français`,
            problemItems: aiOutput.problemItems,
            totalPoints: Math.round(totalPoints),
        };
    }
};