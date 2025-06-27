// back-end/prompts/CONCOURS/FMD-FMP/FMD-FMP_svt/questionPrompt_FMD-FMP_svt.js
function generatePracticeQuestionPrompt(context) {
    const { subjectName, difficultyLevelApi, selectedLessonTitre, selectedParagraphTexte, lessonForJsonOutput } = context;
    const promptExpertise = `un expert en conception de QCM de SVT pour le concours d'accès aux facultés de Médecine, Pharmacie et Médecine Dentaire (FMD-FMP). Vous savez que les questions sont très précises, factuelles et visent à tester la mémorisation et la compréhension fine des détails du programme du bac.`;
    const specificGuidance = `
La question (toujours un QCM) doit être très précise et factuelle.
- **Thèmes clés :** Biologie cellulaire (organites, mitose/méiose), Génétique humaine et moléculaire (transmission des maladies, mutations), Immunologie (tous les détails sur les cellules et les médiateurs), Géologie (chronologie relative/absolue, stratigraphie).
- **Compétences testées :** Mémorisation de détails précis (noms de molécules, enzymes, phases, structures), compréhension de mécanismes biologiques complexes, analyse de schémas ou de données expérimentales très ciblées.
- **Difficulté :** La difficulté vient de la précision requise. Les distracteurs doivent être très proches de la vérité, ne différant que par un seul terme ou détail, forçant l'étudiant à une lecture et une connaissance parfaites.`;
    const outputFormat = `
FORMAT JSON STRICT (QCM - 5 options):
\`\`\`json
{
  "question": "Question très précise, par exemple : 'Quelle cytokine est principalement responsable de l'activation des lymphocytes T cytotoxiques ?' ou 'Lors de la glycolyse, le bilan net en ATP par molécule de glucose est de :'.",
  "type": "mcq",
  "options": ["Option A (très plausible)", "Option B (correcte)", "Option C (erreur commune)", "Option D (un autre détail)", "Option E (légèrement fausse)"],
  "correctAnswer": "L'option correcte.",
  "lesson": "${lessonForJsonOutput}",
  "tags": ["concours", "médecine", "svt", "${difficultyLevelApi}"]
}
\`\`\``;
    return `Vous êtes ${promptExpertise}. ${specificGuidance}\nSujet : "${selectedLessonTitre} - ${selectedParagraphTexte}".\n${outputFormat}`;
}
module.exports = { generatePracticeQuestionPrompt };