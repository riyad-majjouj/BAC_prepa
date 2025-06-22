// back-end/utils/aiGeneralQuestionGenerator.js
require('dotenv').config();
const {
    GEMINI_API_KEY,
    setGeminiApiUrl,
    getRandomFromArray,
    normalizeForPath,
    loadCurriculumData,
    extractCleanJsonString
} = require('./aiGeneralQuestionGeneratorShared'); // تأكد من المسار الصحيح

// تم تحديث هذه النكهات لتكون أكثر تركيزًا على أسلوب الامتحانات
const practiceQuestionTaskFlavors = [
    // MCQ Flavors - mimicking exam question styles
    { id: "mcq_direct_application", type: "mcq", description: "An MCQ requiring direct application of a formula, rule, or definition commonly seen in Moroccan exams." },
    { id: "mcq_conceptual_distinction", type: "mcq", description: "An MCQ that tests the ability to distinguish between closely related concepts, a frequent exam challenge." },
    { id: "mcq_problem_analysis", type: "mcq", description: "An MCQ based on a short scenario or data set requiring analysis to choose the correct answer, exam-style." },
    { id: "mcq_identify_error", type: "mcq", description: "An MCQ where the student must identify an error in a given statement or calculation, similar to critical thinking exam questions." },
    { id: "mcq_chronological_order_or_steps", type: "mcq", description: "An MCQ asking to order events, steps in a process, or components, as might appear in various subjects."},

    // Free Text Flavors - mimicking exam question styles
    { id: "free_text_define_justify", type: "free_text", description: "A question asking for a definition of a key term and a brief justification or example, common in exams." },
    { id: "free_text_explain_phenomenon", type: "free_text", description: "A question requiring an explanation of a specific phenomenon, principle, or result, mimicking 'explain why/how' exam questions." },
    { id: "free_text_solve_short_problem", type: "free_text", description: "A short problem (e.g., calculation, derivation) requiring a concise textual answer for the result or main steps, exam-style." },
    { id: "free_text_interpret_data_or_text", type: "free_text", description: "A question based on a small piece of data, a quote, or a short text, asking for interpretation or analysis, as found in exams." },
    { id: "free_text_compare_contrast_elements", type: "free_text", description: "A question asking to compare and contrast two specific elements (concepts, theories, characters, events), a common exam task." }
];


const generateAIQuestion = async (academicLevelName, trackName, subjectNameFromDB, difficultyLevelApi) => {
    const currentGeminiApiUrl = setGeminiApiUrl('gemini-1.5-flash-latest'); // أو النموذج المفضل لديك

    console.log(`[AI_GEN_PRACTICE_Q_START] For: Lvl='${academicLevelName}', Trk='${trackName}', Subj='${subjectNameFromDB}', Diff='${difficultyLevelApi}'`);
    if (!GEMINI_API_KEY || !currentGeminiApiUrl) {
        throw new Error("AI Service configuration error: API Key or URL is missing.");
    }

    const curriculum = loadCurriculumData(academicLevelName, trackName, subjectNameFromDB);
    let selectedLessonTitre = `Généralités sur ${subjectNameFromDB}`;
    let selectedParagraphTexte = `Aspect spécifique de ${subjectNameFromDB}`;
    let questionLanguage = "fr"; // Default

    const normalizedSubjectForLang = normalizeForPath(subjectNameFromDB);
    let defaultLangForSubject = "fr";
    if (['arabic', 'tarbiyaislamia', 'islamic_edu', 'falsafa', 'philosophie', 'histoiregeographie', 'geo_history', 'allugha_alearabia', 'attarbia_al\'islamia', 'attarikh_w_aljghrafia'].some(sub => normalizedSubjectForLang.includes(sub))) {
        defaultLangForSubject = "ar";
    } else if (['english', 'anglais'].some(sub => normalizedSubjectForLang.includes(sub))) {
        defaultLangForSubject = "en";
    }
    questionLanguage = defaultLangForSubject;

    // --- START MODIFIED LOGIC FOR 1BAC LESSON/TOPIC SELECTION ---
    if (academicLevelName === "1BAC" && curriculum) {
        console.log(`[AI_GEN_PRACTICE_Q_TOPIC_1BAC] Curriculum found for 1BAC. Subject: ${subjectNameFromDB}`);
        questionLanguage = curriculum.langueContenu || (Array.isArray(curriculum) && curriculum[0]?.langueContenu) || defaultLangForSubject;

        if (Array.isArray(curriculum) && curriculum.length > 0) {
            // إذا كان curriculum مصفوفة من الدروس (كما هو متوقع الآن لملفات 1BAC)
            const randomLessonFrom1BacCurriculum = getRandomFromArray(curriculum);
            if (randomLessonFrom1BacCurriculum && randomLessonFrom1BacCurriculum.titreLecon) {
                selectedLessonTitre = randomLessonFrom1BacCurriculum.titreLecon; // اسم الدرس الفعلي
                if (randomLessonFrom1BacCurriculum.paragraphes && randomLessonFrom1BacCurriculum.paragraphes.length > 0) {
                    const randomParagraphObj = getRandomFromArray(randomLessonFrom1BacCurriculum.paragraphes);
                    // Paragraphs in 1BAC might be objects with 'type' and 'text'/'content'
                    if (typeof randomParagraphObj === 'string') {
                        selectedParagraphTexte = randomParagraphObj;
                    } else if (typeof randomParagraphObj === 'object' && randomParagraphObj !== null) {
                        selectedParagraphTexte = randomParagraphObj.text || randomParagraphObj.content || randomParagraphObj.titre || JSON.stringify(randomParagraphObj).substring(0,200);
                    } else {
                        selectedParagraphTexte = `Contenu spécifique de la leçon: ${selectedLessonTitre}`;
                    }
                } else {
                    selectedParagraphTexte = `Contenu général de la leçon: ${selectedLessonTitre}`;
                }
            } else {
                // Fallback if array structure is not as expected
                selectedLessonTitre = `Thème principal de ${subjectNameFromDB} (1BAC)`;
                selectedParagraphTexte = typeof curriculum === 'string' ? curriculum : JSON.stringify(curriculum);
            }
        } else if (typeof curriculum === 'object' && curriculum !== null && curriculum.titreLecon) {
            // إذا كان curriculum كائن واحد يمثل درسًا (أقل احتمالاً الآن لكنه احتياطي)
            selectedLessonTitre = curriculum.titreLecon;
            selectedParagraphTexte = curriculum.description || JSON.stringify(curriculum.paragraphes || curriculum);
        } else {
            // Fallback if curriculum is not an array or expected object
            selectedLessonTitre = `Sujet général pour ${subjectNameFromDB} (1BAC)`;
            selectedParagraphTexte = typeof curriculum === 'string' ? curriculum : JSON.stringify(curriculum);
        }
    } else if (curriculum && Array.isArray(curriculum) && curriculum.length > 0) {
        // This is the existing logic for non-1BAC or when 1BAC curriculum is an array (which it should be)
        const randomLesson = getRandomFromArray(curriculum);
        if (randomLesson && randomLesson.titreLecon) {
            selectedLessonTitre = randomLesson.titreLecon;
            questionLanguage = randomLesson.langueContenu || defaultLangForSubject;
            if (randomLesson.paragraphes && randomLesson.paragraphes.length > 0) {
                const randomParagraph = getRandomFromArray(randomLesson.paragraphes);
                selectedParagraphTexte = typeof randomParagraph === 'string' ? randomParagraph : (randomParagraph?.texte || `Contenu spécifique de la leçon: ${selectedLessonTitre}`);
            } else { selectedParagraphTexte = `Contenu général de la leçon: ${selectedLessonTitre}`; }
        }
        console.log(`[AI_GEN_PRACTICE_Q_TOPIC_NON_1BAC_OR_FALLBACK] Processed curriculum as array.`);
    }
    // --- END MODIFIED LOGIC FOR 1BAC LESSON/TOPIC SELECTION ---

    console.log(`[AI_GEN_PRACTICE_Q_TOPIC] Final Selected Topic: "${selectedLessonTitre} - ${typeof selectedParagraphTexte === 'string' ? selectedParagraphTexte.substring(0,100) : 'Object/Array Paragraph'}...", Final Lang: ${questionLanguage}`);

    const isDifficult = difficultyLevelApi === 'Difficile';
    const questionTypeToGenerate = isDifficult && Math.random() < 0.6 ? "free_text" : "mcq";

    let selectedTaskFlavor = getRandomFromArray(
        practiceQuestionTaskFlavors.filter(f => f.type === questionTypeToGenerate)
    );
    if (!selectedTaskFlavor) {
        selectedTaskFlavor = questionTypeToGenerate === "free_text"
            ? practiceQuestionTaskFlavors.find(f => f.id === "free_text_explain_phenomenon")
            : practiceQuestionTaskFlavors.find(f => f.id === "mcq_direct_application");
    }

    // --- MODIFIED lessonForJson construction ---
    // الآن selectedLessonTitre يجب أن يكون اسم الدرس الفعلي لـ 1BAC أيضًا
    let lessonForJson = selectedLessonTitre; // ابدأ باسم الدرس
    // لا تقم بإلحاق selectedParagraphTexte إذا كان selectedLessonTitre هو اسم درس حقيقي
    // selectedParagraphTexte يستخدم فقط كـ "Detailed Content/Sub-topic for Question Generation" في الـ prompt
    lessonForJson = lessonForJson.substring(0, 250); // تأكد من أنه ليس طويلاً جدًا

    const languageInstruction = questionLanguage === "en" ? "The question and ALL its parts (text, options, correctAnswer) MUST BE EXCLUSIVELY IN ENGLISH."
                              : questionLanguage === "ar" ? "السؤال وجميع أجزائه (النص، الخيارات، الإجابة الصحيحة) يجب أن تكون حصريًا باللغة العربية الفصحى السليمة والمناسبة للسياق الأكاديمي."
                              : "La question et TOUTES ses parties (texte, options, correctAnswer) doivent être EXCLUSIVEMENT EN FRANÇAIS, avec un vocabulaire académique précis.";

    const promptExpertise = `an expert in crafting high-school level exam questions for the Moroccan curriculum, specifically for "${academicLevelName} - ${trackName}".`;

    let examStyleGuidance = `
The generated question MUST strictly emulate the style, structure, and cognitive demands of questions typically found in Moroccan national or regional exams (Contrôles Continus, Examen National/Régional) for the subject "${subjectNameFromDB}" at the "${academicLevelName} - ${trackName}" level.
Focus on questions that assess:
- Clear understanding of key concepts.
- Ability to apply knowledge to new scenarios.
- Critical thinking and problem-solving skills.
- Precision in definitions and explanations.
The question should be challenging yet fair for a student at this level preparing for their official exams.
The question should be based on the provided "Lesson" and "Specific Sub-topic".
The language of the question and all its components must be strictly ${questionLanguage}.
`;

    if (difficultyLevelApi === "Difficile") {
        examStyleGuidance += "This question should be particularly challenging, potentially requiring synthesis of multiple concepts, deeper analysis, or solving a more complex problem. It should mirror the more difficult questions in official exams.";
    } else if (difficultyLevelApi === "Moyen") {
        examStyleGuidance += "This question should require some analytical thought or application of knowledge, going beyond simple recall. It should be of average exam difficulty.";
    } else { // Facile
        examStyleGuidance += "This question should test fundamental understanding and direct recall of key concepts from the lesson, similar to straightforward exam questions.";
    }

    let contextForPrompt = typeof selectedParagraphTexte === 'string' ? selectedParagraphTexte : JSON.stringify(selectedParagraphTexte);
    const MAX_CONTEXT_LENGTH = 1500;
    if (contextForPrompt.length > MAX_CONTEXT_LENGTH) {
        contextForPrompt = contextForPrompt.substring(0, MAX_CONTEXT_LENGTH) + "... (content truncated for brevity in prompt)";
    }

    const topicContextBlock = `
ACADEMIC_CONTEXT:
- Academic Level: "${academicLevelName}"
- Track: "${trackName}"
- Subject: "${subjectNameFromDB}"
- Specific Lesson Focus: "${selectedLessonTitre}" 
- Detailed Content/Sub-topic for Question Generation: "${contextForPrompt}"
- Question Language: "${questionLanguage}"`;

    let outputFormatInstructions;
    if (selectedTaskFlavor.type === "mcq") {
        outputFormatInstructions = `
STRICT JSON OUTPUT FORMAT (MCQ):
1.  ${languageInstruction}
2.  Task objective: "${selectedTaskFlavor.description}". Generate a question reflecting this objective.
3.  Format: MCQ with EXACTLY 4 distinct, plausible options. Options should be complete and grammatically correct.
4.  Correct Answer: There must be only ONE unambiguously correct answer. The "correctAnswer" field in JSON MUST be an exact textual match of one of the provided options.
5.  Distractors: All options, especially incorrect ones (distractors), must be relevant to the topic and plausible to a student at this level. Avoid trivial or obviously wrong options.
6.  Question Text: Must be clear, precise, and directly test the learning objective from the task flavor and the provided lesson context.
7.  "lesson" field: Populate with a concise representation of "${lessonForJson}".
8.  "type" field: Must be "mcq".
RESPOND ONLY with a single, valid JSON object, enclosed in \`\`\`json ... \`\`\`. No preambles or apologies.
\`\`\`json
{
  "question": "The exam-style MCQ question text here...",
  "options": ["Option A text", "Option B text", "Option C text", "Option D text"],
  "correctAnswer": "The exact text of the correct option",
  "lesson": "${lessonForJson}",
  "type": "mcq"
}
\`\`\`
`;
    } else { // free_text
        outputFormatInstructions = `
STRICT JSON OUTPUT FORMAT (Free Text Question):
1.  ${languageInstruction}
2.  Task objective: "${selectedTaskFlavor.description}". Generate a question reflecting this objective.
3.  Question Nature: The question should require a textual answer (e.g., short calculation with steps, derivation, definition with justification, explanation, analysis).
4.  "options" field: Must be an empty array [].
5.  "correctAnswer" field: Provide a concise, accurate model answer or key points/steps expected. For calculations/derivations, include the final result and essential intermediate steps or formulas. This model answer is crucial for later AI-based validation.
6.  Question Text: Must be clear, precise, and suitable for the specified academic level and difficulty, mirroring exam-style free-text questions.
7.  "lesson" field: Populate with a concise representation of "${lessonForJson}".
8.  "type" field: Must be "free_text".
RESPOND ONLY with a single, valid JSON object, enclosed in \`\`\`json ... \`\`\`. No preambles or apologies.
\`\`\`json
{
  "question": "The exam-style open-ended question text here...",
  "options": [],
  "correctAnswer": "A model answer, key points, final calculation result, or main derivation steps, as expected in an exam marking scheme.",
  "lesson": "${lessonForJson}",
  "type": "free_text"
}
\`\`\`
`;
    }

    const promptText = `
You are ${promptExpertise}.
Your mission is to generate a single, high-quality question that is directly usable for student practice and assessment.

OVERALL_EXAM_STYLE_GUIDANCE:
${examStyleGuidance}

QUESTION_GENERATION_TASK:
- Task Flavor ID: ${selectedTaskFlavor.id} (Target output type: ${selectedTaskFlavor.type})

${topicContextBlock}

${outputFormatInstructions}

FINAL_INSTRUCTION: Review your generated JSON carefully to ensure it is valid, adheres to ALL instructions, and all text is in the specified language: ${questionLanguage}. The question must be directly derivable from the provided "Detailed Content/Sub-topic for Question Generation".
`;

    console.log(`[AI_GEN_PRACTICE_Q_PROMPT_INFO] Calling Gemini for ${questionTypeToGenerate} in ${questionLanguage}. Prompt length: ${promptText.length}. Topic: "${selectedLessonTitre}"`);

    let rawResponseBodyTextForErrorLogging = "";
    try {
        const fetchOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: promptText }] }],
                generationConfig: { temperature: 0.6, topP: 0.95, topK: 40, maxOutputTokens: 2048, responseMimeType: "application/json" }, // أضفنا responseMimeType
                safetySettings: [
                    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                    { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                    { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                    { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                ]
            }),
        };
        const response = await fetch(currentGeminiApiUrl, fetchOptions);
        rawResponseBodyTextForErrorLogging = await response.text();

        if (!response.ok) {
            console.error(`[AI_GEN_PRACTICE_Q_ERROR] Gemini API FAILED. Status: ${response.status}. Body: ${rawResponseBodyTextForErrorLogging.substring(0,500)}`);
            throw new Error(`Gemini API request failed (Status: ${response.status}). Response: ${rawResponseBodyTextForErrorLogging.substring(0,100)}`);
        }

        // --- START IMPROVED JSON EXTRACTION FOR GENERATEAIQUESTION ---
        let questionData;
        try {
            console.log("[AI_GEN_PRACTICE_Q_DEBUG] Raw response body:", rawResponseBodyTextForErrorLogging);
            const parsedJsonResponse = JSON.parse(rawResponseBodyTextForErrorLogging);
            if (parsedJsonResponse.question && parsedJsonResponse.type) { // تحقق من وجود حقول أساسية
                questionData = parsedJsonResponse;
            } else if (parsedJsonResponse.candidates && parsedJsonResponse.candidates[0]?.content?.parts?.[0]?.text) {
                let aiTextContent = parsedJsonResponse.candidates[0].content.parts[0].text;
                console.log("[AI_GEN_PRACTICE_Q_DEBUG] Text content from Gemini structure:", aiTextContent);
                const markdownMatch = aiTextContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/s);
                if (markdownMatch && markdownMatch[1]) {
                    aiTextContent = markdownMatch[1].trim();
                }
                questionData = JSON.parse(aiTextContent);
            } else if (parsedJsonResponse.promptFeedback?.blockReason) {
                 throw new Error(`AI prompt blocked. Reason: ${parsedJsonResponse.promptFeedback.blockReason}`);
            } else {
                 throw new Error("Unexpected API response structure after initial parse for question generation.");
            }
        } catch (initialParseError) {
            console.warn(`[AI_GEN_PRACTICE_Q_WARN] Initial JSON.parse failed ('${initialParseError.message}'). Attempting extractCleanJsonString from raw text: ${rawResponseBodyTextForErrorLogging.substring(0,100)}...`);
            try {
                const cleanJsonString = extractCleanJsonString(rawResponseBodyTextForErrorLogging);
                questionData = JSON.parse(cleanJsonString);
                console.log("[AI_GEN_PRACTICE_Q_DEBUG] Successfully parsed using extractCleanJsonString fallback.");
            } catch (fallbackParseError) {
                console.error(`[AI_GEN_PRACTICE_Q_JSON_EXTRACT_FAIL_FINAL] Failed to extract or parse JSON. Error: ${fallbackParseError.message}. Raw response: ${rawResponseBodyTextForErrorLogging.substring(0,500)}`);
                throw new Error(`Failed to parse AI response as JSON: ${fallbackParseError.message}`);
            }
        }
        // --- END IMPROVED JSON EXTRACTION ---


        if (!questionData.question || String(questionData.question).trim() === '') { throw new Error(`Generated JSON missing or empty 'question'.`); }
        if (!questionData.type || (questionData.type !== "mcq" && questionData.type !== "free_text")) { throw new Error(`Generated JSON invalid 'type'.`); }
        if (questionData.type === "mcq") {
            if (!Array.isArray(questionData.options) || questionData.options.length < 2 || questionData.options.length > 5) {
                throw new Error("MCQ 'options' not array with 2-5 elements.");
            }
            if (!questionData.options.every(opt => typeof opt === 'string' && String(opt).trim() !== '')) { throw new Error("MCQ 'options' contain non-string/empty."); }
            if (typeof questionData.correctAnswer !== 'string' || String(questionData.correctAnswer).trim() === '') { throw new Error("MCQ 'correctAnswer' not non-empty string.");}
            const caLower = String(questionData.correctAnswer).trim().toLowerCase();
            const optsLower = questionData.options.map(opt => String(opt).trim().toLowerCase());
            if (!optsLower.includes(caLower)) {
                console.warn(`[AI_VALIDATION_WARN_MCQ_ANSWER_MISMATCH] Correct answer "${questionData.correctAnswer}" not exactly in options. AI's options: [${questionData.options.join(' | ')}]. Using AI's answer.`);
            }
        } else {
            questionData.options = [];
            if (questionData.correctAnswer === undefined || questionData.correctAnswer === null || typeof questionData.correctAnswer !== 'string') {
                console.warn(`[AI_VALIDATION_WARN_FREETEXT_NO_ANSWER] Free text question generated without a 'correctAnswer'. Setting to empty string.`);
                questionData.correctAnswer = "";
            }
        }
        if (typeof questionData.lesson !== 'string' || String(questionData.lesson).trim() === '') {
            console.warn(`[AI_VALIDATION_WARN_LESSON_FIELD] 'lesson' field missing or empty in AI response. Using fallback: "${lessonForJson}"`);
            questionData.lesson = lessonForJson; // استخدم lessonForJson التي تم بناؤها بشكل صحيح
        } else {
            // إذا أعاد AI قيمة لـ lesson، استخدمها ولكن تأكد أنها ليست JSON
            try {
                JSON.parse(questionData.lesson); // محاولة تحليلها كـ JSON
                // إذا نجح التحليل، فهذا يعني أنها لا تزال JSON، استخدم lessonForJson بدلاً منها
                console.warn(`[AI_VALIDATION_WARN_LESSON_IS_JSON] AI returned a JSON string for 'lesson'. Overriding with generated title: "${lessonForJson}"`);
                questionData.lesson = lessonForJson;
            } catch (e) {
                // إذا فشل التحليل، فهذا جيد، إنها سلسلة نصية عادية، يمكننا استخدامها
                questionData.lesson = String(questionData.lesson).trim();
            }
        }


        console.log(`[AI_GEN_PRACTICE_Q_SUCCESS] Data generated and validated (${questionData.type}): "${String(questionData.question).substring(0, 50)}..." Lesson: "${questionData.lesson}"`);
        return {
            question: String(questionData.question).trim(),
            options: questionData.options ? questionData.options.map(opt => String(opt).trim()) : [],
            correctAnswer: String(questionData.correctAnswer).trim(),
            lesson: questionData.lesson, // استخدام قيمة lesson التي تم التحقق منها
            type: questionData.type,
        };

    } catch (error) {
        console.error(`[AI_GEN_PRACTICE_Q_FATAL_OUTER] Critical error during AI question generation: ${error.message}. Raw AI Response: ${rawResponseBodyTextForErrorLogging.substring(0,500)}`, error.stack);
        throw new Error(`AI Practice Question Generation Failed: ${error.message}`);
    }
};

// الدوال الأخرى (validateFreeTextAnswerWithAI, generateHintWithAI, generateDetailedAnswerWithAI) تبقى كما هي.

const validateFreeTextAnswerWithAI = async (originalQuestionText, userAnswerText, subjectNameForPrompt, questionLanguage = "fr") => {
    const currentGeminiApiUrl = setGeminiApiUrl('gemini-1.5-flash-latest');
    console.log(`[AI_VALIDATE_START] Validating: Q="${originalQuestionText.substring(0,50)}...", A="${userAnswerText.substring(0,50)}...", Subj='${subjectNameForPrompt}', Lang='${questionLanguage}' using URL: ${currentGeminiApiUrl}`);
    if (!GEMINI_API_KEY || !currentGeminiApiUrl) {
        console.error("[AI_VALIDATE_FATAL] GEMINI_API_KEY is missing or geminiApiUrl not set.");
        throw new Error("AI Service configuration error: API Key or URL is missing.");
    }
    const languageInstruction = questionLanguage === "en" ? "The feedback MUST BE EXCLUSIVELY IN ENGLISH." : questionLanguage === "ar" ? "التقييم يجب أن يكون حصريًا باللغة العربية الفصحى." : "Le feedback doit être EXCLUSIVEMENT EN FRANÇAIS.";
    const promptText = `
You are an expert pedagogical assistant, specialized in evaluating student answers for the subject: ${subjectNameForPrompt}.
TASK: Evaluate the user's answer to the given question. Your evaluation should be strict but fair.
QUESTION: "${originalQuestionText}"
USER'S ANSWER: "${userAnswerText}"
EVALUATION CRITERIA:
- Focus on conceptual correctness, accuracy, and the presence of the main idea(s) expected for this question.
- If the question implies a single, precise answer (e.g., a specific date, term, or calculation result), correctness is paramount.
- If the question is more open, assess the relevance and justification of the user's answer.
- Be very concise in your feedback. If correct, a short confirmation. If incorrect, point out the main flaw or missing concept briefly.
STRICT OUTPUT FORMAT INSTRUCTIONS:
1. ${languageInstruction}
2. Respond ONLY with the JSON object, enclosed in \`\`\`json ... \`\`\`, without any text, explanation, or comments before or after.
The format must be EXACTLY:
\`\`\`json
{
  "isValid": boolean,
  "feedback": "A very brief, constructive explanation for the evaluation (max 2-3 sentences). This feedback should guide the student."
}
\`\`\`
`;
    let rawResponseBodyTextForErrorLogging = "";
    try {
        const response = await fetch(currentGeminiApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: promptText }] }],
                generationConfig: { temperature: 0.2, topP: 0.9, topK: 30, maxOutputTokens: 512, responseMimeType: "application/json" },
                safetySettings: [
                    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                    { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                    { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                    { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                ]
            }),
        });
        const responseBodyText = await response.text();
        rawResponseBodyTextForErrorLogging = responseBodyText;

        if (!response.ok) {
             console.error(`[AI_VALIDATE_ERROR] Gemini API request FAILED. Status: ${response.status}. Body: ${responseBodyText.substring(0,500)}`);
             throw new Error(`Gemini API request for validation failed with status ${response.status}. Response: ${responseBodyText.substring(0,100)}`);
        }
        
        let validationData;
        try {
            const parsedJsonResponse = JSON.parse(responseBodyText);
            if (typeof parsedJsonResponse.isValid === 'boolean' && typeof parsedJsonResponse.feedback === 'string') {
                validationData = parsedJsonResponse;
            } else if (parsedJsonResponse.candidates && parsedJsonResponse.candidates[0]?.content?.parts?.[0]?.text) {
                let aiTextContent = parsedJsonResponse.candidates[0].content.parts[0].text;
                const markdownMatch = aiTextContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/s);
                if (markdownMatch && markdownMatch[1]) { aiTextContent = markdownMatch[1].trim(); }
                validationData = JSON.parse(aiTextContent);
            } else { throw new Error("Unexpected API structure for validation response."); }
        } catch (e) {
            console.warn(`[AI_VALIDATE_WARN] Initial JSON parse/extract failed. Attempting extractCleanJsonStringShared. Raw: ${responseBodyText.substring(0,100)}`);
            const cleanJsonString = extractCleanJsonString(responseBodyText); // استخدام الدالة من نفس الملف
            validationData = JSON.parse(cleanJsonString);
        }


        if (typeof validationData.isValid !== 'boolean' || typeof validationData.feedback !== 'string') {
            console.error("[AI_VALIDATE_ERROR_MALFORMED] Validation JSON from AI is malformed. Data:", validationData);
            throw new Error("Validation JSON from AI is malformed.");
        }
        return validationData;
    } catch (error) {
        if (error instanceof SyntaxError && error.message.includes("JSON")) {
             console.error(`[AI_VALIDATE_JSON_PARSE_ERROR_FINAL] Failed to parse final JSON. Error: ${error.message}. Raw Body: "${rawResponseBodyTextForErrorLogging.substring(0,300)}"`);
        } else {
            console.error(`[AI_VALIDATE_FATAL_OUTER] Critical error during answer validation: ${error.message}`, error.stack);
        }
        throw error; // Re-throw to be caught by the controller
    }
};

const generateHintWithAI = async (questionText, subjectNameForPrompt, hintLanguage = "ar") => {
    const currentGeminiApiUrl = setGeminiApiUrl('gemini-1.5-flash-latest');
    console.log(`[AI_HINT_START] Generating hint for: Q="${questionText.substring(0,50)}...", Subj='${subjectNameForPrompt}', Lang='${hintLanguage}' using URL: ${currentGeminiApiUrl}`);
    if (!GEMINI_API_KEY || !currentGeminiApiUrl) {
         console.error("[AI_HINT_FATAL] Missing API Key/URL for hint generation.");
         throw new Error("AI Service configuration error: API Key or URL is missing.");
    }
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
        const response = await fetch(currentGeminiApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: promptText }] }],
                generationConfig: { temperature: 0.7, topP: 0.9, topK: 35, maxOutputTokens: 256, responseMimeType: "application/json" },
                safetySettings: [
                    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                    { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                    { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                    { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                ]
            }),
        });
        const responseBodyText = await response.text();
        rawResponseBodyTextForErrorLogging = responseBodyText;
        if (!response.ok) {
            console.error(`[AI_HINT_ERROR] Gemini API hint request failed. Status: ${response.status}. Body: ${responseBodyText.substring(0,500)}`);
            throw new Error(`Gemini API hint request failed. Status: ${response.status}. Response: ${responseBodyText.substring(0,100)}`);
        }
        
        let hintData;
        try {
            const parsedJsonResponse = JSON.parse(responseBodyText);
            if (typeof parsedJsonResponse.hint === 'string') {
                hintData = parsedJsonResponse;
            } else if (parsedJsonResponse.candidates && parsedJsonResponse.candidates[0]?.content?.parts?.[0]?.text) {
                let aiTextContent = parsedJsonResponse.candidates[0].content.parts[0].text;
                const markdownMatch = aiTextContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/s);
                if (markdownMatch && markdownMatch[1]) { aiTextContent = markdownMatch[1].trim(); }
                hintData = JSON.parse(aiTextContent);
            } else { throw new Error("Unexpected API structure for hint response."); }
        } catch (e) {
            console.warn(`[AI_HINT_WARN] Initial JSON parse/extract failed. Attempting extractCleanJsonStringShared. Raw: ${responseBodyText.substring(0,100)}`);
            const cleanJsonString = extractCleanJsonString(responseBodyText); // استخدام الدالة من نفس الملف
            hintData = JSON.parse(cleanJsonString);
        }

        if (typeof hintData.hint !== 'string' || hintData.hint.trim() === '') {
             console.error("[AI_HINT_ERROR_MALFORMED] Hint JSON from AI is malformed or empty. Data:", hintData);
             throw new Error("Hint JSON from AI is malformed or empty.");
        }
        return hintData.hint;
    } catch (error) {
        if (error instanceof SyntaxError && error.message.includes("JSON")) {
             console.error(`[AI_HINT_JSON_PARSE_ERROR_FINAL] Failed to parse final JSON. Error: ${error.message}. Raw Body: "${rawResponseBodyTextForErrorLogging.substring(0,300)}"`);
        } else {
            console.error(`[AI_HINT_FATAL_OUTER] Error generating hint: ${error.message}`, error.stack);
        }
        throw error; // Re-throw
    }
};

const generateDetailedAnswerWithAI = async (questionText, questionType, subjectNameForPrompt, explanationLanguage = "ar", correctAnswerDB = null, userAnswer = null) => {
    const currentGeminiApiUrl = setGeminiApiUrl('gemini-1.5-flash-latest');
    console.log(`[AI_DETAILED_START] Gen detailed answer. Q="${questionText.substring(0,50)}...", Type='${questionType}', Subj='${subjectNameForPrompt}', Lang='${explanationLanguage}' using URL ${currentGeminiApiUrl}`);
    if (!GEMINI_API_KEY || !currentGeminiApiUrl) {
        console.error("[AI_DETAILED_FATAL] Missing API Key/URL for detailed answer generation.");
        throw new Error("AI Service configuration error: API Key or URL is missing.");
    }
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
        const response = await fetch(currentGeminiApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: promptText }] }],
                generationConfig: { temperature: 0.5, topP: 0.95, topK: 40, maxOutputTokens: 3072, responseMimeType: "application/json" },
                safetySettings: [
                    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                    { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                    { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                    { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                ]
            }),
        });
        const responseBodyText = await response.text();
        rawResponseBodyTextForErrorLogging = responseBodyText;
        if (!response.ok) {
            console.error(`[AI_DETAILED_ERROR] Gemini API detailed answer request failed. Status: ${response.status}. Body: ${responseBodyText.substring(0,500)}`);
            throw new Error(`Gemini API detailed answer request failed. Status: ${response.status}. Response: ${responseBodyText.substring(0,100)}`);
        }
        
        let explanationData;
        try {
            const parsedJsonResponse = JSON.parse(responseBodyText);
            if (typeof parsedJsonResponse.detailedExplanation === 'string') {
                explanationData = parsedJsonResponse;
            } else if (parsedJsonResponse.candidates && parsedJsonResponse.candidates[0]?.content?.parts?.[0]?.text) {
                let aiTextContent = parsedJsonResponse.candidates[0].content.parts[0].text;
                const markdownMatch = aiTextContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/s);
                if (markdownMatch && markdownMatch[1]) { aiTextContent = markdownMatch[1].trim(); }
                explanationData = JSON.parse(aiTextContent);
            } else { throw new Error("Unexpected API structure for detailed answer response."); }
        } catch (e) {
            console.warn(`[AI_DETAILED_WARN] Initial JSON parse/extract failed. Attempting extractCleanJsonStringShared. Raw: ${responseBodyText.substring(0,100)}`);
            const cleanJsonString = extractCleanJsonString(responseBodyText); // استخدام الدالة من نفس الملف
            explanationData = JSON.parse(cleanJsonString);
        }


        if (typeof explanationData.detailedExplanation !== 'string' || explanationData.detailedExplanation.trim() === '') {
            console.error("[AI_DETAILED_ERROR_MALFORMED] Detailed explanation JSON from AI is malformed or empty. Data:", explanationData);
            throw new Error("Detailed explanation JSON from AI is malformed or empty.");
        }
        return explanationData.detailedExplanation;
    } catch (error) {
        if (error instanceof SyntaxError && error.message.includes("JSON")) {
             console.error(`[AI_DETAILED_JSON_PARSE_ERROR_FINAL] Failed to parse final JSON. Error: ${error.message}. Raw Body: "${rawResponseBodyTextForErrorLogging.substring(0,300)}"`);
        } else {
            console.error(`[AI_DETAILED_FATAL_OUTER] Error generating detailed answer: ${error.message}`, error.stack);
        }
        throw error; // Re-throw
    }
};


module.exports = {
    generateAIQuestion,
    validateFreeTextAnswerWithAI,
    generateHintWithAI,
    generateDetailedAnswerWithAI
};