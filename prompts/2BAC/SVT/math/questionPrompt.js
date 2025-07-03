// prompts/2BAC/SVT/questionPrompt_2bac_svt_math.js

function generatePracticeQuestionPrompt(context) {
    const {
        academicLevelName, trackName, subjectName, difficultyLevelApi,
        selectedLessonTitre, selectedParagraphTexte, questionLanguage,
        questionTypeToGenerate, selectedTaskFlavor, lessonForJsonOutput
    } = context;

    const languageInstruction = "La question et toutes ses parties (texte, options, correctAnswer) doivent être EXCLUSIVEMENT EN FRANÇAIS.";
    const promptExpertise = `un expert en conception de questions de mathématiques pour le niveau ${academicLevelName} - ${trackName} (SVT) du baccalauréat marocain.`;

    const examStyleGuidance = `
La question générée doit être simple et directe, conforme au programme de mathématiques pour la filière SVT.
Elle doit tester une application directe des outils de base (calcul de limite, dérivée, probabilité simple).
La question doit être strictement liée à la leçon "${selectedLessonTitre}".`;

    const contextForPrompt = typeof selectedParagraphTexte === 'string' ? selectedParagraphTexte : JSON.stringify(selectedParagraphTexte);

    const latexFormattingRule = `
EXIGENCE ABSOLUE POUR LE FORMATAGE MATHÉMATIQUE (LaTeX pour JSON):
1.  **Délimiteurs OBLIGATOIRES :**
    - Utilisez \`$ ... $\` pour TOUTE expression mathématique en ligne (inline).
    - Utilisez \`$$ ... $$\` pour TOUTE expression mathématique en bloc (display).

2.  **Échappement OBLIGATOIRE des backslashs :**
    - Dans le JSON, chaque backslash (\\) d'une commande LaTeX DOIT être doublé (\\\\).
    - EXEMPLE : Pour $\\ln$, écrivez "\\\\ln". Pour $\\to$, écrivez "\\\\to".

3.  Cette règle s'applique à TOUS les champs du JSON : "question", "options", et "correctAnswer".
`;

    let outputFormatInstructions;
    if (questionTypeToGenerate === "mcq") {
        outputFormatInstructions = `
FORMAT DE SORTIE JSON STRICT (QCM):
1.  ${languageInstruction}
2.  ${latexFormattingRule}
3.  Créez un QCM simple avec quatre (4) options. Une seule réponse correcte.

Répondez UNIQUEMENT avec un seul objet JSON valide, encapsulé dans \`\`\`json ... \`\`\`.
\`\`\`json
{
  "question": "Quelle est la dérivée de la fonction $f$ définie par $f(x) = \\ln(2x+1)$ ?",
  "options": [
    "$\\frac{1}{2x+1}$",
    "$\\frac{2}{2x+1}$",
    "$\\frac{1}{x}$",
    "$2x+1$"
  ],
  "correctAnswer": "$\\frac{2}{2x+1}$",
  "lesson": "${lessonForJsonOutput}",
  "type": "mcq"
}
\`\`\`
`;
    } else { // free_text
        outputFormatInstructions = `
FORMAT DE SORTIE JSON STRICT (Question à réponse ouverte):
1.  ${languageInstruction}
2.  ${latexFormattingRule}
3.  La question doit nécessiter un calcul direct.
4.  Le champ "options" doit être un tableau vide [].

Répondez UNIQUEMENT avec un seul objet JSON valide, encapsulé dans \`\`\`json ... \`\`\`.
\`\`\`json
{
  "question": "Calculer la limite suivante : $$\\lim_{x \\to +\\infty} \\frac{3x-1}{x+2}$$",
  "options": [],
  "correctAnswer": "La limite est $3$.",
  "lesson": "${lessonForJsonOutput}",
  "type": "free_text"
}
\`\`\`
`;
    }

    const finalPrompt = `
Vous êtes ${promptExpertise}.
Votre mission est de créer une seule question de qualité, adaptée au niveau SVT.

INSTRUCTIONS DE STYLE ET DE CONTENU:
${examStyleGuidance}

CONTEXTE DE LA QUESTION:
- Leçon: "${selectedLessonTitre}" 
- Contenu Spécifique: "${contextForPrompt}"
- Langue: "${questionLanguage}"

${outputFormatInstructions}

INSTRUCTION FINALE: Assurez-vous que toutes les expressions mathématiques sont formatées en LaTeX avec des délimiteurs et des backslashs doublés comme exigé.
`;
    return finalPrompt;
}

module.exports = { generatePracticeQuestionPrompt };