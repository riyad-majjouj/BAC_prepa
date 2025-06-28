// prompts/2BAC/[SM or SVT]/english/examPrompt.js

// دالة مساعدة لاختيار عناصر عشوائية من مصفوفة بدون تكرار
function getRandomSubarray(arr, size) {
    if (!arr || arr.length === 0) return [];
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(size, shuffled.length));
}

module.exports = {
    examConfig: {
        // الامتحان بأكمله لا يزال "مشكلة" واحدة كبيرة من وجهة نظر النظام
        numberOfProblems: 1, 
        timeLimitMinutes: 120, // أو يمكن جلب هذا من examStructureDetails في المنهج
    },

    type: 'multi-step',
    // لنبدأ بـ flash لتقليل الاستهلاك، يمكن الترقية إلى pro إذا كانت الجودة غير كافية
    defaultModelType: 'gemini-1.5-flash-latest', 
    defaultGenerationConfig: { 
        temperature: 0.65, // قليل من الإبداع ولكن ليس كثيرًا للامتحان
        maxOutputTokens: 8000, // قد نحتاج إلى توكنز كثيرة للامتحان الكامل
        // responseMimeType: "application/json" // يتم تعيينه في fetchGeminiWithConfig
    },

    steps: [
        {
            name: 'generate_full_english_exam_v2',
            description: 'Generates a complete, three-part English national exam with specific structure.',
            promptGenerator: (context) => {
                // context.lesson هنا هو الكائن من exam-curriculum-data/.../english.js
                const { lesson: examStructureData, academicLevelName, trackName } = context; 

                if (!examStructureData || !examStructureData.readingThemes || !examStructureData.grammarPoints || !examStructureData.writingTaskTypes) {
                    console.error("[ENGLISH_EXAM_PROMPT_ERROR] examStructureData is missing or malformed:", examStructureData);
                    throw new Error("Required exam structure data (readingThemes, grammarPoints, writingTaskTypes) is missing for English exam generation.");
                }
                
                // اختيار عشوائي لعدد محدود من العناصر لتوجيه Gemini بشكل أفضل وتقليل الحمل
                const selectedReadingTheme = getRandomSubarray(examStructureData.readingThemes, 1)[0] || "a general interest topic";
                
                // اختيار 3-4 نقاط قواعد متنوعة للامتحان
                const selectedGrammarPoints = getRandomSubarray(examStructureData.grammarPoints, 4); 
                const grammarFocusString = selectedGrammarPoints.length > 0 ? selectedGrammarPoints.join('; ') : "a mix of common grammar points";

                // --- START OF MODIFICATION ---
                // التعديل 1: اختيار نوع واحد فقط من مهام الكتابة بدلاً من اثنين
                const selectedWritingTaskType = getRandomSubarray(examStructureData.writingTaskTypes, 1)[0];
                if (!selectedWritingTaskType) {
                    console.error("[ENGLISH_EXAM_PROMPT_ERROR] Could not select a writing task type.");
                    throw new Error("Could not select a writing task type from the curriculum data.");
                }
                
                // التعديل 2: إنشاء تعليمات لسؤال واحد فقط
                const writingPromptInstruction = `The prompt must be an example of a(n) '${selectedWritingTaskType.type}' task. It should follow this base description: "${selectedWritingTaskType.baseDescription}". The topic should be relevant to ${academicLevelName} students in Morocco.`;
                // --- END OF MODIFICATION ---


                const details = examStructureData.examStructureDetails || {};
                const compPoints = details.comprehension?.points || 15;
                const langPoints = details.language?.points || 15;
                const writingPointsTotal = details.writing?.points || 10;
                const readingWordCount = details.comprehension?.typicalWordCount || "350-450 words"; 
                const writingWordCount = details.writing?.typicalWordCountPerTask || "80-120 words"; // تم تقليل عدد الكلمات قليلاً بما أنه سؤال واحد


                // --- DEBUG LOG ---
                console.log(`[ENGLISH_EXAM_PROMPT_DEBUG] For ${academicLevelName} ${trackName}:`);
                console.log(`  Selected Reading Theme: ${selectedReadingTheme}`);
                console.log(`  Selected Grammar Focus: ${grammarFocusString}`);
                // --- MODIFIED DEBUG LOG ---
                console.log(`  Selected Writing Task Type: ${selectedWritingTaskType.type}`);
                console.log(`  Marker from curriculum: ${examStructureData.fileMarker || 'N/A'}`);
                // --- END DEBUG LOG ---

                return `
You are an expert designer of the Moroccan National English Baccalaureate Exam for ${academicLevelName}, ${trackName} stream.
Your mission is to generate ONE complete, realistic, and coherent exam paper. The paper must have three distinct sections: Comprehension, Language, and Writing, with the standard point distribution (${compPoints} pts, ${langPoints} pts, ${writingPointsTotal} pts respectively).
The content should be original and not directly copied from any existing Moroccan exam papers.

**EXAM CONTENT REQUIREMENTS:**

1.  **Reading Comprehension (${compPoints} pts):**
    *   Generate a compelling and original reading passage of approximately **${readingWordCount}**.
    *   The passage topic MUST be: **"${selectedReadingTheme}"**.
    *   The passage should be engaging, well-structured, and appropriate for the baccalaureate level.
    *   Create a full set of comprehension questions. These questions must test a variety of skills:
        *   Identifying main ideas and supporting details.
        *   Understanding explicit and implicit information (e.g., true/false with justification from the text, WH-questions).
        *   Vocabulary in context (e.g., finding synonyms/antonyms, explaining word meaning).
        *   Understanding pronoun references.
        *   Inferring meaning or author's purpose.
    *   **Each sub-question under Comprehension MUST have a unique 'difficultyOrder' field, starting from 1 and incrementing sequentially.**

2.  **Language (${langPoints} pts):**
    *   Create a variety of language exercises (e.g., gap-filling, multiple choice, sentence transformation/rewriting, matching, word formation).
    *   The exercises MUST cover a good mix of the following grammar points/areas: **${grammarFocusString}**. Ensure at least 3-4 different grammar points are tested.
    *   The exercises should be contextualized and reflect common formats seen in national exams.
    *   **Each sub-question or distinct part of an exercise under Language MUST have a unique 'difficultyOrder' field, incrementing sequentially from the last 'difficultyOrder' of the Comprehension section.**

3.  **Writing (${writingPointsTotal} pts):**
    {/* --- START OF MODIFICATION --- */}
    {/* التعديل 3: تغيير التعليمات للذكاء الاصطناعي ليطلب سؤالاً واحداً فقط */}
    *   Generate **ONE single writing prompt** worth all ${writingPointsTotal} points.
    *   The prompt MUST be based on the following instructions: **${writingPromptInstruction}**
    *   The prompt must be clear, well-defined, and ask students to write approximately **${writingWordCount}**.
    *   **The writing prompt MUST be a single sub-question object with 'isWritingPrompt': true, and have a unique 'difficultyOrder' field, incrementing sequentially from the last 'difficultyOrder' of the Language section.**
    {/* --- END OF MODIFICATION --- */}

**STRICT JSON OUTPUT FORMAT:**
You MUST respond ONLY with a single, valid JSON object, enclosed in \`\`\`json ... \`\`\`. No explanations, apologies, or introductory text.
The structure must be EXACTLY as follows:

\`\`\`json
{
  "problemTitle": "English National Exam - ${academicLevelName} ${trackName} (Sample ${new Date().toISOString().slice(0,10)})",
  "text": "The full reading passage text (approx. ${readingWordCount}) on the theme of '${selectedReadingTheme}' goes here...",
  "subQuestions": [
    // Comprehension Section Example (difficultyOrder starts from 1)
    {
      "text": "A. COMPREHENSION (${compPoints} POINTS)",
      "isTitle": true,
      "points": 0,
      "difficultyOrder": 1 
    },
    {
      "text": "1. Are these statements true or false? Justify your answer with a relevant phrase from the text. (e.g., 4 pts)",
      "isInstruction": true,
      "points": 0,
      "difficultyOrder": 2
    },
    {
      "text": "a. Statement example one.",
      "points": 2,
      "difficultyOrder": 3,
      "answer": "False. Justification: 'Exact quote from the generated text...'"
    },
    // ... more comprehension questions, each with increasing difficultyOrder ...

    // Language Section Example (difficultyOrder continues)
    {
      "text": "B. LANGUAGE (${langPoints} POINTS)",
      "isTitle": true,
      "points": 0,
      "difficultyOrder": 15
    },
    {
      "text": "1. Fill in the blanks with suitable words from the list: (word1, word2, word3). (e.g., 3 pts)",
      "isInstruction": true,
      "points": 0,
      "difficultyOrder": 16
    },
    {
      "text": "a. The student ... (verb) ... hard for the exam.",
      "points": 1.5,
      "difficultyOrder": 17,
      "answer": "studied"
    },
    // ... more language exercises, each with increasing difficultyOrder ...

    // --- START OF MODIFICATION ---
    // التعديل 4: تعديل المثال ليعكس وجود سؤال كتابة واحد فقط
    // Writing Section Example (difficultyOrder continues)
    {
      "text": "C. WRITING (${writingPointsTotal} POINTS)",
      "isTitle": true,
      "points": 0,
      "difficultyOrder": 30 // Example: assuming 29 previous items
    },
    {
      "text": "[Generated Writing Prompt Text, e.g., 'Your friend from England wants to know about a Moroccan festival. Write an email of about ${writingWordCount} describing the festival, its activities, and why you enjoy it.']",
      "isWritingPrompt": true,
      "points": ${writingPointsTotal}, // Points for the entire writing task
      "difficultyOrder": 31, // Increments from the title
      "answer": "Model answer guidelines: A good answer would follow the email format, address all parts of the prompt (description, activities, feelings), use appropriate vocabulary and grammar, and be well-organized within the word limit."
    }
    // --- END OF MODIFICATION ---
  ],
  "totalPoints": ${compPoints + langPoints + writingPointsTotal},
  "lesson": "${examStructureData.fileMarker || examStructureData.examTitleContext || 'English Baccalaureate Exam Structure'}"
}
\`\`\`

FINAL CRITICAL INSTRUCTION: Review your entire output meticulously. It MUST be a single, valid JSON object adhering to ALL specified structures, including the sequential 'difficultyOrder' for every item in 'subQuestions' (titles, instructions, and actual questions/prompts). The 'text' field for the reading passage must be generated.
`;
            },
        },
    ],

    finalAggregator: (context, allStepsOutputs) => {
        // ... (لا حاجة لتغيير هذا الجزء، فهو سيعمل بشكل صحيح مع سؤال واحد) ...
        const examData = allStepsOutputs.generate_full_english_exam_v2;

        if (!examData || typeof examData.text !== 'string' || !Array.isArray(examData.subQuestions)) {
            console.error("[ENGLISH_EXAM_AGGREGATOR_ERROR] The AI returned an invalid primary exam structure:", examData);
            throw new Error("The AI failed to generate a valid primary exam structure (missing text or subQuestions).");
        }
        
        let currentOrder = 0;
        let orderError = false;
        
        examData.subQuestions.forEach((sq, index) => {
            if (typeof sq.difficultyOrder !== 'number') {
                console.warn(`[FINAL_AGGREGATOR_WARN] SubQuestion at index ${index} (text: "${sq.text.substring(0,30)}") is MISSING 'difficultyOrder'. Assigning sequential order ${index + 1}.`);
                sq.difficultyOrder = index + 1;
            }
            currentOrder = sq.difficultyOrder;

            if (sq.isWritingPrompt && (!sq.answer || sq.answer.trim() === "")) {
                sq.answer = "Model answer guidelines: Student should address the prompt fully, use appropriate language, structure, and adhere to word count.";
            } else if (!sq.isTitle && !sq.isInstruction && (!sq.answer || sq.answer.trim() === "")) {
            }
        });

        let calculatedTotalPoints = 0;
        examData.subQuestions.forEach(sq => {
             // تم تبسيط منطق حساب النقاط ليتوافق مع وجود سؤال كتابة واحد فقط
            if (!sq.isTitle && !sq.isInstruction) {
                 calculatedTotalPoints += (Number(sq.points) || 0);
            }
        });
        // في الإصدار السابق، كان هناك منطق خاص للتعامل مع نقاط أسئلة الكتابة المتعددة.
        // الآن بما أنه سؤال واحد، لم نعد بحاجة إليه، والحساب المباشر للنقاط كافٍ.
        calculatedTotalPoints = Math.round(calculatedTotalPoints * 100) / 100;

        if (Math.abs(calculatedTotalPoints - examData.totalPoints) > 0.1) {
            console.warn(`[FINAL_AGGREGATOR_POINTS_MISMATCH] AI stated totalPoints ${examData.totalPoints}, but calculated ${calculatedTotalPoints} from subQuestions. Overriding with calculated value.`);
            examData.totalPoints = calculatedTotalPoints;
        }


        return examData;
    }
};