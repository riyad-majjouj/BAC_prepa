// back-end/prompts/1BAC/SX-SM/1BAC_SX-SM_edu_islamic/examPrompt_1BAC_SX-SM_edu_islamic.js

// قائمة بالسور المقررة (مثال، يجب تدقيقها)
const QURAN_SURAH_1BAC = ["سورة يوسف"]; // يمكن إضافة سور أخرى إذا كانت مقررة

// قائمة بمحاور الدروس الرئيسية (مثال، يجب تدقيقها وتوسيعها)
const ISLAMIC_EDU_THEMES_1BAC = [
    "الإيمان والغيب (مفهومه، أثره في التصور والسلوك)",
    "الإيمان والعلم (العلاقة بينهما، تكامل لا تعارض)",
    "الإيمان والفلسفة (حدود العقل في فهم الغيب، دور الفلسفة الإيجابي)",
    "فقه الأسرة: الزواج (أحكامه ومقاصده)",
    "فقه الأسرة: الطلاق (أحكامه، أسبابه، آثاره)",
    "حقوق الطفل في الإسلام ورعايته",
    "رعاية الإسلام للمجتمع: التكافل الاجتماعي نموذجا",
    "القيم الإسلامية في المعاملات المالية (الصدق، الأمانة، تجنب الربا والغش)",
    "الرسول صلى الله عليه وسلم نموذجا للاقتداء في بناء الأسرة والمجتمع",
    "منهج الإسلام في محاربة الفواحش والانحرافات السلوكية"
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
    defaultGenerationConfig: { temperature: 0.6, maxOutputTokens: 3072 },
    defaultModelType: 'gemini-1.5-flash-latest',
    defaultStepDelayMs: 2000,

    steps: [
        {
            name: 'prepare_exam_focus',
            description: 'Selects a Quranic Surah and key lesson themes for the exam.',
            processor: (context, previousOutputs) => {
                const selectedSurah = getRandomElement(QURAN_SURAH_1BAC) || "سورة يوسف"; // Fallback
                // اختيار 3 أو 4 محاور دروس لتكون مركز الامتحان
                const selectedThemes = getRandomElements(ISLAMIC_EDU_THEMES_1BAC, Math.random() < 0.5 ? 3 : 4); 

                console.log(`[ISLAMIC_EDU_EXAM_PREP] Selected Surah: ${selectedSurah}`);
                console.log(`[ISLAMIC_EDU_EXAM_PREP] Selected Themes: ${selectedThemes.join('، ')}`);

                return {
                    targetSurah: selectedSurah,
                    mainLessonThemes: selectedThemes,
                };
            }
        },
        {
            name: 'generate_contextual_situation_and_texts', // وضعية الانطلاق والنصوص الشرعية
            description: 'Generates a contextual situation (Wada3iya) and related Quranic/Hadith texts.',
            promptGenerator: (context, previousOutputs) => {
                const surah = previousOutputs.prepare_exam_focus?.targetSurah;
                const themes = previousOutputs.prepare_exam_focus?.mainLessonThemes || [];
                
                return `
السياق: أنت مُعدّ امتحانات جهوية لمادة التربية الإسلامية (${context.academicLevelName} - ${context.trackName}).
اللغة: ${context.lessonLanguage} (فصحى واضحة ودقيقة).

المهمة:
1.  **صياغة وضعية تقويمية (سياق مشكل):** قم بصياغة وضعية مشكلة أو سياق واقعي قصير (3-5 أسطر) يربط بين بعض المحاور المختارة (${themes.join('، ')}) ويعكس إشكالية معاصرة أو قضية تحتاج إلى معالجة من منظور إسلامي.
2.  **اختيار نصوص شرعية (أسناد):**
    أ.  اختر آية أو آيتين قصيرتين ومتصلتين بالمعنى من ${surah}، تكون ذات صلة بالوضعية أو أحد المحاور.
    ب. اختر حديثًا نبويًا شريفًا صحيحًا (أو قولاً مأثورًا مناسبًا) يرتبط أيضًا بالوضعية أو المحاور.

صيغة الإخراج JSON الدقيقة:
\`\`\`json
{
  "contextualSituation": "نص الوضعية التقويمية هنا...",
  "quranicText": {
    "text": "الآيات القرآنية المختارة من ${surah} مع الشكل التام...",
    "surahName": "${surah}" 
  },
  "hadithText": {
    "text": "نص الحديث النبوي الشريف المختار مع الإشارة إلى راويه أو مصدره إن أمكن...",
    "source": "مثلاً: رواه البخاري" 
  },
  "linkedThemes": ${JSON.stringify(themes)}
}
\`\`\`
تأكد من أن النصوص الشرعية صحيحة ومناسبة للمستوى، وأن الوضعية واضحة ومحفزة للتفكير.`;
            },
            generationConfig: { maxOutputTokens: 2048 },
        },
        {
            name: 'generate_analysis_questions', // أسئلة الفهم والتحليل والاستنباط
            description: 'Generates questions based on the provided situation and texts.',
            promptGenerator: (context, previousOutputs) => {
                const situation = previousOutputs.generate_contextual_situation_and_texts?.contextualSituation;
                const quran = previousOutputs.generate_contextual_situation_and_texts?.quranicText?.text;
                const hadith = previousOutputs.generate_contextual_situation_and_texts?.hadithText?.text;
                const themes = previousOutputs.generate_contextual_situation_and_texts?.linkedThemes || [];

                if (!situation || !quran) return `ERROR: Contextual situation or Quranic text missing. Output JSON error.`;

                // عادة 5-7 أسئلة متنوعة، بمجموع نقاط (مثلاً 14 نقطة، تضاف إليها 6 نقاط للموقف الشخصي لاحقًا)
                // لكن الامتحان كله على 20. لنفترض أن هذا الجزء عليه 15 نقطة، والموقف 5 نقاط.
                const numAnalysisQuestions = Math.random() < 0.5 ? 5 : 6; 
                const totalPointsForAnalysis = 15; // مجموع نقاط هذه الأسئلة (باستثناء الموقف)

                return `
السياق: أنت واضع أسئلة امتحان جهوي للغة التربية الإسلامية (${context.academicLevelName} - ${context.trackName}).
اللغة: ${context.lessonLanguage}.

وضعية الانطلاق والسياق: "${situation}"
النص القرآني: "${quran}"
${hadith ? `الحديث النبوي: "${hadith}"` : ""}
المحاور الرئيسية المرتبطة: ${themes.join('، ')}

المهمة: بناءً على ما سبق، قم بصياغة ${numAnalysisQuestions} أسئلة متنوعة ومتدرجة الصعوبة.
يجب أن تغطي الأسئلة ما يلي (أمثلة، يمكنك التنويع):
-   تحديد الإشكالية التي تطرحها الوضعية.
-   شرح مفردات أو مفاهيم أساسية واردة في النصوص أو الوضعية.
-   استخلاص المضامين الأساسية للنصوص الشرعية المقدمة.
-   استنباط الأحكام الشرعية أو القيم الإسلامية من الأسناد.
-   ربط النصوص بمحاور الدروس (${themes.join('، ')}).
-   تحليل موقف أو رأي يرد في الوضعية.
-   طلب دليل شرعي إضافي من حفظ التلميذ حول قضية معينة.

يجب أن يكون لكل سؤال حقل "text"، "difficultyOrder" (ترتيب تسلسلي)، وحقل "points".
مجموع النقاط لجميع هذه الأسئلة (${numAnalysisQuestions} سؤالاً) يجب أن يكون بالضبط ${totalPointsForAnalysis} نقطة. (مثلاً: 2ن، 2.5ن، 3ن).

صيغة الإخراج JSON الدقيقة:
\`\`\`json
{
  "analysisQuestions": [
    { "text": "سؤال 1...", "difficultyOrder": 1, "points": 2.5, "category": "فهم وتحليل" },
    // ... أكمل حتى ${numAnalysisQuestions} سؤالاً
  ],
  "totalPointsAwardedForAnalysis": ${totalPointsForAnalysis}
}
\`\`\`
تأكد من صحة JSON، وتنوع الأسئلة، ومجموع النقاط الدقيق.`;
            },
            generationConfig: { maxOutputTokens: 3072 },
        },
        {
            name: 'generate_personal_stance_question', // سؤال الموقف الشخصي
            description: 'Generates a question requiring a personal stance with justification.',
            promptGenerator: (context, previousOutputs) => {
                const situation = previousOutputs.generate_contextual_situation_and_texts?.contextualSituation;
                const themes = previousOutputs.generate_contextual_situation_and_texts?.linkedThemes || [];
                const totalPointsForStance = 5; // عادة 4-6 نقاط

                if (!situation) return `ERROR: Contextual situation missing. Output JSON error.`;
                
                return `
السياق: أنت واضع أسئلة امتحان جهوي للغة التربية الإسلامية (${context.academicLevelName} - ${context.trackName}).
اللغة: ${context.lessonLanguage}.
وضعية الانطلاق: "${situation}"
(قد تكون القضية المطروحة متعلقة بـ: ${themes.join(' أو ')})

المهمة: قم بصياغة سؤال واحد يطلب من التلميذ تحديد موقفه الشخصي من قضية أو سلوك مطروح في الوضعية، مع تعليل الموقف بناءً على ما درسه من قيم ومفاهيم إسلامية، وتوظيف الأدلة الشرعية المناسبة.
هذا السؤال يستحق ${totalPointsForStance} نقاط.

صيغة الإخراج JSON الدقيقة:
\`\`\`json
{
  "stanceQuestion": {
    "text": "سؤال الموقف الشخصي هنا (مثال: ما موقفك من السلوك الوارد في الوضعية المتعلق بـ...؟ علل إجابتك مدعما إياها بما يناسب من النصوص الشرعية والقيم الإسلامية التي درستها.)...",
    "points": ${totalPointsForStance},
    "category": "الموقف الشخصي"
  }
}
\`\`\`
تأكد أن السؤال واضح ويتطلب تعليلاً شرعيًا.`;
            },
            generationConfig: { maxOutputTokens: 1024 },
        }
    ],

    finalAggregator: (context, allStepsOutputs) => {
        const prepData = allStepsOutputs.prepare_exam_focus;
        const situationTexts = allStepsOutputs.generate_contextual_situation_and_texts;
        const analysisQuestionsData = allStepsOutputs.generate_analysis_questions;
        const stanceQuestionData = allStepsOutputs.generate_personal_stance_question;

        if (!situationTexts?.contextualSituation || !analysisQuestionsData?.analysisQuestions || !stanceQuestionData?.stanceQuestion) {
            console.error("[ISLAMIC_EDU_EXAM_AGGREGATOR] Missing critical data:", {prepData, situationTexts, analysisQuestionsData, stanceQuestionData});
            throw new Error("خطأ داخلي: بيانات أساسية مفقودة لتجميع امتحان التربية الإسلامية.");
        }

        let problemText = `**وضعية الانطلاق (السياق):**\n${situationTexts.contextualSituation}\n\n`;
        problemText += `**السند الأول: (من ${situationTexts.quranicText.surahName})**\n${situationTexts.quranicText.text}\n\n`;
        if (situationTexts.hadithText?.text) {
            problemText += `**السند الثاني: (حديث نبوي شريف)**\n${situationTexts.hadithText.text}`;
            if (situationTexts.hadithText.source) {
                problemText += ` (${situationTexts.hadithText.source})`;
            }
        }

        const finalSubQuestions = [];
        let currentGlobalOrder = 0;
        let totalExamPoints = 0;

        analysisQuestionsData.analysisQuestions.forEach(sq => {
            currentGlobalOrder++;
            finalSubQuestions.push({
                text: sq.text,
                difficultyOrder: currentGlobalOrder,
                points: sq.points,
                category: sq.category || "فهم وتحليل واستنباط"
            });
        });
        totalExamPoints += analysisQuestionsData.totalPointsAwardedForAnalysis || 0;
        
        finalSubQuestions.push({
            text: stanceQuestionData.stanceQuestion.text,
            difficultyOrder: currentGlobalOrder + 1,
            points: stanceQuestionData.stanceQuestion.points,
            isPersonalStance: true, // علامة خاصة
            category: stanceQuestionData.stanceQuestion.category || "الموقف الشخصي"
        });
        totalExamPoints += stanceQuestionData.stanceQuestion.points || 0;
        
        // Ensure difficultyOrder is sequential if AI didn't manage it perfectly
        finalSubQuestions.sort((a,b) => a.difficultyOrder - b.difficultyOrder);
        finalSubQuestions.forEach((sq, index) => {
            sq.difficultyOrder = index + 1;
        });


        return {
            problemTitle: `امتحان تجريبي في مادة التربية الإسلامية - ${context.academicLevelName} ${context.trackName}`,
            text: problemText.trim(), // وضعية الانطلاق والنصوص هي "النص الرئيسي"
            subQuestions: finalSubQuestions,
            totalPoints: totalExamPoints, // يجب أن يكون 20 نقطة
            lesson: `مراجعة شاملة للمحاور المقررة (${(prepData?.mainLessonThemes || []).slice(0,2).join('، ')}...)`,
        };
    }
};