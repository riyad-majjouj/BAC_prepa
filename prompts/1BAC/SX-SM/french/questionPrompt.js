// back-end/prompts/1BAC/SX-SM/1BAC_SX-SM_frensh/questionPrompt_1BAC_SX-SM_frensh.js

// هذه الدالة ستعيد نص البرومبت الذي سيستخدمه Gemini
// تأخذ 'context' كمدخل، وهو الكائن الذي بنيناه في generateAIQuestion
function generatePracticeQuestionPrompt(context) {
    const {
        academicLevelName, // "1BAC"
        trackName,         // "SX-SM"
        subjectName,       // "Français" أو "1BAC_SX-SM_frensh" (الاسم المعروض)
        difficultyLevelApi,// "Facile", "Moyen", "Difficile"
        selectedLessonTitre, // عنوان الدرس المختار
        selectedParagraphTexte, // محتوى الفقرة/الموضوع الفرعي المفصل
        questionLanguage,  // "fr" في هذه الحالة
        questionTypeToGenerate, // "mcq" أو "free_text"
        selectedTaskFlavor, // الكائن الذي يصف نكهة المهمة
        lessonForJsonOutput // اسم الدرس الذي يجب أن يظهر في حقل "lesson" في JSON
    } = context;

    // تعليمات اللغة ثابتة تقريبًا للفرنسية
    const languageInstruction = "La question et TOUTES ses parties (texte, options, correctAnswer) doivent être EXCLUSIVEMENT EN FRANÇAIS, avec un vocabulaire académique précis et adapté au niveau régional.";

    const promptExpertise = `un expert en création de questions pour l'examen régional de français (Maroc), niveau ${academicLevelName} - ${trackName}.`;

    let examStyleGuidance = `
La question générée DOIT imiter le style, la structure et les exigences cognitives des questions typiques de l'examen régional de français pour la matière "${subjectName}" au niveau "${academicLevelName} - ${trackName}".
Elle doit évaluer :
- La compréhension fine des concepts clés des œuvres au programme (La Boîte à Merveilles, Antigone, Le Dernier Jour d'un Condamné).
- La capacité à analyser des extraits littéraires.
- La maîtrise des outils de la langue (grammaire, conjugaison, vocabulaire, figures de style).
La question doit être basée sur la "Leçon Spécifique" et le "Contenu Détaillé" fournis.
La langue de la question et de tous ses composants doit être strictement en ${questionLanguage}.
`;

    if (difficultyLevelApi === "Difficile") {
        examStyleGuidance += "Cette question doit être particulièrement exigeante, pouvant nécessiter une analyse approfondie, la mobilisation de connaissances multiples ou l'identification d'éléments subtils dans un texte.";
    } else if (difficultyLevelApi === "Moyen") {
        examStyleGuidance += "Cette question doit solliciter la réflexion ou l'application de connaissances, allant au-delà du simple repérage. Elle doit correspondre à une difficulté moyenne d'examen régional.";
    } else { // Facile
        examStyleGuidance += "Cette question doit tester la compréhension fondamentale et le repérage direct d'informations ou de concepts clés, similaire aux questions d'entrée en matière de l'examen régional.";
    }

    let contextForPrompt = typeof selectedParagraphTexte === 'string' ? selectedParagraphTexte : JSON.stringify(selectedParagraphTexte);
    const MAX_CONTEXT_LENGTH = 1200; // تقليل طفيف للطول للسماح بباقي البرومبت
    if (contextForPrompt.length > MAX_CONTEXT_LENGTH) {
        contextForPrompt = contextForPrompt.substring(0, MAX_CONTEXT_LENGTH) + "... (contenu tronqué)";
    }

    const topicContextBlock = `
CONTEXTE_ACADEMIQUE:
- Niveau: "${academicLevelName}"
- Filière: "${trackName}"
- Matière: "${subjectName}"
- Leçon Spécifique / Œuvre Ciblée: "${selectedLessonTitre}" 
- Contenu Détaillé / Extrait / Sous-thème pour la Question: "${contextForPrompt}"
- Langue de la Question: "${questionLanguage}"`;

    let outputFormatInstructions;
    if (questionTypeToGenerate === "mcq") {
        outputFormatInstructions = `
FORMAT_DE_SORTIE_JSON_STRICT (QCM):
1.  ${languageInstruction}
2.  Objectif de la tâche: "${selectedTaskFlavor.description}". Générer une question reflétant cet objectif.
3.  Format: QCM avec EXACTEMENT 4 options distinctes et plausibles. Les options doivent être complètes et grammaticalement correctes.
4.  Réponse Correcte: Il ne doit y avoir qu'UNE SEULE réponse correcte sans ambiguïté. Le champ "correctAnswer" dans le JSON DOIT être une correspondance textuelle exacte de l'une des options fournies.
5.  Distracteurs: Toutes les options, en particulier les incorrectes (distracteurs), doivent être pertinentes par rapport au sujet et plausibles pour un élève de ce niveau. Éviter les options triviales ou manifestement fausses.
6.  Texte de la Question: Doit être clair, précis, et tester directement l'objectif d'apprentissage de la saveur de la tâche et du contexte de la leçon fourni. La question peut être basée sur un court extrait (si pertinent pour la saveur de la tâche et la leçon) que vous pouvez inclure dans le texte de la question.
7.  Champ "lesson": À remplir avec une représentation concise de "${lessonForJsonOutput}".
8.  Champ "type": Doit être "mcq".
RÉPONDRE UNIQUEMENT avec un seul objet JSON valide, inclus dans \`\`\`json ... \`\`\`. Pas de préambules ni d'excuses.
\`\`\`json
{
  "question": "Le texte de la question QCM style examen régional ici...",
  "options": ["Option A texte", "Option B texte", "Option C texte", "Option D texte"],
  "correctAnswer": "Le texte exact de l'option correcte",
  "lesson": "${lessonForJsonOutput}",
  "type": "mcq"
}
\`\`\`
`;
    } else { // free_text
        outputFormatInstructions = `
FORMAT_DE_SORTIE_JSON_STRICT (Question à Réponse Ouverte):
1.  ${languageInstruction}
2.  Objectif de la tâche: "${selectedTaskFlavor.description}". Générer une question reflétant cet objectif.
3.  Nature de la Question: La question doit nécessiter une réponse textuelle (par exemple, une courte analyse, une justification, une explication d'une figure de style, une identification d'un sentiment). Elle pourrait demander à l'élève de relever un élément dans un texte que vous fournirez dans la question elle-même si nécessaire.
4.  Champ "options": Doit être un tableau vide [].
5.  Champ "correctAnswer": Fournir une réponse modèle concise et précise, ou les points clés attendus. Pour les questions d'analyse, cela pourrait être l'interprétation attendue. Ce modèle de réponse est crucial pour la validation ultérieure par l'IA.
6.  Texte de la Question: Doit être clair, précis, et adapté au niveau et à la difficulté spécifiés, imitant le style des questions à réponse ouverte de l'examen régional.
7.  Champ "lesson": À remplir avec une représentation concise de "${lessonForJsonOutput}".
8.  Champ "type": Doit être "free_text".
RÉPONDRE UNIQUEMENT avec un seul objet JSON valide, inclus dans \`\`\`json ... \`\`\`. Pas de préambules ni d'excuses.
\`\`\`json
{
  "question": "Le texte de la question ouverte style examen régional ici...",
  "options": [],
  "correctAnswer": "Une réponse modèle, les points clés, ou l'interprétation attendue, comme dans un barème d'examen.",
  "lesson": "${lessonForJsonOutput}",
  "type": "free_text"
}
\`\`\`
`;
    }

    const finalPrompt = `
Vous êtes ${promptExpertise}.
Votre mission est de générer UNE SEULE question de haute qualité, directement utilisable pour l'entraînement des élèves.

DIRECTIVES_STYLE_EXAMEN_REGIONAL:
${examStyleGuidance}

TÂCHE_DE_GENERATION_DE_QUESTION:
- Saveur de la Tâche (ID): ${selectedTaskFlavor.id} (Type de sortie visé: ${selectedTaskFlavor.type})

${topicContextBlock}

${outputFormatInstructions}

INSTRUCTION_FINALE: Relisez attentivement le JSON généré pour vous assurer qu'il est valide, qu'il respecte TOUTES les instructions, et que tout le texte est dans la langue spécifiée : ${questionLanguage}. La question doit être directement dérivable du "Contenu Détaillé / Extrait / Sous-thème pour la Question" fourni.
Si la "Saveur de la Tâche" implique une analyse de texte, et que le "Contenu Détaillé" n'est pas un extrait approprié, vous pouvez générer un court extrait pertinent (2-4 lignes) à inclure DANS le champ "question" du JSON, suivi de la question elle-même.
`;
    return finalPrompt;
}

module.exports = {
    generatePracticeQuestionPrompt
};