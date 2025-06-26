// back-end/prompts/1BAC/SX-SM/1BAC_SX-SM_geo_history/examPrompt_1BAC_SX-SM_geo_history.js

// محاور/دروس رئيسية للتاريخ والجغرافيا للأولى باك (أمثلة، يجب تدقيقها وتوسيعها)
const HISTORY_THEMES_1BAC = [
    "التحولات الكبرى في العالم المتوسطي وبناء الحداثة (من القرن 15 إلى القرن 18)",
    "أوروبا من نهاية الحرب العالمية الأولى إلى أزمة 1929",
    "الحرب العالمية الثانية: الأسباب والنتائج",
    "نظام القطبية الثنائية والحرب الباردة",
    "تصفية الاستعمار وبروز العالم الثالث",
    "القضية الفلسطينية والصراع العربي الإسرائيلي",
    "المغرب تحت نظام الحماية: الاستغلال الاستعماري والنضال الوطني",
    "المغرب: الكفاح من أجل الاستقلال واستكمال الوحدة الترابية"
];
const GEOGRAPHY_THEMES_1BAC = [
    "مفهوم التنمية: تعدد المقاربات والتقسيمات الكبرى للعالم (خريطة التنمية)",
    "المجال المغربي: الموارد الطبيعية والبشرية وأساليب تدبيرها",
    "الاختيارات الكبرى لسياسة إعداد التراب الوطني بالمغرب وتحدياتها",
    "التهيئة الحضرية والريفية بالمغرب: أزمة المدينة والريف وأشكال التدخل",
    "العالم العربي: مشكل الماء وظاهرة التصحر",
    "الولايات المتحدة الأمريكية: قوة اقتصادية عظمى (مظاهر القوة وعواملها)",
    "الاتحاد الأوروبي: نحو اندماج شامل (مراحل الاندماج ومظاهره وتحدياته)",
    "الصين: قوة اقتصادية صاعدة (مظاهر النمو وعوامله وحصيلة التنمية)"
];

function getRandomElement(arr) {
    if (!arr || arr.length === 0) return null;
    return arr[Math.floor(Math.random() * arr.length)];
}

module.exports = {
    type: 'multi-step',
    defaultGenerationConfig: { temperature: 0.6, maxOutputTokens: 3072 },
    defaultModelType: 'gemini-1.5-flash-latest',
    defaultStepDelayMs: 2500,

    steps: [
        {
            name: 'determine_exam_structure',
            description: 'Randomly decides which subject (History or Geography) will have documents, and which will have the essay topics.',
            processor: (context, previousOutputs) => {
                const documentSubject = Math.random() < 0.5 ? "التاريخ" : "الجغرافيا";
                const essaySubject = documentSubject === "التاريخ" ? "الجغرافيا" : "التاريخ";
                
                const documentTheme = getRandomElement(documentSubject === "التاريخ" ? HISTORY_THEMES_1BAC : GEOGRAPHY_THEMES_1BAC) || "موضوع رئيسي من المقرر";
                const essayTheme1 = getRandomElement(essaySubject === "التاريخ" ? HISTORY_THEMES_1BAC : GEOGRAPHY_THEMES_1BAC) || "موضوع مقالي أول";
                let essayTheme2 = getRandomElement(essaySubject === "التاريخ" ? HISTORY_THEMES_1BAC : GEOGRAPHY_THEMES_1BAC) || "موضوع مقالي ثان";
                // Ensure essay themes are different
                while (essayTheme2 === essayTheme1 && (essaySubject === "التاريخ" ? HISTORY_THEMES_1BAC : GEOGRAPHY_THEMES_1BAC).length > 1) {
                    essayTheme2 = getRandomElement(essaySubject === "التاريخ" ? HISTORY_THEMES_1BAC : GEOGRAPHY_THEMES_1BAC);
                }


                console.log(`[HIST_GEO_EXAM_PREP] Document Subject: ${documentSubject} (Theme: ${documentTheme})`);
                console.log(`[HIST_GEO_EXAM_PREP] Essay Subject: ${essaySubject} (Theme1: ${essayTheme1}, Theme2: ${essayTheme2})`);

                return {
                    documentSubjectName: documentSubject,
                    essaySubjectName: essaySubject,
                    selectedDocumentTheme: documentTheme,
                    selectedEssayTheme1: essayTheme1,
                    selectedEssayTheme2: essayTheme2,
                };
            }
        },
        {
            name: 'generate_documents_and_questions', // الجزء الأول: الاشتغال بالوثائق (10 نقاط)
            description: 'Generates 2-3 documents (text-based) and related questions for the selected document subject.',
            promptGenerator: (context, previousOutputs) => {
                const docSubj = previousOutputs.determine_exam_structure?.documentSubjectName;
                const docTheme = previousOutputs.determine_exam_structure?.selectedDocumentTheme;
                const numDocs = Math.random() < 0.5 ? 2 : 3; // 2 أو 3 وثائق
                const totalPointsForDocuments = 10;

                if (!docSubj || !docTheme) return `ERROR: Document subject or theme not selected. Output JSON error.`;

                return `
السياق: أنت أستاذ متخصص في إعداد امتحانات مادة ${docSubj} لمستوى الأولى باكالوريا (${context.trackName}) بالمغرب.
اللغة: ${context.lessonLanguage}.

المهمة: قم بإعداد جزء "الاشتغال بالوثائق" لامتحان جهوي، ويتضمن ما يلي:
1.  **إنشاء ${numDocs} وثائق نصية مترابطة:** يجب أن تكون الوثائق نصوصًا (تاريخية أو جغرافية حسب المادة) قصيرة ومركزة (كل وثيقة حوالي 50-100 كلمة)، وتتعلق جميعها بالموضوع المحوري التالي: "${docTheme}".
    تجنب إنشاء وثائق تتطلب رسم مبيانات أو خرائط. ركز على نصوص يمكن تحليلها واستخلاص معلومات منها.
2.  **صياغة 4 أسئلة دقيقة ومتنوعة حول هذه الوثائق:**
    أ.  سؤال لوضع الوثائق في سياقها ${docSubj === "التاريخ" ? "التاريخي (الزمان، المكان، الموضوع)" : "الجغرافي (الموضوع، المجال)"}. (2ن)
    ب. سؤال لشرح مصطلح أو مفهوم أساسي وارد في إحدى الوثائق. (2ن)
    ج. سؤال لاستخراج معطيات أو أفكار أو مواقف محددة من وثيقتين أو أكثر من الوثائق. (3ن)
    د. سؤال لتركيب الفكرة الأساسية الرابطة بين الوثائق، أو لكتابة فقرة مركزة تجيب عن إشكالية محددة بناءً على الوثائق ومكتسباتك (السؤال التركيبي/الإنتاجي). (3ن)
    
    تأكد من أن مجموع نقاط الأسئلة الأربعة هو بالضبط ${totalPointsForDocuments} نقطة.

صيغة الإخراج JSON الدقيقة:
\`\`\`json
{
  "documentSubject": "${docSubj}",
  "documentTheme": "${docTheme}",
  "documents": [
    { "id": 1, "type": "text", "content": "نص الوثيقة الأولى هنا..." },
    { "id": 2, "type": "text", "content": "نص الوثيقة الثانية هنا..." }
    ${numDocs === 3 ? ',{ "id": 3, "type": "text", "content": "نص الوثيقة الثالثة هنا..." }' : ''}
  ],
  "documentQuestions": [
    { "text": "السؤال الأول (السياق)...", "difficultyOrder": 1, "points": 2, "category": "السياق" },
    { "text": "السؤال الثاني (شرح مصطلح)...", "difficultyOrder": 2, "points": 2, "category": "شرح" },
    { "text": "السؤال الثالث (استخراج)...", "difficultyOrder": 3, "points": 3, "category": "استخراج" },
    { "text": "السؤال الرابع (تركيب/إنتاج فقرة)...", "difficultyOrder": 4, "points": 3, "category": "تركيب" }
  ],
  "totalPointsForDocumentSection": ${totalPointsForDocuments}
}
\`\`\`
تأكد من صحة JSON، وأن الوثائق نصية، والأسئلة مناسبة، ومجموع النقاط دقيق.`;
            },
            generationConfig: { maxOutputTokens: 4096 }, // قد تحتاج لمخرجات أطول للوثائق والأسئلة
        },
        {
            name: 'generate_essay_topics', // الجزء الثاني: المقال (10 نقاط)
            description: 'Generates two essay topics for the other subject.',
            promptGenerator: (context, previousOutputs) => {
                const essaySubj = previousOutputs.determine_exam_structure?.essaySubjectName;
                const theme1 = previousOutputs.determine_exam_structure?.selectedEssayTheme1;
                const theme2 = previousOutputs.determine_exam_structure?.selectedEssayTheme2;
                const totalPointsForEssay = 10;

                if (!essaySubj || !theme1 || !theme2) return `ERROR: Essay subject or themes not selected. Output JSON error.`;

                return `
السياق: أنت أستاذ متخصص في إعداد مواضيع مقالية لمادة ${essaySubj} لمستوى الأولى باكالوريا (${context.trackName}) بالمغرب.
اللغة: ${context.lessonLanguage}.

المهمة: قم بصياغة موضوعين مقاليين اختياريين. يجب على التلميذ اختيار واحد منهما.
كل موضوع يجب أن:
-   يكون مرتبطًا بأحد المحاور الرئيسية للمادة ${essaySubj} (الموضوع الأول حول "${theme1}"، والموضوع الثاني حول "${theme2}").
-   يتطلب بناء مقال متكامل (مقدمة مناسبة مع طرح الإشكالية، عرض تحليلي منظم، خاتمة تركيبية).
-   يوجه التلميذ نحو العناصر الأساسية التي يجب تناولها في العرض.
-   يشير إلى أن هذا الجزء من الامتحان عليه ${totalPointsForEssay} نقطة.

صيغة الإخراج JSON الدقيقة:
\`\`\`json
{
  "essaySubject": "${essaySubj}",
  "essayTopics": [
    { 
      "id": 1, 
      "text": "نص الموضوع المقالي الأول هنا، مرتبط بـ '${theme1}'. يجب أن يتضمن توجيهات واضحة لما هو مطلوب في التحليل (مثال: أبرز كذا وكذا، مع التركيز على كذا، موضحا كذا...).",
      "theme": "${theme1}"
    },
    { 
      "id": 2, 
      "text": "نص الموضوع المقالي الثاني هنا، مرتبط بـ '${theme2}'. يجب أن يتضمن توجيهات واضحة مشابهة.",
      "theme": "${theme2}"
    }
  ],
  "pointsForEssaySection": ${totalPointsForEssay}
}
\`\`\`
تأكد من أن نص الموضوعين واضح وشامل للعناصر المطلوبة.`;
            },
            generationConfig: { maxOutputTokens: 2048 },
        }
    ],

    finalAggregator: (context, allStepsOutputs) => {
        const structureData = allStepsOutputs.determine_exam_structure;
        const docData = allStepsOutputs.generate_documents_and_questions;
        const essayData = allStepsOutputs.generate_essay_topics;

        if (!structureData || !docData || !essayData || !docData.documents || !docData.documentQuestions || !essayData.essayTopics) {
            console.error("[HIST_GEO_EXAM_AGGREGATOR] Missing critical data from steps:", {structureData, docData, essayData});
            throw new Error("خطأ داخلي: بيانات أساسية مفقودة لتجميع امتحان التاريخ والجغرافيا.");
        }

        // الجزء الأول: الاشتغال بالوثائق
        let problemText = `**أولاً: الاشتغال بالوثائق في مادة ${docData.documentSubject} (${docData.totalPointsForDocumentSection} نقطة)**\n\n`;
        docData.documents.forEach(doc => {
            problemText += `**الوثيقة ${doc.id}:**\n${doc.content}\n\n`;
        });
        problemText += `**الأسئلة:**\n`;

        const finalSubQuestions = [];
        let currentGlobalOrder = 0;

        docData.documentQuestions.forEach(sq => {
            currentGlobalOrder++;
            finalSubQuestions.push({
                text: sq.text,
                difficultyOrder: currentGlobalOrder,
                points: sq.points,
                category: `وثائق (${docData.documentSubject}) - ${sq.category}`
            });
        });

        // الجزء الثاني: المقال
        // سنقوم بتضمين تعليمات اختيار المقال وسؤال الإنشاء كـ "سؤال فرعي" خاص في نفس التمرين
        let essayInstructionText = `\n\n**ثانياً: إنتاج مقال في مادة ${essayData.essaySubject} (${essayData.pointsForEssaySection} نقطة)**\n\n`;
        essayInstructionText += `اختر أحد الموضوعين التاليين واكتب فيه مقالاً، مراعياً الجوانب المنهجية (مقدمة، عرض، خاتمة) والمعرفية واللغوية:\n\n`;
        essayInstructionText += `**الموضوع الأول:**\n${essayData.essayTopics[0].text}\n\n`;
        essayInstructionText += `**الموضوع الثاني:**\n${essayData.essayTopics[1].text}`;
        
        currentGlobalOrder++;
        finalSubQuestions.push({
            text: essayInstructionText.trim(), // هذا هو نص "السؤال" الذي يتضمن الموضوعين
            difficultyOrder: currentGlobalOrder,
            points: essayData.pointsForEssaySection, // النقاط الكلية للمقال
            isEssayWithOptions: true, // علامة خاصة للواجهة الأمامية لتعرف أن هذا يتطلب اختيار موضوع ثم كتابة
            essaySubject: essayData.essaySubject,
            essayOptions: essayData.essayTopics.map(t => ({id: t.id, text: t.text, theme: t.theme})), // لإرسال خيارات المقال
            category: `مقال (${essayData.essaySubject})`
        });
        
        const totalExamPoints = (docData.totalPointsForDocumentSection || 0) + (essayData.pointsForEssaySection || 0);

        return {
            problemTitle: `امتحان تجريبي في مادة التاريخ والجغرافيا - ${context.academicLevelName} ${context.trackName}`,
            text: problemText.trim(), // وثائق الاشتغال هي "النص الرئيسي" للجزء الأول
            subQuestions: finalSubQuestions, // تحتوي على أسئلة الوثائق + سؤال المقال المدمج
            totalPoints: totalExamPoints, // يجب أن يكون 20
            lesson: `منهجية الاشتغال بالوثائق في ${docData.documentSubject} ومنهجية كتابة المقال في ${essayData.essaySubject}`,
            // معلومات إضافية للواجهة الأمامية للتعامل مع هذا النوع الخاص من الاختبار
            documentSubject: docData.documentSubject,
            essaySubject: essayData.essaySubject,
        };
    }
};