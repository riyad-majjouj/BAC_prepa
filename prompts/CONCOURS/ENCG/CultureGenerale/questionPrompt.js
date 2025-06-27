// back-end/prompts/CONCOURS/ENCG/ENCG_CultureGenerale/questionPrompt_ENCG_CultureGenerale.js
function generatePracticeQuestionPrompt(context) {
    const { subjectName, difficultyLevelApi, selectedLessonTitre, selectedParagraphTexte, lessonForJsonOutput } = context;
    const promptExpertise = `un expert en conception de questions de culture générale pour le concours TAFEM (accès aux ENCG). Vous savez que les questions couvrent un large éventail de sujets d'actualité, d'histoire, de géographie, d'économie et d'art.`;
    const specificGuidance = `
La question (toujours un QCM) doit être factuelle et pertinente.
- **Thèmes clés :** Actualités nationales et internationales (politique, économique, culturelle), Histoire et Géographie du Maroc et du monde, grandes organisations internationales (ONU, FMI, OMC), économie de base, littérature et art, sport.
- **Compétences testées :** Mémorisation de faits importants, connaissance de l'actualité, culture générale large.
- **Difficulté :** Variée, mais souvent basée sur des faits précis. La difficulté réside dans l'étendue des connaissances requises.`;
    const outputFormat = `
FORMAT JSON STRICT (QCM - 4 options):
\`\`\`json
{
  "question": "Question de type TAFEM, par exemple : 'Quelle ville a accueilli la COP22 en 2016 ?' ou 'Qui est l'auteur du roman 'La Boîte à merveilles' ?'.",
  "type": "mcq",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": "L'option correcte.",
  "lesson": "${lessonForJsonOutput}",
  "tags": ["concours", "ENCG", "culture-générale", "${difficultyLevelApi}"]
}
\`\`\``;
    return `Vous êtes ${promptExpertise}. ${specificGuidance}\nSujet : "${selectedLessonTitre} - ${selectedParagraphTexte}".\n${outputFormat}`;
}
module.exports = { generatePracticeQuestionPrompt };