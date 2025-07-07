// prompts/2bac/pc/svt/question.js

/**
 * Génère un prompt dynamique et avancé pour créer des questions de SVT uniques.
 * @param {object} context - Un objet contenant tous les paramètres nécessaires.
 * @param {string} context.academicLevelName - Le niveau scolaire (ex: "2BAC").
 * @param {string} context.trackName - La filière (ex: "Sciences Physiques - PC").
 * @param {string} context.subjectName - Le nom de la matière.
 * @param {string} context.difficultyLevelApi - Le niveau de difficulté ('Facile', 'Moyen', 'Difficile').
 * @param {string} context.selectedLessonTitre - Le titre de la leçon choisie.
 * @param {string} context.selectedParagraphTexte - Le paragraphe ou concept spécifique ciblé.
 * @param {string} context.questionTypeToGenerate - Le type de question ('mcq' ou 'free_text').
 * @param {string} context.lessonForJsonOutput - Le titre de la leçon formaté pour la sortie JSON.
 * @param {string[]} [context.recentlyUsedContexts] - (Optionnel mais crucial) Un tableau de chaînes décrivant les contextes récemment utilisés pour éviter la répétition.
 * @returns {string} Le prompt final prêt à être envoyé à l'API Gemini.
 */
function generatePracticeQuestionPrompt(context) {
    const {
        academicLevelName,
        trackName,
        subjectName,
        difficultyLevelApi,
        selectedLessonTitre,
        selectedParagraphTexte,
        questionTypeToGenerate,
        lessonForJsonOutput,
        recentlyUsedContexts
    } = context;

    const promptExpertise = `Vous êtes un concepteur expert d'épreuves de SVT pour le baccalauréat marocain, filière ${trackName}. Votre spécialité est de créer des questions TOTALEMENT UNIQUES, intelligentes et qui forcent la réflexion en se basant sur des micro-scénarios scientifiques.`;

    let difficultyInstruction;
    let taskInstruction;

    switch (difficultyLevelApi) {
        case "Difficile":
            difficultyInstruction = `La question doit être difficile et non-triviale. Elle doit présenter un scénario complexe et inédit (ex: une enzyme d'une bactérie extrêmophile, une anomalie géologique spécifique, une expérience de marquage radioactif avec des résultats contre-intuitifs) qui oblige l'élève à synthétiser plusieurs concepts du paragraphe "${selectedParagraphTexte}" pour résoudre le problème.`;
            taskInstruction = `Analyser un cas d'étude original, interpréter des données complexes ou expliquer un mécanisme en profondeur.`;
            break;
        case "Moyen":
            difficultyInstruction = `La question doit être de difficulté moyenne. Elle doit présenter un petit contexte ou une situation d'application directe. L'élève doit appliquer une connaissance du paragraphe "${selectedParagraphTexte}" à un exemple concret et non-scolaire.`;
            taskInstruction = `Appliquer une règle à un nouveau cas, comparer deux processus, ou identifier une structure/phénomène dans un contexte spécifique.`;
            break;
        default: // Facile
            difficultyInstruction = `La question doit être facile et directe, testant une connaissance factuelle et précise du paragraphe "${selectedParagraphTexte}". Le contexte, s'il y en a un, doit être minimal et servir uniquement à poser la question.`;
            taskInstruction = `Définir un terme, identifier un élément, citer une étape ou rappeler un fait clé.`;
    }

    let exclusionBlock = "";
    if (recentlyUsedContexts && recentlyUsedContexts.length > 0) {
        const topicsToAvoid = recentlyUsedContexts.map(topic => `- ${topic}`).join('\n');
        exclusionBlock = `
### CONTRAINTE D'EXCLUSION ABSOLUE
Pour garantir une originalité maximale, vous ne devez PAS générer de question dont le scénario ou le contexte est similaire aux thèmes suivants qui ont déjà été utilisés récemment :
${topicsToAvoid}
C'est une règle impérative. Soyez créatif et trouvez un angle d'attaque complètement différent et inattendu.
`;
    }

    const topicContextBlock = `
### CONTEXTE PÉDAGOGIQUE
- **Niveau:** "${academicLevelName}"
- **Filière:** "${trackName}"
- **Leçon:** "${selectedLessonTitre}" 
- **Paragraphe ciblé:** "${selectedParagraphTexte}"
- **Niveau de difficulté demandé:** ${difficultyLevelApi}`;

    let outputFormatInstructions;
    if (questionTypeToGenerate === "mcq") {
        outputFormatInstructions = `
### FORMAT DE SORTIE JSON STRICT (QCM)
\`\`\`json
{
  "question": "Contexte scientifique court et original: [décrire un scénario ou une observation]. Question précise basée sur ce scénario?",
  "options": ["Option A (plausible mais incorrecte)", "Option B (correcte)", "Option C (distracteur commun)", "Option D (une autre option plausible)"],
  "correctAnswer": "L'option B",
  "lesson": "${lessonForJsonOutput}",
  "type": "mcq"
}
\`\`\`
`;
    } else { // free_text
        outputFormatInstructions = `
### FORMAT DE SORTIE JSON STRICT (Question ouverte)
\`\`\`json
{
  "question": "Contexte scientifique court et original: [décrire un scénario ou une observation]. Question précise qui demande une explication ou une définition dans ce contexte?",
  "options": [],
  "correctAnswer": "Une réponse modèle, concise (2-4 phrases), scientifiquement rigoureuse, qui explique le 'pourquoi' ou le 'comment' de manière claire.",
  "lesson": "${lessonForJsonOutput}",
  "type": "free_text"
}
\`\`\`
`;
    }

    return `
${promptExpertise}

### MISSION
Créer UNE SEULE question de type flashcard, **100% originale**, de haute qualité et parfaitement calibrée.

### DIRECTIVES IMPÉRATIVES
1.  **ZÉRO RÉPÉTITION :** Votre objectif principal est de fuir la banalité et les exemples scolaires. Inventez un micro-scénario que l'élève n'a probablement jamais vu.
2.  **CONTEXTUALISATION CRÉATIVE :** Chaque question (sauf potentiellement les plus faciles) doit être intégrée dans un contexte scientifique court, crédible et **original**.
3.  **CALIBRAGE:** Respectez scrupuleusement la difficulté demandée. ${difficultyInstruction}
4.  **CIBLAGE:** La question doit porter spécifiquement sur le concept du paragraphe ciblé.

${exclusionBlock} 

${topicContextBlock}

### TÂCHE SPÉCIFIQUE
${taskInstruction}

${outputFormatInstructions}
Répondez UNIQUEMENT avec l'objet JSON valide, sans aucun texte, commentaire ou explication supplémentaire en dehors du JSON.
`;
}

module.exports = { generatePracticeQuestionPrompt };