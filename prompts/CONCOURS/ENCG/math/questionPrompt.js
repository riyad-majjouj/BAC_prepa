// back-end/prompts/CONCOURS/ENCG/ENCG_Math/questionPrompt_ENCG_Math.js
function generatePracticeQuestionPrompt(context) {
    const { subjectName, difficultyLevelApi, selectedLessonTitre, selectedParagraphTexte, lessonForJsonOutput } = context;
    const promptExpertise = `un expert en conception de questions de mathématiques pour le concours TAFEM (accès aux ENCG). Vous vous concentrez sur les mathématiques appliquées à la gestion : statistiques, probabilités, analyse de fonctions et logique.`;
    const specificGuidance = `
La question (toujours un QCM) doit être un problème concret ou une question de logique.
- **Thèmes clés :** Pourcentages, suites arithmétiques/géométriques (calcul de mensualités, intérêts), statistiques descriptives (moyenne, médiane, variance), probabilités (simples et conditionnelles), analyse de fonctions (domaine de définition, limites, interprétation économique du signe de la dérivée), logique mathématique.
- **Compétences testées :** Raisonnement quantitatif, résolution de problèmes, application des mathématiques à des contextes de gestion.
- **Difficulté :** Moyenne. La rapidité est plus importante que la complexité théorique.`;
    const outputFormat = `
FORMAT JSON STRICT (QCM - 4 options):
\`\`\`json
{
  "question": "Question de type TAFEM, par exemple : 'Un article coûte 200 DH. Après une augmentation de 20% suivie d'une réduction de 20%, quel est son nouveau prix ?' ou 'Quelle est la limite de f(x) = (3x+1)/(x-2) en +infini ?'.",
  "type": "mcq",
  "options": ["192 DH", "200 DH", "208 DH", "196 DH"],
  "correctAnswer": "192 DH",
  "lesson": "${lessonForJsonOutput}",
  "tags": ["concours", "ENCG", "math", "${difficultyLevelApi}"]
}
\`\`\``;
    return `Vous êtes ${promptExpertise}. ${specificGuidance}\nSujet : "${selectedLessonTitre} - ${selectedParagraphTexte}".\n${outputFormat}`;
}
module.exports = { generatePracticeQuestionPrompt };