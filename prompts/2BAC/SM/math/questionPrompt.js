// prompts/2BAC/SM/2BAC_sm_Math/questionPrompt_2bac_sm_math.js

function generatePracticeQuestionPrompt(context) {
    const {
        academicLevelName, // "2BAC"
        trackName,         // "SM"
        subjectName,       // "2BAC_sm_Math"
        difficultyLevelApi,// "Facile", "Moyen", "Difficile"
        selectedLessonTitre, // e.g., "Calcul Intégral"
        selectedParagraphTexte, // e.g., "Techniques de calcul : primitives usuelles, intégration par parties"
        questionLanguage,  // "fr"
        questionTypeToGenerate, // "mcq" ou "free_text"
        selectedTaskFlavor,
        lessonForJsonOutput
    } = context;

    const languageInstruction = "La question et toutes ses parties (texte, options, correctAnswer) doivent être EXCLUSIVEMENT EN FRANÇAIS, avec un vocabulaire mathématique précis et rigoureux.";

    const promptExpertise = `un expert en conception de questions de mathématiques pour le niveau ${academicLevelName} - ${trackName} (Sciences Mathématiques) du baccalauréat marocain.`;

    let examStyleGuidance = `
La question générée doit rigoureusement imiter le style, la structure et le niveau d'exigence des questions de l'Examen National marocain pour la filière Sciences Mathématiques.
Elle doit évaluer :
- La compréhension profonde des concepts et théorèmes.
- La capacité à appliquer les techniques de calcul avec précision.
- La rigueur du raisonnement logique et de la démonstration.
- La capacité à résoudre des problèmes complexes.
La question doit être directement liée au "Sujet de la Leçon" et au "Contenu Spécifique" fournis.
`;

    if (difficultyLevelApi === "Difficile") {
        examStyleGuidance += "Cette question doit être particulièrement difficile, nécessitant une analyse fine, la combinaison de plusieurs concepts, ou une démonstration non triviale.";
    } else if (difficultyLevelApi === "Moyen") {
        examStyleGuidance += "Cette question doit tester une application réfléchie des connaissances, allant au-delà d'un simple calcul direct. Elle doit être d'un niveau de difficulté standard pour un contrôle continu ou une partie d'un problème de bac.";
    } else { // Facile
        examStyleGuidance += "Cette question doit tester la connaissance directe d'une définition, d'un théorème ou l'application d'une formule de base du cours. Elle doit être similaire aux questions de 'vérification des connaissances' au début d'un problème.";
    }

    let contextForPrompt = typeof selectedParagraphTexte === 'string' ? selectedParagraphTexte : JSON.stringify(selectedParagraphTexte);
    const MAX_CONTEXT_LENGTH = 1200;
    if (contextForPrompt.length > MAX_CONTEXT_LENGTH) {
        contextForPrompt = contextForPrompt.substring(0, MAX_CONTEXT_LENGTH) + "... (contenu tronqué)";
    }

    const topicContextBlock = `
CONTEXTE_ACADÉMIQUE:
- Niveau: "${academicLevelName}"
- Filière: "${trackName}"
- Matière: "${subjectName}"
- Sujet de la Leçon: "${selectedLessonTitre}" 
- Contenu Spécifique pour la question: "${contextForPrompt}"
- Langue de la question: "${questionLanguage}"`;

    let outputFormatInstructions;
    if (questionTypeToGenerate === "mcq") {
        outputFormatInstructions = `
FORMAT_DE_SORTIE_JSON_STRICT (QCM):
1.  ${languageInstruction}
2.  Objectif de la tâche: "${selectedTaskFlavor.description}". Créez une question qui reflète cet objectif.
3.  Format: Un QCM avec exactement quatre (4) options distinctes et plausibles.
4.  Réponse_Correcte: Il doit y avoir une seule réponse correcte sans ambiguïté. Le champ "correctAnswer" doit correspondre exactement au texte de l'une des options.
5.  Distracteurs: Les options incorrectes (distracteurs) doivent être pertinentes et représenter des erreurs communes pour un élève de ce niveau.
6.  Texte_de_la_question: La question doit être claire, précise, et peut contenir des expressions mathématiques formatées en LaTeX (ex: \\\\int_{0}^{1} f(x) dx).
7.  Champ "lesson": Doit être rempli avec une représentation concise de "${lessonForJsonOutput}".
8.  Champ "type": Doit être "mcq".

    // --- *** الإضافة هنا *** ---
    NOTE_IMPORTANTE_SUR_LA_CONCISION:
    Tout en respectant la rigueur mathématique, veillez à ce que la question et les options soient aussi concises que possible. L'objectif est de tester le concept clé sans verbosité inutile qui pourrait rendre la réponse JSON trop longue.
    // --- *** نهاية الإضافة *** ---

Répondez UNIQUEMENT avec un seul objet JSON valide, encapsulé dans \`\`\`json ... \`\`\`.
\`\`\`json
{
  "question": "Soit la fonction f définie par f(x) = ... Quelle est la limite de f en +\\\\infty ?",
  "options": ["0", "1", "+\\\\infty", "n'existe pas"],
  "correctAnswer": "+\\\\infty",
  "lesson": "${lessonForJsonOutput}",
  "type": "mcq"
}
\`\`\`
`;
    } else { // free_text
        outputFormatInstructions = `
FORMAT_DE_SORTIE_JSON_STRICT (Question à réponse ouverte):
1.  ${languageInstruction}
2.  Objectif de la tâche: "${selectedTaskFlavor.description}". Créez une question qui reflète cet objectif.
3.  Nature_de_la_question: Doit nécessiter une réponse textuelle (un calcul, une courte démonstration, la détermination d'un ensemble de points, etc.).
4.  Champ "options": Doit être un tableau vide [].
5.  Champ "correctAnswer": Fournissez la réponse finale attendue (ex: le résultat d'un calcul, l'expression d'une dérivée, la solution d'une équation). C'est crucial pour la validation par l'IA.
6.  Texte_de_la_question: La question doit être claire, mathématiquement rigoureuse, et peut contenir des expressions LaTeX.
7.  Champ "lesson": "${lessonForJsonOutput}".
8.  Champ "type": "free_text".
Répondez UNIQUEMENT avec un seul objet JSON valide, encapsulé dans \`\`\`json ... \`\`\`.
\`\`\`json
{
  "question": "Déterminer les racines carrées du nombre complexe z = 3 + 4i.",
  "options": [],
  "correctAnswer": "Les racines carrées sont 2+i et -2-i.",
  "lesson": "${lessonForJsonOutput}",
  "type": "free_text"
}
\`\`\`
`;
    }

    const finalPrompt = `
Vous êtes ${promptExpertise}.
Votre mission est de créer une seule question de haute qualité, directement utilisable pour l'entraînement des élèves.

INSTRUCTIONS_STYLE_EXAMEN:
${examStyleGuidance}

TÂCHE_DE_GÉNÉRATION_DE_QUESTION:
- Saveur de la tâche (ID): ${selectedTaskFlavor.id} (Type de sortie visé: ${selectedTaskFlavor.type})

${topicContextBlock}

${outputFormatInstructions}

INSTRUCTION_FINALE: Relisez attentivement l'objet JSON généré pour vous assurer qu'il est valide, qu'il respecte toutes les instructions et que tous les textes sont dans la langue spécifiée : ${questionLanguage}. La question doit être directement dérivée du "Contenu Spécifique" fourni.
`;
    return finalPrompt;
}

module.exports = {
    generatePracticeQuestionPrompt
};