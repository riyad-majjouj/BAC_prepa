require('dotenv').config();
const { jsonrepair } = require('jsonrepair'); // <-- **الإضافة 1: استيراد مكتبة إصلاح الـ JSON**
const {
    getRandomFromArray,
    normalizeForPath,
    loadCurriculumData,
    loadPromptModule
} = require('./aiGeneralQuestionGeneratorShared');

const { fetchGeminiWithConfig } = require('./promptHelpers');

/**
 * دالة قوية وموثوقة لتحليل الـ JSON من استجابات Gemini.
 * --- **التعديل 2: تم إعادة كتابة هذه الدالة بالكامل لتكون أكثر قوة** ---
 * @param {string} rawResponseText - النص الخام الكامل من استجابة API.
 * @returns {object} - كائن الـ JSON بعد تحليله بنجاح.
 * @throws {Error} - يرمي خطأ إذا فشلت عملية التحليل النهائية.
 */
function robustJsonExtractor(rawResponseText) {
    let jsonString = '';

    // الخطوة 1: استخراج النص الأساسي من كائن استجابة Gemini الكامل
    try {
        const fullResponse = JSON.parse(rawResponseText);
        if (fullResponse.candidates && fullResponse.candidates[0]?.content?.parts?.[0]?.text) {
            jsonString = fullResponse.candidates[0].content.parts[0].text;
        } else {
            jsonString = rawResponseText; // إذا لم يكن بتنسيق Gemini المتوقع، استخدم النص الخام
        }
    } catch (e) {
        // إذا فشل التحليل الأولي، افترض أن النص الخام هو المحتوى نفسه
        jsonString = rawResponseText;
    }

    // الخطوة 2: إزالة علامات Markdown code block (```json ... ```) إن وجدت
    const markdownMatch = jsonString.match(/```(?:json)?\s*([\s\S]*?)\s*```/s);
    if (markdownMatch && markdownMatch[1]) {
        jsonString = markdownMatch[1];
    }

    // الخطوة 3: استخدام "jsonrepair" لإصلاح الأخطاء الشائعة (فواصل زائدة، أقواس مقطوعة، إلخ)
    try {
        // هذه هي الخطوة الحاسمة التي تصلح الـ JSON غير المكتمل أو المعطوب
        const repairedJsonString = jsonrepair(jsonString);
        return JSON.parse(repairedJsonString); // التحليل النهائي بعد الإصلاح
    } catch (finalParseError) {
        console.error("[ROBUST_JSON_EXTRACTOR_FAIL] Could not parse the JSON string even after using jsonrepair.", {
            error: finalParseError.message,
            originalStringSnippet: jsonString.substring(0, 500),
        });
        throw new Error(`Failed to parse final JSON content. Original Snippet: ${jsonString.substring(0, 300)}`);
    }
}


// في ملف aiGeneralQuestionGenerator.js

// --- تعديل مقترح: قائمة نكهات موسعة ومصنفة حسب المهارة المعرفية ---
const practiceQuestionTaskFlavors = [
    // المستوى 1: التذكر والفهم (سهل)
    { id: "recall_definition", type: "mcq", cognitive_level: "Understand", description: " سؤال مباشر يختبر حفظ تعريف أو صيغة أساسية من الدرس." },
    { id: "interpret_concept", type: "free_text", cognitive_level: "Understand", description: " سؤال يطلب من الطالب شرح مفهوم بكلماته الخاصة أو إعطاء مثال عليه." },

    // المستوى 2: التطبيق (متوسط)
    { id: "direct_application", type: "mcq", cognitive_level: "Apply", description: " سؤال يتطلب تطبيق مباشر لصيغة أو نظرية على معطيات جديدة." },
    { id: "solve_standard_problem", type: "free_text", cognitive_level: "Apply", description: " مسألة قصيرة نموذجية تتطلب خطوات حل معروفة من الدرس." },

    // المستوى 3: التحليل (متوسط إلى صعب)
    { id: "analyze_data_set", type: "mcq", cognitive_level: "Analyze", description: " سؤال يعرض مجموعة بيانات صغيرة أو سيناريو ويطلب استنتاج العلاقة أو النمط الصحيح." },
    { id: "identify_error_in_reasoning", type: "mcq", cognitive_level: "Analyze", description: " سؤال يعرض حلاً أو برهاناً خاطئاً ويطلب من الطالب تحديد الخطأ المنطقي." },
    { id: "compare_contrast", type: "free_text", cognitive_level: "Analyze", description: " سؤال يطلب المقارنة بين مفهومين متشابهين لإبراز الفروقات الدقيقة بينهما." },

    // المستوى 4: التقييم والإبداع (صعب)
    { id: "evaluate_statement_validity", type: "free_text", cognitive_level: "Evaluate", description: " سؤال يطرح فرضية أو جملة ويطلب من الطالب تقييم مدى صحتها مع تقديم تبرير رياضي/علمي صارم." },
    { id: "create_counterexample", type: "free_text", cognitive_level: "Create", description: " سؤال يطلب من الطالب بناء مثال مضاد لإثبات أن خاصية معينة ليست صحيحة دائماً." },
    { id: "synthesize_concepts", type: "free_text", cognitive_level: "Create", description: " سؤال يتطلب دمج مفهومين من الدرس (أو من درسين مختلفين) لحل مشكلة غير تقليدية." }
];


const generateAIQuestion = async (academicLevelName, trackName, subjectNameFromDB, difficultyLevelApi, subjectFileNameForPrompts) => {
    console.log(`[AI_GEN_PRACTICE_Q_START] For: Lvl='${academicLevelName}', Trk='${trackName}', SubjDisplay='${subjectNameFromDB}', SubjFile='${subjectFileNameForPrompts}', Diff='${difficultyLevelApi}'`);

    const curriculum = loadCurriculumData(academicLevelName, trackName, subjectNameFromDB);
    let selectedLessonTitre = `Généralités sur ${subjectNameFromDB}`;
    let selectedParagraphTexte = `Aspect spécifique de ${subjectNameFromDB}`;
    let questionLanguage = "fr";
    const normalizedSubjectForLang = normalizeForPath(subjectNameFromDB);
    let defaultLangForSubject = "fr";
    if (['arabic', 'tarbiyaislamia', 'islamic_edu', 'falsafa', 'philosophie', 'histoiregeographie', 'geo_history', 'allugha_alearabia', 'attarbia_al\'islamia', 'attarikh_w_aljghrafia', '1bac_sx-sm_arabic', '1bac_sx-sm_edu_islamic', '1bac_sx-sm_geo_history'].some(sub => normalizedSubjectForLang.includes(sub))) {
        defaultLangForSubject = "ar";
    } else if (['english', 'anglais'].some(sub => normalizedSubjectForLang.includes(sub))) {
        defaultLangForSubject = "en";
    }
    questionLanguage = defaultLangForSubject;
    if (academicLevelName === "1BAC" && curriculum) {
        questionLanguage = curriculum.langueContenu || (Array.isArray(curriculum) && curriculum[0]?.langueContenu) || defaultLangForSubject;
        if (Array.isArray(curriculum) && curriculum.length > 0) {
            const randomLessonFrom1BacCurriculum = getRandomFromArray(curriculum);
            if (randomLessonFrom1BacCurriculum && randomLessonFrom1BacCurriculum.titreLecon) {
                selectedLessonTitre = randomLessonFrom1BacCurriculum.titreLecon;
                if (randomLessonFrom1BacCurriculum.paragraphes && randomLessonFrom1BacCurriculum.paragraphes.length > 0) {
                    const randomParagraphObj = getRandomFromArray(randomLessonFrom1BacCurriculum.paragraphes);
                    selectedParagraphTexte = typeof randomParagraphObj === 'string' ? randomParagraphObj : (randomParagraphObj?.text || randomParagraphObj?.content || randomParagraphObj?.titre || JSON.stringify(randomParagraphObj).substring(0,200));
                } else {
                    selectedParagraphTexte = `Contenu général de la leçon: ${selectedLessonTitre}`;
                }
            } else {
                selectedLessonTitre = `Thème principal de ${subjectNameFromDB} (1BAC)`;
                selectedParagraphTexte = typeof curriculum === 'string' ? curriculum : JSON.stringify(curriculum);
            }
        } else if (typeof curriculum === 'object' && curriculum !== null && curriculum.titreLecon) {
            selectedLessonTitre = curriculum.titreLecon;
            selectedParagraphTexte = curriculum.description || JSON.stringify(curriculum.paragraphes || curriculum);
        } else {
            selectedLessonTitre = `Sujet général pour ${subjectNameFromDB} (1BAC)`;
            selectedParagraphTexte = typeof curriculum === 'string' ? curriculum : JSON.stringify(curriculum);
        }
    } else if (curriculum && Array.isArray(curriculum) && curriculum.length > 0) {
        const randomLesson = getRandomFromArray(curriculum);
        if (randomLesson && randomLesson.titreLecon) {
            selectedLessonTitre = randomLesson.titreLecon;
            questionLanguage = randomLesson.langueContenu || defaultLangForSubject;
            selectedParagraphTexte = randomLesson.paragraphes && randomLesson.paragraphes.length > 0
                ? (getRandomFromArray(randomLesson.paragraphes)?.texte || `Contenu spécifique de la leçon: ${selectedLessonTitre}`)
                : `Contenu général de la leçon: ${selectedLessonTitre}`;
        }
    }
    const isDifficult = difficultyLevelApi === 'Difficile';
    const questionTypeToGenerate = isDifficult && Math.random() < 0.6 ? "free_text" : "mcq";
    let selectedTaskFlavor = getRandomFromArray(practiceQuestionTaskFlavors.filter(f => f.type === questionTypeToGenerate)) 
        || (questionTypeToGenerate === "free_text" ? practiceQuestionTaskFlavors.find(f => f.id === "free_text_explain_phenomenon") : practiceQuestionTaskFlavors.find(f => f.id === "mcq_direct_application"));
    let lessonForJson = selectedLessonTitre.substring(0, 250);
    const promptContext = { academicLevelName, trackName, subjectName: subjectNameFromDB, difficultyLevelApi, selectedLessonTitre, selectedParagraphTexte, questionLanguage, questionTypeToGenerate, selectedTaskFlavor, lessonForJsonOutput: lessonForJson };
    let promptText;
    const customPromptModule = loadPromptModule(academicLevelName, trackName, subjectFileNameForPrompts, 'question');
    if (customPromptModule && typeof customPromptModule.generatePracticeQuestionPrompt === 'function') {
        console.log(`[AI_GEN_PRACTICE_Q_PROMPT] Using custom prompt module for: ${subjectFileNameForPrompts}`);
        try {
            promptText = customPromptModule.generatePracticeQuestionPrompt(promptContext);
            if (!promptText || typeof promptText !== 'string' || promptText.trim() === '') throw new Error("Custom prompt generator returned empty text.");
        } catch (customPromptError) {
            console.error(`[AI_GEN_PRACTICE_Q_ERROR] Custom prompt error: ${customPromptError.message}. Falling back.`);
            promptText = null;
        }
    }
    if (!promptText) {
        console.log(`[AI_GEN_PRACTICE_Q_PROMPT] Using DEFAULT built-in prompt.`);
        const languageInstruction = questionLanguage === "en" ? "MUST BE EXCLUSIVELY IN ENGLISH." : questionLanguage === "ar" ? "يجب أن تكون حصريًا باللغة العربية الفصحى." : "doivent être EXCLUSIVEMENT EN FRANÇAIS.";
        let contextForPrompt = (typeof selectedParagraphTexte === 'string' ? selectedParagraphTexte : JSON.stringify(selectedParagraphTexte)).substring(0, 1500);
        const topicContextBlock = `ACADEMIC_CONTEXT:\n- Level: "${academicLevelName}"\n- Track: "${trackName}"\n- Subject: "${subjectNameFromDB}"\n- Lesson: "${selectedLessonTitre}" \n- Content: "${contextForPrompt}"\n- Language: "${questionLanguage}"`;
        let outputFormatInstructions = `STRICT JSON OUTPUT FORMAT (All text ${languageInstruction}):\nRESPOND ONLY with a single, valid JSON object, enclosed in \`\`\`json ... \`\`\`.`;
        if (questionTypeToGenerate === "mcq") {
            outputFormatInstructions += `\n\`\`\`json\n{ "question": "...", "options": ["...", "...", "...", "..."], "correctAnswer": "...", "lesson": "${lessonForJson}", "type": "mcq" }\n\`\`\``;
        } else {
            // --- **التعديل 3: تحسين توجيه الـ Prompt للإجابات المفتوحة** ---
            outputFormatInstructions += `\n\`\`\`json\n{ "question": "...", "options": [], "correctAnswer": "A concise but complete model answer (3-5 sentences)...", "lesson": "${lessonForJson}", "type": "free_text" }\n\`\`\``;
        }
        promptText = `You are an expert Moroccan curriculum exam question creator. Generate one high-quality question.\n${topicContextBlock}\n${outputFormatInstructions}`;
    }

    console.log(`[AI_GEN_PRACTICE_Q_PROMPT_INFO] Calling Gemini for ${questionTypeToGenerate} in ${questionLanguage}. Topic: "${selectedLessonTitre}"`);

    let rawResponseBodyTextForErrorLogging = "";
    try {
        // --- **التعديل 4 (الأهم): زيادة الحد الأقصى للرموز لمنع انقطاع الاستجابة** ---
        rawResponseBodyTextForErrorLogging = await fetchGeminiWithConfig(promptText, {
            temperature: 0.6, topP: 0.95, topK: 40, maxOutputTokens: 8192,
        }, 'gemini-1.5-flash-latest');
        
        const questionData = robustJsonExtractor(rawResponseBodyTextForErrorLogging);

        if (!questionData || !questionData.question || String(questionData.question).trim() === '') {
            console.error("[AI_VALIDATION_FAIL] The parsed JSON object is missing the 'question' field.", { parsedData: questionData });
            throw new Error(`Generated JSON missing or empty 'question'.`);
        }
        if (!questionData.type || (questionData.type !== "mcq" && questionData.type !== "free_text")) { throw new Error(`Generated JSON invalid 'type'.`); }
        
        if (questionData.type === "mcq") {
            if (!Array.isArray(questionData.options) || questionData.options.length < 2 || questionData.options.length > 5) { throw new Error("MCQ 'options' not array with 2-5 elements."); }
            if (!questionData.options.every(opt => typeof opt === 'string' && String(opt).trim() !== '')) { throw new Error("MCQ 'options' contain non-string/empty."); }
            if (typeof questionData.correctAnswer !== 'string' || String(questionData.correctAnswer).trim() === '') { throw new Error("MCQ 'correctAnswer' not non-empty string.");}
        } else {
            questionData.options = [];
            if (questionData.correctAnswer === undefined) { questionData.correctAnswer = ""; }
        }
        
        questionData.lesson = (typeof questionData.lesson === 'string' && String(questionData.lesson).trim() !== '') ? String(questionData.lesson).trim() : lessonForJson;

        console.log(`[AI_GEN_PRACTICE_Q_SUCCESS] Data generated and validated (${questionData.type}): "${String(questionData.question).substring(0, 50)}..."`);
        return {
            question: String(questionData.question).trim(),
            options: questionData.options ? questionData.options.map(opt => String(opt).trim()) : [],
            correctAnswer: String(questionData.correctAnswer).trim(),
            lesson: questionData.lesson,
            type: questionData.type,
        };

    } catch (error) {
        console.error(`[AI_GEN_PRACTICE_Q_FATAL_OUTER] Critical error during AI question generation: ${error.message}. Raw AI Response: ${rawResponseBodyTextForErrorLogging.substring(0,500)}`);
        console.error(error.stack);
        throw new Error(`AI Practice Question Generation Failed: ${error.message}`);
    }
};

// ... (بقية الدوال في الملف تبقى كما هي) ...

const validateFreeTextAnswerWithAI = async (originalQuestionText, userAnswerText, subjectNameForPrompt, questionLanguage = "fr") => {
    const languageInstruction = questionLanguage === "en" ? "The feedback MUST BE EXCLUSIVELY IN ENGLISH." : questionLanguage === "ar" ? "التقييم يجب أن يكون حصريًا باللغة العربية الفصحى." : "Le feedback doit être EXCLUSIVEMENT EN FRANÇAIS.";
    const promptText = `
You are an expert pedagogical assistant for ${subjectNameForPrompt}.
TASK: Evaluate the user's answer.
QUESTION: "${originalQuestionText}"
USER'S ANSWER: "${userAnswerText}"
STRICT OUTPUT FORMAT:
1. ${languageInstruction}
2. Respond ONLY with the JSON object, enclosed in \`\`\`json ... \`\`\`.
\`\`\`json
{
  "isValid": boolean,
  "feedback": "A very brief, constructive explanation (max 2-3 sentences)."
}
\`\`\`
`;
    let rawResponseBodyTextForErrorLogging = "";
    try {
        rawResponseBodyTextForErrorLogging = await fetchGeminiWithConfig(promptText, {
            temperature: 0.2, topP: 0.9, topK: 30, maxOutputTokens: 512,
        }, 'gemini-1.5-flash-latest');
        
        const validationData = robustJsonExtractor(rawResponseBodyTextForErrorLogging);

        if (typeof validationData.isValid !== 'boolean' || typeof validationData.feedback !== 'string') {
            throw new Error("Validation JSON from AI is malformed.");
        }
        return validationData;
    } catch (error) {
        console.error(`[AI_VALIDATE_FATAL_OUTER] Critical error during answer validation: ${error.message}`, error.stack);
        throw error;
    }
};

const generateHintWithAI = async (questionText, subjectNameForPrompt, hintLanguage = "ar") => {
    const targetLanguageInstruction = hintLanguage === "en" ? "The hint MUST BE EXCLUSIVELY IN ENGLISH." : hintLanguage === "fr" ? "L'indice doit être EXCLUSIVEMENT EN FRANÇAIS." : "التلميح يجب أن يكون حصريًا باللغة العربية الفصحى المبسطة.";
    const promptText = `
You are an expert pedagogical assistant for the subject: ${subjectNameForPrompt}.
TASK: Generate a concise, useful, and non-revealing hint for the following question.
QUESTION: "${questionText}"
GUIDELINES:
- Focus on one key concept, a relevant formula, or a general approach.
- DO NOT reveal the answer or any part of it directly.
- Keep it very short (ideally one sentence, max two).
- ${targetLanguageInstruction}
STRICT OUTPUT FORMAT:
Respond ONLY with the JSON object, enclosed in \`\`\`json ... \`\`\`, without any text, explanation, or comments before or after.
\`\`\`json
{
  "hint": "The hint text here..."
}
\`\`\`
`;
    let rawResponseBodyTextForErrorLogging = "";
    try {
        rawResponseBodyTextForErrorLogging = await fetchGeminiWithConfig(promptText, {
            temperature: 0.7, topP: 0.9, topK: 35, maxOutputTokens: 256,
        }, 'gemini-1.5-flash-latest');
        
        const hintData = robustJsonExtractor(rawResponseBodyTextForErrorLogging);

        if (typeof hintData.hint !== 'string' || hintData.hint.trim() === '') {
             throw new Error("Hint JSON from AI is malformed or empty.");
        }
        return hintData.hint;
    } catch (error) {
        console.error(`[AI_HINT_FATAL_OUTER] Error generating hint: ${error.message}`, error.stack);
        throw error;
    }
};

// ... (افترض وجود دوال مثل fetchGeminiWithConfig و robustJsonExtractor)

/**
 * Generates a detailed, pedagogical explanation for a given question using an AI model.
 * The explanation will be structured with Markdown and will use LaTeX for mathematical expressions.
// ... افترض وجود دوال مثل fetchGeminiWithConfig و robustJsonExtractor

/**
 * Generates a detailed, pedagogical explanation for a given question using an AI model.
 * This version includes strict instructions for JSON-safe LaTeX escaping.
 * 
 * @param {string} questionText The text of the question.
 * @param {string} questionType The type of the question (e.g., 'mcq', 'free_text').
 * @param {string} subjectNameForPrompt The subject name to provide context to the AI.
 * @param {string} [explanationLanguage="ar"] The desired language for the explanation ('ar', 'fr', 'en').
 * @param {string|null} correctAnswerDB The known correct answer to the question.
 * @returns {Promise<string>} A promise that resolves to the detailed explanation text in Markdown/LaTeX format.
 */
const generateDetailedAnswerWithAI = async (questionText, questionType, subjectNameForPrompt, explanationLanguage = "ar", correctAnswerDB = null) => {
    const targetLanguageInstruction = explanationLanguage === "en" 
        ? "The detailed explanation MUST BE EXCLUSIVELY IN ENGLISH." 
        : explanationLanguage === "fr" 
        ? "L'explication détaillée doit être EXCLUSIVEMENT EN FRANÇAIS." 
        : "الشرح المفصل يجب أن يكون حصريًا باللغة العربية الفصحى.";
    
    let promptCoreConcepts = `Provide a step-by-step, clear, and comprehensive explanation for how to arrive at the correct answer for the following question.\nSubject: ${subjectNameForPrompt}\nQuestion Type: ${questionType}\nQuestion: "${questionText}"`;
    
    if (correctAnswerDB) {
        promptCoreConcepts += `\nThe correct answer is known to be: "${correctAnswerDB}". Your main task is to explain in detail why this answer is correct. If it's a multiple-choice question, you should also briefly explain why other common incorrect options are wrong.`;
    }

    // --- هذا هو الجزء الأهم الذي تم تحديثه بناءً على مثالك الناجح ---
    const promptText = `
You are an expert pedagogical assistant, a specialist in mathematics and sciences. Your task is to provide a detailed, didactic explanation.
${promptCoreConcepts}

---
**GUIDELINES FOR EXPLANATION (NON-NEGOTIABLE):**
---

**1. LaTeX Quality:**
- For ALL mathematical formulas, symbols, and variables, you MUST use correct LaTeX notation.
- Use $...$ for inline math (e.g., "The variable is $x$.").
- Use $$...$$ for display math on its own line.

**2. Markdown Structure:**
- Structure the explanation logically. Use markdown for formatting (e.g., headings like "## المفاهيم الأساسية", bullet points like "* النقطة الأولى", bold text like "**مصطلح مهم**").

**3. LANGUAGE:**
- ${targetLanguageInstruction}

**4. CRUCIAL TECHNICAL REQUIREMENT: JSON-SAFE LaTeX ESCAPING**
- This is the most important rule. Inside the final JSON string, every single backslash \`\\\` used for LaTeX commands **MUST BE ESCAPED** with a second backslash \`\\\\\`.
- This is a non-negotiable technical constraint for the output to be parsed correctly.
- **CORRECT (inside the JSON string):** \`"L'intégrale de \\\\frac{1}{x} est \\\\ln|x| + C."\`
- **INCORRECT (inside the JSON string):** \`"L'intégrale de \\frac{1}{x} est \\ln|x| + C."\`
- **CORRECT (inside the JSON string):** \`"La solution est $$x = \\\\frac{-b \\\\pm \\\\sqrt{b^2-4ac}}{2a}$$"\`
- **INCORRECT (inside the JSON string):** \`"La solution est $$x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}$$"\`

---
**STRICT OUTPUT FORMAT**
---
Respond ONLY with the JSON object, enclosed in \`\`\`json ... \`\`\`, without any text before or after. The following example shows the required structure and **demonstrates the correct backslash escaping**. You must follow this formatting precisely.
\`\`\`json
{
  "detailedExplanation": "## شرح التكامل بالتعويض\\n\\nلحل التكامل $$I = \\\\int_1^e \\\\frac{\\\\ln(x)}{x(1+\\\\ln^2(x))} dx$$\\n\\n**الخطوة الأولى: التعويض الأول**\\nنضع $u = \\\\ln(x)$. من هنا، نجد أن $du = \\\\frac{1}{x} dx$.\\nعندما $x=1$, $u = \\\\ln(1) = 0$.\\nعندما $x=e$, $u = \\\\ln(e) = 1$.\\n\\nيصبح التكامل:\\n$$I = \\\\int_0^1 \\\\frac{u}{1+u^2} du$$"
}
\`\`\`
`;
    // --------------------------------------------------------------------------

    let rawResponseBodyTextForErrorLogging = "";
    try {
        rawResponseBodyTextForErrorLogging = await fetchGeminiWithConfig(promptText, {
            temperature: 0.4,
            topP: 0.95, 
            topK: 40, 
            maxOutputTokens: 4096,
        }, 'gemini-1.5-flash-latest');

        const explanationData = robustJsonExtractor(rawResponseBodyTextForErrorLogging);

        if (typeof explanationData.detailedExplanation !== 'string' || explanationData.detailedExplanation.trim() === '') {
            throw new Error("Detailed explanation JSON from AI is malformed or empty.");
        }
        return explanationData.detailedExplanation;
    } catch (error) {
        console.error(`[AI_DETAILED_FATAL_OUTER] Error generating detailed answer: ${error.message}`, error.stack);
        if (rawResponseBodyTextForErrorLogging) {
            console.error("[AI_RAW_RESPONSE_ON_ERROR]:", rawResponseBodyTextForErrorLogging);
        }
        throw new Error(`Failed to generate detailed explanation from AI. Root cause: ${error.message}`);
    }
};

module.exports = {
    generateAIQuestion,
    validateFreeTextAnswerWithAI,
    generateHintWithAI,
    generateDetailedAnswerWithAI
};