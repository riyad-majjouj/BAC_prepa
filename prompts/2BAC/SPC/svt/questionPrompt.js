// Similaire à `2bac_sm_svt`, mais avec une expertise ciblée pour SPC.
function generatePracticeQuestionPrompt(context) {
    const { academicLevelName, trackName, subjectName, difficultyLevelApi, selectedLessonTitre, selectedParagraphTexte, questionLanguage, questionTypeToGenerate, selectedTaskFlavor, lessonForJsonOutput } = context;

    const promptExpertise = `un expert en SVT, spécialisé dans la création de questions pour le baccalauréat marocain, filière ${trackName} (Sciences Physiques).`;
    let examStyleGuidance = `
La question doit être précise et conforme au programme de SVT pour la filière SPC. Elle doit tester la capacité de l'élève à restituer des connaissances ou à effectuer un raisonnement simple.
La question doit être directement liée à la leçon "${selectedLessonTitre}".`;

    if (difficultyLevelApi === "Difficile") {
        examStyleGuidance += "Cette question doit demander une comparaison ou une explication basée sur des connaissances bien assimilées.";
    } else { // Facile ou Moyen
        examStyleGuidance += "Cette question doit tester la connaissance directe d'une définition, d'un rôle ou d'une étape clé d'un processus.";
    }

    const topicContextBlock = `
- Niveau: "${academicLevelName}"
- Filière: "${trackName}"
- Leçon: "${selectedLessonTitre}" 
- Concept: "${selectedParagraphTexte}"`;

    let outputFormatInstructions;
    if (questionTypeToGenerate === "mcq") {
        outputFormatInstructions = `
FORMAT_DE_SORTIE_JSON_STRICT (QCM):
1. Format: QCM avec 3 ou 4 options. Une seule est correcte.
\`\`\`json
{
  "question": "L'information génétique est localisée dans :",
  "options": ["Le noyau", "Le cytoplasme", "La membrane cellulaire", "Les ribosomes"],
  "correctAnswer": "Le noyau",
  "lesson": "${lessonForJsonOutput}",
  "type": "mcq"
}
\`\`\`
`;
    } else { // free_text
        outputFormatInstructions = `
FORMAT_DE_SORTIE_JSON_STRICT (Question ouverte):
1. Nature: Doit demander une définition ou une explication courte.
\`\`\`json
{
  "question": "Définir le terme 'allèle'.",
  "options": [],
  "correctAnswer": "Un allèle est une version possible d'un gène. Il occupe le même locus sur des chromosomes homologues.",
  "lesson": "${lessonForJsonOutput}",
  "type": "free_text"
}
\`\`\`
`;
    }

    return `
Vous êtes ${promptExpertise}.
Votre mission est de créer une seule question de haute qualité.
${examStyleGuidance}
TÂCHE DE GÉNÉRATION:
${topicContextBlock}
${outputFormatInstructions}
Répondez UNIQUEMENT avec un seul objet JSON valide.`;
}

module.exports = { generatePracticeQuestionPrompt };