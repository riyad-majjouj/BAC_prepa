function generatePracticeQuestionPrompt(context) {
    const { academicLevelName, trackName, subjectName, difficultyLevelApi, selectedLessonTitre, selectedParagraphTexte, questionTypeToGenerate, selectedTaskFlavor, lessonForJsonOutput } = context;

    const promptExpertise = `un expert en conception de questions de mathématiques pour le niveau ${academicLevelName} - ${trackName} (SVT) du baccalauréat marocain.`;
    let examStyleGuidance = `
La question générée doit être très simple et directe, conforme au programme de mathématiques pour la filière SVT.
Elle doit tester une application directe des outils mathématiques de base (calcul de limite, dérivée, probabilité simple).
La question doit être directement liée à la leçon "${selectedLessonTitre}".`;

    const topicContextBlock = `
- Niveau: "${academicLevelName}"
- Filière: "${trackName}"
- Leçon: "${selectedLessonTitre}" 
- Concept: "${selectedParagraphTexte}"`;

    let outputFormatInstructions;
    if (questionTypeToGenerate === "mcq") {
        outputFormatInstructions = `
FORMAT_DE_SORTIE_JSON_STRICT (QCM):
\`\`\`json
{
  "question": "Quelle est la dérivée de la fonction f(x) = ln(2x+1) ?",
  "options": ["1/(2x+1)", "2/(2x+1)", "1/x", "2x+1"],
  "correctAnswer": "2/(2x+1)",
  "lesson": "${lessonForJsonOutput}",
  "type": "mcq"
}
\`\`\`
`;
    } else { // free_text
        outputFormatInstructions = `
FORMAT_DE_SORTIE_JSON_STRICT (Question ouverte):
\`\`\`json
{
  "question": "Calculer la limite de f(x) = (3x-1)/(x+2) quand x tend vers +\\infty.",
  "options": [],
  "correctAnswer": "La limite est 3.",
  "lesson": "${lessonForJsonOutput}",
  "type": "free_text"
}
\`\`\`
`;
    }

    return `
Vous êtes ${promptExpertise}.
Votre mission est de créer une seule question de qualité, adaptée au niveau SVT.
${examStyleGuidance}
TÂCHE DE GÉNÉRATION:
${topicContextBlock}
${outputFormatInstructions}
Répondez UNIQUEMENT avec un seul objet JSON valide.`;
}

module.exports = { generatePracticeQuestionPrompt };