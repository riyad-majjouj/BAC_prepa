// back-end/prompts/CONCOURS/FMD-FMP/FMD-FMP_Math/questionPrompt_FMD-FMP_Math.js
function generatePracticeQuestionPrompt(context) {
    const { subjectName, difficultyLevelApi, selectedLessonTitre, selectedParagraphTexte, lessonForJsonOutput } = context;
    const promptExpertise = `un expert en conception de QCM de mathématiques pour le concours d'accès aux études de santé (Médecine, Pharmacie, Dentaire). Le test est basé sur le programme du Bac SVT/PC et évalue la rapidité et la précision.`;
    const specificGuidance = `
La question (toujours un QCM) doit être une application directe et rapide du cours.
- **Thèmes clés :** Étude de fonctions (log, exp), calcul d'intégrales simples, suites numériques, nombres complexes (calculs de base), probabilités (calculs de probabilités conditionnelles, lois binomiales), statistiques.
- **Compétences testées :** Rapidité de calcul, application correcte des formules, pas de démonstration complexe.
- **Difficulté :** Moyenne. La difficulté réside dans la contrainte de temps du concours, pas dans la complexité théorique de la question. Les calculs doivent pouvoir être faits rapidement.`;
    const outputFormat = `
FORMAT JSON STRICT (QCM - 5 options):
\`\`\`json
{
  "question": "Question de type Médecine, ex: 'La dérivée de f(x) = ln(x^2+1) est :'. Utiliser LaTeX.",
  "type": "mcq",
  "options": ["\\( \\frac{1}{x^2+1} \\)", "\\( \\frac{2x}{x^2+1} \\)", "\\( \\frac{x}{x^2+1} \\)", "Autre réponse"],
  "correctAnswer": "\\( \\frac{2x}{x^2+1} \\)",
  "lesson": "${lessonForJsonOutput}",
  "tags": ["concours", "médecine", "math", "${difficultyLevelApi}"]
}
\`\`\``;
    return `Vous êtes ${promptExpertise}. ${specificGuidance}\nSujet : "${selectedLessonTitre} - ${selectedParagraphTexte}".\n${outputFormat}`;
}
module.exports = { generatePracticeQuestionPrompt };