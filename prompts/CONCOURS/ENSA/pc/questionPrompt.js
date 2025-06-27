// back-end/prompts/CONCOURS/ENSA/ENSA_pc/questionPrompt_ENSA_pc.js
function generatePracticeQuestionPrompt(context) {
    const { subjectName, difficultyLevelApi, selectedLessonTitre, selectedParagraphTexte, lessonForJsonOutput } = context;
    const promptExpertise = `un expert en conception de QCM de Physique-Chimie pour le concours d'accès aux ENSA. Vous savez que les questions testent à la fois la compréhension conceptuelle et la capacité à résoudre rapidement des problèmes calculatoires.`;
    const specificGuidance = `
La question (toujours un QCM) doit être de niveau élevé.
- **Physique :** Mouvements (parabolique, circulaire, oscillateurs), Lois de Newton, Énergie, Électricité (circuits RLC, régimes transitoires), Ondes, Nucléaire.
- **Chimie :** Cinétique chimique, équilibres chimiques (acides-bases, pH), réactions d'oxydo-réduction, chimie organique (mécanismes réactionnels de base).
- **Compétences testées :** Application rapide des lois, analyse dimensionnelle, raisonnement sur les ordres de grandeur, interprétation de graphes, résolution de systèmes d'équations simples.
- **Difficulté :** La question peut combiner plusieurs concepts (ex: énergie mécanique dans un champ électrique). Les options numériques doivent être proches pour tester la précision du calcul.`;
    const outputFormat = `
FORMAT JSON STRICT (QCM - 5 options):
\`\`\`json
{
  "question": "Question type ENSA, par exemple sur l'étude énergétique d'un oscillateur amorti ou le calcul du pH d'un mélange complexe.",
  "type": "mcq",
  "options": ["Option A", "Option B", "Option C", "Option D", "Option E"],
  "correctAnswer": "L'option correcte.",
  "lesson": "${lessonForJsonOutput}",
  "tags": ["concours", "ENSA", "physique-chimie", "${difficultyLevelApi}"]
}
\`\`\``;
    return `Vous êtes ${promptExpertise}. ${specificGuidance}\nSujet : "${selectedLessonTitre} - ${selectedParagraphTexte}".\n${outputFormat}`;
}
module.exports = { generatePracticeQuestionPrompt };