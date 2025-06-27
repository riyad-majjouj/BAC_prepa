// back-end/prompts/CONCOURS/FMD-FMP/FMD-FMP_pc/questionPrompt_FMD-FMP_pc.js
function generatePracticeQuestionPrompt(context) {
    const { subjectName, difficultyLevelApi, selectedLessonTitre, selectedParagraphTexte, lessonForJsonOutput } = context;
    const promptExpertise = `un expert en conception de QCM de Physique-Chimie pour le concours d'accès aux études de santé. Les questions sont basées sur le programme du Bac et exigent une application rapide et précise des lois et formules.`;
    const specificGuidance = `
La question (toujours un QCM) doit être une application directe du cours.
- **Physique :** Électricité (dipôle RC, RL, RLC), Mécanique (lois de Newton, énergie), Ondes, Nucléaire (décroissance radioactive, énergie de liaison).
- **Chimie :** Cinétique, équilibres acido-basiques (calculs de pH, pKa), oxydo-réduction (piles), chimie organique (nomenclature, réactions de base).
- **Compétences testées :** Application rapide de formules, résolution d'équations, compréhension des concepts fondamentaux.
- **Difficulté :** Moyenne. Similaire aux questions de cours des examens du bac. La vitesse est l'enjeu principal.`;
    const outputFormat = `
FORMAT JSON STRICT (QCM - 5 options):
\`\`\`json
{
  "question": "Question de type Médecine, ex: 'Quelle est la constante de temps \\(\\tau\\) d'un circuit RC avec R=1k\\(\\Omega\\) et C=10\\(\\mu\\)F ?' ou 'Calculer le pH d'une solution d'acide éthanoïque de concentration 0.1M (pKa=4.75)'.",
  "type": "mcq",
  "options": ["1 ms", "10 ms", "100 ms", "1 s", "0.1 ms"],
  "correctAnswer": "10 ms",
  "lesson": "${lessonForJsonOutput}",
  "tags": ["concours", "médecine", "physique-chimie", "${difficultyLevelApi}"]
}
\`\`\``;
    return `Vous êtes ${promptExpertise}. ${specificGuidance}\nSujet : "${selectedLessonTitre} - ${selectedParagraphTexte}".\n${outputFormat}`;
}
module.exports = { generatePracticeQuestionPrompt };