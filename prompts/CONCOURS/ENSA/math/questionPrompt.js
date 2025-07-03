// قائمة أمثلة لأسئلة ENSA عالية الجودة.
// سيتم اختيار مثال واحد عشوائيًا من هذه القائمة في كل مرة لتوجيه الذكاء الاصطناعي.
// كل الأسئلة والخيارات تستخدم تنسيق LaTeX مع الـ 'double backslashes' الصحيحة لسلاسل JSON.
const ensaMathExamples = [
    {
        question: "Quelle est la valeur de la limite suivante : $L = \\lim_{n \\to +\\infty} \\sum_{k=1}^{n} \\frac{n}{n^2 + k^2}$ ?",
        type: "mcq",
        options: ["$1$", "$\\frac{\\pi}{4}$", "$+\\infty$", "$0$", "$\\ln(2)$"],
        correctAnswer: "$\\frac{\\pi}{4}$",
        lesson: "Analyse - Intégration et Limites",
        tags: ["concours", "ENSA", "math", "difficile", "somme de riemann"]
    },
    {
        question: "Soit $j = e^{i \\frac{2\\pi}{3}}$. Quelle est la valeur de la somme $S = \\sum_{k=0}^{2024} (k+1)j^k$ ?",
        type: "mcq",
        options: ["$0$", "$1$", "$\\frac{2025}{j-1}$", "$\\frac{2024}{j-1}$", "$2025$"],
        correctAnswer: "$\\frac{2025}{j-1}$",
        lesson: "Nombres Complexes - Racines de l'unité",
        tags: ["concours", "ENSA", "math", "difficile", "nombres complexes", "suites"]
    },
    {
        question: "On considère l'intégrale $I = \\int_{0}^{\\pi/2} \\frac{\\sin(x)}{\\sin(x) + \\cos(x)} dx$. Quelle est la valeur de $I$ ?",
        type: "mcq",
        options: ["$\\frac{\\pi}{2}$", "$\\frac{\\pi}{3}$", "$\\frac{\\pi}{4}$", "$\\frac{\\pi}{8}$", "$1$"],
        correctAnswer: "$\\frac{\\pi}{4}$",
        lesson: "Analyse - Calcul Intégral",
        tags: ["concours", "ENSA", "math", "difficile", "intégrale", "astuce de calcul"]
    },
    {
        question: "Soit l'équation différentielle $(E): y' - 2xy = x$. Quelle est la solution de $(E)$ qui s'annule en $x=0$ ?",
        type: "mcq",
        options: [
            "$y(x) = \\frac{1}{2}(e^{x^2} - 1)$",
            "$y(x) = e^{x^2} - \\frac{1}{2}$",
            "$y(x) = \\frac{1}{2}(1 - e^{-x^2})$",
            "$y(x) = x^2 e^{x^2}$",
            "$y(x) = -\\frac{1}{2}$"
        ],
        correctAnswer: "$y(x) = \\frac{1}{2}(e^{x^2} - 1)$",
        lesson: "Analyse - Équations Différentielles",
        tags: ["concours", "ENSA", "math", "difficile", "équations différentielles"]
    },
    {
        question: "Le nombre de diviseurs de $N = 2^4 \\times 3^3 \\times 5^2$ qui sont des carrés parfaits est :",
        type: "mcq",
        options: ["$12$", "$15$", "$18$", "$24$", "$60$"],
        correctAnswer: "$12$",
        lesson: "Arithmétique",
        tags: ["concours", "ENSA", "math", "difficile", "arithmétique", "dénombrement"]
    },
    // Nouveaux أمثلة لتعزيز LaTeX
    {
        question: "Soit $A = \\begin{pmatrix} 1 & 1 \\\\ 0 & 1 \\end{pmatrix}$. Calculer la matrice $A^{100}$.",
        type: "mcq",
        options: [
            "$\\begin{pmatrix} 1 & 100 \\\\ 0 & 1 \\end{pmatrix}$",
            "$\\begin{pmatrix} 1 & 1 \\\\ 0 & 100 \\end{pmatrix}$",
            "$\\begin{pmatrix} 100 & 100 \\\\ 0 & 100 \\end{pmatrix}$",
            "$\\begin{pmatrix} 1 & 0 \\\\ 100 & 1 \\end{pmatrix}$",
            "$\\begin{pmatrix} 1 & 10 \\\\ 0 & 1 \\end{pmatrix}$"
        ],
        correctAnswer: "$\\begin{pmatrix} 1 & 100 \\\\ 0 & 1 \\end{pmatrix}$",
        lesson: "Algèbre Linéaire - Puissances de Matrices",
        tags: ["concours", "ENSA", "math", "difficile", "matrice", "puissance"]
    },
    {
        question: "Soit $x \\in \\mathbb{R}$. Simplifier l'expression $E = \\lfloor x + 1 \\rfloor - \\lfloor x \\rfloor$.",
        type: "mcq",
        options: ["$0$", "$1$", "$x$", "$x+1$", "$\\lfloor x \\rfloor$"],
        correctAnswer: "$1$",
        lesson: "Arithmétique - Partie Entière",
        tags: ["concours", "ENSA", "math", "facile", "arithmétique", "partie entière"]
    },
    {
        question: "Calculer l'intégrale suivante : $J = \\int_{0}^{\\pi} x \\sin(x) dx$.",
        type: "mcq",
        options: ["$0$", "$1$", "$\\frac{\\pi}{2}$", "$\\pi$", "$-\\pi$"],
        correctAnswer: "$\\pi$",
        lesson: "Analyse - Intégration par parties",
        tags: ["concours", "ENSA", "math", "moyenne", "intégrale", "IPP"]
    }
];

/**
 * Génère un prompt pour créer une question de type QCM de mathématiques pour le concours ENSA.
 * @param {object} context - Contexte contenant les informations sur le sujet, la difficulté, etc.
 * @param {string} context.subjectName - Nom de la matière (ex: "Mathématiques").
 * @param {string} context.difficultyLevelApi - Niveau de difficulté (ex: "difficile").
 * @param {string} context.selectedLessonTitre - Titre de la leçon (ex: "Nombres Complexes").
 * @param {string} context.selectedParagraphTexte - Paragraphe spécifique de la leçon.
 * @param {string} context.lessonForJsonOutput - Nom de la leçon à insérer dans le JSON final.
 * @returns {string} Le prompt complet pour l'IA.
 */
function generatePracticeQuestionPrompt(context) {
    const { difficultyLevelApi, selectedLessonTitre, selectedParagraphTexte, lessonForJsonOutput } = context;

    // --- 1. Sélectionner un exemple aléatoire ---
    const randomIndex = Math.floor(Math.random() * ensaMathExamples.length);
    const exampleQuestion = ensaMathExamples[randomIndex];
    const exampleString = JSON.stringify(exampleQuestion, null, 2);

    // --- 2. Définir les instructions du prompt ---
    const promptExpertise = `Vous êtes un expert en conception de QCM de mathématiques pour le concours d'accès aux Écoles Nationales des Sciences Appliquées (ENSA). Vous maîtrisez parfaitement le programme du bac SM et les types de questions qui nécessitent rapidité, astuce et une connaissance approfondie des théorèmes.`;

    const specificGuidance = `
Créez une question QCM difficile et discriminante, conçue pour un concours de haut niveau.

**Règles impératives de formatage LaTeX :**
  - Toutes les expressions mathématiques (variables, symboles, formules, matrices, etc.) doivent être entourées de délimiteurs mathématiques.
  - Pour le mode mathématique **inline**, utilisez le symbole dollar unique ($). Exemple: "Soit $f(x) = x^2$."
  - Pour le mode mathématique **display** (bloc séparé), utilisez le double dollar ($$). Exemple: "Voici une formule: $$\\int_a^b f(x)dx$$."
  - **CHAQUE** commande LaTeX (qui commence par une barre oblique inverse '\\' ou '\\begin{') doit utiliser **DEUX** barres obliques inverses (\\\\) dans la chaîne JSON. Par exemple, pour l'instruction LaTeX '\\frac{a}{b}' vous écrirez " \\\\frac{a}{b} ".
  - Pour les matrices, utilisez l'environnement "\\\\begin{pmatrix}" (pour parenthèses) et "\\\\end{pmatrix}". Chaque nouvelle ligne dans une matrice doit être indiquée par QUATRE barres obliques inverses (\\\\\\\\). Exemple : "Voici une matrice: $\\\\begin{pmatrix} a & b \\\\\\\\ c & d \\\\end{pmatrix}$."
  - Pour les fonctions partie entière (floor), utilisez les commandes "\\\\lfloor" et "\\\\rfloor".
  - Assurez-vous que la syntaxe LaTeX est parfaitement valide et qu'elle peut être rendue sans erreur par un moteur comme MathJax.
  - Évitez les caractères spéciaux ou les séquences d'échappement incorrectes qui pourraient casser le rendu LaTeX.

- **Distracteurs :** Les options incorrectes (distracteurs) doivent être des résultats plausibles issus d'erreurs de calcul courantes, d'applications erronées de théorèmes ou de simplifications incorrectes. Ne proposez pas de réponses manifestement fausses.
- **Originalité :** La question doit être originale et ne pas être une copie directe de l'exemple fourni.

- **Thèmes à privilégier :** Analyse (limites complexes, études de fonctions, intégrales non-triviales, suites), Algèbre (complexes, arithmétique, structures), Géométrie.
- **Techniques à tester :** La résolution rapide de la question doit idéalement reposer sur une astuce, une méthode non évidente ou un théorème spécifique (Sommes de Riemann, Cesàro, binôme de Newton, racines de l'unité, changement de variable astucieux, etc.).`;

    const fewShotExample = `
Voici un exemple concret du style, de la difficulté et du format JSON attendu. Cet exemple respecte toutes les règles de formatage LaTeX. Inspirez-vous de cet exemple pour créer une nouvelle question :
\`\`\`json
${exampleString}
\`\`\``;

    const outputFormat = `
Maintenant, en vous basant sur l'exemple et les règles ci-dessus, générez une nouvelle question sur le sujet suivant.
**Sujet de la question :** "${selectedLessonTitre} - ${selectedParagraphTexte}".

Répondez **uniquement** avec un bloc de code JSON respectant scrupuleusement le format suivant (5 options), et assurez-vous que tout le LaTeX est correctement formaté avec des doubles backslashes (\\\\) pour chaque commande :
\`\`\`json
{
  "question": "Votre question difficile de type ENSA ici, en utilisant LaTeX et respectant les doubles backslashes. Exemple : Soit $f(x) = x^x$, quelle est la valeur de $f'(1)$ ?",
  "type": "mcq",
  "options": [
    "Option A en LaTeX, exemple : $1$",
    "Option B en LaTeX, exemple : $e$",
    "Option C en LaTeX, exemple : $0$",
    "Option D en LaTeX, exemple : $1+e$",
    "Option E en LaTeX, exemple : $\\frac{1}{e}$"
  ],
  "correctAnswer": "L'option correcte, aussi en LaTeX avec doubles backslashes. Exemple : $1$",
  "lesson": "${lessonForJsonOutput}",
  "tags": ["concours", "ENSA", "math", "${difficultyLevelApi}"]
}
\`\`\``;

    // --- 3. Assembler le prompt final ---
    return `${promptExpertise}\n${specificGuidance}\n${fewShotExample}\n${outputFormat}`;
}

module.exports = { generatePracticeQuestionPrompt };