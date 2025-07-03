// back-end/prompts/2BAC/SM/2BAC_sm_pc/questionPrompt_2bac_sm_pc.js

function generatePracticeQuestionPrompt(context) {
    const {
        academicLevelName, trackName, subjectName, difficultyLevelApi,
        selectedLessonTitre, selectedParagraphTexte, questionLanguage,
        questionTypeToGenerate, selectedTaskFlavor, lessonForJsonOutput
    } = context;

    const languageInstruction = "La question et toutes ses parties (texte, options, correctAnswer) doivent être EXCLUSIVEMENT EN FRANÇAIS, avec un vocabulaire scientifique précis et rigoureux.";
    const promptExpertise = `un expert en conception de questions de Physique-Chimie pour le niveau ${academicLevelName} - ${trackName} (Sciences Mathématiques) du baccalauréat marocain.`;

    let examStyleGuidance = `
La question générée doit rigoureusement imiter le style et le niveau d'exigence des questions de l'Examen National marocain pour la filière SM.
Elle doit évaluer la compréhension des lois et concepts fondamentaux et la capacité à les appliquer dans des situations concrètes.
La question doit être directement liée au "Sujet de la Leçon" et au "Contenu Spécifique" fournis.
`;

    if (difficultyLevelApi === "Difficile") {
        examStyleGuidance += "Cette question doit être difficile, nécessitant une analyse fine ou la combinaison de plusieurs formules/concepts.";
    } else if (difficultyLevelApi === "Moyen") {
        examStyleGuidance += "Cette question doit tester une application réfléchie des connaissances.";
    } else { // Facile
        examStyleGuidance += "Cette question doit tester la connaissance directe d'une définition, d'une loi ou d'une formule de base.";
    }

    // --- *** تعديل جوهري هنا (بداية) *** ---
    const latexFormattingRule = `
EXIGENCE ABSOLUE POUR LE FORMATAGE MATHÉMATIQUE (LaTeX pour JSON):
1.  **Délimiteurs OBLIGATOIRES :**
    - Utilisez \`$ ... $\` pour TOUTE expression mathématique en ligne (inline), comme une variable ($U_C$), une unité ($F$), une valeur ($10\\mu F$).
    - Utilisez \`$$ ... $$\` pour TOUTE expression mathématique en bloc (display), comme les équations différentielles, les formules complètes.
2.  **Échappement OBLIGATOIRE :**
    - À l'intérieur des délimiteurs, chaque backslash (\\) d'une commande LaTeX DOIT être doublé (échappé) pour être valide dans le JSON.
3.  **EXEMPLES CORRECTS (À SUIVRE SCRUPULEUSEMENT) :**
    - Variable : "La tension $u_C(t)$..."
    - Formule complète en option : "$$T_0 = 2\\pi\\sqrt{LC}$$"
    - Équation différentielle : "$$RC\\frac{du_C}{dt} + u_C = E$$"
    - Symbole : "La constante de Planck $h$ et la longueur d'onde $\\lambda$."
4.  Cette règle s'applique à TOUS les champs : "question", "options", et "correctAnswer".
`;
    // --- *** تعديل جوهري هنا (نهاية) *** ---
    
    let outputFormatInstructions;
    if (questionTypeToGenerate === "mcq") {
        outputFormatInstructions = `
FORMAT DE SORTIE JSON STRICT (QCM):
1.  ${languageInstruction}
2.  ${latexFormattingRule}
3.  Objectif: "${selectedTaskFlavor.description}".
4.  Créez un QCM avec 3 ou 4 options. Une seule est correcte.

Répondez UNIQUEMENT avec un seul objet JSON valide, encapsulé dans \`\`\`json ... \`\`\`.
\`\`\`json
{
  "question": "Quelle est l'expression de la période propre $T_0$ d'un circuit oscillant $(L, C)$ idéal ?",
  "options": [
    "$$T_0 = 2\\\\pi\\\\sqrt{LC}$$",
    "$$T_0 = \\\\frac{1}{2\\\\pi\\\\sqrt{LC}}$$",
    "$$T_0 = 2\\\\pi\\\\sqrt{\\\\frac{L}{C}}$$",
    "$$T_0 = 2\\\\pi\\\\sqrt{\\\\frac{C}{L}}$$"
  ],
  "correctAnswer": "$$T_0 = 2\\\\pi\\\\sqrt{LC}$$",
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
3.  Objectif: "${selectedTaskFlavor.description}".
4.  Nature: Doit nécessiter un calcul, l'écriture d'une équation ou une justification courte.
5.  "options" doit être un tableau vide [].

Répondez UNIQUEMENT avec un seul objet JSON valide, encapsulé dans \`\`\`json ... \`\`\`.
\`\`\`json
{
  "question": "Établir l'équation différentielle vérifiée par la charge $q(t)$ du condensateur lors de la charge dans un circuit RLC série soumis à un échelon de tension $E$.",
  "options": [],
  "correctAnswer": "$$L\\\\frac{d^2q}{dt^2} + R\\\\frac{dq}{dt} + \\\\frac{1}{C}q = E$$",
  "lesson": "${lessonForJsonOutput}",
  "type": "free_text"
}
\`\`\`
`;
    }

    const finalPrompt = `
Vous êtes ${promptExpertise}.
Votre mission est de créer une seule question de haute qualité.

INSTRUCTIONS DE STYLE ET DE CONTENU:
${examStyleGuidance}

CONTEXTE DE LA QUESTION:
- Leçon: "${selectedLessonTitre}" 
- Contenu Spécifique: "${selectedParagraphTexte}"
- Langue: "${questionLanguage}"

${outputFormatInstructions}

INSTRUCTION FINALE: Soyez extrêmement rigoureux. La validité du JSON et le respect ABSOLU des règles de formatage LaTeX (délimiteurs \`$\`/\`$$\` ET doubles backslashs \`\\\\\`) sont primordiaux.
`;
    return finalPrompt;
}

module.exports = { generatePracticeQuestionPrompt };