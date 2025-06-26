// back-end/prompts/1BAC/SX-SM/1BAC_SX-SM_ar/examPrompt_1BAC_SX-SM_ar.js

// قائمة بدروس علوم اللغة المقررة للأولى باك (يمكن توسيعها وتدقيقها حسب الإطار المرجعي)
const ARABIC_LANGUAGE_LESSONS_1BAC = [
    "التمييز", "العدد (أحكامه وإعرابه)", "المصادر (الثلاثي وغير الثلاثي)", 
    "الاستعارة (أركانها وأنواعها)", "الطباق والمقابلة", "أسلوب الاستفهام وأدواته ومعانيه",
    "أسلوب الأمر والنهي وأغراضهما البلاغية", "أسلوب النداء", "الممنوع من الصرف (لعلة ولعلتين)"
];

// قائمة بمهارات التعبير والإنشاء المقررة (يمكن توسيعها)
const ARABIC_PRODUCTION_SKILLS_1BAC = [
    "مهارة تحليل صورة (مكوناتها، دلالاتها، أبعادها)",
    "مهارة توسيع فكرة (بالأمثلة والشواهد والحجج)",
    "مهارة المقارنة والاستنتاج (بين نصين، موقفين، ظاهرتين)",
    "مهارة الربط بين الأفكار (باستخدام أدوات ربط متنوعة)"
];

// مواضيع محتملة للنصوص (يمكن أن تكون أكثر تحديدًا إذا كان لديك قائمة بنصوص مقررة)
const ARABIC_TEXT_THEMES_1BAC = [
    "قضايا التنمية المستدامة وتحدياتها في العالم المعاصر",
    "دور التكنولوجيا الحديثة في التواصل وتأثيرها على القيم الاجتماعية",
    "مفهوم الحداثة وإشكالاته في الفكر العربي المعاصر",
    "الهجرة وأبعادها الاجتماعية والاقتصادية والثقافية",
    "قضايا الشباب وتطلعاتهم في المجتمع الحديث",
    "أهمية الحوار والتسامح في بناء مجتمع متماسك",
    "الفن ودوره في التعبير عن قضايا المجتمع والارتقاء بالذوق"
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
    defaultGenerationConfig: { temperature: 0.65, maxOutputTokens: 3072 }, // زيادة طفيفة للمخرجات الأطول
    defaultModelType: 'gemini-1.5-flash-latest',
    defaultStepDelayMs: 2500, // تأخير افتراضي بين الخطوات

    steps: [
        {
            name: 'prepare_exam_components',
            description: 'Selects random text theme, language lessons, and production skill for the exam.',
            processor: (context, previousOutputs) => {
                const selectedTextTheme = getRandomElement(ARABIC_TEXT_THEMES_1BAC) || "موضوع فكري أو أدبي معاصر";
                // اختيار درسين أو ثلاثة لعلوم اللغة
                const selectedLangLessons = getRandomElements(ARABIC_LANGUAGE_LESSONS_1BAC, Math.random() < 0.5 ? 2 : 3); 
                const selectedProductionSkill = getRandomElement(ARABIC_PRODUCTION_SKILLS_1BAC) || "مهارة إنشائية مناسبة للمستوى";

                console.log(`[ARABIC_EXAM_PREP] Selected Text Theme: ${selectedTextTheme}`);
                console.log(`[ARABIC_EXAM_PREP] Selected Language Lessons: ${selectedLangLessons.join('، ')}`);
                console.log(`[ARABIC_EXAM_PREP] Selected Production Skill: ${selectedProductionSkill}`);

                return {
                    textGenerationTheme: selectedTextTheme,
                    languageLessonsForQuestions: selectedLangLessons,
                    productionSkillForEssay: selectedProductionSkill,
                };
            }
        },
        {
            name: 'generate_main_text', // المجال الأول: درس النصوص - النص
            description: 'Generates the main analytical/literary text for the exam.',
            promptGenerator: (context, previousOutputs) => {
                const theme = previousOutputs.prepare_exam_components?.textGenerationTheme;
                if (!theme) return `ERROR: Text theme not selected. Output JSON error.`;

                return `
السياق: أنت مؤلف أكاديمي متخصص في إعداد نصوص للامتحانات الجهوية لمادة اللغة العربية، مستوى ${context.academicLevelName} - ${context.trackName} بالمغرب.
اللغة: ${context.lessonLanguage} (فصحى سليمة وواضحة).

المهمة: قم بصياغة نص مقالي (فكري، نقدي، أو أدبي قصير) متماسك، يتراوح طوله بين 250 و 350 كلمة.
يجب أن يتمحور النص حول الموضوع التالي: "${theme}".
النص يجب أن يكون مناسبًا لطرح أسئلة تحليلية وفهمية عليه، ويتضمن أفكارًا رئيسية وثانوية واضحة، ويمكن أن يحتوي على بعض الأساليب البلاغية أو الحجاجية الضمنية. يجب أن يكون ملائماً للمستوى المعرفي لتلاميذ الأولى باكالوريا.

صيغة الإخراج JSON الدقيقة (فقط كائن JSON):
\`\`\`json
{
  "mainText": "النص المقالي المُنشأ هنا...",
  "mainTextTitleSuggestion": "عنوان مقترح للنص (اختياري، إذا كان مناسباً)",
  "mainTextTheme": "${theme}"
}
\`\`\`
تأكد من صحة JSON وأن حقل "mainText" غير فارغ.`;
            },
            generationConfig: { maxOutputTokens: 2048 },
        },
        {
            name: 'generate_text_analysis_questions', // المجال الأول: درس النصوص - الأسئلة
            description: 'Generates questions related to text comprehension and analysis.',
            promptGenerator: (context, previousOutputs) => {
                const mainText = previousOutputs.generate_main_text?.mainText;
                const textTitle = previousOutputs.generate_main_text?.mainTextTitleSuggestion;
                if (!mainText) return `ERROR: Main text not found from previous step. Output JSON error.`;

                // عادة 6-7 أسئلة لنصوص المجموع 10 نقاط
                const numTextQuestions = Math.random() < 0.5 ? 6 : 7; 
                const totalPointsForTextQuestions = 10;

                return `
السياق: أنت واضع أسئلة امتحان جهوي للغة العربية (${context.academicLevelName} - ${context.trackName}).
اللغة: ${context.lessonLanguage}.
نص الانطلاق المقدم:
${textTitle ? `عنوان مقترح: ${textTitle}\n` : ''}"${mainText}"

المهمة: بناءً على نص الانطلاق أعلاه، قم بصياغة ${numTextQuestions} أسئلة متنوعة ومتدرجة الصعوبة تغطي جوانب الفهم والتحليل والتركيب، كما هو معهود في الامتحانات الجهوية.
الأسئلة يجب أن تشمل (على سبيل المثال لا الحصر):
-   سؤال حول علاقة جزء من النص (عنوان، فقرة) بموضوعه العام.
-   تحديد القضية المحورية أو الأفكار الرئيسية في النص.
-   شرح فكرة أو قولة واردة في النص.
-   استخراج حقلين دلاليين وتحديد العلاقة بينهما مع التعليل.
-   إبراز بعض خصائص النص (أسلوب، لغة، منهجية الكاتب).
-   تحليل بعض الروابط أو الأساليب الحجاجية المستخدمة.
-   سؤال تركيبي يتطلب إبداء الرأي في قضية يطرحها النص مع تقديم الحجج.

يجب أن يكون لكل سؤال حقل "text" (نص السؤال)، "difficultyOrder" (ترتيب تسلسلي يبدأ من 1)، وحقل "points".
مجموع النقاط لجميع هذه الأسئلة (${numTextQuestions} سؤالاً) يجب أن يكون بالضبط ${totalPointsForTextQuestions} نقطة. قم بتوزيع النقاط بشكل مناسب (مثلاً: 1ن، 1.5ن، 2ن، 3ن للسؤال التركيبي).

صيغة الإخراج JSON الدقيقة (فقط كائن JSON):
\`\`\`json
{
  "textAnalysisQuestions": [
    { "text": "سؤال فهم/تحليل 1...", "difficultyOrder": 1, "points": 1 },
    { "text": "سؤال فهم/تحليل 2...", "difficultyOrder": 2, "points": 1.5 }
    // ... أكمل حتى ${numTextQuestions} سؤالاً
  ],
  "totalPointsAwardedForTextAnalysis": ${totalPointsForTextQuestions}
}
\`\`\`
تأكد من صحة JSON، العدد الصحيح للأسئلة، ومجموع النقاط الدقيق.`;
            },
             generationConfig: { maxOutputTokens: 3072 },
        },
        {
            name: 'generate_language_science_questions', // المجال الثاني: علوم اللغة
            description: 'Generates questions on specific language science topics.',
            promptGenerator: (context, previousOutputs) => {
                const mainText = previousOutputs.generate_main_text?.mainText; // يمكن استخدامه كمرجع للاستخراج
                const langLessonsToCover = previousOutputs.prepare_exam_components?.languageLessonsForQuestions || [];
                if (langLessonsToCover.length === 0) {
                    return `{"languageScienceQuestions": [], "totalPointsAwardedForLanguage": 0}`; // لا أسئلة إذا لم يتم اختيار دروس
                }

                // عادة سؤالان لعلوم اللغة بمجموع 4 نقاط
                const numLangQuestions = langLessonsToCover.length; // سؤال لكل درس مختار
                const totalPointsForLanguageQuestions = 4;
                // AI سيقوم بتوزيع النقاط على الأسئلة

                const lessonInstructions = langLessonsToCover.map((lesson, index) => 
                    `السؤال ${index + 1}: سؤال تطبيقي حول درس "${lesson}". يمكن أن يكون على شكل استخراج من النص السابق ("${mainText ? mainText.substring(0,100)+'...' : 'النص الرئيسي'}") مع التحليل، أو إكمال جدول، أو تكوين جمل، أو تحديد عناصر الظاهرة اللغوية مع الضبط بالشكل إذا لزم الأمر.`
                ).join('\n');

                return `
السياق: أنت متخصص في أسئلة علوم اللغة للامتحان الجهوي (${context.academicLevelName} - ${context.trackName}).
اللغة: ${context.lessonLanguage}.

المهمة: قم بصياغة ${numLangQuestions} أسئلة دقيقة في علوم اللغة، تستهدف الدروس التالية:
${lessonInstructions}

يجب أن يكون لكل سؤال حقل "text"، "difficultyOrder" (ترتيب تسلسلي)، وحقل "points".
مجموع النقاط لجميع هذه الأسئلة (${numLangQuestions} سؤالاً) يجب أن يكون بالضبط ${totalPointsForLanguageQuestions} نقطة.

صيغة الإخراج JSON الدقيقة (فقط كائن JSON):
\`\`\`json
{
  "languageScienceQuestions": [
    { "text": "سؤال علوم اللغة 1 حول '${langLessonsToCover[0]}'", "difficultyOrder": 1, "points": 2 },
    // ... أكمل لباقي الدروس المختارة
    { "text": "سؤال علوم اللغة ${numLangQuestions} حول '${langLessonsToCover[numLangQuestions-1]}'", "difficultyOrder": ${numLangQuestions}, "points": ${totalPointsForLanguageQuestions - ( (numLangQuestions-1) * 2) } } // مثال لتوزيع النقاط
  ],
  "totalPointsAwardedForLanguage": ${totalPointsForLanguageQuestions}
}
\`\`\`
تأكد من صحة JSON، العدد الصحيح للأسئلة، وتغطية الدروس المطلوبة، ومجموع النقاط الدقيق.`;
            },
            generationConfig: { maxOutputTokens: 2048 },
        },
        {
            name: 'generate_production_ecrite_task', // المجال الثالث: التعبير والإنشاء
            description: 'Generates an essay/production task.',
            promptGenerator: (context, previousOutputs) => {
                const skillToApply = previousOutputs.prepare_exam_components?.productionSkillForEssay;
                const mainTextThemeForInspiration = previousOutputs.generate_main_text?.mainTextTheme;
                const totalPointsForProduction = 6;

                if (!skillToApply) return `ERROR: Production skill not selected. Output JSON error.`;
                
                return `
السياق: أنت مُعدّ لمواضيع التعبير والإنشاء للامتحان الجهوي (${context.academicLevelName} - ${context.trackName}).
اللغة: ${context.lessonLanguage}.
المهارة الإنشائية المستهدفة: "${skillToApply}".
(يمكن الاستئناس بالموضوع العام للنص السابق: "${mainTextThemeForInspiration || 'موضوع فكري معاصر'}" لاختيار سياق للموضوع).

المهمة: قم بصياغة نص الموضوع (التعليمة) للتعبير والإنشاء.
يجب أن يطلب الموضوع من التلميذ إنتاج نص متكامل (مقالة، رسالة، إلخ حسب طبيعة المهارة) يوظف فيه بشكل واضح "${skillToApply}".
الموضوع يجب أن يكون واضحًا، محفزًا، ومناسبًا للمستوى، ويتيح للتلميذ التعبير عن أفكاره وتنظيمها.
اذكر أن هذا المكون عليه ${totalPointsForProduction} نقاط.

صيغة الإخراج JSON الدقيقة (فقط كائن JSON):
\`\`\`json
{
  "productionTask": {
    "text": "نص موضوع التعبير والإنشاء هنا، مع توجيهات واضحة لتطبيق مهارة '${skillToApply}'...",
    "points": ${totalPointsForProduction},
    "skillTargeted": "${skillToApply}"
  }
}
\`\`\`
تأكد من صحة JSON.`;
            },
            generationConfig: { maxOutputTokens: 1024 },
        }
    ],

    finalAggregator: (context, allStepsOutputs) => {
        const prepData = allStepsOutputs.prepare_exam_components;
        const textData = allStepsOutputs.generate_main_text;
        const analysisQuestionsData = allStepsOutputs.generate_text_analysis_questions;
        const languageQuestionsData = allStepsOutputs.generate_language_science_questions;
        const productionData = allStepsOutputs.generate_production_ecrite_task;

        if (!textData?.mainText || !analysisQuestionsData?.textAnalysisQuestions || !languageQuestionsData?.languageScienceQuestions || !productionData?.productionTask) {
            console.error("[ARABIC_EXAM_AGGREGATOR] Missing critical data from one or more steps:", {prepData, textData, analysisQuestionsData, languageQuestionsData, productionData});
            throw new Error("خطأ داخلي: بيانات أساسية مفقودة لتجميع امتحان اللغة العربية.");
        }

        const finalSubQuestions = [];
        let currentGlobalOrder = 0;
        let totalExamPoints = 0;

        // المجال الأول: درس النصوص (النص يُعرض كـ problemText الرئيسي)
        analysisQuestionsData.textAnalysisQuestions.forEach(sq => {
            currentGlobalOrder++;
            finalSubQuestions.push({
                text: sq.text,
                difficultyOrder: currentGlobalOrder,
                points: sq.points,
                category: "درس النصوص" // تصنيف للسؤال
            });
        });
        totalExamPoints += analysisQuestionsData.totalPointsAwardedForTextAnalysis || 0;

        // المجال الثاني: علوم اللغة
        languageQuestionsData.languageScienceQuestions.forEach(sq => {
            currentGlobalOrder++;
            finalSubQuestions.push({
                text: sq.text,
                difficultyOrder: currentGlobalOrder,
                points: sq.points,
                category: "علوم اللغة"
            });
        });
        totalExamPoints += languageQuestionsData.totalPointsAwardedForLanguage || 0;
        
        // المجال الثالث: التعبير والإنشاء (يُعرض كسؤال أخير)
        finalSubQuestions.push({
            text: productionData.productionTask.text,
            difficultyOrder: currentGlobalOrder + 1,
            points: productionData.productionTask.points,
            isProductionEcrite: true, // علامة خاصة للإنشاء
            category: "التعبير والإنشاء"
        });
        totalExamPoints += productionData.productionTask.points || 0;

        return {
            problemTitle: `امتحان جهوي تجريبي في مادة اللغة العربية - ${context.academicLevelName} ${context.trackName}`,
            text: textData.mainText, // النص الرئيسي للامتحان
            subQuestions: finalSubQuestions,
            totalPoints: totalExamPoints, // يجب أن يكون 20 نقطة (10 + 4 + 6)
            lesson: `مراجعة شاملة: النصوص، علوم اللغة، والتعبير والإنشاء (الموضوع العام للنص: ${prepData?.textGenerationTheme || 'متنوع'})`,
        };
    }
};