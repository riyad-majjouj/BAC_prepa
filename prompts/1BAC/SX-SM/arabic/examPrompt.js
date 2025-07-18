// back-end/prompts/1BAC/SX-SM/1BAC_SX-SM_ar/examPrompt_1BAC_SX-SM_ar.js

// قائمة بدروس علوم اللغة المقررة للأولى باك
const ARABIC_LANGUAGE_LESSONS_1BAC = [
    "التمييز", "العدد (أحكامه وإعرابه)", "المصادر (الثلاثي وغير الثلاثي)", 
    "الاستعارة (أركانها وأنواعها)", "الطباق والمقابلة", "أسلوب الاستفهام وأدواته ومعانيه",
    "أسلوب الأمر والنهي وأغراضهما البلاغية", "أسلوب النداء", "الممنوع من الصرف (لعلة ولعلتين)"
];

// قائمة بمهارات التعبير والإنشاء المقررة
const ARABIC_PRODUCTION_SKILLS_1BAC = [
    "مهارة تحليل صورة", "مهارة توسيع فكرة", "مهارة المقارنة والاستنتاج", "مهارة الربط بين الأفكار"
];

// مواضيع محتملة للنصوص
const ARABIC_TEXT_THEMES_1BAC = [
    "قضايا التنمية المستدامة", "التكنولوجيا الحديثة وتأثيرها على المجتمع", "مفهوم الحداثة في الفكر العربي",
    "الهجرة وأبعادها الاجتماعية", "قضايا الشباب وتطلعاتهم", "أهمية الحوار والتسامح"
];

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
    defaultGenerationConfig: { temperature: 0.65, maxOutputTokens: 4096 },
    defaultModelType: 'gemini-1.5-flash-latest',

    steps: [
        {
            name: 'prepare_exam_components',
            description: 'Selects random elements for the exam.',
            processor: () => {
                const selectedTextTheme = getRandomElement(ARABIC_TEXT_THEMES_1BAC) || "موضوع فكري";
                const selectedLangLessons = getRandomElements(ARABIC_LANGUAGE_LESSONS_1BAC, 2); 
                const selectedProductionSkill = getRandomElement(ARABIC_PRODUCTION_SKILLS_1BAC) || "مهارة توسيع فكرة";
                return {
                    textGenerationTheme: selectedTextTheme,
                    languageLessonsForQuestions: selectedLangLessons,
                    productionSkillForEssay: selectedProductionSkill,
                };
            }
        },
        {
            name: 'generate_full_arabic_exam',
            description: 'Generates the entire Arabic exam structure in one call.',
            promptGenerator: (context, previousOutputs) => {
                const theme = previousOutputs.prepare_exam_components?.textGenerationTheme;
                const langLessons = previousOutputs.prepare_exam_components?.languageLessonsForQuestions || [];
                const prodSkill = previousOutputs.prepare_exam_components?.productionSkillForEssay;

                const languageQuestionsInstructions = langLessons.map(lesson => `- سؤال تطبيقي حول درس "${lesson}".`).join('\n');

                return `
أنت خبير في وضع الامتحانات الجهوية لمادة اللغة العربية، مستوى ${context.academicLevelName}.
مهمتك هي إنشاء امتحان كامل ومتكامل من ثلاثة مجالات رئيسية: درس النصوص (10 نقاط)، علوم اللغة (4 نقاط)، والتعبير والإنشاء (6 نقاط).

**متطلبات الامتحان:**

1.  **المجال الأول: درس النصوص (10 نقاط)**
    -   أنشئ نصًا مقاليًا فكريًا متماسكًا (250-350 كلمة) حول الموضوع التالي: **"${theme}"**.
    -   صغ 6-7 أسئلة تحليلية متنوعة حول النص (قضية محورية، حقول دلالية، أساليب حجاجية، رأي شخصي...). وزع 10 نقاط عليها.

2.  **المجال الثاني: علوم اللغة (4 نقاط)**
    -   صغ سؤالين تطبيقيين حول الدروس التالية، كل سؤال بنقطتين:
    ${languageQuestionsInstructions}

3.  **المجال الثالث: التعبير والإنشاء (6 نقاط)**
    -   صغ نص موضوع واحد يطلب من التلميذ تطبيق المهارة التالية: **"${prodSkill}"**.

**صيغة الإخراج JSON الصارمة:**
يجب أن يكون الإخراج كائن JSON واحد فقط. يجب أن يحتوي على مفتاح \`"examItems"\` وهو عبارة عن مصفوفة تحتوي على كل مكونات الامتحان بالترتيب.

\`\`\`json
{
  "problemTitle": "امتحان تجريبي في اللغة العربية",
  "examItems": [
    {
      "itemType": "content",
      "contentType": "paragraph",
      "text": "النص المقالي الكامل الذي أنشأته حول '${theme}' يوضع هنا..."
    },
    {
      "itemType": "content",
      "contentType": "subheading",
      "text": "المجال الأول: درس النصوص (10 نقاط)"
    },
    {
      "itemType": "question",
      "text": "1. السؤال الأول حول النص...",
      "points": 1,
      "orderInProblem": 1,
      "questionType": "free_text",
      "correctAnswer": "إجابة نموذجية مختصرة..."
    },
    {
      "itemType": "content",
      "contentType": "subheading",
      "text": "المجال الثاني: علوم اللغة (4 نقاط)"
    },
    {
      "itemType": "question",
      "text": "1. سؤال حول الدرس اللغوي الأول...",
      "points": 2,
      "orderInProblem": 8,
      "questionType": "free_text",
      "correctAnswer": "إجابة نموذجية..."
    },
    {
      "itemType": "content",
      "contentType": "subheading",
      "text": "المجال الثالث: التعبير والإنشاء (6 نقاط)"
    },
    {
      "itemType": "question",
      "text": "نص موضوع التعبير والإنشاء الذي يطلب تطبيق مهارة '${prodSkill}'...",
      "points": 6,
      "orderInProblem": 10,
      "questionType": "free_text",
      "correctAnswer": "إرشادات للتصحيح: يجب على التلميذ احترام خطوات المهارة، سلامة اللغة، ووضوح الأفكار."
    }
  ]
}
\`\`\`
تأكد من أن \`orderInProblem\` متسلسل وفريد لكل سؤال.
`;
            },
        }
    ],

    finalAggregator: (context, allStepsOutputs) => {
        const aiOutput = allStepsOutputs.generate_full_arabic_exam;

        if (!aiOutput || !Array.isArray(aiOutput.examItems)) {
            console.error("[ARABIC_EXAM_AGGREGATOR] Missing or invalid 'examItems' from AI output:", aiOutput);
            throw new Error("خطأ داخلي: لم يتمكن الذكاء الاصطناعي من إنشاء بنية الامتحان المطلوبة.");
        }

        const totalPoints = aiOutput.examItems.reduce((sum, item) => {
            return item.itemType === 'question' ? sum + (item.points || 0) : sum;
        }, 0);

        return {
            problemTitle: aiOutput.problemTitle || `امتحان تجريبي في مادة اللغة العربية`,
            problemItems: aiOutput.examItems, // The structure is already correct
            totalPoints: Math.round(totalPoints),
        };
    }
};