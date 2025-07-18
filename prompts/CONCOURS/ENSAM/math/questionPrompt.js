// back-end/prompts/CONCOURS/ENSAM/ENSAM_Math/questionPrompt_ENSAM_Math.js

// ==================================================================================
// 1. "صندوق أدوات التعقيد" - مفاهيم متقدمة خاصة بـ ENSAM
// ==================================================================================
const outilsDeComplexification = [
  // Analyse
  "Utiliser le théorème de Rolle pour prouver l'existence d'une racine pour la dérivée.",
  "Calculer une limite en utilisant un développement limité d'une fonction composée.",
  "Étudier la convergence d'une intégrale impropre en utilisant des critères de comparaison.",
  "Résoudre une équation différentielle en utilisant la méthode de variation de la constante.",
  "Relier la somme d'une série de Riemann à une intégrale.",

  // Algèbre
  "Discuter le rang d'une matrice à paramètre.",
  "Utiliser l'algorithme d'Euclide étendu pour résoudre une équation diophantienne $ax+by=c$.",
  "Déterminer les éléments propres (valeurs, vecteurs) d'une matrice 3x3 et l'utiliser pour calculer $A^n$.",
  "Appliquer le théorème de Cayley-Hamilton pour trouver l'inverse d'une matrice.",
  "Décomposer une fraction rationnelle avec un pôle double en éléments simples.",

  // Géométrie
  "Déterminer la nature de l'intersection d'un plan et d'un cône.",
  "Utiliser le produit mixte pour trouver la distance entre deux droites non coplanaires.",
  "Identifier une transformation complexe comme la composée d'une rotation et d'une homothétie.",
  "Trouver le lieu géométrique des points vérifiant une condition complexe (ex: $\\frac{z-a}{z-b}$ est imaginaire pur).",
  "Optimiser une distance ou un volume en utilisant des outils d'analyse (étude de fonction).",

  // Probabilités
  "Modéliser une situation par une chaîne de Markov à deux états.",
  "Calculer la fonction de répartition d'une variable aléatoire $Y=g(X)$ où X suit une loi connue.",
  "Utiliser l'inégalité de Bienaymé-Tchebychev pour borner une probabilité.",
  "Trouver la loi de probabilité du maximum ou du minimum de deux variables aléatoires indépendantes.",
  "Appliquer la formule des probabilités totales sur un espace infini dénombrable."
];

// مثال وحيد عالي الجودة يُستخدم فقط لتوضيح صيغة الـ JSON النهائية
// ملاحظة: صيغ LaTeX هنا مكتوبة بشكل عادي (single backslash) لسهولة القراءة في الكود
const formatExample = {
  question: "Soit $X$ une variable aléatoire à valeurs dans $\\mathbb{N}^*$ telle que $P(X=k) = \\frac{c}{k^2}$. Calculer l'espérance $\\mathbb{E}[e^{-tX}]$.",
  type: "mcq",
  options: ["$\\sum_{k=1}^{\\infty} \\frac{c e^{-kt}}{k^2}$", "$\\frac{c\\pi^2}{6}$", "$c \\cdot \\ln(1-e^{-t})$", "Non calculable", "Autre réponse"],
  correctAnswer: "$\\sum_{k=1}^{\\infty} \\frac{c e^{-kt}}{k^2}$",
  lesson: "Probabilités et Variables Aléatoires",
  tags: ["maths", "proba", "difficile", "concours"]
};


function generatePracticeQuestionPrompt(context) {
    const { subjectName, difficultyLevelApi, selectedLessonTitre, selectedParagraphTexte, lessonForJsonOutput } = context;

    // --- 1. اختيار "أداة تعقيد" عشوائية ---
    const randomToolIndex = Math.floor(Math.random() * outilsDeComplexification.length);
    const outilChoisi = outilsDeComplexification[randomToolIndex];
    
    // ضبط المثال ليتوافق مع السياق الحالي
    formatExample.lesson = lessonForJsonOutput;
    formatExample.tags = ["concours", "ENSAM", subjectName.toLowerCase(), difficultyLevelApi];

    const promptExpertise = `Vous êtes un concepteur expert de problèmes de Mathématiques pour le concours d'accès aux ENSAM. Votre spécialité est de créer des QCM qui sondent la profondeur de la compréhension, l'agilité calculatoire et la capacité à synthétiser des concepts de différents chapitres.`;
    
    // --- 2. تعليمات جديدة ومشددة ---
    const specificGuidance = `
**RÈGLE D'OR n°1 : CRÉATIVITÉ ET INTÉGRATION**
Votre mission est de **construire** un problème original. Pour cela, vous devez :
1.  Partir du **SUJET SPÉCIFIQUE** fourni.
2.  Y **intégrer** de manière intelligente l'**OUTIL DE COMPLEXIFICATION** ci-dessous.
Ne posez pas une question *sur* l'outil, mais *utilisez-le* pour formuler une question sur le sujet.

**RÈGLE D'OR n°2 : QUALITÉ LaTeX IMPECCABLE**
Le rendu mathématique doit être parfait.
- **DO :** Utiliser \`$\\mathbb{R}$\`, \`$\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}$\`, \`$\\sum_{k=0}^{n}$\`, \`$\\forall x \\in [a,b]$\`.
- **DON'T :** Utiliser du texte pour décrire les maths, oublier les délimiteurs \`$\`, utiliser des notations non standard.

**RÈGLE D'OR n°3 (CRUCIALE) : FORMATAGE JSON ET ÉCHAPPEMENT LaTeX**
Dans la chaîne de caractères JSON finale, **chaque backslash (\\) de LaTeX doit être échappé par un autre backslash**. C'est une contrainte technique non négociable pour que le rendu fonctionne.
- **CORRECT (dans le JSON) :** \`"\\\\mathbb{R}"\`, \`"\\\\frac{1}{2}"\`, \`"\\\\sum_{k=1}^{\\\\infty}"\`
- **INCORRECT (dans le JSON) :** \`"\\mathbb{R}"\`, \`"\\frac{1}{2}"\`, \`"\\sum_{k=1}^{\\infty}"\``;

    // --- 3. استخدام المثال الوحيد لتوضيح الصيغة مع الإصرار على الإchappement ---
    // نقوم يدويًا بمضاعفة الـ backslash في المثال ليكون مطابقًا للمطلوب تمامًا
    const escapedExampleJson = JSON.stringify(formatExample, null, 2).replace(/\\/g, '\\\\');

    const outputFormat = `
**FORMAT DE SORTIE :** JSON STRICT (QCM avec 5 options). L'exemple suivant illustre **uniquement** la structure et la qualité du formatage **avec les backslashs échappés** que vous devez scrupuleusement respecter.
\`\`\`json
${escapedExampleJson}
\`\`\``;

    // --- 4. تجميع البرومبت النهائي مع فصل واضح للمكونات ---
    return `Vous êtes ${promptExpertise}.

${specificGuidance}

---
**VOTRE MISSION**
---
1.  **SUJET SPÉCIFIQUE À TRAITER :**
    - **Leçon :** "${selectedLessonTitre}"
    - **Paragraphe :** "${selectedParagraphTexte}"

2.  **OUTIL DE COMPLEXIFICATION À INTÉGRER :**
    - "${outilChoisi}"

Créez maintenant une question unique, pertinente et de niveau concours ENSAM qui combine ces deux éléments, en respectant le format de sortie JSON avec l'échappement correct des caractères LaTeX.

${outputFormat}`;
}

module.exports = { generatePracticeQuestionPrompt };