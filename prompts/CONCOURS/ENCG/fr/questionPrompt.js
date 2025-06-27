// back-end/prompts/CONCOURS/ENCG/ENCG_fr/questionPrompt_ENCG_fr.js
function generatePracticeQuestionPrompt(context) {
    const { subjectName, difficultyLevelApi, selectedLessonTitre, selectedParagraphTexte, lessonForJsonOutput } = context;
    const promptExpertise = `un expert en conception de questions de français pour le concours TAFEM (accès aux ENCG). Vous testez la maîtrise fine de la grammaire, du vocabulaire, de la conjugaison et de l'orthographe.`;
    const specificGuidance = `
La question (toujours un QCM) doit être technique et précise sur un point de langue.
- **Thèmes clés :** Concordance des temps, conjugaison des verbes irréguliers, orthographe d'usage et grammaticale (accords complexes), vocabulaire soutenu, figures de style, synonymes/antonymes.
- **Compétences testées :** Maîtrise des règles de la langue française, précision orthographique et grammaticale.
- **Difficulté :** Élevée. Les distracteurs doivent être des erreurs courantes et plausibles.`;
    const outputFormat = `
FORMAT JSON STRICT (QCM - 4 options):
\`\`\`json
{
  "question": "Question de type TAFEM, par exemple : 'Complétez la phrase : Il faut que vous ... vos devoirs.' ou 'Quelle phrase est correctement orthographiée ?'.",
  "type": "mcq",
  "options": ["finissiez", "finissez", "finiriez", "ayez fini"],
  "correctAnswer": "finissiez",
  "lesson": "${lessonForJsonOutput}",
  "tags": ["concours", "ENCG", "français", "${difficultyLevelApi}"]
}
\`\`\``;
    return `Vous êtes ${promptExpertise}. ${specificGuidance}\nSujet : "${selectedLessonTitre} - ${selectedParagraphTexte}".\n${outputFormat}`;
}
module.exports = { generatePracticeQuestionPrompt };