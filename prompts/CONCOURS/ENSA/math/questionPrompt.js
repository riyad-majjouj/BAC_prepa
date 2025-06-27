// back-end/prompts/CONCOURS/ENSA/ENSA_Math/questionPrompt_ENSA_Math.js
function generatePracticeQuestionPrompt(context) {
    const { subjectName, difficultyLevelApi, selectedLessonTitre, selectedParagraphTexte, lessonForJsonOutput } = context;
    const promptExpertise = `un expert en conception de QCM de mathématiques pour le concours d'accès aux Écoles Nationales des Sciences Appliquées (ENSA). Vous maîtrisez parfaitement le programme du bac SM et les types de questions qui nécessitent rapidité, astuce et une connaissance approfondie des théorèmes.`;
    const specificGuidance = `
La question (toujours un QCM) doit être difficile et discriminante.
- **Thèmes clés :** Analyse (limites complexes, études de fonctions, intégrales non-triviales, suites), Algèbre (complexes, arithmétique, structures), Géométrie.
- **Techniques à tester :** La question peut nécessiter une astuce ou l'application d'un théorème spécifique pour être résolue rapidement. Pensez à des concepts comme :
    - Les sommes de Riemann pour calculer une limite via une intégrale.
    - Le théorème de Cesàro pour des limites de suites.
    - La formule du binôme de Newton dans un contexte de dénombrement ou d'algèbre.
    - Des changements de variable astucieux en calcul intégral.
    - L'utilisation des racines de l'unité en nombres complexes.
- **Difficulté :** Très élevée. Les distracteurs doivent être des résultats obtenus par des erreurs de calcul classiques ou des approches incorrectes mais plausibles. La réponse ne doit pas être évidente.`;
    const outputFormat = `
FORMAT JSON STRICT (QCM - 5 options):
\`\`\`json
{
  "question": "Question de type ENSA, nécessitant une analyse fine ou une astuce. Utiliser LaTeX pour les notations : \\( \\lim_{n \\to +\\infty} \\sum_{k=1}^{n} \\frac{n}{n^2+k^2} \\).",
  "type": "mcq",
  "options": ["Option A", "Option B", "Option C", "Option D", "Option E"],
  "correctAnswer": "L'option correcte.",
  "lesson": "${lessonForJsonOutput}",
  "tags": ["concours", "ENSA", "math", "${difficultyLevelApi}"]
}
\`\`\``;
    return `Vous êtes ${promptExpertise}. ${specificGuidance}\nSujet de la question : "${selectedLessonTitre} - ${selectedParagraphTexte}".\n${outputFormat}`;
}
module.exports = { generatePracticeQuestionPrompt };