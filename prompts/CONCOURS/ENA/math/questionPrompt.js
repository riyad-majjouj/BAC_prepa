// back-end/prompts/CONCOURS/ENA/ENA_Math/questionPrompt_ENA_Math.js
function generatePracticeQuestionPrompt(context) {
    const { subjectName, difficultyLevelApi, selectedLessonTitre, selectedParagraphTexte, lessonForJsonOutput } = context;
    const promptExpertise = `un expert en conception de QCM de mathématiques pour le concours d'accès aux Écoles Nationales d'Architecture (ENA). Vous savez que le test se concentre sur la logique, la géométrie dans l'espace, les suites, et la résolution de problèmes non-standards plutôt que sur le calcul pur.`;
    const specificGuidance = `
La question (toujours un QCM) doit être un puzzle logique ou géométrique.
- **Thèmes clés :** Géométrie dans l'espace (projections, sections, volumes), suites logiques (numériques ou graphiques), dénombrement, probabilités, lecture de graphes et de plans.
- **Compétences testées :** Vision spatiale, raisonnement déductif, capacité à identifier des patrons, résolution de problèmes sans formule évidente.
- **Difficulté :** Élevée. Les options doivent inclure des pièges basés sur des erreurs de raisonnement courantes. La question ne doit pas être résolue par un simple calcul, mais par une analyse astucieuse.`;
    const outputFormat = `
FORMAT JSON STRICT (QCM - 4 ou 5 options):
\`\`\`json
{
  "question": "Question de type ENA (ex: un cube est coupé par un plan, quelle est la forme de la section ? ou une suite de figures à compléter).",
  "type": "mcq",
  "options": ["Option A", "Option B", "Option C", "Option D", "Option E"],
  "correctAnswer": "L'option correcte.",
  "lesson": "${lessonForJsonOutput}",
  "tags": ["concours", "ENA", "math", "${difficultyLevelApi}"]
}
\`\`\``;
    return `Vous êtes ${promptExpertise}. ${specificGuidance}\nSujet : "${selectedLessonTitre} - ${selectedParagraphTexte}".\n${outputFormat}`;
}
module.exports = { generatePracticeQuestionPrompt };