// back-end/prompts/1BAC/SX-SM/1BAC_SX-SM_edu_islamic/questionPrompt_1BAC_SX-SM_edu_islamic.js

function generatePracticeQuestionPrompt(context) {
    const {
        academicLevelName,
        trackName,
        subjectName, // "التربية الإسلامية" أو "1BAC_SX-SM_edu_islamic"
        difficultyLevelApi,
        selectedLessonTitre, // عنوان الدرس المختار (مثلاً: "الإيمان والغيب"، "فقه الأسرة: الزواج")
        selectedParagraphTexte, // تفاصيل إضافية (مفهوم، حكم، دليل شرعي، إلخ)
        questionLanguage,  // "ar"
        questionTypeToGenerate, // "mcq" أو "free_text"
        selectedTaskFlavor,
        lessonForJsonOutput 
    } = context;

    const languageInstruction = "السؤال وجميع أجزائه (النص، الخيارات، الإجابة الصحيحة إن وجدت) يجب أن تكون حصريًا باللغة العربية الفصحى، مع مراعاة الدقة في استخدام المصطلحات الشرعية.";

    const promptExpertise = `خبير في إعداد أسئلة مادة التربية الإسلامية للمستوى الثانوي التأهيلي (الأولى باكالوريا - ${trackName}) وفق الإطار المرجعي المغربي للامتحانات.`;

    let examStyleGuidance = `
السؤال المُنشأ يجب أن يحاكي أسلوب أسئلة الامتحانات الجهوية لمادة التربية الإسلامية، ويركز على تقييم:
- فهم واستيعاب المفاهيم الشرعية والقيم الإسلامية.
- القدرة على استنباط الأحكام والدروس من النصوص الشرعية (قرآن وسنة).
- مهارة التحليل والربط بين مختلف محاور الدروس.
- القدرة على التعبير عن المواقف بأسلوب واضح ومدعم بالحجج الشرعية.
يجب أن يكون السؤال مبنيًا على "الدرس المحدد" و "المحتوى التفصيلي" المقدم.
`;

    if (difficultyLevelApi === "Difficile") {
        examStyleGuidance += "هذا السؤال يجب أن يكون مركبًا، يتطلب ربطًا بين عدة مفاهيم أو استدلالاً دقيقًا أو تحليل موقف معقد.";
    } else if (difficultyLevelApi === "Moyen") {
        examStyleGuidance += "هذا السؤال يجب أن يتطلب فهمًا جيدًا للدرس والقدرة على تطبيق المعرفة في سياقات مشابهة لما يرد في الامتحانات.";
    } else { // Facile
        examStyleGuidance += "هذا السؤال يجب أن يختبر المعرفة المباشرة بالتعريفات أو الأحكام أو المضامين الأساسية للدرس.";
    }

    let contextForPrompt = typeof selectedParagraphTexte === 'string' ? selectedParagraphTexte : JSON.stringify(selectedParagraphTexte);
    const MAX_CONTEXT_LENGTH = 1200;
    if (contextForPrompt.length > MAX_CONTEXT_LENGTH) {
        contextForPrompt = contextForPrompt.substring(0, MAX_CONTEXT_LENGTH) + "... (تم اقتطاع المحتوى)";
    }

    const topicContextBlock = `
السياق_الأكاديمي:
- المستوى: "${academicLevelName}"
- المسلك: "${trackName}"
- المادة: "${subjectName}"
- الدرس_المحدد_للسؤال / المحور: "${selectedLessonTitre}" 
- المحتوى_التفصيلي_للسؤال / المفهوم_الفرعي / الدليل_الشرعي: "${contextForPrompt}"
- لغة_السؤال: "${questionLanguage}"`;

    let outputFormatInstructions;
    if (questionTypeToGenerate === "mcq") {
        outputFormatInstructions = `
صيغة_الإخراج_JSON_الدقيقة (سؤال متعدد الاختيارات QCM):
1.  ${languageInstruction}
2.  الهدف من المهمة: "${selectedTaskFlavor.description}". أنشئ سؤالاً يعكس هذا الهدف في سياق التربية الإسلامية.
3.  الصيغة: سؤال QCM مع 3 أو 4 خيارات مميزة. أحد الخيارات صحيح بشكل قاطع.
4.  الإجابة_الصحيحة: حقل "correctAnswer" يجب أن يكون مطابقًا تمامًا لنص الخيار الصحيح.
5.  المشتتات: يجب أن تكون ذات صلة بالموضوع وتبدو معقولة للطالب.
6.  نص_السؤال: يجب أن يكون واضحًا ودقيقًا. قد يتضمن آية قرآنية قصيرة، حديثًا نبويًا، أو موقفًا يتعلق بالدرس.
7.  حقل "lesson": "${lessonForJsonOutput}".
8.  حقل "type": "mcq".
أجب فقط بكائن JSON واحد صالح، مُضمَّن في \`\`\`json ... \`\`\`.
\`\`\`json
{
  "question": "نص سؤال QCM في التربية الإسلامية هنا...",
  "options": ["الخيار أ", "الخيار ب", "الخيار ج", "الخيار د (اختياري)"],
  "correctAnswer": "النص الدقيق للخيار الصحيح",
  "lesson": "${lessonForJsonOutput}",
  "type": "mcq"
}
\`\`\`
`;
    } else { // free_text
        outputFormatInstructions = `
صيغة_الإخراج_JSON_الدقيقة (سؤال مفتوح الإجابة):
1.  ${languageInstruction}
2.  الهدف من المهمة: "${selectedTaskFlavor.description}". أنشئ سؤالاً يعكس هذا الهدف في سياق التربية الإسلامية.
3.  طبيعة_السؤال: يتطلب إجابة نصية (شرح مفهوم، استنباط حكم، ذكر دليل، تحديد موقف مع التعليل).
4.  حقل "options": يجب أن يكون مصفوفة فارغة [].
5.  حقل "correctAnswer": قدم إجابة نموذجية مركزة ودقيقة، أو العناصر الأساسية للإجابة.
6.  نص_السؤال: يجب أن يكون واضحًا ومباشرًا. قد يبدأ بوضعية مشكلة قصيرة أو نص شرعي قصير.
7.  حقل "lesson": "${lessonForJsonOutput}".
8.  حقل "type": "free_text".
أجب فقط بكائن JSON واحد صالح، مُضمَّن في \`\`\`json ... \`\`\`.
\`\`\`json
{
  "question": "نص السؤال المفتوح في التربية الإسلامية هنا...",
  "options": [],
  "correctAnswer": "إجابة نموذجية أو العناصر الأساسية المتوقعة.",
  "lesson": "${lessonForJsonOutput}",
  "type": "free_text"
}
\`\`\`
`;
    }

    const finalPrompt = `
أنت ${promptExpertise}.
مهمتك هي إنشاء سؤال واحد عالي الجودة، مناسب لتدريب التلاميذ وتقييمهم.

إرشادات_أسلوب_الامتحان_الجهوي:
${examStyleGuidance}

مهمة_إنشاء_السؤال:
- نكهة المهمة (ID): ${selectedTaskFlavor.id} (نوع المخرج المستهدف: ${selectedTaskFlavor.type})

${topicContextBlock}

${outputFormatInstructions}

تعليمات_نهائية: تأكد من صحة JSON والتزامه بجميع التعليمات. يجب أن يكون السؤال واضحًا ومناسبًا للمستوى المحدد.
`;
    return finalPrompt;
}

module.exports = {
    generatePracticeQuestionPrompt
};