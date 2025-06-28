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


const practiceQuestionTaskFlavors = [
    { id: "mcq_direct_application", type: "mcq", description: "An MCQ requiring direct application of a formula, rule, or definition commonly seen in Moroccan exams." },
    { id: "mcq_conceptual_distinction", type: "mcq", description: "An MCQ that tests the ability to distinguish between closely related concepts, a frequent exam challenge." },
    { id: "mcq_problem_analysis", type: "mcq", description: "An MCQ based on a short scenario or data set requiring analysis to choose the correct answer, exam-style." },
    { id: "mcq_identify_error", type: "mcq", description: "An MCQ where the student must identify an error in a given statement or calculation, similar to critical thinking exam questions." },
    { id: "mcq_chronological_order_or_steps", type: "mcq", description: "An MCQ asking to order events, steps in a process, or components, as might appear in various subjects."},
    { id: "free_text_define_justify", type: "free_text", description: "A question asking for a definition of a key term and a brief justification or example, common in exams." },
    { id: "free_text_explain_phenomenon", type: "free_text", description: "A question requiring an explanation of a specific phenomenon, principle, or result, mimicking 'explain why/how' exam questions." },
    { id: "free_text_solve_short_problem", type: "free_text", description: "A short problem (e.g., calculation, derivation) requiring a concise textual answer for the result or main steps, exam-style." },
    { id: "free_text_interpret_data_or_text", type: "free_text", description: "A question based on a small piece of data, a quote, or a short text, asking for interpretation or analysis, as found in exams." },
    { id: "free_text_compare_contrast_elements", type: "free_text", description: "A question asking to compare and contrast two specific elements (concepts, theories, characters, events), a common exam task." }
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

const generateDetailedAnswerWithAI = async (questionText, questionType, subjectNameForPrompt, explanationLanguage = "ar", correctAnswerDB = null, userAnswer = null) => {
    const targetLanguageInstruction = explanationLanguage === "en" ? "The detailed explanation MUST BE EXCLUSIVELY IN ENGLISH." : explanationLanguage === "fr" ? "L'explication détaillée doit être EXCLUSIVEMENT EN FRANÇAIS." : "الشرح المفصل يجب أن يكون حصريًا باللغة العربية الفصحى.";
    let promptCoreConcepts = `Provide a step-by-step, clear, and comprehensive explanation for how to arrive at the correct answer for the following question.\nSubject: ${subjectNameForPrompt}\nQuestion Type: ${questionType}\nQuestion: "${questionText}"`;
    if (correctAnswerDB) {
        promptCoreConcepts += `\nThe correct answer is known to be: "${correctAnswerDB}". Explain why this answer is correct, and if it's an MCQ, why other plausible (but incorrect) options might be chosen and why they are wrong.`;
    }
    if (userAnswer) {
        promptCoreConcepts += `\nThe student's provided answer was: "${userAnswer}". If this answer is incorrect or incomplete, gently point out the deficiencies or misconceptions in their answer as part of your explanation. If it's correct, confirm it and still provide the full explanation.`;
    }
    const promptText = `
You are an expert pedagogical assistant. Your task is to provide a detailed, didactic explanation.
${promptCoreConcepts}
GUIDELINES FOR EXPLANATION:
- Structure the explanation logically. Use markdown for formatting (e.g., headings like "### Principaux Concepts", bullet points like "* Point 1", bold text like "**Terme Important**").
- Explain all necessary concepts, formulas, or steps clearly.
- If applicable, provide context or real-world examples.
- Ensure the language is appropriate for the student's level.
- ${targetLanguageInstruction}
STRICT OUTPUT FORMAT:
Respond ONLY with the JSON object, enclosed in \`\`\`json ... \`\`\`, without any text, explanation, or comments before or after.
\`\`\`json
{
  "detailedExplanation": "The full, well-structured detailed explanation text here, using Markdown for clarity and readability."
}
\`\`\`
`;
    let rawResponseBodyTextForErrorLogging = "";
    try {
        rawResponseBodyTextForErrorLogging = await fetchGeminiWithConfig(promptText, {
            temperature: 0.5, topP: 0.95, topK: 40, maxOutputTokens: 3072,
        }, 'gemini-1.5-flash-latest');

        const explanationData = robustJsonExtractor(rawResponseBodyTextForErrorLogging);

        if (typeof explanationData.detailedExplanation !== 'string' || explanationData.detailedExplanation.trim() === '') {
            throw new Error("Detailed explanation JSON from AI is malformed or empty.");
        }
        return explanationData.detailedExplanation;
    } catch (error) {
        console.error(`[AI_DETAILED_FATAL_OUTER] Error generating detailed answer: ${error.message}`, error.stack);
        throw error;
    }
};


module.exports = {
    generateAIQuestion,
    validateFreeTextAnswerWithAI,
    generateHintWithAI,
    generateDetailedAnswerWithAI
};