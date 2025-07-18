// back-end/prompts/CONCOURS/ENSAM/ENSAM_pc/questionPrompt_ENSAM_pc.js
function generatePracticeQuestionPrompt(context) {
    const { subjectName, difficultyLevelApi, selectedLessonTitre, selectedParagraphTexte, lessonForJsonOutput } = context;
    const promptExpertise = `un expert en conception de questions de Physique-Chimie pour le concours d'accès aux ENSAM. L'accent est mis sur la mécanique, l'électricité et la thermodynamique.`;
    const specificGuidance = `
La question (QCM) doit être un problème d'ingénierie appliquée.
- **Physique :** Mécanique du solide (cinématique, dynamique, énergie), Électricité (RLC, puissance), Thermodynamique (premier principe, gaz parfaits), Ondes.
- **Chimie :** Moins prépondérante, mais peut inclure des questions sur les matériaux ou l'oxydo-réduction.
- **Compétences testées :** Modélisation physique, application rigoureuse des lois, résolution de problèmes concrets.
- **Difficulté :** Très élevée. Les questions peuvent nécessiter la combinaison de plusieurs lois physiques.`;
    const outputFormat = `
FORMAT JSON STRICT (QCM - 5 options):
\`\`\`json
{
  "question": "Question de type ENSAM, ex: 'Calculer la vitesse de sortie d'un projectile d'un canon à ressort de raideur k' ou 'Déterminer le déphasage entre le courant et la tension dans un circuit RLC série'.",
  "type": "mcq",
  "options": ["Option A", "Option B", "Option C", "Option D", "Option E"],
  "correctAnswer": "L'option correcte.",
  "lesson": "${lessonForJsonOutput}",
  "tags": ["concours", "ENSAM", "physique-chimie", "${difficultyLevelApi}"]
}
\`\`\``;
    return `Vous êtes ${promptExpertise}. ${specificGuidance}\nSujet : "${selectedLessonTitre} - ${selectedParagraphTexte}".\n${outputFormat}`;
}
module.exports = { generatePracticeQuestionPrompt };