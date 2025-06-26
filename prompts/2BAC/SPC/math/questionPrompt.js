function generatePracticeQuestionPrompt(context) {
    const { academicLevelName, trackName, subjectName, difficultyLevelApi, selectedLessonTitre, selectedParagraphTexte, questionLanguage, questionTypeToGenerate, selectedTaskFlavor, lessonForJsonOutput } = context;

    const languageInstruction = "La question et toutes ses parties (texte, options, correctAnswer) doivent être EXCLUSIVEMENT EN FRANÇAIS, avec un vocabulaire mathématique précis.";
    const promptExpertise = `un expert en conception de questions de mathématiques pour le niveau ${academicLevelName} - ${trackName} (Sciences Physiques) du baccalauréat marocain.`;

    let examStyleGuidance = `
La question générée doit rigoureusement imiter le style et le niveau d'exigence des questions de l'Examen National marocain pour la filière Sciences Physiques (SPC).
Elle doit évaluer :
- La bonne compréhension des concepts et théorèmes.
- La capacité à appliquer les techniques de calcul de manière correcte.
- Le raisonnement logique dans la résolution de problèmes.
La question doit être directement liée au "Sujet de la Leçon" et au "Contenu Spécifique" fournis.`;

    if (difficultyLevelApi === "Difficile") {
        examStyleGuidance += "Cette question doit nécessiter la combinaison de deux concepts ou une analyse plus poussée qu'une simple application directe.";
    } else if (difficultyLevelApi === "Moyen") {
        examStyleGuidance += "Cette question doit tester une application réfléchie des connaissances, typique d'un contrôle continu.";
    } else { // Facile
        examStyleGuidance += "Cette question doit tester la connaissance directe d'une définition, d'un théorème ou l'application immédiate d'une formule du cours.";
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
3. Format: Un QCM avec 4 options distinctes et plausibles. Une seule est correcte.
4. Distracteurs: Les options incorrectes doivent représenter des erreurs de calcul ou de raisonnement communes.
\`\`\`json
{
  "question": "Quelle est la limite de la suite (u_n) définie par u_n = (2n+1)/(3n-5) ?",
  "options": ["2/3", "1", "+\\infty", "-1/5"],
  "correctAnswer": "2/3",
  "lesson": "${lessonForJsonOutput}",
  "type": "mcq"
}
\`\`\`
`;
    } else { // free_text
        outputFormatInstructions = `
FORMAT_DE_SORTIE_JSON_STRICT (Question ouverte):
1. ${languageInstruction}
2. Objectif: "${selectedTaskFlavor.description}".
3. correctAnswer: Fournissez le résultat final attendu (un nombre, une expression, etc.).
\`\`\`json
{
  "question": "Calculer l'intégrale I = \\\\int_{0}^{1} (x^2 + 2x) dx.",
  "options": [],
  "correctAnswer": "I = 4/3",
  "lesson": "${lessonForJsonOutput}",
  "type": "free_text"
}
\`\`\`
`;
    }

    return `
Vous êtes ${promptExpertise}.
Votre mission est de créer une seule question de qualité, style examen national SPC.
${examStyleGuidance}
TÂCHE DE GÉNÉRATION:
${topicContextBlock}
${outputFormatInstructions}
Répondez UNIQUEMENT avec un seul objet JSON valide.`;
}

module.exports = { generatePracticeQuestionPrompt };