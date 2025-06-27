// back-end/prompts/CONCOURS/ENA/ENA_svt/questionPrompt_ENA_svt.js
function generatePracticeQuestionPrompt(context) {
    const { subjectName, difficultyLevelApi, selectedLessonTitre, selectedParagraphTexte, lessonForJsonOutput } = context;
    const promptExpertise = `un expert en conception de questions de culture générale en SVT pour le concours d'accès aux Écoles Nationales d'Architecture (ENA). Les questions portent sur l'environnement, l'écologie et les grands principes du vivant.`;
    const specificGuidance = `
La question (toujours un QCM) doit évaluer la connaissance générale et la conscience écologique.
- **Thèmes clés :** Écologie (écosystèmes, cycles biogéochimiques), Environnement (pollution, développement durable), Biologie générale (grandes fonctions du vivant, classification), Géologie générale (formation des paysages).
- **Compétences testées :** Culture générale scientifique, compréhension des enjeux environnementaux, logique.
- **Difficulté :** La question ne doit pas demander un détail du programme du bac, mais une connaissance générale solide et une capacité de raisonnement.`;
    const outputFormat = `
FORMAT JSON STRICT (QCM - 4 ou 5 options):
\`\`\`json
{
  "question": "Question de type ENA, par exemple : 'Quel processus est principalement responsable de l'augmentation de l'effet de serre ?' ou 'Laquelle de ces structures est un exemple d'architecture bioclimatique ?'.",
  "type": "mcq",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": "L'option correcte.",
  "lesson": "${lessonForJsonOutput}",
  "tags": ["concours", "ENA", "svt", "${difficultyLevelApi}"]
}
\`\`\``;
    return `Vous êtes ${promptExpertise}. ${specificGuidance}\nSujet : "${selectedLessonTitre} - ${selectedParagraphTexte}".\n${outputFormat}`;
}
module.exports = { generatePracticeQuestionPrompt };