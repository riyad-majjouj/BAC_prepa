// prompts/2BAC/SM/questionPrompt_2bac_sm_math.js

function generatePracticeQuestionPrompt(context) {
    const {
        academicLevelName, trackName, subjectName, difficultyLevelApi,
        selectedLessonTitre, selectedParagraphTexte, questionLanguage,
        questionTypeToGenerate, selectedTaskFlavor, lessonForJsonOutput
    } = context;

    const languageInstruction = "La question et toutes ses parties (texte, options, correctAnswer) doivent être EXCLUSIVEMENT EN FRANÇAIS, avec un vocabulaire mathématique précis et rigoureux.";
    const promptExpertise = `un expert en conception de questions de mathématiques pour le niveau ${academicLevelName} - ${trackName} (Sciences Mathématiques) du baccalauréat marocain.`;

    let examStyleGuidance = `
La question générée doit rigoureusement imiter le style, la structure et le niveau d'exigence des questions de l'Examen National marocain pour la filière Sciences Mathématiques.
Elle doit évaluer la compréhension profonde des concepts, la capacité à appliquer les techniques avec précision, et la rigueur du raisonnement.
La question doit être directement et strictement liée au "Sujet de la Leçon" et au "Contenu Spécifique" fournis.
`;

    if (difficultyLevelApi === "Difficile") {
        examStyleGuidance += "Cette question doit être très difficile, nécessitant une analyse fine, la combinaison de plusieurs concepts, et une solution non évidente.";
    } else if (difficultyLevelApi === "Moyen") {
        examStyleGuidance += "Cette question doit tester une application réfléchie des connaissances, pouvant nécessiter une petite astuce (changement de variable, simplification, etc.).";
    } else { // Facile
        examStyleGuidance += "Cette question doit tester la connaissance directe d'une définition, d'un théorème ou l'application simple d'une formule du cours.";
    }

    const contextForPrompt = typeof selectedParagraphTexte === 'string' ? selectedParagraphTexte : JSON.stringify(selectedParagraphTexte);

    const latexFormattingRule = `
EXIGENCE ABSOLUE POUR LE FORMATAGE MATHÉMATIQUE (LaTeX pour JSON):
1.  **Délimiteurs OBLIGATOIRES :**
    - Utilisez \`$ ... $\` pour TOUTE expression mathématique en ligne (inline), comme une variable ($f$), un nombre ($3$), une appartenance ($x \\in H$).
    - Utilisez \`$$ ... $$\` pour TOUTE expression mathématique en bloc (display), comme les fractions, les intégrales, les limites.

2.  **Échappement OBLIGATOIRE des backslashs :**
    - À l'intérieur du JSON généré, chaque backslash (\\) d'une commande LaTeX DOIT être doublé (échappé) pour être valide.
    - EXEMPLE CORRECT : Pour obtenir $\\implies$, vous devez écrire "\\\\implies" dans la chaîne de caractères du JSON. Pour $\\in$, vous devez écrire "\\\\in".

3.  **EXEMPLES À SUIVRE SCRUPULEUSEMENT :**
    - Appartenance : "Si $x \\in H$ et $y \\in H$..."
    - Implication : "L'assertion $(1) \\implies (2)$ est vraie."
    - Limite : "Calculer $$\\lim_{x \\to +\\infty} (\\sqrt{x^2+x} - x)$$"
    - Fraction : "$$f(x) = \\frac{x^2 - 4}{x - 2}$$"

4.  Cette règle s'applique à TOUS les champs du JSON : "question", "options", et "correctAnswer".
`;

    let outputFormatInstructions;
    if (questionTypeToGenerate === "mcq") {
        outputFormatInstructions = `
FORMAT DE SORTIE JSON STRICT (QCM):
1.  ${languageInstruction}
2.  ${latexFormattingRule}
3.  Objectif : "Évaluer la compréhension des définitions et des théorèmes fondamentaux sur les structures algébriques (sous-groupes)."
4.  Créez un QCM avec exactement quatre (4) options. Une seule réponse correcte. Les distracteurs doivent représenter des erreurs de raisonnement courantes.

Répondez UNIQUEMENT avec un seul objet JSON valide, encapsulé dans \`\`\`json ... \`\`\`.
L'exemple ci-dessous est celui que vous devez générer, en respectant parfaitement le formatage LaTeX.
\`\`\`json
{
  "question": "Soit $(G, *)$ un groupe. On considère les assertions suivantes concernant un sous-ensemble $H$ de $G$ :\\\\ \\\\ (1) Si $x, y \\in H$, alors $x * y^{-1} \\in H$. \\\\ (2) Si $x \\in H$, alors $x^{-1} \\in H$. \\\\ (3) $H$ est non vide. \\\\ (4) L'élément neutre $e$ de $G$ appartient à $H$. \\\\ \\\\ Quelle est la bonne séquence d'implications nécessaires et suffisantes pour démontrer que $H$ est un sous-groupe de $G$ ?",
  "options": [
    "$(1) \\implies (2) \\implies (3) \\implies (4)$",
    "$(3) \\implies (1) \\implies (2) \\implies (4)$",
    "$(3)$ et $(1) \\implies (2)$ et $(4)$",
    "$(1)$ et $(3) \\implies (2)$ et $(4)$"
  ],
  "correctAnswer": "$(3)$ et $(1) \\implies (2)$ et $(4)$",
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
3.  La question doit nécessiter un calcul ou une courte démonstration.
4.  Le champ "options" doit être un tableau vide [].

Répondez UNIQUEMENT avec un seul objet JSON valide, encapsulé dans \`\`\`json ... \`\`\`.
\`\`\`json
{
  "question": "Calculer la limite suivante : $$\\lim_{x \\to +\\infty} (\\sqrt{x^2 + 4x} - x)$$",
  "options": [],
  "correctAnswer": "La limite est $2$.",
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
- Contenu Spécifique: "${contextForPrompt}"
- Langue: "${questionLanguage}"

${outputFormatInstructions}

INSTRUCTION FINALE: Vérifiez méticuleusement votre réponse. L'objet JSON doit être parfait. Le formatage LaTeX (avec les délimiteurs \`$\` ou \`$$\` ET les doubles backslashs \`\\\\\` pour les commandes) est l'exigence la plus critique.
`;
    return finalPrompt;
}

module.exports = { generatePracticeQuestionPrompt };