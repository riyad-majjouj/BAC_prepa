// Ce fichier sera très similaire à celui de 2BAC_sm_pc, 
// car le programme et le style de questions sont proches.
// La principale différence est dans la chaîne `promptExpertise`.

function generatePracticeQuestionPrompt(context) {
    const { academicLevelName, trackName, subjectName, difficultyLevelApi, selectedLessonTitre, selectedParagraphTexte, questionLanguage, questionTypeToGenerate, selectedTaskFlavor, lessonForJsonOutput } = context;

    const languageInstruction = "La question et toutes ses parties (texte, options, correctAnswer) doivent être EXCLUSIVEMENT EN FRANÇAIS, avec un vocabulaire scientifique précis et rigoureux.";
    // La seule modification significative est ici
    const promptExpertise = `un expert en conception de questions de Physique-Chimie pour le niveau ${academicLevelName} - ${trackName} (Sciences Physiques) du baccalauréat marocain.`;

    let examStyleGuidance = `
La question générée doit rigoureusement imiter le style et le niveau d'exigence des questions de l'Examen National marocain pour la filière Sciences Physiques (SPC).
Elle doit évaluer la compréhension des lois et concepts fondamentaux, et la capacité à les appliquer dans des situations concrètes.
La question doit être directement liée au "Sujet de la Leçon" et au "Contenu Spécifique" fournis.`;

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
\`\`\`json
{
  "question": "Un condensateur de capacité C = 10µF est chargé sous une tension U = 5V. Quelle est l'énergie emmagasinée ?",
  "options": ["2.5e-5 J", "1.25e-4 J", "5.0e-5 J"],
  "correctAnswer": "1.25e-4 J",
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
${examStyleGuidance}
TÂCHE DE GÉNÉRATION:
${topicContextBlock}
${outputFormatInstructions}
Répondez UNIQUEMENT avec un seul objet JSON valide.`;
}

module.exports = { generatePracticeQuestionPrompt };