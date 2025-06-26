// exam-curriculum-data/2BAC/english.js (أو مسار محدد للشعبة إذا اختلف المحتوى)
// الغرض: توفير هيكل ومواضيع عامة لامتحان اللغة الإنجليزية للسنة الثانية بكالوريا

module.exports = {
  // يمكن استخدام هذا الاسم في عنوان الامتحان إذا أردت
  examTitleContext: "English National Baccalaureate Exam Structure",

  readingThemes: [
    "Cultural values and issues",
    "Citizenship and civic education",
    "Science, technology, and innovation",
    "The environment and sustainable development",
    "Humor and its forms",
    "The generation gap",
    "Media and communication",
    "Education and Learning",
    "Women and Power",
    "Health and Well-being",
    "Work and Careers"
  ],
  grammarPoints: [
    // يمكن تجميعها أو تركها مفصلة كما هي، البرومبت سيختار منها
    "Tenses (Present Perfect, Past Perfect, Future Perfect, Conditionals)",
    "Modals (obligation, advice, possibility, deduction, ability, permission)",
    "Passive Voice (all tenses, impersonal passive)",
    "Reported Speech (statements, questions, commands, requests)",
    "Relative Clauses (defining and non-defining, prepositions)",
    "Gerunds and Infinitives (after verbs, adjectives, purpose, with meaning change)",
    "Linking words and Connectors (contrast, cause/effect, purpose, addition, sequencing)",
    "Phrasal Verbs (common ones, transitive/intransitive, separable/inseparable)",
    "Wishes and Regrets (present, future, past)",
    "Comparatives and Superlatives (advanced forms, intensifiers)",
    "Articles (a/an, the, zero article - advanced usage)"
  ],
  writingTaskTypes: [
    // البرومبت سيختار نوعين من هذه ويولد مهام كتابة لها
    { type: "Email", baseDescription: "Write an email (e.g., responding, informing, requesting, complaining, applying)." },
    { type: "Article", baseDescription: "Write a short article for a school magazine or a blog (e.g., opinion, descriptive, informative)." },
    { type: "Story", baseDescription: "Write or complete a short story (e.g., based on a prompt, picture, or given opening/ending)." },
    { type: "Review", baseDescription: "Write a review (e.g., of a book, film, event, product)." },
    { type: "Report", baseDescription: "Write a short report (e.g., on an event, a survey, a problem)." },
    { type: "Formal Letter", baseDescription: "Write a formal letter (e.g., application, complaint, inquiry)." }
  ],
  examStructureDetails: { // هذا للاسترشاد به عند بناء البرومبت أو لـ Gemini
    comprehension: { points: 15, typicalWordCount: "300-400 words" },
    language: { points: 15, typicalExerciseTypes: ["gap-filling", "multiple choice", "sentence rewriting", "matching", "word formation"] },
    writing: { points: 10, typicalWordCountPerTask: "around 120-150 words", numberOfPromptsToGenerate: 2, studentChooses: 1 }
  },
  // للتحقق من أن هذا الملف هو الذي يتم تحميله
  fileMarker: "EXAM_STRUCTURE_ENGLISH_2BAC_V2"
};