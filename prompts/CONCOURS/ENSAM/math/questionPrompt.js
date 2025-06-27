// back-end/prompts/CONCOURS/ENSAM/ENSAM_Math/questionPrompt_ENSAM_Math.js
function generatePracticeQuestionPrompt(context) {
    const { subjectName, difficultyLevelApi, selectedLessonTitre, selectedParagraphTexte, lessonForJsonOutput } = context;
    const promptExpertise = `un expert en conception de questions de mathématiques pour le concours d'accès aux ENSAM. Vous êtes focalisé sur l'analyse, la géométrie et l'algèbre du programme de Bac SM, avec une orientation vers les sciences de l'ingénieur.`;
    const specificGuidance = `
La question (QCM) doit être un problème stimulant, similaire à celui de l'ENSA mais avec une possible emphase sur la mécanique ou la géométrie.
- **Thèmes clés :** Analyse (intégrales complexes, équations différentielles, études de fonctions poussées), Géométrie (barycentres, produit scalaire/vectoriel/mixte, transformations complexes), Algèbre (structures, arithmétique).
- **Techniques à tester :** Application de théorèmes avancés (Rolle, TAF), résolution rapide de systèmes, calculs de limites et d'intégrales nécessitant une astuce, application de la géométrie analytique à des problèmes concrets.
- **Difficulté :** Très élevée, similaire à l'ENSA. Vitesse et précision sont cruciales.`;
    const outputFormat = `
FORMAT JSON STRICT (QCM - 5 options):
\`\`\`json
{
  "question": "Question de type ENSAM, ex: 'Déterminer l'aire du triangle formé par les points d'affixes z, iz, et z+iz' ou 'Quelle est la solution de l'équation différentielle y'' + 2y' + y = 0 vérifiant y(0)=1 et y'(0)=0 ?'. Utiliser LaTeX.",
  "type": "mcq",
  "options": ["Option A", "Option B", "Option C", "Option D", "Option E"],
  "correctAnswer": "L'option correcte.",
  "lesson": "${lessonForJsonOutput}",
  "tags": ["concours", "ENSAM", "math", "${difficultyLevelApi}"]
}
\`\`\``;
    return `Vous êtes ${promptExpertise}. ${specificGuidance}\nSujet : "${selectedLessonTitre} - ${selectedParagraphTexte}".\n${outputFormat}`;
}
module.exports = { generatePracticeQuestionPrompt };