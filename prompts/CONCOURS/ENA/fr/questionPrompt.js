// back-end/prompts/CONCOURS/ENA/ENA_fr/questionPrompt_ENA_fr.js
function generatePracticeQuestionPrompt(context) {
    const { subjectName, difficultyLevelApi, selectedLessonTitre, selectedParagraphTexte, lessonForJsonOutput } = context;
    const promptExpertise = `un expert en conception de questions de français pour le concours d'accès aux Écoles Nationales d'Architecture (ENA). Vous comprenez que le test évalue la logique, la culture générale, et la maîtrise de la langue dans un contexte d'analyse spatiale et critique.`;
    const specificGuidance = `
La question doit être un défi intellectuel, simulant la complexité des épreuves de l'ENA.
- **Type de question :** Privilégiez les QCM complexes (type: "mcq") ou des questions d'analyse courtes (type: "free_text").
- **Thèmes :** Art, architecture, urbanisme, histoire de l'art, géométrie, philosophie, ou des sujets de société invitant à la réflexion critique.
- **Compétences testées :** Compréhension fine, analyse de texte/citation, logique verbale, synonymie/antonymie contextuelle, correction de phrases complexes, culture générale.
- **Difficulté :** Le niveau doit être élevé, avec des distracteurs plausibles pour les QCM et des questions ouvertes nécessitant une réponse concise mais argumentée.`;
    const outputFormat = `
FORMAT JSON STRICT (uniquement l'objet JSON):
\`\`\`json
{
  "question": "Le texte ou la question principale ici...",
  "type": "${context.questionTypeToGenerate}",
  "options": ${context.questionTypeToGenerate === 'mcq' ? '["Option A", "Option B", "Option C", "Option D"]' : '[]'},
  "correctAnswer": "La réponse exacte ou un modèle de réponse pour les questions ouvertes.",
  "lesson": "${lessonForJsonOutput}",
  "tags": ["concours", "ENA", "français", "${difficultyLevelApi}"]
}
\`\`\``;
    return `Vous êtes ${promptExpertise}. ${specificGuidance}\nSujet de la question : "${selectedLessonTitre} - ${selectedParagraphTexte}".\n${outputFormat}`;
}
module.exports = { generatePracticeQuestionPrompt };