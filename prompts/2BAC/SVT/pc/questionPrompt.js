function generatePracticeQuestionPrompt(context) {
    const { academicLevelName, trackName, subjectName, difficultyLevelApi, selectedLessonTitre, selectedParagraphTexte, questionLanguage, questionTypeToGenerate, selectedTaskFlavor, lessonForJsonOutput } = context;

    const languageInstruction = "La question et toutes ses parties (texte, options, correctAnswer) doivent être EXCLUSIVEMENT EN FRANÇAIS, avec un vocabulaire scientifique précis et rigoureux.";
    const promptExpertise = `un expert en conception de questions de Physique-Chimie pour le niveau ${academicLevelName} - ${trackName} (SVT) du baccalauréat marocain.`;

    let examStyleGuidance = `
La question générée doit être conforme au programme de PC pour la filière SVT. Elle doit tester une application directe des lois et formules du cours, avec un niveau de complexité adapté à une matière secondaire.
La question doit être directement liée au "Sujet de la Leçon" et au "Contenu Spécifique" fournis.`;

    if (difficultyLevelApi === "Difficile") {
        examStyleGuidance += "Cette question doit demander l'application d'une formule dans un contexte légèrement différent ou une justification simple.";
    } else if (difficultyLevelApi === "Moyen") {
        examStyleGuidance += "Cette question doit tester une application directe et standard des connaissances.";
    } else { // Facile
        examStyleGuidance += "Cette question doit tester la connaissance directe d'une définition, d'une unité ou d'une formule de base.";
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
  "question": "Quelle est l'unité de la capacité C d'un condensateur dans le Système International ?",
  "options": ["Le Farad (F)", "Le Volt (V)", "L'Ohm (Ω)", "Le Henry (H)"],
  "correctAnswer": "Le Farad (F)",
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
  "question": "Un conducteur ohmique de résistance R=100Ω est traversé par un courant I=0.5A. Calculer la tension U à ses bornes.",
  "options": [],
  "correctAnswer": "U = 50 V",
  "lesson": "${lessonForJsonOutput}",
  "type": "free_text"
}
\`\`\`
`;
    }

    return `
Vous êtes ${promptExpertise}.
Votre mission est de créer une seule question de haute qualité pour l'entraînement des élèves de SVT.
${examStyleGuidance}
TÂCHE DE GÉNÉRATION:
${topicContextBlock}
${outputFormatInstructions}
Répondez UNIQUEMENT avec un seul objet JSON valide.`;
}

module.exports = { generatePracticeQuestionPrompt };