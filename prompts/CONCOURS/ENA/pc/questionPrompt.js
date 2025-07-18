// back-end/prompts/CONCOURS/ENA/ENA_pc/questionPrompt_ENA_pc.js
function generatePracticeQuestionPrompt(context) {
    const { subjectName, difficultyLevelApi, selectedLessonTitre, selectedParagraphTexte, lessonForJsonOutput } = context;
    const promptExpertise = `un expert en conception de questions de culture scientifique générale pour le concours d'accès aux Écoles Nationales d'Architecture (ENA). Vous créez des questions qui testent l'intuition physique et la compréhension des phénomènes quotidiens.`;
    const specificGuidance = `
La question (toujours un QCM) doit évaluer le raisonnement logique et la compréhension conceptuelle plutôt que le calcul.
- **Thèmes clés :** Optique géométrique (ombres, lumière, couleurs), Statique des forces (équilibre, structures simples), Échelles et proportions, Phénomènes naturels (acoustique, thermique), Chimie de base (matériaux, réactions simples).
- **Compétences testées :** Logique, déduction, compréhension de concepts physiques sans application numérique complexe, culture scientifique.
- **Difficulté :** Moyenne à élevée, avec des distracteurs basés sur des idées fausses courantes. La question doit faire appel à l'intuition.`;
    const outputFormat = `
FORMAT JSON STRICT (QCM - 4 ou 5 options):
\`\`\`json
{
  "question": "Question de type ENA, par exemple : 'Si vous vous tenez face à un miroir plan, pour voir l'intégralité de votre corps, la hauteur minimale du miroir doit être...' ou 'Quel matériau est le meilleur isolant thermique parmi les suivants ?'.",
  "type": "mcq",
  "options": ["Option A", "Option B", "Option C", "Option D", "Option E"],
  "correctAnswer": "L'option correcte.",
  "lesson": "${lessonForJsonOutput}",
  "tags": ["concours", "ENA", "physique-chimie", "${difficultyLevelApi}"]
}
\`\`\``;
    return `Vous êtes ${promptExpertise}. ${specificGuidance}\nSujet : "${selectedLessonTitre} - ${selectedParagraphTexte}".\n${outputFormat}`;
}
module.exports = { generatePracticeQuestionPrompt };