// back-end/prompts/1BAC/SX-SM/1BAC_SX-SM_geo_history/examPrompt_1BAC_SX-SM_geo_history.js

const HISTORY_THEMES_1BAC = [ "التحولات الكبرى في العالم المتوسطي", "أوروبا من نهاية الحرب العالمية الأولى إلى أزمة 1929", "الحرب العالمية الثانية", "نظام القطبية الثنائية", "تصفية الاستعمار", "القضية الفلسطينية", "المغرب تحت نظام الحماية", "استقلال المغرب واستكمال الوحدة الترابية" ];
const GEOGRAPHY_THEMES_1BAC = [ "مفهوم التنمية", "المجال المغربي: الموارد الطبيعية والبشرية", "سياسة إعداد التراب الوطني", "التهيئة الحضرية والريفية", "مشكل الماء وظاهرة التصحر بالعالم العربي", "الولايات المتحدة الأمريكية قوة اقتصادية", "الاتحاد الأوروبي نحو اندماج شامل", "الصين قوة اقتصادية صاعدة" ];

function getRandomElement(arr) { if (!arr || arr.length === 0) return null; return arr[Math.floor(Math.random() * arr.length)]; }

module.exports = {
    type: 'multi-step',
    defaultGenerationConfig: { temperature: 0.6, maxOutputTokens: 4096 },
    defaultModelType: 'gemini-1.5-flash-latest',

    steps: [
        {
            name: 'prepare_exam_structure',
            description: 'Decides the structure of the exam.',
            processor: () => {
                const documentSubject = Math.random() < 0.5 ? "التاريخ" : "الجغرافيا";
                const essaySubject = documentSubject === "التاريخ" ? "الجغرافيا" : "التاريخ";
                const documentTheme = getRandomElement(documentSubject === "التاريخ" ? HISTORY_THEMES_1BAC : GEOGRAPHY_THEMES_1BAC);
                const essayTheme1 = getRandomElement(essaySubject === "التاريخ" ? HISTORY_THEMES_1BAC : GEOGRAPHY_THEMES_1BAC);
                let essayTheme2 = getRandomElement(essaySubject === "التاريخ" ? HISTORY_THEMES_1BAC : GEOGRAPHY_THEMES_1BAC);
                while (essayTheme2 === essayTheme1) { essayTheme2 = getRandomElement(essaySubject === "التاريخ" ? HISTORY_THEMES_1BAC : GEOGRAPHY_THEMES_1BAC); }
                return { documentSubject, essaySubject, documentTheme, essayTheme1, essayTheme2 };
            }
        },
        {
            name: 'generate_full_hist_geo_exam',
            description: 'Generates the entire History-Geography exam.',
            promptGenerator: (context, previousOutputs) => {
                const { documentSubject, essaySubject, documentTheme, essayTheme1, essayTheme2 } = previousOutputs.prepare_exam_structure;

                return `
أنت أستاذ خبير في وضع الامتحانات الجهوية لمادة التاريخ والجغرافيا، مستوى ${context.academicLevelName}.
مهمتك هي إنشاء امتحان كامل يتكون من جزأين:
1.  **الاشتغال بالوثائق في مادة ${documentSubject} (10 نقاط):** أنشئ 2-3 وثائق نصية قصيرة حول موضوع **"${documentTheme}"**. ثم صغ 4 أسئلة (سياق، شرح مصطلح، استخراج، تركيب فكرة).
2.  **إنتاج مقال في مادة ${essaySubject} (10 نقاط):** صغ موضوعين مقاليين اختياريين. الأول حول **"${essayTheme1}"** والثاني حول **"${essayTheme2}"**.

**صيغة الإخراج JSON الصارمة:**
يجب أن يكون الإخراج كائن JSON واحد يحتوي على مفتاح \`"problemItems"\` وهو مصفوفة تضم كل مكونات الامتحان بالترتيب.

\`\`\`json
{
  "problemTitle": "امتحان تجريبي في التاريخ والجغرافيا",
  "problemItems": [
    {
      "itemType": "content",
      "contentType": "subheading",
      "text": "أولاً: الاشتغال بالوثائق في مادة ${documentSubject} (10 نقاط)"
    },
    {
      "itemType": "content",
      "contentType": "paragraph",
      "text": "**الوثيقة 1:** (نص الوثيقة الأولى هنا...)"
    },
    {
      "itemType": "content",
      "contentType": "paragraph",
      "text": "**الوثيقة 2:** (نص الوثيقة الثانية هنا...)"
    },
    {
      "itemType": "question",
      "text": "1. ضع الوثيقتين في سياقهما ${documentSubject === 'التاريخ' ? 'التاريخي' : 'الجغرافي'}.",
      "points": 2,
      "orderInProblem": 1,
      "questionType": "free_text",
      "correctAnswer": "إجابة نموذجية..."
    },
    {
      "itemType": "content",
      "contentType": "subheading",
      "text": "ثانياً: إنتاج مقال في مادة ${essaySubject} (10 نقاط)"
    },
    {
      "itemType": "question",
      "text": "اكتب في أحد الموضوعين التاليين:\\n\\n**الموضوع الأول:**\\n${essayTheme1}: (توجيهات المقال الأول...)\\n\\n**الموضوع الثاني:**\\n${essayTheme2}: (توجيهات المقال الثاني...)",
      "points": 10,
      "orderInProblem": 5,
      "questionType": "free_text",
      "correctAnswer": "معايير التصحيح: الجانب المنهجي، المعرفي، والشكل العام."
    }
  ]
}
\`\`\`
`;
            },
        }
    ],
    finalAggregator: (context, allStepsOutputs) => {
        const aiOutput = allStepsOutputs.generate_full_hist_geo_exam;

        if (!aiOutput || !Array.isArray(aiOutput.problemItems)) {
            console.error("[HIST_GEO_EXAM_AGGREGATOR] Missing or invalid 'problemItems' from AI output:", aiOutput);
            throw new Error("خطأ داخلي: لم يتمكن الذكاء الاصطناعي من إنشاء بنية الامتحان المطلوبة.");
        }

        const totalPoints = aiOutput.problemItems.reduce((sum, item) => {
            return item.itemType === 'question' ? sum + (item.points || 0) : sum;
        }, 0);

        return {
            problemTitle: aiOutput.problemTitle || `امتحان تجريبي في التاريخ والجغرافيا`,
            problemItems: aiOutput.problemItems,
            totalPoints: Math.round(totalPoints),
        };
    }
};