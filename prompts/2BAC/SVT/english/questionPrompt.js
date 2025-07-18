function generatePracticeQuestionPrompt(context) {
    const {
        difficultyLevelApi,
        selectedLessonTitre, // This will be the grammar point or vocabulary theme
        selectedParagraphTexte, // Detailed context for the question
        questionTypeToGenerate,
        selectedTaskFlavor,
        lessonForJsonOutput
    } = context;

    const languageInstruction = "The question, options, and answer MUST BE ENTIRELY in clear, grammatically correct English suitable for a baccalaureate level.";

    const promptExpertise = `an expert in creating English language questions for the Moroccan baccalaureate exam.`;

    let examStyleGuidance = `
The generated question must strictly follow the style of the Moroccan National Exam. It should test a specific language point from the curriculum.
The question should be based on the provided "Topic" and "Specific Content".
The difficulty should be appropriate for a student preparing for their final exams.`;

    if (difficultyLevelApi === "Difficile") {
        examStyleGuidance += " This question should be challenging, requiring a nuanced understanding of the language point (e.g., using it in a complex sentence or distinguishing it from a similar structure).";
    } else if (difficultyLevelApi === "Moyen") {
        examStyleGuidance += " This question should be a standard application of the rule, similar to what's found in a typical exam 'Language' section.";
    } else { // Facile
        examStyleGudance += " This question should be a direct, straightforward test of the language point.";
    }

    const topicContextBlock = `
ACADEMIC_CONTEXT:
- Topic: "${selectedLessonTitre}" 
- Specific Content for Question: "${selectedParagraphTexte}"
- Language: "en"`;

    let outputFormatInstructions;
    if (questionTypeToGenerate === "mcq") {
        outputFormatInstructions = `
STRICT JSON OUTPUT FORMAT (MCQ):
1. ${languageInstruction}
2. Task Objective: "${selectedTaskFlavor.description}".
3. Format: An MCQ with exactly 4 distinct, plausible options. Only one is correct.
4. Distractors: The incorrect options should represent common student errors.
5. "lesson" field: Use the provided topic: "${lessonForJsonOutput}".
6. "type" field: Must be "mcq".
Respond ONLY with a single, valid JSON object, enclosed in \`\`\`json ... \`\`\`.
\`\`\`json
{
  "question": "Choose the correct form to complete the sentence: If I had known you were coming, I ... a cake.",
  "options": ["would bake", "will bake", "would have baked", "baked"],
  "correctAnswer": "would have baked",
  "lesson": "${lessonForJsonOutput}",
  "type": "mcq"
}
\`\`\`
`;
    } else { // free_text (e.g., gap-fill, sentence transformation)
        outputFormatInstructions = `
STRICT JSON OUTPUT FORMAT (Free Text Question):
1. ${languageInstruction}
2. Task Objective: "${selectedTaskFlavor.description}".
3. Nature: Must require a short textual answer (filling a gap, rewriting a sentence, etc.).
4. "options" field: MUST be an empty array [].
5. "correctAnswer" field: Provide the exact expected answer.
6. "lesson" field: "${lessonForJsonOutput}".
7. "type" field: "free_text".
Respond ONLY with a single, valid JSON object, enclosed in \`\`\`json ... \`\`\`.
\`\`\`json
{
  "question": "Rewrite the following sentence in the passive voice: 'The students wrote excellent essays.'",
  "options": [],
  "correctAnswer": "Excellent essays were written by the students.",
  "lesson": "${lessonForJsonOutput}",
  "type": "free_text"
}
\`\`\`
`;
    }

    return `
You are ${promptExpertise}.
Your mission is to generate a single, high-quality question for student practice.

EXAM STYLE GUIDANCE:
${examStyleGuidance}

QUESTION GENERATION TASK:
- Task Flavor ID: ${selectedTaskFlavor.id}
${topicContextBlock}

${outputFormatInstructions}

FINAL INSTRUCTION: Review the generated JSON to ensure it is valid and all text is in English. The question must be directly related to the "Specific Content".
`;
}

module.exports = {
    generatePracticeQuestionPrompt
};