// prompts/2BAC/[SM, SPC, or SVT]/english/examPrompt.js

// This prompt module is self-contained and does not need external helpers.

module.exports = {
    examConfig: {
        numberOfProblems: 1, // The entire English exam is generated as a single "problem"
        timeLimitMinutes: 120,
    },

    type: 'multi-step',
    defaultGenerationConfig: { temperature: 0.6, maxOutputTokens: 8192 },
    defaultModelType: 'gemini-1.5-pro-latest', // Use a more powerful model for this complex task

    steps: [
        {
            name: 'generate_full_exam',
            description: 'Generates a complete, three-part English national exam.',
            promptGenerator: (context) => {
                const { lesson: curriculum } = context; // 'lesson' here is the entire curriculum object

                const readingThemes = curriculum.readingThemes.join(', ');
                const grammarPoints = curriculum.grammarPoints.join(', ');
                const writingTasks = curriculum.writingTasks.map(t => t.type).join(', ');

                return `
You are an expert designer of the Moroccan National English Baccalaureate Exam.
Your mission is to generate ONE complete, realistic, and coherent exam paper. The paper must have three distinct sections: Comprehension, Language, and Writing, with the standard point distribution (15, 15, 10).

**EXAM CONTENT GUIDELINES:**
1.  **Reading Comprehension (15 pts):**
    *   Generate a compelling and original reading text (around 300-400 words) on ONE of these themes: **${readingThemes}**. The text should be engaging and appropriate for a baccalaureate level.
    *   Create a full set of comprehension questions that test for both explicit and implicit understanding (e.g., ticking true/false with justification, answering WH-questions, finding word references, inferring meaning).
2.  **Language (15 pts):**
    *   Create a variety of language exercises (e.g., gap-filling, multiple choice, sentence rewriting, matching) that cover a good mix of the following grammar points: **${grammarPoints}**.
    *   Ensure the exercises are varied and reflect the format of the national exam.
3.  **Writing (10 pts):**
    *   Create TWO distinct writing prompts. The student will be asked to choose ONE.
    *   The prompts should be of these types: **${writingTasks}**. They must be clear, well-defined, and related to the general themes of the curriculum.

**STRICT JSON OUTPUT FORMAT:**
You MUST respond ONLY with a single, valid JSON object. No explanations or introductory text. The entire response must be a JSON object starting with \`{\` and ending with \`}\`.
The structure must be EXACTLY as follows:

\`\`\`json
{
  "problemTitle": "English National Exam (Sample)",
  "text": "The full reading passage text goes here. It should be a coherent and well-written text of 300-400 words.",
  "subQuestions": [
    {
      "text": "A. COMPREHENSION (15 POINTS)",
      "isTitle": true,
      "points": 0
    },
    {
      "text": "1. Are these statements true or false? Justify. (3 pts)",
      "isInstruction": true,
      "points": 0
    },
    {
      "text": "a. The author believes technology is the only solution to unemployment.",
      "points": 1.5,
      "answer": "False. Justification: '...technology alone cannot solve this complex issue; it requires a multi-faceted approach including education reform...'"
    },
    {
      "text": "b. The text suggests that creativity is becoming less important in the job market.",
      "points": 1.5,
      "answer": "False. Justification: '...on the contrary, creativity and critical thinking are now more valuable than ever...'"
    },
    {
      "text": "2. Answer these questions from the text. (4 pts)",
      "isInstruction": true,
      "points": 0
    },
    {
      "text": "a. According to the text, what are two main challenges young graduates face?",
      "points": 2,
      "answer": "Two challenges are the skills gap and the high level of competition for a limited number of jobs."
    },
    {
      "text": "3. What do the underlined words in the text refer to? (2 pts)",
      "isInstruction": true,
      "points": 0
    },
    {
      "text": "a. 'it' (paragraph 2) refers to:",
      "points": 1,
      "answer": "technology / the rapid advancement of technology"
    },
    {
      "text": "B. LANGUAGE (15 POINTS)",
      "isTitle": true,
      "points": 0
    },
    {
      "text": "1. Fill in the gaps with the correct phrasal verb from the list: turn down, look up, get on with, take up. (4 pts)",
      "isInstruction": true,
      "points": 0
    },
    {
      "text": "a. If you don't know a word, you should ... it ... in a dictionary.",
      "points": 2,
      "answer": "look it up"
    },
    {
      "text": "2. Rewrite the sentences beginning with the words given. (3 pts)",
      "isInstruction": true,
      "points": 0
    },
    {
      "text": "a. The government has implemented a new policy. -> A new policy ...",
      "points": 1.5,
      "answer": "A new policy has been implemented by the government."
    },
    {
      "text": "C. WRITING (10 POINTS)",
      "isTitle": true,
      "points": 0
    },
    {
      "text": "Choose ONE of the following topics. (120 words)",
      "isInstruction": true,
      "points": 10
    },
    {
      "text": "Topic 1: Write an email to your friend telling them about a cultural event you recently attended. Describe the event and explain why you enjoyed it.",
      "isWritingPrompt": true,
      "points": 10
    },
    {
      "text": "Topic 2: Some people believe that the internet has had a negative impact on young people's social skills. Write an article for your school magazine giving your opinion on this issue.",
      "isWritingPrompt": true,
      "points": 10
    }
  ],
  "totalPoints": 40,
  "lesson": "General English Proficiency"
}
\`\`\`

FINAL INSTRUCTION: Double-check your entire output to ensure it is a single, perfectly formatted JSON object.
`;
            },
        },
    ],

    finalAggregator: (context, allStepsOutputs) => {
        const examData = allStepsOutputs.generate_full_exam;

        if (!examData || !examData.text || !Array.isArray(examData.subQuestions)) {
            throw new Error("The AI failed to generate a valid exam structure.");
        }
        
        // Add model answers for writing prompts for review purposes
        examData.subQuestions.forEach(sq => {
            if (sq.isWritingPrompt && !sq.answer) {
                sq.answer = "Model answer would include: appropriate format (email/article), clear main ideas, supporting details, correct grammar and vocabulary, and adherence to the word count.";
            }
        });

        return examData;
    }
};