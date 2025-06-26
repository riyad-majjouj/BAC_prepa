// back-end/prompts/2BAC/[SM, SPC, SVT]/english/examPrompt.js
// This prompt module is self-contained and does not need external helpers.

module.exports = {
    examConfig: {
        numberOfProblems: 1, // The entire English exam is generated as a single "problem" by the AI
        timeLimitMinutes: 120, // 2 hours
        examTitle: (context) => `English Baccalaureate Exam - ${context.academicLevelName} ${context.trackName}`,
        generalInstructions: (context) => `
This English exam paper for ${context.academicLevelName} ${context.trackName} is divided into three sections: Comprehension, Language, and Writing.
Read all instructions carefully before answering the questions. Manage your time wisely.
Total score: 40 points (Comprehension: 15 pts, Language: 15 pts, Writing: 10 pts).
Duration: 2 hours.
Good luck!
`,
    },

    type: 'multi-step', // Still multi-step conceptually, but only one AI generation step for the whole exam
    defaultGenerationConfig: { temperature: 0.6, maxOutputTokens: 8192 }, // Max tokens for a full exam
    defaultModelType: 'gemini-1.5-pro-latest', // A capable model is needed for this complex task

    steps: [
        {
            name: 'generate_full_english_exam_paper',
            description: 'Generates a complete, three-part English national baccalaureate exam paper with diverse question formats.',
            promptGenerator: (context) => {
                // 'lesson' in this context is the curriculum object for English,
                // containing readingThemes, grammarPoints, writingTasks.
                const { lesson: curriculum, academicLevelName, trackName } = context;

                const readingThemesList = curriculum.readingThemes && curriculum.readingThemes.length > 0
                    ? curriculum.readingThemes.join('", "')
                    : "technology, environment, education, culture, citizenship"; // Fallback themes
                const grammarPointsList = curriculum.grammarPoints && curriculum.grammarPoints.length > 0
                    ? curriculum.grammarPoints.join('", "')
                    : "tenses, passive voice, reported speech, conditionals, modals, phrasal verbs, relative clauses"; // Fallback grammar
                const writingTasksList = curriculum.writingTasks && curriculum.writingTasks.length > 0
                    ? curriculum.writingTasks.map(t => t.type).join('", "') // Assuming writingTasks is an array of objects with a 'type' property
                    : "email, article, paragraph, story completion"; // Fallback writing tasks

                return `
You are an expert designer of the Moroccan National English Baccalaureate Exam for ${academicLevelName} - ${trackName}.
Your mission is to generate ONE complete, realistic, and coherent exam paper. The paper MUST have three distinct sections: Comprehension (15 points), Language (15 points), and Writing (10 points).
Integrate a variety of question formats as specified below.

**EXAM CONTENT AND STRUCTURE GUIDELINES:**

**I. COMPREHENSION (15 POINTS)**
    A.  **Reading Text:** Generate an original, engaging, and coherent reading passage (approximately 350-450 words). The text should be on ONE of the following general themes: "${readingThemesList}". It must be appropriate for the baccalaureate level, offering sufficient depth for varied comprehension questions.
    B.  **Comprehension Questions:** Create a comprehensive set of questions that assess different reading skills. Include:
        1.  **True/False with Justification (question_format: "true_false_justify"):** 2-3 statements. Students must justify their answer by quoting from the text.
        2.  **WH-Questions (question_format: "free_text"):** 2-3 questions requiring short textual answers based on explicit information.
        3.  **Word Reference (question_format: "free_text"):** 2 questions asking what underlined pronouns/words in the text refer to.
        4.  **Inferring Meaning/Main Idea (question_format: "free_text" or "mcq"):** 1-2 questions testing deeper understanding, e.g., "What is the author's main purpose in this paragraph?" or "Which of these titles best suits the passage?".

**II. LANGUAGE (15 POINTS)**
    Create a variety of language exercises covering a mix of grammar points from: "${grammarPointsList}". Ensure questions are contextualized and reflect national exam formats. Include:
        1.  **Gap-Filling (question_format: "free_text" or "gap_filling_multiple_choice"):** 1-2 exercises. For "gap_filling_multiple_choice", provide 3-4 options for each blank.
        2.  **Sentence Rewriting (question_format: "free_text"):** 1-2 exercises (e.g., active to passive, direct to reported speech, conditional transformation).
        3.  **Verb Tense/Form (question_format: "free_text"):** An exercise asking students to put verbs in brackets into the correct tense or form.
        4.  **Matching (question_format: "matching_pairs"):** 1 exercise, e.g., matching words with their definitions, or sentence beginnings with their endings, or functions with their exponents.
        5.  **Multiple Choice Grammar (question_format: "mcq"):** 1-2 questions testing specific grammar points with 3-4 options.

**III. WRITING (10 POINTS)**
    Create TWO distinct writing prompts. Students will choose ONE to answer. The prompts should be related to general themes suitable for baccalaureate students and cover types such as: "${writingTasksList}".
    Each prompt should clearly state the task, expected length (e.g., 120-150 words), and context (e.g., "Write an email to...", "Write an article for...").
    (question_format for writing prompts will be "free_text", but indicate they are "isWritingPrompt: true" in the JSON).

**STRICT JSON OUTPUT FORMAT:**
You MUST respond ONLY with a single, valid JSON object. No explanations or introductory text.
The structure must be EXACTLY as follows. Pay close attention to the "question_format" field for each sub-question.

\`\`\`json
{
  "problemTitle": "English National Exam Sample (${academicLevelName} - ${trackName})",
  "problemText": "[The full, original reading passage text (350-450 words) goes here. It should be well-structured with paragraphs.]",
  "problemLesson": "General English Proficiency Review", // Or a specific theme if the text is very focused
  "subQuestions": [
    // --- COMPREHENSION SECTION (15 pts) ---
    { "text": "A. COMPREHENSION (15 POINTS)", "question_format": "section_title", "points": 0, "difficultyOrder": 1 },
    {
      "text": "1. Are these statements TRUE or FALSE? JUSTIFY your answers from the text. (e.g., 4 pts)",
      "question_format": "instruction_group", // A header for a group of T/F questions
      "points": 0, "difficultyOrder": 2
    },
    {
      "text": "a. Statement one about the text.",
      "question_format": "true_false_justify",
      "correct_answer_details": {"is_true": true, "justification_quote": "Exact quote from the text."},
      "points": 2, "difficultyOrder": 3
    },
    {
      "text": "b. Statement two about the text.",
      "question_format": "true_false_justify",
      "correct_answer_details": {"is_true": false, "justification_quote": "Exact quote from the text proving it false."},
      "points": 2, "difficultyOrder": 4
    },
    {
      "text": "2. Answer the following questions from the text. (e.g., 5 pts)",
      "question_format": "instruction_group",
      "points": 0, "difficultyOrder": 5
    },
    {
      "text": "a. Why does the author mention [specific detail]?",
      "question_format": "free_text",
      "correct_answer": "Model answer based on the text.",
      "points": 2.5, "difficultyOrder": 6
    },
    // ... more comprehension questions ...
    {
      "text": "3. What do the underlined words in the text refer to? (e.g., 2 pts)",
      "question_format": "instruction_group",
      "points": 0, "difficultyOrder": 10
    },
    {
      "text": "a. 'they' (paragraph X) refers to: .........",
      "question_format": "free_text",
      "correct_answer": "The specific noun or phrase 'they' refers to.",
      "points": 1, "difficultyOrder": 11
    },

    // --- LANGUAGE SECTION (15 pts) ---
    { "text": "B. LANGUAGE (15 POINTS)", "question_format": "section_title", "points": 0, "difficultyOrder": 20 },
    {
      "text": "1. Fill in the blanks with the appropriate words/phrasal verbs from the list: (word1, word2, word3, word4). (e.g., 4 pts)",
      "question_format": "instruction_group",
      "points": 0, "difficultyOrder": 21
    },
    {
      "text": "a. She decided to ___ her studies after a long break.",
      "question_format": "gap_filling_multiple_choice", // Or simply "free_text" if no list is provided and AI should choose
      "blank_id": 1, // Optional, for clarity if there are multiple blanks in one sentence
      "options": ["take up", "take off", "take in"], // If multiple choice for the blank
      "correct_answer": "take up",
      "points": 2, "difficultyOrder": 22
    },
    {
      "text": "2. Match the words in Column A with their corresponding definitions in Column B. (e.g., 3 pts)",
      "question_format": "matching_pairs",
      "group_a_items": ["Sustainable", "Innovation", "Global"],
      "group_b_items": ["Affecting the entire world.", "A new idea, method, or device.", "Able to be maintained at a certain rate or level."],
      "correct_matches": [
        {"item_a": "Sustainable", "item_b": "Able to be maintained at a certain rate or level."},
        {"item_a": "Innovation", "item_b": "A new idea, method, or device."},
        {"item_a": "Global", "item_b": "Affecting the entire world."}
      ],
      "points": 3, "difficultyOrder": 25
    },
    // ... more language exercises ...

    // --- WRITING SECTION (10 pts) ---
    { "text": "C. WRITING (10 POINTS)", "question_format": "section_title", "points": 0, "difficultyOrder": 40 },
    {
      "text": "Choose ONE of the following topics and write about 120-150 words.",
      "question_format": "instruction_group",
      "points": 10, "difficultyOrder": 41 // Points apply to the chosen task
    },
    {
      "text": "Topic 1: Write an email to the editor of a local newspaper complaining about the lack of recycling facilities in your neighborhood. Suggest some solutions.",
      "question_format": "free_text", // All writing tasks are free_text
      "isWritingPrompt": true, // Special flag for the UI
      "points": 10, // Points are for the task itself
      "correct_answer": "Model answer guidance: Email format, clear statement of problem, specific examples, polite tone, feasible suggestions, appropriate language and structure.",
      "difficultyOrder": 42
    },
    {
      "text": "Topic 2: Some people argue that artificial intelligence will create more jobs than it eliminates. Write an article for your school blog expressing your opinion and providing reasons.",
      "question_format": "free_text",
      "isWritingPrompt": true,
      "points": 10,
      "correct_answer": "Model answer guidance: Article format, clear thesis statement, well-supported arguments (pro and/or con AI's impact on jobs), logical organization, appropriate vocabulary and tone.",
      "difficultyOrder": 43
    }
  ],
  "totalPoints": 40 // Sum of Comprehension (15) + Language (15) + Writing (10)
}
\`\`\`

FINAL INSTRUCTIONS:
- Ensure the total points for subQuestions in Comprehension sum to 15, Language to 15, and Writing to 10. The overall "totalPoints" in the main JSON should be 40.
- For "true_false_justify", the "correct_answer_details" should contain an "is_true" (boolean) and "justification_quote" (string).
- For "matching_pairs", "group_a_items" and "group_b_items" are arrays of strings. "correct_matches" is an array of objects like {"item_a": "...", "item_b": "..."}.
- For "gap_filling_multiple_choice", if used, provide "options" (array of strings) and "correct_answer" (string) for each blank.
- Double-check your entire output to ensure it is a single, perfectly formatted JSON object.
- The reading passage must be original and well-written.
- All question text and model answers should be in clear, grammatically correct English.
`;
            },
        },
    ],

    finalAggregator: (context, allStepsOutputs) => {
        // This aggregator is called after the single step 'generate_full_english_exam_paper'
        const examData = allStepsOutputs.generate_full_english_exam_paper;

        if (!examData || !examData.problemText || !Array.isArray(examData.subQuestions) || typeof examData.totalPoints !== 'number') {
            console.error("[ENGLISH_EXAM_AGGREGATOR_ERROR] AI failed to generate a valid exam structure:", examData);
            throw new Error("The AI failed to generate a valid or complete English exam structure.");
        }

        // Basic validation for points (more detailed validation could be added)
        let comprehensionPoints = 0;
        let languagePoints = 0;
        let writingPoints = 0;
        let currentSection = "";

        examData.subQuestions.forEach(sq => {
            if (sq.question_format === "section_title") {
                if (sq.text.includes("COMPREHENSION")) currentSection = "comprehension";
                else if (sq.text.includes("LANGUAGE")) currentSection = "language";
                else if (sq.text.includes("WRITING")) currentSection = "writing";
            } else if (sq.question_format !== "instruction_group") { // Don't count points for instruction groups
                const points = Number(sq.points);
                if (!isNaN(points) && points > 0) {
                    if (currentSection === "comprehension") comprehensionPoints += points;
                    else if (currentSection === "language") languagePoints += points;
                    else if (currentSection === "writing" && sq.isWritingPrompt) {
                        // For writing, only one prompt is chosen, so we expect the point value on the prompt itself.
                        // The aggregator just sums up one of them. For simplicity, we assume the AI gives 10 to each.
                        // The actual score is 10 for the section.
                    }
                }
            }
             // Ensure question_format exists for all actual questions
            if (sq.question_format !== "section_title" && sq.question_format !== "instruction_group" && !sq.question_format) {
                console.warn(`[ENGLISH_EXAM_AGGREGATOR_WARN] SubQuestion "${sq.text.substring(0,30)}..." missing 'question_format'. Defaulting to 'free_text'.`);
                sq.question_format = 'free_text';
            }
        });
        
        // Writing section is typically 10 points for the chosen task.
        // The AI structure has points on each prompt, which is fine for display.
        // The totalPoints should be 40.
        
        comprehensionPoints = Math.round(comprehensionPoints * 100) / 100;
        languagePoints = Math.round(languagePoints * 100) / 100;
        // Writing points is fixed at 10 for the section.

        if (Math.abs(comprehensionPoints - 15) > 0.1) {
            console.warn(`[ENGLISH_EXAM_AGGREGATOR_WARN] Comprehension points sum to ${comprehensionPoints}, expected 15.`);
        }
        if (Math.abs(languagePoints - 15) > 0.1) {
            console.warn(`[ENGLISH_EXAM_AGGREGATOR_WARN] Language points sum to ${languagePoints}, expected 15.`);
        }
        // totalPoints should be 40. The AI is asked to ensure this.

        return examData; // Return the full structure as generated by the AI
    }
};