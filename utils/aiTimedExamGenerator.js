// back-end/utils/aiTimedExamGenerator.js
require('dotenv').config();
const AcademicLevel = require('../models/AcademicLevel');
const Track = require('../models/Track');
const Subject = require('../models/Subject');

const {
    GEMINI_API_KEY,
    setGeminiApiUrl,
    loadCurriculumData,
    normalizeForPath,
    getRandomFromArray,
    extractCleanJsonString
} = require('./aiGeneralQuestionGeneratorShared'); // تأكد من المسار الصحيح

const mapLevelToArabic = (levelApiValue) => { /* ... كما هي ... */
    const mapping = { 'Facile': 'سهل', 'Moyen': 'متوسط', 'Difficile': 'صعب' };
    return mapping[levelApiValue] || levelApiValue;
};
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));


// --- دالة مساعدة لتحديد بنية التمرين حسب المادة (مثال أولي) ---
function getSubjectSpecificExamProblemStructure(subjectNameNormalized, lessonLanguage, targetTotalPoints, numSubQuestionsRequested) {
    let structureDescription = `The problem should have a main description/scenario, followed by EXACTLY ${numSubQuestionsRequested} free-text sub-questions. These sub-questions should ideally have progressive difficulty.`;
    let pointsDistributionGuidance = `The sum of points for all sub-questions MUST BE EXACTLY ${targetTotalPoints}. Distribute these points among the sub-questions, giving more points to more complex or multi-step sub-questions. Points for each sub-question must be positive integers or half-points (e.g., 1, 1.5, 2, 2.5).`;
    let specificInstructions = ""; // تعليمات إضافية خاصة بالمادة

    // مثال للغة الفرنسية (يمكن توسيعه وتفصيله)
    if (subjectNameNormalized.includes('frensh') || subjectNameNormalized.includes('français')) {
        // توزيع مقترح للنقاط: فهم النص (10 نقاط)، اللغة (6 نقاط)، الإنشاء (4 نقاط) - هذا مثال عام
        // لإنشاء "تمرين" واحد، قد نركز على جزء واحد فقط أو ندمج.
        // هذا الـ prompt الحالي ينشئ "تمرينًا واحدًا" (problem set). لإنشاء امتحان كامل للفرنسية
        // كما وصفته (نص + أسئلة فهم + أسئلة لغة + إنشاء)، سيتطلب الأمر إما:
        // 1. Prompt واحد معقد جدًا يطلب كل هذه الأجزاء في JSON واحد (صعب جدًا على AI الالتزام به بدقة).
        // 2. أو استدعاءات متعددة لـ AI لإنشاء كل جزء على حدة، ثم تجميعها في الخادم. (أكثر موثوقية)

        // *** للتبسيط حاليًا، هذا الـ prompt سينشئ "تمرينًا" واحدًا يمكن أن يكون جزءًا من امتحان فرنسية ***
        // يمكن أن يكون هذا التمرين هو جزء "étude de texte" أو "langue".
        // "Production écrite" عادة ما يكون مهمة منفصلة.

        structureDescription = `
This problem should be structured like a typical "Étude de Texte" or "Langue" section from a Moroccan regional French exam.
It must include:
1.  A main text (literary excerpt, article, etc.) as "problemDescription". This text should be suitable for analysis at the ${lessonLanguage === 'fr' ? 'target' : 'specified'} language level.
2.  Followed by ${numSubQuestionsRequested} sub-questions related to the text, covering aspects like:
    - Comprehension (identification d'informations, relevé d'indices, type de texte, etc.)
    - Analysis (figures de style, tonalité, point de vue de l'auteur, etc.)
    - Lexicon/Vocabulary (meaning of words in context)
    - Grammar/Langue (conjugation, syntax, etc., if relevant to the text or as separate sub-questions focusing on 'la langue').
The sub-questions should be free-text.`;
        pointsDistributionGuidance = `The total points for this problem (all sub-questions combined) is ${targetTotalPoints}. Distribute these points appropriately among the ${numSubQuestionsRequested} sub-questions. For example, comprehension questions might carry more weight initially.`;
        specificInstructions = `Ensure the chosen text and questions are typical of those found in the "Examen Régional Normalisé" for French.`;
    }
    // مثال للرياضيات أو الفيزياء (أقرب للـ prompt الحالي)
    else if (subjectNameNormalized.includes('math') || subjectNameNormalized.includes('physic') || subjectNameNormalized.includes('chimie') || subjectNameNormalized.includes('svt')) {
        structureDescription = `The problem should present a scenario, data, or a situation requiring scientific/mathematical reasoning, followed by ${numSubQuestionsRequested} sequential free-text sub-questions that guide the student through solving the problem or analyzing different aspects. Sub-questions should build upon each other where appropriate.`;
        // pointsDistributionGuidance remains similar
        specificInstructions = `The problem should reflect the style of exercises found in the Moroccan national exam for this scientific subject, testing application of formulas, theorems, and problem-solving methodologies.`;
    }
    // مثال للفلسفة (يتطلب تفكيرًا مختلفًا)
    else if (subjectNameNormalized.includes('falsafa') || subjectNameNormalized.includes('philosophie')) {
        structureDescription = `
The problem should present a philosophical question, a short excerpt from a philosophical text, or a thought-provoking statement as "problemDescription".
This should be followed by ${numSubQuestionsRequested} sub-questions designed to:
1.  Elicit understanding of the core philosophical concept(s) or thesis presented.
2.  Encourage critical analysis and argumentation.
3.  Prompt the student to formulate their own reasoned position or to compare different philosophical perspectives.
Sub-questions should be open-ended, requiring developed textual answers.`;
        pointsDistributionGuidance = `Total points: ${targetTotalPoints}. Distribute these among the ${numSubQuestionsRequested} sub-questions, rewarding depth of analysis, clarity of argument, and relevant use of philosophical knowledge.`;
        specificInstructions = `The problem must emulate the style of a dissertation or text analysis question from the Moroccan national exam in Philosophy.`;
    }
    // يمكنك إضافة المزيد من الشروط `else if` لمواد أخرى (تاريخ وجغرافيا، تربية إسلامية، إلخ)

    return { structureDescription, pointsDistributionGuidance, specificInstructions };
}
// --- نهاية الدالة المساعدة ---


async function generateSingleAIProblemSetDataForLesson(
    academicLevelName,
    trackName,
    subjectNameFromDB, // اسم المادة كما هو في DB، مثل "2BAC_sm_fransh"
    difficultyLevelApi,
    specificLessonTitle, // قد يكون "عام" إذا لم يتم اختيار درس محدد
    lessonLanguage
) {
    const currentGeminiApiUrl = setGeminiApiUrl('gemini-1.5-flash-latest');
    console.log(`[AI_SINGLE_PROBLEM_DATA_EXAM_GEN_START] Lesson: "${specificLessonTitle}", Subject: '${subjectNameFromDB}', Diff: '${difficultyLevelApi}', Lang: ${lessonLanguage}`);

    if (!GEMINI_API_KEY || !currentGeminiApiUrl) { /* ... error handling ... */
        throw new Error("AI Service configuration error: API Key or URL is missing.");
    }

    let numSubQuestions; // سيتم تحديدها لاحقًا أو داخل getSubjectSpecificExamProblemStructure
    if (difficultyLevelApi === 'Difficile') numSubQuestions = Math.floor(Math.random() * 2) + 4; // 4-5
    else if (difficultyLevelApi === 'Moyen') numSubQuestions = Math.floor(Math.random() * 2) + 3; // 3-4
    else numSubQuestions = Math.floor(Math.random() * 2) + 2; // 2-3

    // تحديد إجمالي النقاط بشكل أكثر واقعية للامتحان (عادة ما يكون لكل تمرين وزن معين)
    // هذا يمكن أن يأتي من إعدادات الامتحان أو يتم تحديده هنا. لنفترض أن كل تمرين في الامتحان يستحق 10-20 نقطة.
    let targetTotalPointsForThisProblem = 10; // قيمة افتراضية
    if (subjectNameFromDB.toLowerCase().includes('math')) targetTotalPointsForThisProblem = Math.random() < 0.5 ? 10 : 15;
    else if (subjectNameFromDB.toLowerCase().includes('physic') || subjectNameFromDB.toLowerCase().includes('chimie')) targetTotalPointsForThisProblem = Math.random() < 0.5 ? 7.5 : 10;
    else if (subjectNameFromDB.toLowerCase().includes('frensh') || subjectNameFromDB.toLowerCase().includes('arab') || subjectNameFromDB.toLowerCase().includes('english')) targetTotalPointsForThisProblem = 20; // قد يكون النص والأسئلة عليه 20 نقطة
    else if (subjectNameFromDB.toLowerCase().includes('falsafa')) targetTotalPointsForThisProblem = 20;
    else targetTotalPointsForThisProblem = Math.random() < 0.5 ? 10 : (Math.random() < 0.5 ? 7.5 : 5) ; // مواد أخرى

    // تعديل عدد الأسئلة الفرعية إذا كان الموضوع يتطلب ذلك (مثل اللغة الفرنسية)
    const subjectNameNormalized = normalizeForPath(subjectNameFromDB);
    if (subjectNameNormalized.includes('frensh') || subjectNameNormalized.includes('philosophie')) {
        numSubQuestions = Math.floor(Math.random() * 3) + 5; // 5-7 أسئلة فرعية لمثل هذه المواد
        if (subjectNameNormalized.includes('frensh') && targetTotalPointsForThisProblem < 15) targetTotalPointsForThisProblem = 20; // تأكد من أن نقاط الفرنسية عالية
    }


    const { structureDescription, pointsDistributionGuidance, specificInstructions } =
        getSubjectSpecificExamProblemStructure(subjectNameNormalized, lessonLanguage, targetTotalPointsForThisProblem, numSubQuestions);

    const languageInstruction = lessonLanguage === "ar" ? "جميع أجزاء هذا التمرين (العنوان، النص الرئيسي، الأسئلة الفرعية) يجب أن تكون حصريًا باللغة العربية الفصحى الأكاديمية."
                              : lessonLanguage === "en" ? "All parts of this problem (title, main text, sub-questions) MUST BE EXCLUSIVELY IN ACADEMIC ENGLISH."
                              : "Toutes les parties de ce problème (titre, texte principal, sous-questions) DOIVENT ÊTRE EXCLUSIVEMENT EN FRANÇAIS ACADÉMIQUE SOUTENU.";

    const promptExpertise = `an expert in designing official exam papers (National or Regional exams) for the Moroccan curriculum (${academicLevelName} - ${trackName}).`;

    // إذا كان "specificLessonTitle" عامًا، نطلب من AI اختيار موضوع مناسب للامتحان
    let lessonFocusInstruction = `The problem must be SPECIFICALLY about the LESSON: "${specificLessonTitle}".`;
    if (specificLessonTitle.toLowerCase().includes("général") || specificLessonTitle.toLowerCase().includes("general theme")) {
        lessonFocusInstruction = `The problem should cover a significant and exam-relevant topic or chapter from the subject "${subjectNameFromDB}". You choose an appropriate specific lesson topic.`;
    }


    const promptText = `
You are ${promptExpertise}
Your task is to generate ONE SINGLE, coherent, exam-style problem set ("Problème", "Étude de Texte", "Dissertation", or "مسألة" as appropriate for the subject) for "${subjectNameFromDB}".
This problem is part of a larger simulated exam.

SUBJECT-SPECIFIC GUIDANCE for "${subjectNameFromDB}":
${specificInstructions}

CORE REQUIREMENTS:
- Focus: ${lessonFocusInstruction}
- Overall Difficulty for this problem: "${difficultyLevelApi}".
- Language: ${languageInstruction}
- Structure: ${structureDescription}
- Points Distribution: ${pointsDistributionGuidance}

STRICT JSON OUTPUT (The entire response must be ONLY this JSON object, enclosed in \`\`\`json ... \`\`\`):
\`\`\`json
{
  "problemTitle": "A concise and exam-appropriate title for this problem, in ${lessonLanguage}.",
  "problemDescription": "The main text, scenario, literary excerpt, dataset, or philosophical prompt for the problem, in ${lessonLanguage}. This section sets the stage and provides the material for the sub-questions.",
  "subQuestions": [
    { "text": "Text of the first sub-question, in ${lessonLanguage}.", "difficultyOrder": 1, "points": <points_for_sq1> }
    // ... continue for EXACTLY ${numSubQuestions} sub-questions, following the structure and points guidance.
  ],
  "totalPointsProblem": ${targetTotalPointsForThisProblem}, // Must be exactly ${targetTotalPointsForThisProblem} and equal the sum of sub-question points.
  "lessonContext": "${specificLessonTitle}", // If you chose a specific lesson, state it here. Otherwise, use the original provided.
  "type": "problem_set" // This field MUST be "problem_set".
}
\`\`\`
Example of subQuestions for a French "Étude de Texte" with ${numSubQuestions} sub-questions and ${targetTotalPointsForThisProblem} total points:
[
  { "text": "Quel est le type de ce texte ? Justifiez votre réponse.", "difficultyOrder": 1, "points": 2 },
  { "text": "Relevez dans le texte quatre mots ou expressions appartenant au champ lexical de la peur.", "difficultyOrder": 2, "points": 2 },
  { "text": "Analysez la figure de style dans la phrase suivante : '...'.", "difficultyOrder": 3, "points": 3 },
  // ... other questions (comprehension, analysis, langue)
  { "text": "À votre avis, quelle est la visée de l'auteur à travers ce passage ?", "difficultyOrder": ${numSubQuestions}, "points": <remaining_points> }
]

IMPORTANT VALIDATION RULES (Adhere strictly):
- 'problemTitle' and 'problemDescription' (the main text/scenario) must be non-empty.
- 'subQuestions' must be an array of EXACTLY ${numSubQuestions} objects.
- Each sub-question object must have "text" (non-empty string), "difficultyOrder" (sequential number from 1 to ${numSubQuestions}), and "points" (positive number, can be integer or half-point like 1.5).
- The sum of "points" from all 'subQuestions' MUST equal 'totalPointsProblem', which itself must be ${targetTotalPointsForThisProblem}.
- All textual content must be in the specified language: ${lessonLanguage}.
Ensure the generated JSON is valid and strictly follows this format. No comments or explanations outside the JSON.
`;

    console.log(`[AI_SINGLE_PROBLEM_DATA_EXAM_GEN_PROMPT] For lesson "${specificLessonTitle}" (${lessonLanguage}). Target Points: ${targetTotalPointsForThisProblem}, Num SubQ: ${numSubQuestions}. Prompt Len: ${promptText.length}`);
    // ... (باقي الكود لـ fetch، استخلاص JSON، والتحقق من الصحة يبقى كما هو في ردك الأخير) ...
    // ... مع التأكد من استخدام extractCleanJsonString بشكل صحيح ...
    let rawResponseBodyTextForErrorLogging = "";
    try {
        const fetchOptions = { /* ... as before ... */
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: promptText }] }],
                generationConfig: { temperature: 0.6, topP: 0.95, topK: 40, maxOutputTokens: 4096 },
                safetySettings: [ /* ... */ ]
            }),
        };
        const response = await fetch(currentGeminiApiUrl, fetchOptions);
        rawResponseBodyTextForErrorLogging = await response.text();

        if (!response.ok) { /* ... error handling ... */
            console.error(`[AI_SINGLE_PROBLEM_DATA_EXAM_GEN_ERROR] Gemini API FAILED. Status: ${response.status}. Body: ${rawResponseBodyTextForErrorLogging.substring(0,500)}`);
            throw new Error(`Gemini API request failed (Status: ${response.status}).`);
        }

        let actualTextFromAi = ""; // Logic to get text from response.candidates or raw response
        try {
            const parsedFullResponse = JSON.parse(rawResponseBodyTextForErrorLogging);
            if (parsedFullResponse.candidates && parsedFullResponse.candidates[0]?.content?.parts?.[0]?.text) {
                actualTextFromAi = parsedFullResponse.candidates[0].content.parts[0].text;
            } else if (parsedFullResponse.promptFeedback?.blockReason) {
                 throw new Error(`AI prompt blocked. Reason: ${parsedFullResponse.promptFeedback.blockReason}`);
            } else { actualTextFromAi = rawResponseBodyTextForErrorLogging; }
        } catch (e) { actualTextFromAi = rawResponseBodyTextForErrorLogging; }


        if (!actualTextFromAi || actualTextFromAi.trim() === "") {
            throw new Error("AI response content (actualTextFromAi) is empty.");
        }

        const cleanJsonString = extractCleanJsonString(actualTextFromAi);
        const problemData = JSON.parse(cleanJsonString);

        // --- Validation (similar to before, with adjustments for exam context) ---
        if (problemData.type !== 'problem_set') throw new Error(`AI type mismatch. Expected 'problem_set'.`);
        // lessonContext might be chosen by AI if original specificLessonTitle was general
        if (!problemData.lessonContext || String(problemData.lessonContext).trim() === '') {
            console.warn("AI response missing 'lessonContext'. Using original or default.");
            problemData.lessonContext = specificLessonTitle;
        }
        if (!problemData.problemDescription || String(problemData.problemDescription).trim() === '') throw new Error("AI response missing 'problemDescription'.");
        if (!problemData.problemTitle || String(problemData.problemTitle).trim() === '') problemData.problemTitle = `Problème sur ${problemData.lessonContext}`;
        if (!problemData.subQuestions || !Array.isArray(problemData.subQuestions) || problemData.subQuestions.length === 0) throw new Error("AI response missing 'subQuestions'.");

        if (problemData.subQuestions.length !== numSubQuestions) {
             console.warn(`[AI_EXAM_VALIDATION] AI returned ${problemData.subQuestions.length} subQ, prompt asked for ${numSubQuestions}. Accepting AI's count.`);
             // Potentially adjust numSubQuestions if needed for further logic, or just proceed.
        }

        let calculatedTotalPoints = 0;
        const validatedSubQuestions = problemData.subQuestions.map((sq, index) => {
            if (!sq.text || String(sq.text).trim() === '' || typeof sq.difficultyOrder !== 'number' || typeof sq.points !== 'number' || sq.points <= 0) {
                if (typeof sq.points === 'string') sq.points = parseFloat(sq.points); // Attempt recovery
                if (isNaN(sq.points) || sq.points <= 0) {
                     console.error(`Invalid subQ structure (index ${index}): ${JSON.stringify(sq)}. Defaulting points.`);
                     sq.points = 1; // Default
                }
            }
            sq.difficultyOrder = (typeof sq.difficultyOrder === 'number' && sq.difficultyOrder > 0) ? sq.difficultyOrder : (index + 1);
            sq.points = Number(parseFloat(sq.points).toFixed(1));
            calculatedTotalPoints += sq.points;
            return {
                text: String(sq.text).trim(),
                difficultyOrder: sq.difficultyOrder,
                points: sq.points,
            };
        }).sort((a,b) => a.difficultyOrder - b.difficultyOrder);


        // For exams, it's CRITICAL that totalPointsProblem matches the target or a recalculated sum.
        // If AI doesn't respect sum, we might need to adjust sub-question points proportionally or error out.
        // For now, let's trust the AI to get close and log a warning.
        // The controller `startExam` will use `problemData.totalPointsProblem` from AI or recalculate.
        if (Math.abs(calculatedTotalPoints - targetTotalPointsForThisProblem) > 0.1 && validatedSubQuestions.length > 0) {
            console.warn(`AI subQuestions sum to ${calculatedTotalPoints}, target was ${targetTotalPointsForThisProblem}. Final problem points will be ${calculatedTotalPoints}.`);
        }
        // Ensure totalPointsProblem reflects the sum of validated sub-questions
        problemData.totalPointsProblem = validatedSubQuestions.length > 0 ? calculatedTotalPoints : 0;


        if (problemData.totalPointsProblem === 0 && validatedSubQuestions.length > 0) {
            // This is a more critical issue for an exam problem
            throw new Error("Generated exam problem has sub-questions but total points sum to zero. Invalid.");
        }

        console.log(`[AI_SINGLE_PROBLEM_DATA_EXAM_GEN_SUCCESS] Problem Data: "${problemData.problemTitle}", Lesson: "${problemData.lessonContext}", Total Points: ${problemData.totalPointsProblem}, Num SubQ: ${validatedSubQuestions.length}.`);
        return { // هذا الكائن هو ما سيُضمن في TimedExamAttempt
            problemTitle: String(problemData.problemTitle).trim(),
            text: String(problemData.problemDescription).trim(), // النص الرئيسي للتمرين
            subQuestions: validatedSubQuestions, // الأسئلة الفرعية التي تم التحقق منها
            totalPoints: problemData.totalPointsProblem,
            lesson: problemData.lessonContext,
        };

    } catch (error) {
        console.error(`[AI_SINGLE_PROBLEM_DATA_EXAM_GEN_FATAL_OUTER] Lesson "${specificLessonTitle}": ${error.message}. Raw Response: ${rawResponseBodyTextForErrorLogging.substring(0,300)}`, error.stack);
        throw error;
    }
}


/**
 * Generates a full exam set data (array of problem data objects).
 */
const generateFullExamSetData = async (
    academicLevelId,
    trackId,
    subjectId,
    examDifficultyApiValue,
    numberOfProblemsToGenerate
) => {
    // ... (نفس منطق جلب levelDoc, trackDoc, subjectDoc واختيار الدروس كما في ردك الأخير) ...
    // ... والتأكد من استخدام generateSingleAIProblemSetDataForLesson (النسخة المعدلة أعلاه) ...
    console.log(`[FULL_EXAM_SET_DATA_LESSON_FOCUSED_START] Generating ${numberOfProblemsToGenerate} problems data. SubjID: ${subjectId}, Diff: ${examDifficultyApiValue}`);

    const [levelDoc, trackDoc, subjectDoc] = await Promise.all([
        AcademicLevel.findById(academicLevelId).select('name').lean(),
        Track.findById(trackId).select('name').lean(),
        Subject.findById(subjectId).select('name').lean()
    ]);

    if (!levelDoc || !trackDoc || !subjectDoc) {
        console.error(`[FULL_EXAM_SET_DATA_ERROR] Academic entities not found. Lvl: ${levelDoc?._id}, Trk: ${trackDoc?._id}, Sub: ${subjectDoc?._id}`);
        throw new Error('Academic entities not found. Please check the provided IDs.');
    }
    console.log(`[FULL_EXAM_SET_DATA_CONTEXT] Level: ${levelDoc.name}, Track: ${trackDoc.name}, Subject: ${subjectDoc.name}`);

    const curriculumData = loadCurriculumData(levelDoc.name, trackDoc.name, subjectDoc.name);
    let availableUniqueLessons = [];

    if (curriculumData && Array.isArray(curriculumData) && curriculumData.length > 0) {
        const lessonTitles = new Set();
        curriculumData.forEach(lesson => {
            if (lesson && lesson.titreLecon && typeof lesson.titreLecon === 'string' && lesson.titreLecon.trim() !== "") {
                lessonTitles.add(lesson.titreLecon.trim());
            }
        });
        lessonTitles.forEach(title => {
            const originalLessonObject = curriculumData.find(l => l.titreLecon === title);
            const lang = originalLessonObject?.langueContenu ||
                         (subjectDoc.name.toLowerCase().includes("arab") ||
                          subjectDoc.name.toLowerCase().includes("islamia") ||
                          subjectDoc.name.toLowerCase().includes("tarikh") ||
                          subjectDoc.name.toLowerCase().includes("joghrafia") ||
                          subjectDoc.name.toLowerCase().includes("falsafa") ? "ar" : "fr");
            availableUniqueLessons.push({ title: title, language: lang });
        });
        console.log(`[FULL_EXAM_SET_DATA_LESSONS] Found ${availableUniqueLessons.length} unique lessons from curriculum.`);
    } else {
        console.warn(`[FULL_EXAM_SET_DATA_LESSONS] No curriculum data or lessons found for ${subjectDoc.name}. Will use general themes.`);
    }

    const selectedLessonsForProblems = [];
    if (availableUniqueLessons.length > 0) {
        let lessonsToPickFrom = [...availableUniqueLessons];
        for (let i = 0; i < numberOfProblemsToGenerate; i++) {
            if (lessonsToPickFrom.length === 0) {
                console.log("[FULL_EXAM_SET_DATA_LESSONS] Re-using lessons as not enough unique ones for all problems.");
                lessonsToPickFrom = [...availableUniqueLessons];
            }
            if (lessonsToPickFrom.length === 0) break;
            const randomIndex = Math.floor(Math.random() * lessonsToPickFrom.length);
            selectedLessonsForProblems.push(lessonsToPickFrom.splice(randomIndex, 1)[0]);
        }
    }

    if (selectedLessonsForProblems.length < numberOfProblemsToGenerate) {
        const numFallbacksNeeded = numberOfProblemsToGenerate - selectedLessonsForProblems.length;
        const defaultLangForSubject = subjectDoc.name.toLowerCase().includes("arab") ||
                                      subjectDoc.name.toLowerCase().includes("islamia") ||
                                      subjectDoc.name.toLowerCase().includes("tarikh") ||
                                      subjectDoc.name.toLowerCase().includes("joghrafia") ||
                                      subjectDoc.name.toLowerCase().includes("falsafa") ? "ar" : "fr";
        for (let i = 0; i < numFallbacksNeeded; i++) {
            selectedLessonsForProblems.push({
                title: `${subjectDoc.name} - Thème général ${i + 1}`, // عنوان عام
                language: defaultLangForSubject
            });
        }
        console.log(`[FULL_EXAM_SET_DATA_LESSONS] Filled with ${numFallbacksNeeded} fallback general themes.`);
    }
    console.log(`[FULL_EXAM_SET_DATA_LESSONS] Final lessons to generate problems for:`, selectedLessonsForProblems.map(l => `${l.title} (${l.language})`));


    const generatedProblemsDataArray = [];
    const MAX_CONSECUTIVE_ERRORS = 2;
    let consecutiveErrors = 0;

    for (let i = 0; i < numberOfProblemsToGenerate; i++) {
        if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
            console.warn(`[FULL_EXAM_SET_DATA_WARN] Stopping generation due to ${MAX_CONSECUTIVE_ERRORS} consecutive errors.`);
            break;
        }
        const lessonForThisProblem = selectedLessonsForProblems[i];
        if (!lessonForThisProblem || !lessonForThisProblem.title || !lessonForThisProblem.language) {
            console.error(`[FULL_EXAM_SET_DATA_ERROR] Invalid or missing lesson data for problem index ${i}. Cannot generate problem.`);
            consecutiveErrors++;
            continue;
        }

        console.log(`[FULL_EXAM_SET_DATA_ITERATION] Attempting to generate Problem Data ${i + 1}/${numberOfProblemsToGenerate}, lesson: "${lessonForThisProblem.title}" (Lang: ${lessonForThisProblem.language})`);
        try {
            // استدعاء النسخة المعدلة من الدالة
            const problemData = await generateSingleAIProblemSetDataForLesson(
                levelDoc.name,
                trackDoc.name,
                subjectDoc.name,
                examDifficultyApiValue,
                lessonForThisProblem.title,
                lessonForThisProblem.language
            );
            if (problemData && problemData.totalPoints > 0) {
                generatedProblemsDataArray.push(problemData);
                consecutiveErrors = 0;
            } else {
                throw new Error("Generated problem data was invalid (e.g., zero points) or null.");
            }

            if (i < numberOfProblemsToGenerate - 1 && generatedProblemsDataArray.length < numberOfProblemsToGenerate) {
                const delayDuration = Math.floor(Math.random() * 3000) + 5000;
                console.log(`[FULL_EXAM_SET_DATA_DELAY] Successfully generated problem. Delaying ${delayDuration/1000}s before next...`);
                await delay(delayDuration);
            }
        } catch (error) {
            consecutiveErrors++;
            console.error(`[FULL_EXAM_SET_DATA_ITERATION_ERROR] Failed to generate problem data for lesson "${lessonForThisProblem.title}". Error: ${error.message}. Consecutive errors: ${consecutiveErrors}.`);
            if (error.message && (error.message.toLowerCase().includes("quota") || error.message.toLowerCase().includes("rate limit") || error.message.includes("resource has been exhausted"))) {
                console.error("[FULL_EXAM_SET_DATA_QUOTA_ERROR] AI Quota/Rate Limit Exceeded or Resource Exhausted. Stopping exam generation.");
                throw new Error(`AI Service Limit Reached. Only ${generatedProblemsDataArray.length} problems generated.`);
            }
            if (i < numberOfProblemsToGenerate - 1 && consecutiveErrors < MAX_CONSECUTIVE_ERRORS) {
                const errorDelay = 3000;
                console.log(`[FULL_EXAM_SET_DATA_ERROR_DELAY] Delaying ${errorDelay/1000}s after error...`);
                await delay(errorDelay);
            }
        }
    }

    if (generatedProblemsDataArray.length === 0) {
        throw new Error(`Failed to generate ANY valid problems data after ${numberOfProblemsToGenerate} attempts. Check AI service, prompts, or curriculum data.`);
    }
    if (generatedProblemsDataArray.length < numberOfProblemsToGenerate) {
        console.warn(`[FULL_EXAM_SET_DATA_WARN] Generated only ${generatedProblemsDataArray.length} valid problems out of ${numberOfProblemsToGenerate} requested.`);
    }

    console.log(`[FULL_EXAM_SET_DATA_LESSON_FOCUSED_END] Successfully generated data for ${generatedProblemsDataArray.length} problems.`);
    return generatedProblemsDataArray;
};

module.exports = {
    generateFullExamSetData,
};