// back-end/prompts/2bac/SPC/SPC_Math/questionPrompt_2bac_spc_math.js

// ==================================================================================
// PHILOSOPHIE FINALE : "GÉNÉRATION FOCALISÉE SUR UN CONCEPT + UNE ASTUCE INTRINSÈQUE"
// Objectif : Créer des questions complexes mais qui restent focalisées sur UN SEUL chapitre.
// 1. On utilise une "Banque d'Astuces" de techniques mathématiques générales.
// 2. À chaque génération, on combine un "Paragraphe du Cours" (le concept central)
//    avec une "Astuce de Conception" (la difficulté ajoutée).
// 3. L'IA a pour mission de créer une question où l'astuce est une étape nécessaire pour
//    *débloquer* l'application du concept principal.
// ==================================================================================

// --- Banque d'Astuces de Conception (techniques non directes) ---
const astucesDeConception = [
    "Nécessite de multiplier par l'expression conjuguée pour lever une indétermination.",
    "Nécessite un changement de variable simple (ex: poser X = e^x, X = ln(x), ou X = sqrt(x)).",
    "Nécessite une factorisation par le terme de plus haut degré pour simplifier une expression complexe.",
    "Nécessite de reconnaître et d'appliquer une identité remarquable (ex: (a-b)², a³-b³).",
    "Nécessite une réécriture du numérateur ou une division euclidienne pour simplifier une fraction.",
    "La solution implique l'interprétation géométrique d'une expression (module, argument, distance).",
    "Nécessite d'appliquer une intégration par parties une ou deux fois.",
    "La question est formulée de manière inversée (ex: trouver le paramètre 'a' pour que la limite soit 'L').",
    "La fonction est définie par morceaux, exigeant une étude attentive au point de jonction.",
    "Le problème nécessite de passer par la forme exponentielle ou trigonométrique pour simplifier un calcul complexe.",
    "Nécessite d'utiliser une propriété fondamentale d'une fonction (parité, périodicité) pour simplifier le problème."
];

// Fonction pour choisir une astuce aléatoire
function getRandomAstuce() {
    return astucesDeConception[Math.floor(Math.random() * astucesDeConception.length)];
}

function generatePracticeQuestionPrompt(context) {
    const { academicLevelName, trackName, selectedLessonTitre, selectedParagraphTexte, questionTypeToGenerate, lessonForJsonOutput } = context;

    // --- 1. Sélection dynamique d'une astuce de conception ---
    const selectedAstuce = getRandomAstuce();

    const promptExpertise = `Vous êtes un expert en conception de questions de mathématiques complexes pour le niveau ${academicLevelName} - ${trackName}. Votre spécialité est de créer des questions de style Examen National marocain qui ne sont jamais directes, mais qui restent strictement focalisées sur le chapitre étudié.`;

    // --- 2. Instructions fondamentales basées sur la combinaison Concept + Astuce ---
    const specificGuidance = `
**MISSION CENTRALE : CRÉER UNE QUESTION NON DIRECTE MAIS FOCALISÉE**
Votre tâche est de concevoir une question de mathématiques qui combine DEUX éléments tout en restant **strictement dans le cadre de la "Leçon de référence"** :
1.  **Le Concept du Cours :** Le savoir-faire de base tiré du **"Paragraphe Cible"**.
2.  **L'Astuce de Conception :** Une étape préparatoire ou une technique de résolution spécifiée dans **"L'Astuce à Intégrer"**.

**PROCESSUS DE CRÉATION OBLIGATOIRE :**
1.  **Analyser** le **"Paragraphe Cible"**. C'est le concept principal que l'élève doit maîtriser.
2.  **Analyser** **"L'Astuce à Intégrer"**. C'est la difficulté que vous devez ajouter.
3.  **Synthétiser :** Créez un exercice où l'application directe du concept du paragraphe est impossible au départ. L'élève DOIT d'abord appliquer **"L'Astuce à Intégrer"** (factoriser, utiliser le conjugué, etc.) pour transformer le problème. Une fois cette étape franchie, il peut alors appliquer le concept du paragraphe pour trouver la solution.
4.  **RÈGLE D'OR :** La question finale et sa résolution ne doivent faire appel qu'à des connaissances de la **"Leçon de référence"** et des acquis des années précédentes. **NE JAMAIS combiner des concepts de chapitres différents du programme de Terminale.**
5.  **Important :** L'astuce ne doit JAMAIS être mentionnée dans la question. Elle doit être découverte par l'élève.

**EXIGENCE ABSOLUE POUR LE FORMATAGE MATHÉMATIQUE (LaTeX) :**
- Toute expression mathématique, variable, ou symbole DOIT être formatée en LaTeX.
- Utilisez des doubles backslashs pour l'échappement dans le JSON final.
- **Exemples de formatage correct :**
  - Pour une fonction : "Soit la fonction $f$ définie par $f(x) = \\\\frac{x^2 - 1}{x+1}$."
  - Pour une limite : "Calculer $\\\\lim_{x \\\\to +\\\\infty} (\\\\sqrt{x^2+x} - x)$."
  - Pour une intégrale : "Déterminer la valeur de $I = \\\\int_{0}^{1} x e^x dx$."
- L'intégralité de la sortie doit être un objet JSON valide et rien d'autre.`;

    // --- 3. Format de sortie ---
    const outputFormat = `
**VOTRE TÂCHE :**
Appliquez rigoureusement le processus de création décrit ci-dessus. Retournez le résultat sous la forme d'un objet JSON valide.

\`\`\`json
{
  "question": "Votre question ici, entièrement formatée en LaTeX pour les maths.",
  "type": "${questionTypeToGenerate}",
  "options": ["Option 1 en LaTeX", "Option 2 en LaTeX", "Option 3 en LaTeX", "Option 4 en LaTeX"],
  "correctAnswer": "La bonne réponse en LaTeX",
  "lesson": "${lessonForJsonOutput}"
}
\`\`\`
Si le type est "free_text", le champ "options" doit être un tableau vide [] et "correctAnswer" doit contenir la réponse textuelle détaillée.`;

    // --- 4. Assemblage du Prompt final ---
    return `${promptExpertise}

${specificGuidance}

---
**ÉLÉMENTS POUR LA CRÉATION DE LA QUESTION**
---
- **Leçon de référence (CADRE STRICT) :** "${selectedLessonTitre}"
- **Paragraphe Cible (Le concept de base à tester) :** "${selectedParagraphTexte}"
- **L'Astuce à Intégrer (La difficulté cachée à ajouter) :** "${selectedAstuce}"
- **Type de question à générer :** "${questionTypeToGenerate}"

${outputFormat}
`;
}

module.exports = { generatePracticeQuestionPrompt };