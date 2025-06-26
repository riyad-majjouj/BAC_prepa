// back-end/prompts/1BAC/SX-SM/1BAC_SX-SM_frensh/examPrompt_1BAC_SX-SM_frensh.js

const NOVELS_1BAC = ["La Boîte à Merveilles", "Antigone", "Le Dernier Jour d'un Condamné"];
const LANGUAGE_LESSONS_1BAC = [
    "Les figures de style (métaphore, comparaison, personnification, hyperbole, etc.)",
    "La focalisation (interne, externe, zéro)",
    "Les registres de langue (familier, courant, soutenu)",
    "Le discours direct, indirect et indirect libre",
    "Les temps verbaux et leurs valeurs dans le récit",
    "Les champs lexicaux",
    "La modalisation (expression de la certitude, du doute, etc.)"
];
const PRODUCTION_ECRITE_THEMES_1BAC = {
    "La Boîte à Merveilles": [
        "L'enfance et la solitude", "La superstition et les traditions populaires", 
        "Les relations familiales et de voisinage", "L'importance des objets et des lieux dans la mémoire"
    ],
    "Antigone": [
        "Le conflit entre la loi divine et la loi humaine", "Le devoir et la conscience morale",
        "La solitude de l'héroïne tragique", "Le pouvoir et la justice", "La jeunesse face à l'autorité"
    ],
    "Le Dernier Jour d'un Condamné": [
        "L'inhumanité de la peine de mort", "L'angoisse et la souffrance face à la mort",
        "La critique du système judiciaire", "La perte de la liberté et la condition du prisonnier"
    ]
};

function getRandomElement(arr) {
    if (!arr || arr.length === 0) return null;
    return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomElements(arr, count) {
    if (!arr || arr.length === 0) return [];
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

module.exports = {
    type: 'multi-step',
    defaultGenerationConfig: { temperature: 0.6, maxOutputTokens: 2048 },
    defaultModelType: 'gemini-1.5-flash-latest',

    steps: [
        {
            name: 'prepare_exam_elements',
            description: 'Selects random elements for the exam (novel, language lessons, essay theme). This is a server-side step, does not call AI.',
            // لا يوجد promptGenerator، هذه خطوة معالجة بيانات فقط
            processor: (context, previousOutputs) => {
                const selectedNovel = getRandomElement(NOVELS_1BAC);
                const selectedLanguageLessons = getRandomElements(LANGUAGE_LESSONS_1BAC, 2); // اختيار درسين لغة عشوائيًا
                let essayThemesForNovel = PRODUCTION_ECRITE_THEMES_1BAC[selectedNovel] || [];
                if (essayThemesForNovel.length === 0) { // Fallback if novel not in map or no themes
                    const allThemes = Object.values(PRODUCTION_ECRITE_THEMES_1BAC).flat();
                    essayThemesForNovel = getRandomElements(allThemes, 1);
                }
                const selectedEssayTheme = getRandomElement(essayThemesForNovel) || "un thème général lié aux préoccupations humaines explorées dans les œuvres au programme";

                console.log(`[FRENCH_EXAM_PREP] Selected Novel: ${selectedNovel}`);
                console.log(`[FRENCH_EXAM_PREP] Selected Language Lessons: ${selectedLanguageLessons.join(', ')}`);
                console.log(`[FRENCH_EXAM_PREP] Selected Essay Theme: ${selectedEssayTheme}`);

                return {
                    selectedNovelForExcerpt: selectedNovel,
                    selectedLanguageLessonsForQuestions: selectedLanguageLessons,
                    selectedEssayThemeForProduction: selectedEssayTheme,
                };
            }
            // لا يوجد تأخير لهذه الخطوة لأنها لا تستدعي API
        },
        {
            name: 'generate_literary_excerpt',
            description: 'Generates a literary excerpt from the pre-selected novel.',
            promptGenerator: (context, previousOutputs) => {
                const novelToUse = previousOutputs.prepare_exam_elements?.selectedNovelForExcerpt;
                if (!novelToUse) {
                    return `ERROR: Novel for excerpt was not selected in the previous step. Cannot proceed. Output a JSON error.`;
                }
                return `
CONTEXTE : Assistant expert pour examens régionaux de français (${context.academicLevelName} - ${context.trackName}, Maroc).
LANGUE : ${context.lessonLanguage}.

TÂCHE : Générer un extrait littéraire UNIQUE et COHÉRENT d'environ 150-200 mots, spécifiquement de l'œuvre : "${novelToUse}".
L'extrait doit être significatif, se prêtant à l'analyse (compréhension, figures de style, etc.).

FORMAT DE SORTIE JSON STRICT :
\`\`\`json
{
  "literaryExcerpt": "L'extrait littéraire généré...",
  "sourceNovel": "${novelToUse}"
}
\`\`\`
Assurez la validité du JSON.`;
            },
            generationConfig: { maxOutputTokens: 1024 },
            delayAfterStepMs: 1000
        },
        {
            name: 'generate_comprehension_language_reaction_questions',
            description: 'Generates comprehension, language, and personal reaction questions.',
            promptGenerator: (context, previousOutputs) => {
                const excerpt = previousOutputs.generate_literary_excerpt?.literaryExcerpt;
                const sourceNovel = previousOutputs.generate_literary_excerpt?.sourceNovel;
                const langLessons = previousOutputs.prepare_exam_elements?.selectedLanguageLessonsForQuestions || [];

                if (!excerpt) return `ERROR: Literary excerpt missing. Output JSON error.`;

                const numComprehensionQuestions = 4; // أسئلة فهم وتحليل مباشرة للمقتطف
                const numLanguageQuestions = langLessons.length; // سؤال لكل درس لغة مختار
                const numReactionQuestions = 2; // أسئلة التعبير عن الرأي/الموقف (مثل س9 وس10)
                // Total points for this entire section (comprehension, language, reaction) = 10 points (as per regional exam structure)
                const totalPointsForQuestions = 10; 
                // AI needs to distribute these 10 points among all these questions.

                let languageQuestionsInstructions = "Aucune question de langue spécifique demandée.";
                if (numLanguageQuestions > 0) {
                    languageQuestionsInstructions = `
${numLanguageQuestions} questions portant sur les points de langue suivants (essayez de les lier à l'extrait si pertinent, sinon posez des questions générales sur ces leçons) :
${langLessons.map(lesson => `- ${lesson}`).join('\n')}`;
                }

                return `
CONTEXTE : Concepteur de sujets d'examen régional de français (${context.academicLevelName} - ${context.trackName}).
LANGUE : ${context.lessonLanguage}.
EXTRAIT LITTÉRAIRE DE "${sourceNovel}" : 
"${excerpt}"

TÂCHE : Créer un ensemble de questions variées sur cet extrait, totalisant ${totalPointsForQuestions} points, réparties comme suit :
1.  ${numComprehensionQuestions} questions de compréhension et d'analyse directe de l'extrait (valeur indicative: 1 à 1.5 points chacune).
    Exemples: identification du type de texte, situation du passage, personnages présents, sentiments exprimés, relevé d'indices, identification et analyse d'une figure de style simple présente dans l'extrait, etc.
2.  ${languageQuestionsInstructions} (valeur indicative: 1 à 1.5 points chacune).
3.  ${numReactionQuestions} questions de réaction personnelle/jugement critique (similaires aux questions 9 et 10 des examens régionaux) basées sur l'extrait ou les thèmes qu'il évoque (valeur indicative: 1.5 à 2 points chacune).
    Exemples: "Que pensez-vous de la réaction du personnage X face à cette situation ? Justifiez.", "Partagez-vous le point de vue exprimé dans ce passage concernant [thème] ? Expliquez."

Chaque sous-question doit avoir "text", "difficultyOrder" (numérotation continue à partir de 1), et "points".
La SOMME TOTALE des points pour TOUTES ces questions (compréhension, langue, réaction) doit être EXACTEMENT ${totalPointsForQuestions}.

FORMAT DE SORTIE JSON STRICT :
\`\`\`json
{
  "questions": [
    { "text": "Question 1 (compréhension)...", "difficultyOrder": 1, "points": 1.5, "category": "comprehension" },
    // ... autres questions de compréhension/analyse
    { "text": "Question sur '${langLessons[0]}'", "difficultyOrder": ${numComprehensionQuestions + 1}, "points": 1, "category": "language" },
    // ... autres questions de langue
    { "text": "Question de réaction 1...", "difficultyOrder": ${numComprehensionQuestions + numLanguageQuestions + 1}, "points": 2, "category": "reaction" }
    // ... autre question de réaction
  ],
  "totalPointsAwardedForQuestions": ${totalPointsForQuestions}
}
\`\`\`
Assurez la validité, le nombre correct de questions par catégorie, et la somme exacte des points.`;
            },
            generationConfig: { maxOutputTokens: 3072 },
            delayAfterStepMs: 1000
        },
        {
            name: 'generate_production_ecrite_topic',
            description: 'Generates an essay topic based on a pre-selected theme.',
            promptGenerator: (context, previousOutputs) => {
                const essayTheme = previousOutputs.prepare_exam_elements?.selectedEssayThemeForProduction;
                const sourceNovelForInspiration = previousOutputs.generate_literary_excerpt?.sourceNovel;
                const pointsForProduction = 10;

                if (!essayTheme) return `ERROR: Essay theme missing. Output JSON error.`;

                return `
CONTEXTE : Concepteur de sujets d'examen régional de français (${context.academicLevelName} - ${context.trackName}).
LANGUE : ${context.lessonLanguage}.
THÈME IMPOSÉ POUR LA PRODUCTION ÉCRITE : "${essayTheme}"
(Ce thème peut être lié à l'œuvre "${sourceNovelForInspiration}" ou être plus général.)

TÂCHE : Formuler UN SEUL sujet de Production Écrite (essai argumentatif ou narratif, selon ce qui est le plus approprié pour le thème) destiné aux élèves.
Le sujet doit :
- Être clairement basé sur le THÈME IMPOSÉ : "${essayTheme}".
- Inviter l'élève à développer une réflexion personnelle, à argumenter, ou à raconter une expérience en lien avec le thème.
- La consigne doit être précise et guider l'élève sur ce qui est attendu.
- Indiquer que cette partie est sur ${pointsForProduction} points.

FORMAT DE SORTIE JSON STRICT :
\`\`\`json
{
  "productionEcriteTopic": {
    "text": "Sujet de production écrite formulé ici, basé sur le thème '${essayTheme}'...",
    "points": ${pointsForProduction}
  }
}
\`\`\`
Assurez la validité du JSON.`;
            },
            generationConfig: { maxOutputTokens: 1024 }
        }
    ],

    finalAggregator: (context, allStepsOutputs) => {
        const prepData = allStepsOutputs.prepare_exam_elements;
        const excerptData = allStepsOutputs.generate_literary_excerpt;
        const questionsGroupData = allStepsOutputs.generate_comprehension_language_reaction_questions;
        const productionData = allStepsOutputs.generate_production_ecrite_topic;

        if (!prepData || !excerptData || !questionsGroupData || !productionData || !excerptData.literaryExcerpt || !questionsGroupData.questions || !productionData.productionEcriteTopic) {
            console.error("[FRENCH_EXAM_AGGREGATOR] Missing critical data from steps:", { prepData, excerptData, questionsGroupData, productionData });
            throw new Error("Erreur interne: Données manquantes pour l'agrégation finale de l'épreuve de français.");
        }

        const literaryExcerpt = excerptData.literaryExcerpt;
        const sourceNovelDisplay = prepData.selectedNovelForExcerpt ? ` (Œuvre de référence : ${prepData.selectedNovelForExcerpt})` : '';

        const finalSubQuestions = [];
        let currentOrder = 0;

        // أسئلة الفهم، اللغة، رد الفعل
        questionsGroupData.questions.forEach(sq => {
            currentOrder++;
            finalSubQuestions.push({
                text: sq.text,
                difficultyOrder: currentOrder, // نعتمد على الترتيب الذي تم إنشاؤه في الخطوة السابقة إذا كان متسلسلاً
                points: sq.points,
                category: sq.category || 'unknown' // للحفاظ على تصنيف السؤال إذا لزم الأمر
            });
        });
        
        // سؤال الإنشاء
        finalSubQuestions.push({
            text: productionData.productionEcriteTopic.text,
            difficultyOrder: currentOrder + 1,
            points: productionData.productionEcriteTopic.points,
            isProductionEcrite: true,
            category: 'production'
        });

        // التأكد من أن difficultyOrder متسلسل وصحيح
        finalSubQuestions.sort((a,b) => a.difficultyOrder - b.difficultyOrder);
        finalSubQuestions.forEach((sq, index) => {
            sq.difficultyOrder = index + 1;
        });


        const totalPointsCalculated = (questionsGroupData.totalPointsAwardedForQuestions || 0) + (productionData.productionEcriteTopic.points || 0);

        return {
            problemTitle: `Épreuve Type Examen Régional - Français ${sourceNovelDisplay}`,
            text: literaryExcerpt, // المقتطف هو النص الأساسي
            subQuestions: finalSubQuestions,
            totalPoints: totalPointsCalculated,
            lesson: `Analyse de texte, langue et production écrite (${prepData.selectedNovelForExcerpt || 'Thèmes variés'})`,
        };
    }
};