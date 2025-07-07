// back-end/prompts/1BAC/SX-SM/1BAC_SX-SM_edu_islamic/examPrompt_1BAC_SX-SM_edu_islamic.js

const QURAN_SURAH_1BAC = ["سورة يوسف"];
const ISLAMIC_EDU_THEMES_1BAC = [ "الإيمان والغيب", "الإيمان والعلم", "الإيمان والفلسفة", "فقه الأسرة: الزواج والطلاق", "حقوق الطفل في الإسلام", "التكافل الاجتماعي", "محاربة الفواحش" ];

function getRandomElement(arr) { if (!arr || arr.length === 0) return null; return arr[Math.floor(Math.random() * arr.length)]; }
function getRandomElements(arr, count) { if (!arr || arr.length === 0) return []; const shuffled = [...arr].sort(() => 0.5 - Math.random()); return shuffled.slice(0, count); }

module.exports = {
    type: 'multi-step',
    defaultGenerationConfig: { temperature: 0.6, maxOutputTokens: 4096 },
    defaultModelType: 'gemini-1.5-flash-latest',

    steps: [
        {
            name: 'prepare_exam_focus',
            description: 'Selects a Surah and themes for the exam.',
            processor: () => {
                const selectedSurah = getRandomElement(QURAN_SURAH_1BAC) || "سورة يوسف";
                const selectedThemes = getRandomElements(ISLAMIC_EDU_THEMES_1BAC, 3); 
                return { targetSurah: selectedSurah, mainLessonThemes: selectedThemes };
            }
        },
        {
            name: 'generate_full_islamic_edu_exam',
            description: 'Generates the entire Islamic Education exam.',
            promptGenerator: (context, previousOutputs) => {
                const surah = previousOutputs.prepare_exam_focus?.targetSurah;
                const themes = previousOutputs.prepare_exam_focus?.mainLessonThemes || [];

                return `
أنت خبير في وضع الامتحانات الجهوية لمادة التربية الإسلامية، مستوى ${context.academicLevelName}.
مهمتك هي إنشاء امتحان كامل ومتكامل (20 نقطة) بناءً على وضعية تقويمية وأسناد.

**متطلبات الامتحان:**

1.  **وضعية الانطلاق والأسناد:**
    -   صغ وضعية تقويمية (سياق مشكل) تربط بين المحاور التالية: **${themes.join('، ')}**.
    -   اختر آية أو آيتين من **${surah}** كـ"سند أول" مرتبط بالوضعية.
    -   اختر حديثًا نبويًا شريفًا كـ"سند ثان".

2.  **الأسئلة (20 نقطة):**
    -   صغ حوالي 6-8 أسئلة متنوعة ومتدرجة.
    -   يجب أن تشمل الأسئلة: تحديد الإشكالية، شرح مفاهيم، استخلاص مضامين وأحكام من الأسناد، وربطها بالدروس.
    -   يجب أن يكون السؤال الأخير سؤالاً عن الموقف الشخصي مع التعليل الشرعي.
    -   وزع 20 نقطة على جميع الأسئلة.

**صيغة الإخراج JSON الصارمة:**
يجب أن يكون الإخراج كائن JSON واحد يحتوي على مفتاح \`"problemItems"\` وهو مصفوفة تضم كل مكونات الامتحان بالترتيب.

\`\`\`json
{
  "problemTitle": "امتحان تجريبي في التربية الإسلامية",
  "problemItems": [
    {
      "itemType": "content",
      "contentType": "paragraph",
      "text": "**وضعية الانطلاق:**\\n(نص الوضعية التقويمية هنا...)"
    },
    {
      "itemType": "content",
      "contentType": "paragraph",
      "text": "**السند 1: (من ${surah})**\\n(الآيات القرآنية هنا مع الشكل...)"
    },
    {
      "itemType": "content",
      "contentType": "paragraph",
      "text": "**السند 2: (حديث نبوي)**\\n(نص الحديث النبوي هنا...)"
    },
    {
      "itemType": "question",
      "text": "1. حدد الإشكالية التي تطرحها الوضعية.",
      "points": 2,
      "orderInProblem": 1,
      "questionType": "free_text",
      "correctAnswer": "إجابة نموذجية..."
    },
    {
      "itemType": "question",
      "text": "7. ما موقفك من... مع التعليل الشرعي.",
      "points": 4,
      "orderInProblem": 7,
      "questionType": "free_text",
      "correctAnswer": "إرشادات التصحيح..."
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
        const aiOutput = allStepsOutputs.generate_full_islamic_edu_exam;

        if (!aiOutput || !Array.isArray(aiOutput.problemItems)) {
            console.error("[ISLAMIC_EDU_EXAM_AGGREGATOR] Missing or invalid 'problemItems' from AI output:", aiOutput);
            throw new Error("خطأ داخلي: لم يتمكن الذكاء الاصطناعي من إنشاء بنية الامتحان المطلوبة.");
        }

        const totalPoints = aiOutput.problemItems.reduce((sum, item) => {
            return item.itemType === 'question' ? sum + (item.points || 0) : sum;
        }, 0);

        return {
            problemTitle: aiOutput.problemTitle || `امتحان تجريبي في التربية الإسلامية`,
            problemItems: aiOutput.problemItems,
            totalPoints: Math.round(totalPoints),
        };
    }
};