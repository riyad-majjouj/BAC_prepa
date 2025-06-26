// back-end/prompts/2BAC/SM/2BAC_sm_svt/questionPrompt_2bac_sm_svt.js

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

    const promptExpertise = `un expert en SVT, spécialisé dans la création de questions pour le baccalauréat marocain, filière ${trackName}.`;

    let examStyleGuidance = `
La question doit être précise, scientifiquement rigoureuse et conforme au programme marocain. Elle doit tester la capacité de l'élève à restituer des connaissances, à analyser des données ou à raisonner scientifiquement.
La question doit être directement liée à la leçon "${selectedLessonTitre}" et au concept "${selectedParagraphTexte}".
`;

    if (difficultyLevelApi === "Difficile") {
        examStyleGuidance += "Cette question doit être complexe, nécessitant de lier plusieurs informations ou d'appliquer un raisonnement en plusieurs étapes.";
    } else if (difficultyLevelApi === "Moyen") {
        examStyleGuidance += "Cette question doit aller au-delà de la simple définition, en demandant une petite analyse ou une comparaison.";
    } else { // Facile
        examStyleGuidance += "Cette question doit tester la connaissance directe d'une définition, d'un rôle ou d'une étape clé d'un processus.";
    }

    const topicContextBlock = `
- Niveau: "${academicLevelName}"
- Filière: "${trackName}"
- Matière: "${subjectName}"
- Leçon: "${selectedLessonTitre}" 
- Concept Spécifique: "${selectedParagraphTexte}"
- Langue: "${questionLanguage}"`;

    let outputFormatInstructions;
    if (questionTypeToGenerate === "mcq") {
        outputFormatInstructions = `
FORMAT_DE_SORTIE_JSON_STRICT (QCM):
1. Format: QCM avec 3 ou 4 options. Une seule est correcte.
2. Distracteurs: Les options incorrectes doivent être plausibles et basées sur des confusions fréquentes.
\`\`\`json
{
  "question": "Quelle est la phase de la méiose où se produit le brassage interchromosomique ?",
  "options": ["Prophase I", "Anaphase I", "Prophase II", "Anaphase II"],
  "correctAnswer": "Anaphase I",
  "lesson": "${lessonForJsonOutput}",
  "type": "mcq"
}
\`\`\`
`;
    } else { // free_text
        outputFormatInstructions = `
FORMAT_DE_SORTIE_JSON_STRICT (Question à réponse ouverte):
1. Nature: Doit demander une définition, une explication courte, une comparaison, ou le résultat d'un croisement génétique simple.
2. correctAnswer: Fournir la réponse modèle concise attendue.
\`\`\`json
{
  "question": "Définir le terme 'code génétique' et citer deux de ses caractéristiques.",
  "options": [],
  "correctAnswer": "Le code génétique est le système de correspondance entre les codons de l'ARNm et les acides aminés. Il est universel (le même pour presque tous les êtres vivants) et redondant (plusieurs codons peuvent coder pour le même acide aminé).",
  "lesson": "${lessonForJsonOutput}",
  "type": "free_text"
}
\`\`\`
`;
    }

    return `
Vous êtes ${promptExpertise}.
Votre mission est de créer une seule question de haute qualité.

INSTRUCTIONS_STYLE_EXAMEN:
${examStyleGuidance}

TÂCHE DE GÉNÉRATION:
${topicContextBlock}

${outputFormatInstructions}
Répondez UNIQUEMENT avec un seul objet JSON valide.
`;
}

module.exports = {
    generatePracticeQuestionPrompt
};