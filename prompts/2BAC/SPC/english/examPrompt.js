// prompts/2BAC/[SM or SVT]/english/examPrompt.js

// دالة مساعدة لاختيار عناصر عشوائية من مصفوفة بدون تكرار
function getRandomSubarray(arr, size) {
    if (!arr || arr.length === 0) return [];
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(size, shuffled.length));
}

module.exports = {
    examConfig: {
        numberOfProblems: 1, 
        timeLimitMinutes: 120,
    },
    type: 'multi-step',
    defaultModelType: 'gemini-1.5-flash-latest', 
    defaultGenerationConfig: { 
        temperature: 0.65,
        maxOutputTokens: 8000,
    },

    steps: [
        {
            name: 'generate_full_english_exam_v2',
            description: 'Generates a complete, three-part English national exam with specific structure.',
            promptGenerator: (context) => {
                // ... (لا تغيير في هذا الجزء، يبقى كما هو)
                const { lesson: examStructureData, academicLevelName, trackName } = context; 
                const selectedReadingTheme = getRandomSubarray(examStructureData.readingThemes, 1)[0] || "a general interest topic";
                const selectedGrammarPoints = getRandomSubarray(examStructureData.grammarPoints, 4); 
                const grammarFocusString = selectedGrammarPoints.length > 0 ? selectedGrammarPoints.join('; ') : "a mix of common grammar points";
                const selectedWritingTaskType = getRandomSubarray(examStructureData.writingTaskTypes, 1)[0];
                const writingPromptInstruction = `The prompt must be an example of a(n) '${selectedWritingTaskType.type}' task. It should follow this base description: "${selectedWritingTaskType.baseDescription}".`;
                const details = examStructureData.examStructureDetails || {};
                const compPoints = details.comprehension?.points || 15;
                const langPoints = details.language?.points || 15;
                const writingPointsTotal = details.writing?.points || 10;
                const readingWordCount = details.comprehension?.typicalWordCount || "350-450 words"; 
                const writingWordCount = details.writing?.typicalWordCountPerTask || "80-120 words";

                return `
You are an expert designer of the Moroccan National English Baccalaureate Exam for ${academicLevelName}, ${trackName} stream.
Your mission is to generate ONE complete exam paper following the structure below.

**EXAM CONTENT REQUIREMENTS:**
1.  **Reading Comprehension (${compPoints} pts):**
    *   Generate a compelling reading passage of **${readingWordCount}** on the topic: **"${selectedReadingTheme}"**.
    *   Create a full set of comprehension questions (true/false, WH-questions, vocabulary, references).
    *   Each sub-question MUST have a unique 'difficultyOrder'.

2.  **Language (${langPoints} pts):**
    *   Create exercises covering: **${grammarFocusString}**.
    *   Each sub-question MUST have a unique 'difficultyOrder', continuing from the previous section.

3.  **Writing (${writingPointsTotal} pts):**
    *   Generate **ONE single writing prompt** based on: **${writingPromptInstruction}**
    *   The prompt must ask for **${writingWordCount}** words.
    *   It must be a single sub-question with 'isWritingPrompt': true and a unique 'difficultyOrder'.

**STRICT JSON OUTPUT FORMAT:**
You MUST respond ONLY with a single, valid JSON object.
\`\`\`json
{
  "problemTitle": "English National Exam - Sample...",
  "readingPassage": "The full reading passage text goes here...",
  "examItems": [
    {
      "itemType": "title",
      "text": "A. COMPREHENSION (${compPoints} POINTS)"
    },
    {
      "itemType": "instruction",
      "text": "1. Are these statements true or false? Justify."
    },
    {
      "itemType": "question",
      "text": "a. Statement example one.",
      "points": 2,
      "difficultyOrder": 3,
      "answer": "False. Justification: '...'"
    },
    {
      "itemType": "title",
      "text": "B. LANGUAGE (${langPoints} POINTS)"
    },
    {
      "itemType": "question",
      "text": "1. Fill in the blank: ...",
      "points": 1.5,
      "difficultyOrder": 17,
      "answer": "studied"
    },
    {
      "itemType": "title",
      "text": "C. WRITING (${writingPointsTotal} POINTS)"
    },
    {
      "itemType": "question",
      "text": "[Generated Writing Prompt Text...]",
      "isWritingPrompt": true,
      "points": ${writingPointsTotal},
      "difficultyOrder": 31,
      "answer": "Model answer guidelines..."
    }
  ],
  "totalPoints": ${compPoints + langPoints + writingPointsTotal}
}
\`\`\`
CRITICAL: Ensure 'difficultyOrder' is sequential and unique for all questions across all sections.
`;
            },
        },
    ],

    // [MODIFIED] This is the most important change.
    // It transforms the AI's flat output into the structured `problemItems` format.
    finalAggregator: (context, allStepsOutputs) => {
        const aiOutput = allStepsOutputs.generate_full_english_exam_v2;

        if (!aiOutput || !aiOutput.readingPassage || !Array.isArray(aiOutput.examItems)) {
            console.error("[ENGLISH_EXAM_AGGREGATOR_ERROR] The AI returned an invalid structure:", aiOutput);
            throw new Error("The AI failed to generate a valid exam structure (missing readingPassage or examItems).");
        }
        
        const problemItems = [];

        // 1. Add the reading passage as the first content item.
        problemItems.push({
            itemType: 'content',
            contentType: 'paragraph', // We'll treat the main text as a paragraph
            text: aiOutput.readingPassage,
        });

        // 2. Process the list of titles, instructions, and questions.
        aiOutput.examItems.forEach(item => {
            if (item.itemType === 'title' || item.itemType === 'instruction') {
                problemItems.push({
                    itemType: 'content',
                    // Use a more specific contentType
                    contentType: item.itemType === 'title' ? 'subheading' : 'instruction',
                    text: item.text,
                });
            } else if (item.itemType === 'question') {
                problemItems.push({
                    itemType: 'question',
                    text: item.text,
                    points: item.points || 0,
                    orderInProblem: item.difficultyOrder, // Use difficultyOrder as the unique ID
                    questionType: item.question_format || (item.isWritingPrompt ? 'free_text' : 'free_text'), // Default to free_text
                    correctAnswer: item.answer || "No model answer provided.",
                    // Add other fields if your AI prompt generates them
                    options: item.options || [],
                });
            }
        });

        // Calculate total points from the generated items
        const calculatedTotalPoints = problemItems.reduce((sum, item) => {
            if (item.itemType === 'question' && typeof item.points === 'number') {
                return sum + item.points;
            }
            return sum;
        }, 0);

        return {
            problemTitle: aiOutput.problemTitle || "Generated English Exam",
            problemItems: problemItems, // The new structured format
            totalPoints: Math.round(calculatedTotalPoints * 100) / 100,
            // The old fields are no longer needed
            // text: undefined,
            // subQuestions: undefined,
        };
    }
};