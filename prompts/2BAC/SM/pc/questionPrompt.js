// back-end/prompts/2BAC/SM/2BAC_sm_pc/questionPrompt_2bac_sm_pc.js

function generatePracticeQuestionPrompt(context) {
    const {
        academicLevelName,
        trackName,
        subjectName,
        difficultyLevelApi,
        selectedLessonTitre,
        selectedParagraphTexte,
        questionLanguage,
        questionTypeToGenerate,
        selectedTaskFlavor,
        lessonForJsonOutput
    } = context;

    const languageInstruction = "La question et toutes ses parties (texte, options, correctAnswer) doivent être EXCLUSIVEMENT EN FRANÇAIS, avec un vocabulaire scientifique précis et rigoureux.";
    const promptExpertise = `un expert en conception de questions de Physique-Chimie pour le niveau ${academicLevelName} - ${trackName} (Sciences Mathématiques) du baccalauréat marocain.`;

    let examStyleGuidance = `
La question générée doit rigoureusement imiter le style et le niveau d'exigence des questions de l'Examen National marocain pour la filière Sciences Mathématiques.
Elle doit évaluer la compréhension des lois et concepts fondamentaux, et la capacité à les appliquer dans des situations concrètes.
La question doit être directement liée au "Sujet de la Leçon" et au "Contenu Spécifique" fournis.
`;

    if (difficultyLevelApi === "Difficile") {
        examStyleGuidance += "Cette question doit être difficile, nécessitant une analyse fine ou la combinaison de plusieurs formules/concepts.";
    } else if (difficultyLevelApi === "Moyen") {
        examStyleGuidance += "Cette question doit tester une application réfléchie des connaissances, au-delà d'une simple restitution.";
    } else { // Facile
        examStyleGuidance += "Cette question doit tester la connaissance directe d'une définition, d'une loi ou d'une formule de base du cours.";
    }

    const topicContextBlock = `
CONTEXTE_ACADÉMIQUE:
- Niveau: "${academicLevelName}"
- Filière: "${trackName}"
- Matière: "${subjectName}"
- Sujet de la Leçon: "${selectedLessonTitre}" 
- Contenu Spécifique: "${selectedParagraphTexte}"
- Langue: "${questionLanguage}"`;

    let outputFormatInstructions;
    if (questionTypeToGenerate === "mcq") {
        outputFormatInstructions = `
FORMAT_DE_SORTIE_JSON_STRICT (QCM):
1. ${languageInstruction}
2. Objectif: "${selectedTaskFlavor.description}".
3. Format: Un QCM avec 3 ou 4 options. Une seule est correcte.
4. Distracteurs: Les options incorrectes doivent représenter des erreurs de raisonnement courantes.
5. Texte_de_la_question: La question doit être claire, et peut inclure des valeurs numériques et des unités. Utiliser LaTeX pour les formules.
\`\`\`json
{
  "question": "Un condensateur de capacité C = 10µF est chargé sous une tension U = 5V. Quelle est l'énergie emmagasinée ? Données: ...",
  "options": ["2.5x10^-5 J", "1.25x10^-4 J", "5.0x10^-5 J"],
  "correctAnswer": "1.25x10^-4 J",
  "lesson": "${lessonForJsonOutput}",
  "type": "mcq"
}
\`\`\`
`;
    } else { // free_text
        outputFormatInstructions = `
FORMAT_DE_SORTIE_JSON_STRICT (Question à réponse ouverte):
1. ${languageInstruction}
2. Objectif: "${selectedTaskFlavor.description}".
3. Nature: Doit nécessiter un calcul, l'écriture d'une équation ou une justification courte.
4. correctAnswer: Fournir la réponse finale attendue (résultat numérique avec unité, ou équation complète).
\`\`\`json
{
  "question": "Établir l'équation différentielle vérifiée par la tension u_c(t) aux bornes du condensateur lors de la charge dans un circuit RC série.",
  "options": [],
  "correctAnswer": "RC(du_c/dt) + u_c = E",
  "lesson": "${lessonForJsonOutput}",
  "type": "free_text"
}
\`\`\`
`;
    }

    return `
Vous êtes ${promptExpertise}.
Votre mission est de créer une seule question de haute qualité pour l'entraînement des élèves.

INSTRUCTIONS_STYLE_EXAMEN:
${examStyleGuidance}

TÂCHE DE GÉNÉRATION:
- Saveur (ID): ${selectedTaskFlavor.id}
${topicContextBlock}

${outputFormatInstructions}

INSTRUCTION_FINALE: Répondez UNIQUEMENT avec un seul objet JSON valide, sans aucun texte avant ou après.
`;
}

module.exports = {
    generatePracticeQuestionPrompt
};