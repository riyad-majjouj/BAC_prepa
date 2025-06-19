// backend/utils/aiQuestionGenerator.js
require('dotenv').config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// استيراد بيانات المناهج
const curriculumBacMarocFrancais = require('../curriculumData.js');
const concoursCurriculumData = require('../concoursCurriculum.js');

// --- تعريف URL الخاص بـ Gemini API بشكل عام ---
let geminiApiUrl;
if (GEMINI_API_KEY) {
    geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
} else {
    console.error("[AI_CORE_FATAL] GEMINI_API_KEY is missing! AI functionalities will not work.");
}


// --- دالة مساعدة لاختيار عنصر عشوائي من مصفوفة ---
function getRandomFromArray(arr) {
    if (!arr || arr.length === 0) return null;
    return arr[Math.floor(Math.random() * arr.length)];
}

// --- دالة مساعدة للحصول على بيانات المادة من concoursCurriculumData ---
function getConcoursSubjectInfo(subjectNameFromUser) {
    if (!concoursCurriculumData || !Array.isArray(concoursCurriculumData.subjects)) {
        console.warn("[AI_GEN_WARN] concoursCurriculumData.subjects is not defined or not an array.");
        return null;
    }
    let subjectData = concoursCurriculumData.subjects.find(s => s.nomMatiereAr === subjectNameFromUser);
    if (!subjectData) {
        subjectData = concoursCurriculumData.subjects.find(s => s.nomMatiere === subjectNameFromUser);
    }
    if (subjectData) {
        return {
            nameForPrompt: subjectData.nomMatiere,
            availableLessons: subjectData.lecons || [],
            originalSubjectData: subjectData,
            language: subjectData.nomMatiere === "English" ? "en" : (subjectData.langueContenu || "fr") // تمت إضافة langueContenu كخيار احتياطي للغة
        };
    }
    return null;
}

// --- دالة مساعدة للحصول على بيانات المادة من curriculumBacMarocFrancais ---
function getBacSubjectInfo(trackFromUser, subjectNameArFromUser) {
    const brancheData = curriculumBacMarocFrancais.find(b => b.nomBranche === trackFromUser);
    if (brancheData) {
        const matiereData = brancheData.matieres.find(m => m.nomMatiereAr === subjectNameArFromUser);
        if (matiereData) {
            let leconsOuSections = [];
            if (matiereData.nomMatiere === "Physique-Chimie") {
                leconsOuSections = (matiereData.leconsPhysique || []).concat(matiereData.leconsChimie || []);
            } else if (matiereData.nomMatiere === "Anglais") { // English can have 'sections' or 'lecons'
                leconsOuSections = matiereData.sections || matiereData.lecons || []; // تم تعديل هذا الشرط ليشمل lecons أيضًا للغة الإنجليزية
            }
             else {
                leconsOuSections = matiereData.lecons || [];
            }
            return {
                nameForPrompt: matiereData.nomMatiere,
                availableLessonsOrSections: leconsOuSections,
                originalMatiereData: matiereData,
                language: matiereData.nomMatiere === "Anglais" ? "en" : (matiereData.langueContenu || "fr") // تمت إضافة langueContenu كخيار احتياطي للغة
            };
        }
    }
    return null;
}

const promptTaskFlavors = [
    { id: "standard_mcq", description: "Create ONE original, relevant, and challenging MCQ question based on the provided context." },
    { id: "application_mcq", description: "Create an MCQ question that requires practical application of the given topic/sub-topic. If possible, relate it to a real-world inspired scenario or a scenario from another scientific discipline (like physics for a math problem, or vice-versa if appropriate)." },
    { id: "gap_fill_concept_mcq", description: "Formulate an MCQ question that presents a concept or statement with a crucial piece of information missing (the 'gap'). The options should provide plausible completions for this gap, with only one being correct according to the topic/sub-topic." },
    { id: "error_spotting_mcq", description: "Create an MCQ question where the question stem or one of the options subtly introduces a common misconception or error related to the topic. The task is to identify the correct concept or statement, implicitly correcting or avoiding the error. The options must be carefully crafted around this." },
    { id: "interpretive_mcq", description: "Create an MCQ question that asks for an interpretation or explanation of *why* a certain rule/principle (from the topic/sub-topic) applies or *why* a particular outcome occurs in a given scenario related to the topic." },
    { id: "comparative_mcq", description: "If two topics are provided, create an MCQ question that requires comparing or contrasting them, or finding a relationship between them. If only one topic, create a question that compares different aspects within that topic." },
    { id: "free_text_conceptual", description: "Create ONE original, relevant, and challenging open-ended question that requires a conceptual written answer based on the provided context. The question should prompt for an explanation, analysis, or detailed description." }
];

const questionContexts = [
    "a purely academic/theoretical setting",
    "a real-world problem-solving scenario (e.g., engineering, finance, daily life)",
    "an interdisciplinary link (e.g., physics in biology, math in economics)",
    "a historical context related to the discovery/development of the concept",
    "a debate or discussion format (e.g., two students discussing a concept, one is mistaken)",
    "a data interpretation scenario (if applicable to the subject)"
];

// --- الدالة الرئيسية لتوليد السؤال ---
const generateAIQuestion = async (subjectNameArFromUser, level, trackFromUser) => {
    if (!GEMINI_API_KEY || !geminiApiUrl) { // التحقق من وجود المفتاح و URL - تم تعديل هذا الشرط ليشمل geminiApiUrl
        console.error("[AI_GEN_FATAL] GEMINI_API_KEY is missing or geminiApiUrl is not set.");
        throw new Error("AI Service configuration error: API Key or URL is missing.");
    }
    console.log(`[AI_GEN_INFO] Initiating question generation for: Track='${trackFromUser}', Subject (Arabic)='${subjectNameArFromUser}', Level='${level}'`);

    let selectedLessonTitre = "Thème général non spécifié";
    let selectedParagraphTexte = "Aspect général non spécifié";
    let subjectNameForPromptContext = subjectNameArFromUser;
    let questionLanguage = "fr";
    const isConcoursTrack = trackFromUser === "CONCOURS";
    const defaultLessonConcours = `Sujet Général du Concours (${subjectNameArFromUser})`;
    const defaultLessonBac = `Sujet général de la matière (${subjectNameArFromUser})`;
    let selectedLessonTitre2 = null;
    let selectedParagraphTexte2 = null;
    let combineTopicsInQuestion = Math.random() < 0.35;
    const isDifficultNonConcours = level === "Difficile" && !isConcoursTrack;
    const questionTypeToGenerate = isDifficultNonConcours ? "free_text" : "mcq";
    console.log(`[AI_GEN_INFO] Determined question type to generate: ${questionTypeToGenerate}`);

    if (isConcoursTrack) {
        console.log("[AI_GEN_INFO] CONCOURS track detected.");
        const concoursSubject = getConcoursSubjectInfo(subjectNameArFromUser);
        if (concoursSubject) {
            subjectNameForPromptContext = concoursSubject.nameForPrompt;
            questionLanguage = concoursSubject.language;
            if (concoursSubject.availableLessons.length > 0) {
                const randomLesson = getRandomFromArray(concoursSubject.availableLessons);
                if (randomLesson && randomLesson.titreLecon) {
                    selectedLessonTitre = randomLesson.titreLecon;
                    const randomParagraph = getRandomFromArray(randomLesson.paragraphes);
                    selectedParagraphTexte = randomParagraph || `Aspect général de la leçon: ${selectedLessonTitre}`;
                    if (combineTopicsInQuestion && concoursSubject.availableLessons.length > 1) {
                        let randomLesson2 = getRandomFromArray(concoursSubject.availableLessons);
                        while (randomLesson2 && randomLesson2.titreLecon === selectedLessonTitre) {
                            randomLesson2 = getRandomFromArray(concoursSubject.availableLessons);
                        }
                        if (randomLesson2 && randomLesson2.titreLecon) {
                            selectedLessonTitre2 = randomLesson2.titreLecon;
                            const randomParagraph2 = getRandomFromArray(randomLesson2.paragraphes);
                            selectedParagraphTexte2 = randomParagraph2 || `Aspect général de la leçon 2: ${selectedLessonTitre2}`;
                        } else { combineTopicsInQuestion = false; }
                    } else { combineTopicsInQuestion = false; }
                } else { selectedLessonTitre = `Thème Aléatoire pour ${subjectNameForPromptContext} (Concours)`; combineTopicsInQuestion = false; }
            } else { selectedLessonTitre = `Thème Principal pour ${subjectNameForPromptContext} (Concours)`; combineTopicsInQuestion = false; }
        } else {
            console.warn(`[AI_GEN_WARN] Subject (Ar: '${subjectNameArFromUser}') NOT FOUND in 'concoursCurriculumData'. Using default.`); // تم تغيير console.error إلى console.warn وإضافة "Using default."
            selectedLessonTitre = defaultLessonConcours; combineTopicsInQuestion = false;
            subjectNameForPromptContext = subjectNameArFromUser; // Fallback to Arabic name if no match
            questionLanguage = "fr"; // Default to French
        }
    } else { // BAC Track
        const bacSubjectInfo = getBacSubjectInfo(trackFromUser, subjectNameArFromUser);
        if (bacSubjectInfo) {
            subjectNameForPromptContext = bacSubjectInfo.nameForPrompt;
            questionLanguage = bacSubjectInfo.language;
            if (bacSubjectInfo.nameForPrompt === "Anglais") {
                const sectionsOrLessons = bacSubjectInfo.availableLessonsOrSections; // Could be 'sections' or 'lecons' - تم تغيير الاسم ليعكس أنه يمكن أن يكون أي منهما
                if (sectionsOrLessons && sectionsOrLessons.length > 0) {
                    const randomSection = getRandomFromArray(sectionsOrLessons);
                    if (randomSection) { // تم تبسيط هذا الشرط
                        selectedLessonTitre = randomSection.typeSection || randomSection.titreLecon || "General English Topic"; // Handle both structures - التعامل مع كلا الهيكلين
                        const themes = randomSection.themes || randomSection.paragraphes || []; // Handle both structures - التعامل مع كلا الهيكلين
                        const randomTheme = getRandomFromArray(themes);
                        selectedParagraphTexte = randomTheme?.titreTheme || randomTheme || "General English Theme/Skill"; // تبسيط وتوفير قيمة افتراضية

                        if (combineTopicsInQuestion && sectionsOrLessons.length > 0) { // تم تغيير sections.length إلى sectionsOrLessons.length
                            const randomSection2 = getRandomFromArray(sectionsOrLessons); // تم تغيير sections إلى sectionsOrLessons
                            if (randomSection2) { // تم تبسيط هذا الشرط
                                const themes2 = randomSection2.themes || randomSection2.paragraphes || []; // التعامل مع كلا الهيكلين
                                let randomTheme2 = getRandomFromArray(themes2);
                                const section2Title = randomSection2.typeSection || randomSection2.titreLecon || "General English Topic 2"; // التعامل مع كلا الهيكلين
                                const theme2Title = randomTheme2?.titreTheme || randomTheme2 || "General English Theme/Skill 2"; // تبسيط وتوفير قيمة افتراضية

                                if ((section2Title !== selectedLessonTitre || theme2Title !== selectedParagraphTexte)) { // ضمان عدم تكرار نفس الموضوع
                                    selectedLessonTitre2 = section2Title;
                                    selectedParagraphTexte2 = theme2Title;
                                } else { combineTopicsInQuestion = false; }
                            } else { combineTopicsInQuestion = false; }
                        } else { combineTopicsInQuestion = false; }
                    } else { selectedLessonTitre = "General English Topic"; combineTopicsInQuestion = false; }
                } else { selectedLessonTitre = "General English Grammar/Vocabulary"; combineTopicsInQuestion = false; }
            } else { // Other BAC subjects
                const lecons = bacSubjectInfo.availableLessonsOrSections;
                if (lecons && lecons.length > 0) {
                    const randomLesson = getRandomFromArray(lecons);
                    if (randomLesson && randomLesson.titreLecon) {
                        selectedLessonTitre = randomLesson.titreLecon;
                        const randomParagraph = getRandomFromArray(randomLesson.paragraphes);
                        selectedParagraphTexte = randomParagraph || `Contenu général: ${selectedLessonTitre}`;
                        if (combineTopicsInQuestion && lecons.length > 1) {
                            let randomLesson2 = getRandomFromArray(lecons);
                            while (randomLesson2 && randomLesson2.titreLecon === selectedLessonTitre) {
                                randomLesson2 = getRandomFromArray(lecons);
                            }
                            if (randomLesson2 && randomLesson2.titreLecon) {
                                selectedLessonTitre2 = randomLesson2.titreLecon;
                                const randomParagraph2 = getRandomFromArray(randomLesson2.paragraphes);
                                selectedParagraphTexte2 = randomParagraph2 || `Contenu général leçon 2: ${selectedLessonTitre2}`;
                            } else { combineTopicsInQuestion = false; }
                        } else { combineTopicsInQuestion = false; }
                    } else { selectedLessonTitre = `Sujet aléatoire pour ${subjectNameForPromptContext}`; combineTopicsInQuestion = false; }
                } else { selectedLessonTitre = defaultLessonBac; combineTopicsInQuestion = false; }
            }
        } else {
            console.warn(`[AI_GEN_WARN] BAC Subject (Ar: '${subjectNameArFromUser}') or Track '${trackFromUser}' NOT FOUND. Using default.`); // تم تغيير console.error إلى console.warn وإضافة "Using default."
            selectedLessonTitre = defaultLessonBac; combineTopicsInQuestion = false;
            subjectNameForPromptContext = subjectNameArFromUser; // Fallback
            questionLanguage = "fr"; // Default
        }
    }
    if (!combineTopicsInQuestion) { selectedLessonTitre2 = null; selectedParagraphTexte2 = null; }

    console.log(`[AI_GEN_INFO] Topic 1: '${selectedLessonTitre}' - '${selectedParagraphTexte}' (Lang: ${questionLanguage})`); // تم إضافة لغة السؤال إلى السجل
    if (selectedLessonTitre2) { console.log(`[AI_GEN_INFO] Topic 2: '${selectedLessonTitre2}' - '${selectedParagraphTexte2}' (Attempting combination)`); }

    let lessonForJson;
    const isGeneric = (title, paragraph) => title === "Thème général non spécifié" || title.startsWith("Sujet général") || title.startsWith("Thème Aléatoire pour") || title.startsWith("Thème Principal pour") || title === defaultLessonConcours || title === defaultLessonBac || title === "General English Grammar/Vocabulary" || title === "General English Topic" || title === "General English Theme/Skill" || paragraph === "Aspect général non spécifié" || paragraph.startsWith("Aspect général de la leçon:") || paragraph.startsWith("Contenu général") || paragraph === "General English theme" || paragraph === "General English Theme/Skill"; // تم إضافة "General English Theme/Skill"
    const formatLessonString = (title, paragraph, isGenTitle, isGenPara) => { if (!isGenTitle) { return !isGenPara ? `${title} - ${paragraph}` : title; } return isConcoursTrack ? defaultLessonConcours : defaultLessonBac; };
    
    // تم تعديل منطق lessonForJson لمنع تكرار نفس الدرس إذا كان الدرسان متطابقين
    let lesson1Json = formatLessonString(selectedLessonTitre, selectedParagraphTexte, isGeneric(selectedLessonTitre, "specific"), isGeneric("specific", selectedParagraphTexte));
    if (selectedLessonTitre2 && selectedParagraphTexte2) { 
        const lesson2Json = formatLessonString(selectedLessonTitre2, selectedParagraphTexte2, isGeneric(selectedLessonTitre2, "specific"), isGeneric("specific", selectedParagraphTexte2)); 
        const defaultForTrack = isConcoursTrack ? defaultLessonConcours : defaultLessonBac; 
        if (lesson1Json !== defaultForTrack && lesson2Json !== defaultForTrack && lesson1Json !== lesson2Json) { // تمت إضافة شرط lesson1Json !== lesson2Json
            lessonForJson = `${lesson1Json} & ${lesson2Json}`; 
        } else if (lesson1Json !== defaultForTrack) { 
            lessonForJson = lesson1Json; 
        } else if (lesson2Json !== defaultForTrack) { 
            lessonForJson = lesson2Json; 
        } else { 
            lessonForJson = defaultForTrack; 
        } 
    } else { 
        lessonForJson = lesson1Json; 
    }
    if (typeof lessonForJson !== 'string' || lessonForJson.includes("undefined") || lessonForJson.length < 5 || lessonForJson.trim() === "&" || lessonForJson.trim() === "") { // تم إضافة lessonForJson.trim() === ""
        lessonForJson = isConcoursTrack ? defaultLessonConcours : defaultLessonBac; 
        console.warn(`[AI_GEN_WARN] lessonForJson was invalid or too short, reset to default: '${lessonForJson}'`); 
    }
    console.log(`[AI_GEN_INFO] Final 'lesson' field for JSON output: "${lessonForJson}"`);

    const languageInstruction = questionLanguage === "en"
        ? "The question and ALL its parts (options, correct answer) MUST BE EXCLUSIVELY IN ENGLISH. The JSON response must also be in English where text fields are concerned (question, options, correctAnswer, lesson)." // تم توضيح أن استجابة JSON يجب أن تكون أيضًا باللغة الإنجليزية للحقول النصية
        : "La question et TOUTES ses parties (options, bonne réponse) doivent être EXCLUSIVEMENT EN FRANÇAIS. La réponse JSON doit également être en français pour les champs textuels (question, options, correctAnswer, lesson)."; // تم توضيح أن استجابة JSON يجب أن تكون أيضًا باللغة الفرنسية للحقول النصية

    const promptExpertise = isConcoursTrack
        ? "specialized in creating advanced questions for Moroccan higher education entrance exams (Concours)."
        : "specialized in creating questions for the Moroccan baccalaureate, option française.";

    let selectedTaskFlavor;
    if (questionTypeToGenerate === "free_text") {
        selectedTaskFlavor = promptTaskFlavors.find(f => f.id === "free_text_conceptual");
    } else {
        selectedTaskFlavor = getRandomFromArray(promptTaskFlavors.filter(f => f.id !== "free_text_conceptual"));
    }
    if (!selectedTaskFlavor) {
        selectedTaskFlavor = questionTypeToGenerate === "free_text"
            ? { id: "free_text_conceptual", description: "Create ONE original, relevant, and challenging open-ended question..." }
            : { id: "standard_mcq", description: "Create ONE original, relevant, and challenging MCQ question..." };
        console.warn(`[AI_GEN_WARN] Could not find task flavor, using fallback: ${selectedTaskFlavor.id}`);
    }

    const selectedContextHint = getRandomFromArray(questionContexts);
    let topicContextBlock = `- Main Lesson / Topic: "${selectedLessonTitre}"\n- Specific Point / Sub-topic: "${selectedParagraphTexte}"`;
    if (selectedLessonTitre2 && selectedParagraphTexte2) {
        topicContextBlock += `\n- Second Main Lesson / Topic (to combine with the first if the task is 'comparative_mcq' or if it makes sense for the question): "${selectedLessonTitre2}"\n- Second Specific Point / Sub-topic: "${selectedParagraphTexte2}"`; // تم توضيح متى يجب دمج الموضوعين
    }

    let outputFormatInstructions;
    if (questionTypeToGenerate === "mcq") {
        outputFormatInstructions = `
STRICT OUTPUT FORMAT INSTRUCTIONS (MCQ):
1.  ${languageInstruction}
2.  MCQ format with EXACTLY 4 distinct options. All options must be plausible and relevant to the topic. // تم إضافة توضيح حول الخيارات
3.  Only one correct answer among the options.
4.  The question must be directly and clearly related to the "Specific Point / Sub-topic" and "Main Lesson / Topic" indicated.
    ${selectedLessonTitre2 ? "If two topics are provided, the question should ideally integrate, compare, or relate both topics, especially if 'comparative_mcq' task flavor is chosen." : ""} // تم توضيح متى يجب دمج الموضوعين
    Ensure the content is relevant for the '${trackFromUser}' exam type.
    If general placeholder terms are indicated for lesson or sub-topic (e.g., "Thème général"), create a question generally relevant to the Subject (${subjectNameForPromptContext}) and Exam Type (${trackFromUser}) at the requested difficulty level (${level}). // تم إضافة تعليمات حول المصطلحات العامة
5.  The "lesson" field in the JSON output must be exactly: "${lessonForJson}".
6.  The "type" field must be "mcq".
7.  The "track" field must be exactly: "${trackFromUser}".
8.  The "subject" field must be exactly: "${subjectNameArFromUser}".
9.  The "level" field must be exactly: "${level}".
RESPOND ONLY with the JSON object, without any text, explanation, or comments before or after. The format must be EXACTLY:
\`\`\`json
{
  "track": "${trackFromUser}",
  "subject": "${subjectNameArFromUser}",
  "level": "${level}",
  "question": "The question text here...",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": "The correct option text",
  "lesson": "${lessonForJson}",
  "generatedBy": "ai",
  "type": "mcq"
}
\`\`\`
`;
    } else { // free_text
        outputFormatInstructions = `
STRICT OUTPUT FORMAT INSTRUCTIONS (Free Text Question):
1.  ${languageInstruction}
2.  The question should be open-ended, requiring a written textual answer, not a selection from options. It should prompt for explanation, analysis, comparison, or detailed description. // تم توضيح نوع الإجابة المطلوبة
3.  DO NOT provide options. The "options" field in the JSON must be an empty array []. // تم التأكيد على أن حقل الخيارات يجب أن يكون مصفوفة فارغة
4.  DO NOT provide a correctAnswer. The "correctAnswer" field in the JSON should be an empty string "". // تم التأكيد على أن حقل الإجابة الصحيحة يجب أن يكون سلسلة فارغة
5.  The question must be directly and clearly related to the "Specific Point / Sub-topic" and "Main Lesson / Topic" indicated.
    ${selectedLessonTitre2 ? "If two topics are provided, the question should ideally integrate, compare, or relate both topics." : ""}
    Ensure the content is relevant for the '${trackFromUser}' exam type.
    If general placeholder terms are indicated for lesson or sub-topic (e.g., "Thème général"), create a question generally relevant to the Subject (${subjectNameForPromptContext}) and Exam Type (${trackFromUser}) at the requested difficulty level (${level}). // تم إضافة تعليمات حول المصطلحات العامة
6.  The "lesson" field in the JSON output must be exactly: "${lessonForJson}".
7.  The "type" field must be "free_text".
8.  The "track" field must be exactly: "${trackFromUser}".
9.  The "subject" field must be exactly: "${subjectNameArFromUser}".
10. The "level" field must be exactly: "${level}".
RESPOND ONLY with the JSON object, without any text, explanation, or comments before or after. The format must be EXACTLY:
\`\`\`json
{
  "track": "${trackFromUser}",
  "subject": "${subjectNameArFromUser}",
  "level": "${level}",
  "question": "The open-ended question text here...",
  "options": [],
  "correctAnswer": "",
  "lesson": "${lessonForJson}",
  "generatedBy": "ai",
  "type": "free_text"
}
\`\`\`
`;
    }

    const promptText = `
You are an expert pedagogical assistant, ${promptExpertise}
TASK_TYPE: ${selectedTaskFlavor.id} (${questionTypeToGenerate})
OBJECTIVE: ${selectedTaskFlavor.description}
QUESTION_CONTEXT_HINTS:
- Try to frame the question within a context like: "${selectedContextHint}", if it feels natural for the subject and topic.
- Ensure the question is appropriately challenging for the specified difficulty level and exam type.
QUESTION_DETAILS:
- Exam Type / Track: ${trackFromUser} ${isConcoursTrack ? `(Targeting schools like: ${getRandomFromArray(concoursCurriculumData.schools) || 'various competitive exams'})` : ''}
- Subject: ${subjectNameForPromptContext} (Content language: ${questionLanguage})
- Desired difficulty level: ${level} ${isConcoursTrack ? '(Concours Level - advanced and potentially multi-step/multi-concept)' : ''} // تم إضافة multi-concept
${topicContextBlock}
${outputFormatInstructions}
`;

    console.log(`[AI_GEN_INFO] Attempting to call Gemini API for ${questionTypeToGenerate} question. Task Flavor: ${selectedTaskFlavor.id}. Language: ${questionLanguage}`); // تم إضافة لغة السؤال إلى السجل

    try {
        const response = await fetch(geminiApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: promptText }] }],
                generationConfig: { temperature: 0.8, topP: 0.95, topK: 40, maxOutputTokens: 2048 },
                safetySettings: [
                    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                    { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                    { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                    { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                ]
            }),
        });
        const responseBodyText = await response.text();
        if (!response.ok) {
            console.error(`[AI_GEN_ERROR] Gemini API request FAILED. Status: ${response.status}.`);
            console.error(`[AI_GEN_ERROR] Gemini API Response Body (first 1000 chars): ${responseBodyText.substring(0, 1000)}`);
            if (response.status === 400) { console.error("[AI_GEN_ERROR] Prompt sent (first 500 chars):", promptText.substring(0, 500)); }
            throw new Error(`Gemini API request failed with status ${response.status}. Response: ${responseBodyText.substring(0, 200)}`);
        }
        console.log("[AI_GEN_INFO] Gemini API request successful. Status:", response.status);

        let aiResponseContent = "";
        try {
            const parsedJsonResponse = JSON.parse(responseBodyText);
            if (parsedJsonResponse.candidates && parsedJsonResponse.candidates[0]?.content?.parts?.[0]?.text) {
                aiResponseContent = parsedJsonResponse.candidates[0].content.parts[0].text;
            } else if (parsedJsonResponse.promptFeedback?.blockReason) {
                console.error(`[AI_GEN_ERROR] Prompt was BLOCKED by Gemini. Reason: ${parsedJsonResponse.promptFeedback.blockReason}`);
                if (parsedJsonResponse.promptFeedback.safetyRatings) { console.error("[AI_GEN_ERROR] Safety Ratings:", JSON.stringify(parsedJsonResponse.promptFeedback.safetyRatings, null, 2));}
                throw new Error(`AI prompt blocked by safety settings. Reason: ${parsedJsonResponse.promptFeedback.blockReason}`);
            } else {
                 console.error("[AI_GEN_ERROR] Gemini API response JSON structure is unexpected. Full response:", JSON.stringify(parsedJsonResponse, null, 2));
                throw new Error("Gemini API response JSON structure is not as expected.");
            }
        } catch (jsonParseError) {
            console.error("[AI_GEN_FATAL] Failed to parse Gemini API response as JSON. Raw response (first 1000 chars):", responseBodyText.substring(0,1000));
            throw new Error("Gemini API returned non-JSON text. Raw text: " + responseBodyText.substring(0, 100));
        }

        const markdownMatch = aiResponseContent.match(/```json\s*([\s\S]*?)\s*```/s);
        let finalJsonString;
        if (markdownMatch && markdownMatch[1]) {
            finalJsonString = markdownMatch[1].trim();
        } else {
            const firstBrace = aiResponseContent.indexOf('{');
            const lastBrace = aiResponseContent.lastIndexOf('}');
            if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
                finalJsonString = aiResponseContent.substring(firstBrace, lastBrace + 1).trim();
            } else {
                finalJsonString = aiResponseContent.trim();
                console.warn("[AI_GEN_WARN] No Markdown JSON or clear braces. Parsing raw AI content.");
            }
        }

        try {
            const questionData = JSON.parse(finalJsonString);
            console.log("[AI_GEN_INFO] Successfully parsed final JSON string.");

            if (questionData.type === "mcq") {
                const expectedFields = ['track', 'subject', 'level', 'question', 'options', 'correctAnswer', 'lesson', 'generatedBy', 'type'];
                for (const field of expectedFields) { if (questionData[field] === undefined) { throw new Error(`Generated MCQ JSON missing field: '${field}'.`); } }
                if (!Array.isArray(questionData.options) || questionData.options.length !== 4) { throw new Error("Generated MCQ JSON incorrect 'options' format (not array or not 4 options)."); } // تم توضيح الخطأ
                if (typeof questionData.correctAnswer !== 'string' || questionData.correctAnswer.trim() === '') { throw new Error("Generated MCQ JSON 'correctAnswer' is not a non-empty string."); } // تم إضافة التحقق من أن الإجابة الصحيحة ليست سلسلة فارغة
                if (questionData.options && !questionData.options.includes(questionData.correctAnswer)) { 
                    console.warn(`[AI_GEN_WARN] MCQ CorrectAnswer "${questionData.correctAnswer}" not in options [${questionData.options.join(', ')}]. Attempting to fix or re-evaluate.`); // تم تحسين رسالة التحذير
                    // Consider a more robust fix here, e.g., picking the closest option or flagging for review.
                    // For now, if options are very different, it's a significant error.
                }
            } else if (questionData.type === "free_text") {
                const expectedFields = ['track', 'subject', 'level', 'question', 'lesson', 'generatedBy', 'type'];
                for (const field of expectedFields) { if (questionData[field] === undefined) { throw new Error(`Generated Free Text JSON missing field: '${field}'.`); } }
                questionData.options = []; // Ensure options is an empty array - تم التأكيد على أن الخيارات يجب أن تكون مصفوفة فارغة
                questionData.correctAnswer = ""; // Ensure correctAnswer is an empty string - تم التأكيد على أن الإجابة الصحيحة يجب أن تكون سلسلة فارغة
            } else { throw new Error(`Generated JSON has unknown 'type': ${questionData.type}.`); }

            if (questionData.track !== trackFromUser) { console.warn(`AI Mismatch: track. Expected '${trackFromUser}', Got '${questionData.track}'. Overriding.`); questionData.track = trackFromUser; }
            if (questionData.subject !== subjectNameArFromUser) { console.warn(`AI Mismatch: subject. Expected '${subjectNameArFromUser}', Got '${questionData.subject}'. Overriding.`); questionData.subject = subjectNameArFromUser; }
            if (questionData.level !== level) { console.warn(`AI Mismatch: level. Expected '${level}', Got '${questionData.level}'. Overriding.`); questionData.level = level; }
            if (questionData.lesson !== lessonForJson) { console.warn(`AI Mismatch: lesson. Expected '${lessonForJson}', Got '${questionData.lesson}'. Overriding.`); questionData.lesson = lessonForJson; }

            console.log(`[AI_GEN_SUCCESS] Question generated (${questionData.type}): "${questionData.question.substring(0, 70)}..."`);
            return questionData;

        } catch (finalJsonParseError) {
            console.error("[AI_GEN_FATAL] Failed to parse final JSON string from AI. String:", finalJsonString.substring(0,1000));
            console.error("[AI_GEN_FATAL] Original AI content (first 500 chars):", aiResponseContent.substring(0, 500));
            throw new Error("Failed to parse AI's final JSON. Content: " + finalJsonString.substring(0, 100));
        }
    } catch (error) {
        console.error(`[AI_GEN_FATAL_OUTER] Critical error during generation: ${error.message}`);
        if (error.message.includes("blocked by safety settings") || error.message.includes("400")) {
             console.error("Problematic Prompt (first 500 chars): " + promptText.substring(0,500));
        }
        throw error;
    }
};

// --- NEW FUNCTION: Validate Free Text Answer with AI ---
const validateFreeTextAnswerWithAI = async (originalQuestionText, userAnswerText, subjectNameForPrompt, questionLanguage = "fr") => {
    if (!GEMINI_API_KEY || !geminiApiUrl) { // تم إضافة التحقق من geminiApiUrl
        console.error("[AI_VALIDATE_FATAL] GEMINI_API_KEY is missing or geminiApiUrl not set.");
        throw new Error("AI Service configuration error: API Key or URL is missing.");
    }
    console.log(`[AI_VALIDATE_INFO] Initiating answer validation for: Subject='${subjectNameForPrompt}', Lang='${questionLanguage}'`);
    console.log(`[AI_VALIDATE_INFO] Question: "${originalQuestionText.substring(0,100)}..." User Answer: "${userAnswerText.substring(0,100)}..."`); // تم إضافة سجل للسؤال وإجابة المستخدم

    const languageInstruction = questionLanguage === "en"
        ? "The feedback MUST BE EXCLUSIVELY IN ENGLISH."
        : "Le feedback doit être EXCLUSIVEMENT EN FRANÇAIS.";

    const promptText = `
You are an expert pedagogical assistant, specialized in evaluating student answers for the subject: ${subjectNameForPrompt}.
TASK: Evaluate the user's answer to the given question.
QUESTION: "${originalQuestionText}"
USER'S ANSWER: "${userAnswerText}"
EVALUATION CRITERIA:
- Focus on conceptual correctness and the presence of the main idea(s) expected.
- The answer doesn't need to be perfectly phrased or exhaustive, but it must address the core of the question accurately.
- If the question asks for multiple points, check if the most important ones are present and correctly explained.
- Be very concise in your feedback. If correct, a short confirmation. If incorrect, point out the main flaw or missing concept briefly. // تم تعديل هذا البند لطلب إيجاز أكبر
STRICT OUTPUT FORMAT INSTRUCTIONS:
1. ${languageInstruction}
2. Respond ONLY with the JSON object, without any text, explanation, or comments before or after.
The format must be EXACTLY:
\`\`\`json
{
  "isValid": boolean,
  "feedback": "A very brief, constructive explanation for the evaluation (max 2-3 sentences)." // تم تحديد طول التغذية الراجعة
}
\`\`\`
`;

    try {
        const response = await fetch(geminiApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: promptText }] }],
                generationConfig: { temperature: 0.3, topP: 0.9, topK: 30, maxOutputTokens: 512 }, // Lower temperature for more deterministic validation - تم خفض درجة الحرارة
                safetySettings: [
                    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                    { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                    { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                    { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                ]
            }),
        });
        const responseBodyText = await response.text();
        if (!response.ok) {
            console.error(`[AI_VALIDATE_ERROR] Gemini API request FAILED. Status: ${response.status}.`);
            console.error(`[AI_VALIDATE_ERROR] Gemini API Response Body (first 500 chars): ${responseBodyText.substring(0, 500)}`);
            throw new Error(`Gemini API request for validation failed with status ${response.status}. Response: ${responseBodyText.substring(0, 200)}`);
        }
        console.log("[AI_VALIDATE_INFO] Gemini API request successful for validation.");

        let aiResponseContent = "";
        try {
            const parsedJsonResponse = JSON.parse(responseBodyText);
            if (parsedJsonResponse.candidates && parsedJsonResponse.candidates[0]?.content?.parts?.[0]?.text) {
                aiResponseContent = parsedJsonResponse.candidates[0].content.parts[0].text;
            } else if (parsedJsonResponse.promptFeedback?.blockReason) {
                console.error(`[AI_VALIDATE_ERROR] Prompt was BLOCKED. Reason: ${parsedJsonResponse.promptFeedback.blockReason}`);
                throw new Error(`AI validation prompt blocked by safety settings. Reason: ${parsedJsonResponse.promptFeedback.blockReason}`);
            } else {
                console.error("[AI_VALIDATE_ERROR] Gemini API response JSON structure is unexpected. Full Response:", JSON.stringify(parsedJsonResponse, null, 2)); // تم إضافة تسجيل الاستجابة الكاملة
                throw new Error("Gemini API validation response JSON structure not as expected.");
            }
        } catch (jsonParseError) {
            console.error("[AI_VALIDATE_FATAL] Failed to parse Gemini API validation response as JSON. Raw response:", responseBodyText.substring(0,500)); // تم إضافة تسجيل الاستجابة الأولية
            throw new Error("Gemini API validation returned non-JSON text. Raw text: " + responseBodyText.substring(0, 100)); // تم إضافة الاستجابة الأولية إلى رسالة الخطأ
        }

        const markdownMatch = aiResponseContent.match(/```json\s*([\s\S]*?)\s*```/s);
        let finalJsonString;
        if (markdownMatch && markdownMatch[1]) {
            finalJsonString = markdownMatch[1].trim();
        } else {
            const firstBrace = aiResponseContent.indexOf('{');
            const lastBrace = aiResponseContent.lastIndexOf('}');
            if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
                finalJsonString = aiResponseContent.substring(firstBrace, lastBrace + 1).trim();
            } else {
                finalJsonString = aiResponseContent.trim();
                console.warn("[AI_VALIDATE_WARN] No Markdown JSON or clear braces in validation response. Attempting to parse raw content:", finalJsonString.substring(0,100)); // تم إضافة تسجيل المحتوى الأولي
            }
        }
        try {
            const validationData = JSON.parse(finalJsonString);
            console.log("[AI_VALIDATE_INFO] Successfully parsed validation JSON:", JSON.stringify(validationData));
            if (typeof validationData.isValid !== 'boolean' || typeof validationData.feedback !== 'string') {
                console.error("[AI_VALIDATE_ERROR] Validation JSON missing 'isValid' (boolean) or 'feedback' (string). Received:", validationData); // تم إضافة البيانات المستلمة إلى رسالة الخطأ
                // Fallback if parsing gives an object but not the expected fields
                return { isValid: false, feedback: "حدث خطأ أثناء تقييم الإجابة بواسطة الذكاء الاصطناعي. الرجاء المحاولة مرة أخرى أو مراجعة الإجابة يدويًا." }; // تم إضافة رسالة خطأ احتياطية
            }
            return validationData;
        } catch (finalJsonParseError) {
            console.error("[AI_VALIDATE_FATAL] Failed to parse final validation JSON string from AI. String was:", finalJsonString.substring(0,500)); // تم إضافة السلسلة التي فشل تحليلها
            console.error("[AI_VALIDATE_FATAL] Original AI response:", aiResponseContent.substring(0,500)); // تم إضافة استجابة الذكاء الاصطناعي الأصلية
            // Return a default error object if final parsing fails
            return { isValid: false, feedback: "خطأ فني في تحليل تقييم الذكاء الاصطناعي. الرجاء التواصل مع الدعم." }; // تم إضافة رسالة خطأ احتياطية أكثر تحديدًا
        }
    } catch (error) {
        console.error(`[AI_VALIDATE_FATAL_OUTER] Critical error during answer validation: ${error.message}`);
        throw error; // Re-throw to be caught by controller
    }
};

// --- NEW FUNCTION: Generate Hint with AI ---
const generateHintWithAI = async (questionText, subjectNameForPrompt, hintLanguage = "ar") => {
    if (!GEMINI_API_KEY || !geminiApiUrl) { // التحقق من المفتاح و URL
        console.error("[AI_HINT_FATAL] GEMINI_API_KEY is missing or geminiApiUrl not set.");
        throw new Error("AI Service configuration error: API Key or URL is missing.");
    }
    console.log(`[AI_HINT_INFO] Initiating hint generation for: Subject='${subjectNameForPrompt}', HintLang='${hintLanguage}'`);
    console.log(`[AI_HINT_INFO] Question (start): "${questionText.substring(0,100)}..."`); // تسجيل بداية نص السؤال

    const targetLanguageInstruction = hintLanguage === "en" ? "The hint MUST BE EXCLUSIVELY IN ENGLISH."
                                   : hintLanguage === "fr" ? "L'indice doit être EXCLUSIVEMENT EN FRANÇAIS."
                                   : "التلميح يجب أن يكون حصريًا باللغة العربية الفصحى المبسطة."; // تعليمات اللغة المستهدفة
    
    const promptText = `
You are an expert pedagogical assistant, specialized in providing helpful hints for students for the subject: ${subjectNameForPrompt}.
TASK: Generate a concise and useful hint for the following question. The hint should guide the student towards the correct thinking process or relevant concept without revealing the answer directly.
QUESTION: "${questionText}"
HINT GUIDELINES:
- Focus on one key aspect, concept, formula, or common pitfall related to the question.
- Avoid giving away the answer or making the question too easy.
- Keep the hint short (1-2 sentences).
- ${targetLanguageInstruction}
STRICT OUTPUT FORMAT INSTRUCTIONS:
1. Respond ONLY with the JSON object, without any text, explanation, or comments before or after.
The format must be EXACTLY:
\`\`\`json
{
  "hint": "The generated hint text here..."
}
\`\`\`
`;

    try {
        const response = await fetch(geminiApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: promptText }] }],
                generationConfig: { temperature: 0.7, topP: 0.9, topK: 35, maxOutputTokens: 256 },
                safetySettings: [ { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" }, { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" }, { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" }, { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" } ] // تم إضافة إعدادات الأمان المفقودة
            }),
        });
        const responseBodyText = await response.text();
        if (!response.ok) { 
            console.error(`[AI_HINT_ERROR] Gemini API request FAILED. Status: ${response.status}. Body: ${responseBodyText.substring(0,500)}`); // معالجة الأخطاء مشابهة للدوال الأخرى
            throw new Error(`Gemini API request for hint failed with status ${response.status}.`);
        }
        console.log("[AI_HINT_INFO] Gemini API request successful for hint.");

        let aiResponseContent = "";
        try { 
            const parsedJsonResponse = JSON.parse(responseBodyText);
            if (parsedJsonResponse.candidates && parsedJsonResponse.candidates[0]?.content?.parts?.[0]?.text) {
                aiResponseContent = parsedJsonResponse.candidates[0].content.parts[0].text;
            } else if (parsedJsonResponse.promptFeedback?.blockReason) {
                throw new Error(`AI hint prompt blocked. Reason: ${parsedJsonResponse.promptFeedback.blockReason}`);
            } else { throw new Error("Gemini API hint response JSON structure not as expected."); }
        } catch (jsonParseError) { throw new Error("Gemini API hint returned non-JSON text."); }
        
        const markdownMatch = aiResponseContent.match(/```json\s*([\s\S]*?)\s*```/s);
        let finalJsonString;
        if (markdownMatch && markdownMatch[1]) { finalJsonString = markdownMatch[1].trim(); }
        else { 
            const firstBrace = aiResponseContent.indexOf('{');
            const lastBrace = aiResponseContent.lastIndexOf('}');
            if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
                finalJsonString = aiResponseContent.substring(firstBrace, lastBrace + 1).trim();
            } else {
                finalJsonString = aiResponseContent.trim();
                console.warn("[AI_HINT_WARN] No Markdown JSON or clear braces in hint response. Attempting to parse raw content:", finalJsonString.substring(0,100)); // معالجة احتياطية لمطابقة الأقواس
            }
        }

        try { 
            const hintData = JSON.parse(finalJsonString);
            console.log("[AI_HINT_INFO] Successfully parsed hint JSON:", JSON.stringify(hintData));
            if (typeof hintData.hint !== 'string' || hintData.hint.trim() === '') {
                throw new Error("Hint JSON from AI is malformed or hint is empty.");
            }
            return hintData.hint; // إرجاع نص التلميح فقط
        } catch (finalJsonParseError) { 
            console.error("[AI_HINT_FATAL] Failed to parse final hint JSON. String was:", finalJsonString.substring(0,500));
            throw new Error("Failed to parse AI's final hint JSON.");
        }
    } catch (error) { 
        console.error(`[AI_HINT_FATAL_OUTER] Critical error during hint generation: ${error.message}`); // معالجة الأخطاء الخارجية
        throw error;
    }
};


// --- NEW FUNCTION: Generate Detailed Answer with AI ---
const generateDetailedAnswerWithAI = async (questionText, questionType, subjectNameForPrompt, explanationLanguage = "ar", correctAnswerDB = null, userAnswer = null) => {
    if (!GEMINI_API_KEY || !geminiApiUrl) { // التحقق من المفتاح و URL
        console.error("[AI_DETAILED_FATAL] GEMINI_API_KEY is missing or geminiApiUrl not set.");
        throw new Error("AI Service configuration error: API Key or URL is missing.");
    }
    console.log(`[AI_DETAILED_INFO] Initiating detailed answer generation for: Subject='${subjectNameForPrompt}', Lang='${explanationLanguage}', Type='${questionType}'`);
    console.log(`[AI_DETAILED_INFO] Question (start): "${questionText.substring(0,100)}..."`); // تسجيل بداية نص السؤال
    if (correctAnswerDB) console.log(`[AI_DETAILED_INFO] DB Correct Answer: "${String(correctAnswerDB).substring(0,100)}..."`); // تسجيل الإجابة الصحيحة من قاعدة البيانات إذا وجدت
    if (userAnswer) console.log(`[AI_DETAILED_INFO] User Answer: "${String(userAnswer).substring(0,100)}..."`); // تسجيل إجابة المستخدم إذا وجدت

    const targetLanguageInstruction = explanationLanguage === "en" ? "The detailed explanation MUST BE EXCLUSIVELY IN ENGLISH. Use clear, academic language."
                                   : explanationLanguage === "fr" ? "L'explication détaillée doit être EXCLUSIVEMENT EN FRANÇAIS. Utilisez un langage académique clair."
                                   : "الشرح المفصل يجب أن يكون حصريًا باللغة العربية الفصحى الواضحة والمنظمة. استخدم مصطلحات أكاديمية مناسبة."; // تعليمات اللغة المستهدفة

    let promptCoreConcepts = `Explain the core concepts, principles, or methods necessary to correctly answer the following question regarding "${subjectNameForPrompt}".`;
    if (questionType === 'mcq' && correctAnswerDB) {
        promptCoreConcepts += `\nThe question is multiple choice, and the correct answer is: "${correctAnswerDB}". Explain *why* this answer is correct, addressing the underlying concepts. If appropriate, briefly mention why other plausible (but incorrect) options might be chosen by mistake.`;
    } else if (questionType === 'free_text') {
        promptCoreConcepts += `\nThe question is open-ended. Provide a comprehensive explanation covering the key points expected in a good answer.`;
        if (correctAnswerDB && correctAnswerDB !== "AI_VALIDATION_REQUIRED") { // إضافة شرط correctAnswerDB !== "AI_VALIDATION_REQUIRED"
            promptCoreConcepts += ` A model answer or key points from our database are: "${correctAnswerDB}". You can use this as a reference to structure your explanation or elaborate on these points.`;
        }
    }
    if (userAnswer) {
        promptCoreConcepts += `\nThe student provided the following answer: "${userAnswer}". If this answer is incorrect or incomplete, gently point out the deficiencies in relation to the correct concepts or expected key points, as part of your overall explanation. Do not be harsh.`;
    }

    const promptText = `
You are an expert pedagogical assistant and subject matter expert in: ${subjectNameForPrompt}.
TASK: Provide a clear, comprehensive, and well-structured detailed explanation for the provided question.
QUESTION: "${questionText}"
QUESTION TYPE: ${questionType}
EXPLANATION GUIDELINES:
- ${promptCoreConcepts}
- Structure the explanation logically. Use headings (e.g., ## Main Concept), bullet points (* point), or numbered lists where appropriate for clarity.
- Ensure the explanation is accurate and directly relevant to the question and subject matter.
- Maintain a helpful, educational tone.
- ${targetLanguageInstruction}
STRICT OUTPUT FORMAT INSTRUCTIONS:
1. Respond ONLY with the JSON object, without any text, explanation, or comments before or after.
The format must be EXACTLY:
\`\`\`json
{
  "detailedExplanation": "The full, well-structured detailed explanation text here. Use markdown for formatting like ## for H2, * for bullets."
}
\`\`\`
`;

    try {
        const response = await fetch(geminiApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: promptText }] }],
                generationConfig: { temperature: 0.6, topP: 0.95, topK: 40, maxOutputTokens: 3072 }, // Allow more tokens for detailed answer
                safetySettings: [ { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" }, { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" }, { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" }, { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" } ] // تم إضافة إعدادات الأمان المفقودة
            }),
        });
        const responseBodyText = await response.text();
        if (!response.ok) { 
            console.error(`[AI_DETAILED_ERROR] Gemini API request FAILED. Status: ${response.status}. Body: ${responseBodyText.substring(0,500)}`); // معالجة الأخطاء
            throw new Error(`Gemini API request for detailed answer failed with status ${response.status}.`);
        }
        console.log("[AI_DETAILED_INFO] Gemini API request successful for detailed answer.");

        let aiResponseContent = "";
        try { 
            const parsedJsonResponse = JSON.parse(responseBodyText);
            if (parsedJsonResponse.candidates && parsedJsonResponse.candidates[0]?.content?.parts?.[0]?.text) {
                aiResponseContent = parsedJsonResponse.candidates[0].content.parts[0].text;
            } else if (parsedJsonResponse.promptFeedback?.blockReason) {
                throw new Error(`AI detailed answer prompt blocked. Reason: ${parsedJsonResponse.promptFeedback.blockReason}`);
            } else { throw new Error("Gemini API detailed answer response JSON structure not as expected."); }
        } catch (jsonParseError) { throw new Error("Gemini API detailed answer returned non-JSON text."); }

        const markdownMatch = aiResponseContent.match(/```json\s*([\s\S]*?)\s*```/s);
        let finalJsonString;
        if (markdownMatch && markdownMatch[1]) { finalJsonString = markdownMatch[1].trim(); }
        else { 
            const firstBrace = aiResponseContent.indexOf('{');
            const lastBrace = aiResponseContent.lastIndexOf('}');
            if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
                finalJsonString = aiResponseContent.substring(firstBrace, lastBrace + 1).trim();
            } else {
                finalJsonString = aiResponseContent.trim();
                console.warn("[AI_DETAILED_WARN] No Markdown JSON or clear braces in detailed answer response. Attempting to parse raw content:", finalJsonString.substring(0,100)); // معالجة احتياطية
            }
        }
        
        try { 
            const explanationData = JSON.parse(finalJsonString);
            console.log("[AI_DETAILED_INFO] Successfully parsed detailed explanation JSON.");
            if (typeof explanationData.detailedExplanation !== 'string' || explanationData.detailedExplanation.trim() === '') {
                throw new Error("Detailed explanation JSON from AI is malformed or explanation is empty.");
            }
            return explanationData.detailedExplanation; // إرجاع نص الشرح المفصل فقط
        } catch (finalJsonParseError) { 
            console.error("[AI_DETAILED_FATAL] Failed to parse final detailed explanation JSON. String was:", finalJsonString.substring(0,500));
            throw new Error("Failed to parse AI's final detailed explanation JSON.");
        }
    } catch (error) { 
        console.error(`[AI_DETAILED_FATAL_OUTER] Critical error during detailed answer generation: ${error.message}`); // معالجة الأخطاء الخارجية
        throw error;
    }
};


module.exports = { 
    generateAIQuestion, 
    validateFreeTextAnswerWithAI,
    generateHintWithAI,             // <-- تصدير دالة التلميح
    generateDetailedAnswerWithAI    // <-- تصدير دالة الإجابة المفصلة
};