// back-end/prompts/1BAC/SX-SM/1BAC_SX-SM_geo_history/questionPrompt_1BAC_SX-SM_geo_history.js

function generatePracticeQuestionPrompt(context) {
    const {
        academicLevelName,
        trackName,
        subjectName,       // "التاريخ والجغرافيا" أو "1BAC_SX-SM_geo_history"
        difficultyLevelApi,
        selectedLessonTitre, // عنوان درس/وحدة في التاريخ أو الجغرافيا
        selectedParagraphTexte, // تفاصيل (مفهوم، حدث، ظاهرة جغرافية)
        questionLanguage,  // "ar"
        questionTypeToGenerate,
        selectedTaskFlavor,
        lessonForJsonOutput 
    } = context;

    const languageInstruction = "السؤال وجميع أجزائه يجب أن تكون باللغة العربية الفصحى، مع استخدام دقيق للمصطلحات التاريخية والجغرافية.";
    const promptExpertise = `خبير في صياغة أسئلة مادة التاريخ والجغرافيا لمستوى الأولى باكالوريا (${trackName}) وفق المنهاج المغربي.`;

    let examStyleGuidance = `
السؤال يجب أن يحاكي أسلوب أسئلة الامتحانات الجهوية في التاريخ أو الجغرافيا، ويركز على:
- فهم المصطلحات والمفاهيم والأحداث والظواهر.
- القدرة على تحليل الوثائق (إذا كان السؤال يتضمن وثيقة افتراضية).
- مهارة تحديد السياق التاريخي أو الجغرافي.
- القدرة على المقارنة والاستنتاج وصياغة الأفكار بشكل منظم.
يجب أن يكون السؤال مبنيًا على "الدرس المحدد" و "المحتوى التفصيلي".
`;

    if (difficultyLevelApi === "Difficile") {
        examStyleGuidance += "هذا السؤال يتطلب تحليلًا أعمق، أو ربطًا بين معطيات متعددة، أو تقييمًا نقديًا لموقف أو حدث.";
    } else if (difficultyLevelApi === "Moyen") {
        examStyleGuidance += "هذا السؤال يتطلب فهمًا جيدًا للمادة والقدرة على توظيف المعارف في سياقات مشابهة لأسئلة الامتحان.";
    } else { // Facile
        examStyleGuidance += "هذا السؤال يختبر المعرفة المباشرة بالتواريخ، التعريفات، أو الخصائص الأساسية لظاهرة ما.";
    }

    let contextForPrompt = typeof selectedParagraphTexte === 'string' ? selectedParagraphTexte : JSON.stringify(selectedParagraphTexte);
    const MAX_CONTEXT_LENGTH = 1200;
    if (contextForPrompt.length > MAX_CONTEXT_LENGTH) {
        contextForPrompt = contextForPrompt.substring(0, MAX_CONTEXT_LENGTH) + "...";
    }

    const topicContextBlock = `
السياق_الأكاديمي:
- المستوى: "${academicLevelName}"
- المسلك: "${trackName}"
- المادة: "${subjectName}"
- الدرس_المحدد / الوحدة: "${selectedLessonTitre}" 
- المحتوى_التفصيلي / المفهوم_الفرعي: "${contextForPrompt}"
- لغة_السؤال: "${questionLanguage}"`;

    let outputFormatInstructions;
    if (questionTypeToGenerate === "mcq") {
        outputFormatInstructions = `
صيغة_الإخراج_JSON_الدقيقة (QCM):
1.  ${languageInstruction}
2.  الهدف: "${selectedTaskFlavor.description}".
3.  الصيغة: QCM بـ 3 أو 4 خيارات.
4.  الإجابة_الصحيحة: حقل "correctAnswer" مطابق لأحد الخيارات.
5.  نص_السؤال: واضح ودقيق، قد يستند إلى معلومة تاريخية أو جغرافية محددة.
6.  حقل "lesson": "${lessonForJsonOutput}".
7.  حقل "type": "mcq".
أجب فقط بكائن JSON:
\`\`\`json
{
  "question": "نص سؤال QCM في التاريخ أو الجغرافيا...",
  "options": ["خيار أ", "خيار ب", "خيار ج", "خيار د (اختياري)"],
  "correctAnswer": "نص الخيار الصحيح",
  "lesson": "${lessonForJsonOutput}",
  "type": "mcq"
}
\`\`\`
`;
    } else { // free_text
        outputFormatInstructions = `
صيغة_الإخراج_JSON_الدقيقة (سؤال مفتوح):
1.  ${languageInstruction}
2.  الهدف: "${selectedTaskFlavor.description}".
3.  طبيعة_السؤال: يتطلب شرح مصطلح، تحديد سياق، استخلاص فكرة، مقارنة، أو تعليل.
4.  حقل "options": [].
5.  حقل "correctAnswer": إجابة نموذجية مركزة.
6.  نص_السؤال: واضح. قد يتضمن إشارة إلى وثيقة افتراضية أو حدث/ظاهرة معينة.
7.  حقل "lesson": "${lessonForJsonOutput}".
8.  حقل "type": "free_text".
أجب فقط بكائن JSON:
\`\`\`json
{
  "question": "نص السؤال المفتوح في التاريخ أو الجغرافيا...",
  "options": [],
  "correctAnswer": "إجابة نموذجية أو العناصر الأساسية.",
  "lesson": "${lessonForJsonOutput}",
  "type": "free_text"
}
\`\`\`
`;
    }

    const finalPrompt = `
أنت ${promptExpertise}.
مهمتك إنشاء سؤال واحد عالي الجودة.

إرشادات_أسلوب_الامتحان:
${examStyleGuidance}

مهمة_إنشاء_السؤال:
- نكهة المهمة: ${selectedTaskFlavor.id} (النوع: ${selectedTaskFlavor.type})

${topicContextBlock}

${outputFormatInstructions}

تعليمات_نهائية: راجع JSON للتأكد من صحته والتزامه بالتعليمات.
`;
    return finalPrompt;
}

module.exports = {
    generatePracticeQuestionPrompt
};