// back-end/prompts/CONCOURS/FMD-FMP/FMD-FMP_pc/questionPrompt_FMD-FMP_pc.js

// ==================================================================================
// 1. بنك أمثلة موسع (20 سؤالاً) لتوجيه الذكاء الاصطناعي
// ==================================================================================
const exampleQuestions = [
    // -- Électricité --
    {
      question: "La tension aux bornes d'un condensateur dans un circuit RC série est $u_C(t) = 12(1 - e^{-200t})$ V. Si la capacité est $C = 50 \\mu\\text{F}$, quelles sont les valeurs de $E$ et $R$ ?",
      type: "mcq", options: ["$E=12\\text{ V}, R=100 \\Omega$", "$E=12\\text{ V}, R=200 \\Omega$", "$E=6\\text{ V}, R=100 \\Omega$", "$E=12\\text{ V}, R=50 \\Omega$", "$E=6\\text{ V}, R=200 \\Omega$"], correctAnswer: "$E=12\\text{ V}, R=100 \\Omega$",
      lesson: "Dipôle RC", tags: ["physique", "électricité", "difficile"]
    },
    {
      question: "Dans un circuit RLC série, l'équation différentielle de la charge $q(t)$ est $L\\frac{d^2q}{dt^2} + R\\frac{dq}{dt} + \\frac{1}{C}q = 0$. Quelle est la pulsation propre $\\omega_0$ des oscillations ?",
      type: "mcq", options: ["$\\omega_0 = \\sqrt{LC}$", "$\\omega_0 = \\frac{1}{\\sqrt{LC}}$", "$\\omega_0 = \\frac{R}{2L}$", "$\\omega_0 = \\frac{L}{R}$", "$\\omega_0 = RC$"], correctAnswer: "$\\omega_0 = \\frac{1}{\\sqrt{LC}}$",
      lesson: "Dipôle RLC", tags: ["physique", "électricité", "cours"]
    },
    // -- Nucléaire --
    {
      question: "Le noyau de Polonium $^{210}_{84}\\text{Po}$ est radioactif $\\alpha$. Sa demi-vie est $t_{1/2} = 138$ jours. Quelle est l'activité $A$ d'un échantillon de masse $m=1\\mu\\text{g}$ ? Données: $M(\\text{Po}) = 210 \\text{ g/mol}$, $N_A = 6,02 \\cdot 10^{23} \\text{ mol}^{-1}$.",
      type: "mcq", options: ["$1,66 \\cdot 10^9$ Bq", "$5,8 \\cdot 10^{12}$ Bq", "$2,1 \\cdot 10^4$ Bq", "$1,38 \\cdot 10^7$ Bq", "$4,5 \\cdot 10^{15}$ Bq"], correctAnswer: "$1,66 \\cdot 10^9$ Bq",
      lesson: "Radioactivité", tags: ["physique", "nucléaire", "calcul"]
    },
    {
      question: "Quelle est l'énergie libérée par la fusion de deux noyaux de deutérium $^{2}_{1}\\text{H}$ selon la réaction : $^{2}_{1}\\text{H} + ^{2}_{1}\\text{H} \\to ^{3}_{2}\\text{He} + ^{1}_{0}\\text{n}$ ? Données: $m(^{2}_{1}\\text{H})=2,01355u$, $m(^{3}_{2}\\text{He})=3,01493u$, $m(n)=1,00866u$, $1u = 931,5 \\text{ MeV/c}^2$.",
      type: "mcq", options: ["$3,27 \\text{ MeV}$", "$1,52 \\text{ MeV}$", "$4,03 \\text{ MeV}$", "$17,6 \\text{ MeV}$", "$2,22 \\text{ MeV}$"], correctAnswer: "$3,27 \\text{ MeV}$",
      lesson: "Énergie nucléaire", tags: ["physique", "nucléaire", "fusion"]
    },
    // -- Mécanique --
    {
      question: "Un projectile est lancé depuis l'origine avec une vitesse $\\vec{v_0}$ faisant un angle $\\alpha$ avec l'horizontale. L'équation de sa trajectoire est $y(x) = -\\frac{g}{2v_0^2 \\cos^2\\alpha}x^2 + (\\tan\\alpha)x$. Si la portée est de 40 m et la hauteur maximale de 10 m, quel est l'angle de tir $\\alpha$ ?",
      type: "mcq", options: ["$15^\\circ$", "$30^\\circ$", "$45^\\circ$", "$60^\\circ$", "$75^\\circ$"], correctAnswer: "$45^\\circ$",
      lesson: "Mouvement dans un champ de pesanteur", tags: ["physique", "mécanique", "difficile"]
    },
    {
      question: "Un pendule simple de longueur $L=1$ m oscille. Quelle est sa période $T$ sur la Lune, où l'intensité de la pesanteur est $g_L \\approx 1,6 \\text{ m/s}^2$ ? On prend $\\pi^2 \\approx 10$.",
      type: "mcq", options: ["$T \\approx 2,0$ s", "$T \\approx 0,8$ s", "$T \\approx 5,0$ s", "$T \\approx 1,25$ s", "$T \\approx 4,0$ s"], correctAnswer: "$T \\approx 5,0$ s",
      lesson: "Oscillateurs mécaniques", tags: ["physique", "mécanique", "application"]
    },
    // -- Ondes --
    {
      question: "Une fente de largeur $a = 0,1$ mm est éclairée par une lumière monochromatique de longueur d'onde $\\lambda = 600$ nm. La figure de diffraction est observée sur un écran situé à une distance $D = 2$ m de la fente. Quelle est la largeur $L$ de la tache centrale ?",
      type: "mcq", options: ["$L=0,6$ cm", "$L=1,2$ cm", "$L=2,4$ cm", "$L=3,0$ cm", "$L=6,0$ cm"], correctAnswer: "$L=2,4$ cm",
      lesson: "Diffraction et interférences", tags: ["physique", "ondes", "calcul"]
    },
    // -- Chimie : Acido-basique --
    {
      question: "On mélange $V_A = 10$ mL d'une solution d'acide éthanoïque de concentration $C_A = 0,2$ mol/L avec $V_B = 15$ mL d'une solution d'éthanoate de sodium de concentration $C_B = 0,1$ mol/L. Donnée: $pK_a(\\text{Acide éthanoïque}) = 4,8$. Quel est le pH de la solution tampon obtenue ?",
      type: "mcq", options: ["pH = 4,62", "pH = 4,80", "pH = 4,92", "pH = 4,98", "pH = 4,52"], correctAnswer: "pH = 4,62",
      lesson: "Réactions acido-basiques", tags: ["chimie", "pH", "difficile"]
    },
    {
        question: "Quel est le pH d'une solution aqueuse d'ammoniac $NH_3$ de concentration $C = 0,01 \\text{mol.L}^{-1}$ ? Donnée: $pK_a(NH_4^+/NH_3) = 9,2$.",
        type: "mcq", options: ["pH = 11,1", "pH = 10,6", "pH = 9,2", "pH = 7,0", "pH = 2,9"], correctAnswer: "pH = 10,6",
        lesson: "Calcul de pH", tags: ["chimie", "pH", "base faible"]
    },
    // -- Chimie : Cinétique --
    {
        question: "La décomposition du peroxyde d'hydrogène $2H_2O_2 \\to 2H_2O + O_2$ est une réaction d'ordre 1. Si la concentration initiale en $H_2O_2$ est de 0,8 M et qu'elle devient 0,2 M après 20 minutes, quelle est la constante de vitesse $k$ ?",
        type: "mcq", options: ["$k = 0,0693 \\text{ min}^{-1}$", "$k = 0,0347 \\text{ min}^{-1}$", "$k = 0,1386 \\text{ min}^{-1}$", "$k = 0,0300 \\text{ min}^{-1}$", "$k = 1,386 \\text{ min}^{-1}$"], correctAnswer: "$k = 0,0693 \\text{ min}^{-1}$",
        lesson: "Cinétique chimique", tags: ["chimie", "vitesse", "difficile"]
    },
    // -- 10 autres exemples variés --
    {
        question: "L'équation horaire d'un oscillateur est $x(t) = 0,04 \\cos(10\\pi t + \\frac{\\pi}{4})$. Quelle est son accélération à l'instant $t=0$ ?",
        type: "mcq", options: ["$a(0) = -2\\pi^2\\sqrt{2} \\text{ m/s}^2$", "$a(0) = -4\\pi^2 \\text{ m/s}^2$", "$a(0) = 4\\pi^2 \\text{ m/s}^2$", "$a(0) = 0 \\text{ m/s}^2$", "$a(0) = -20\\pi^2 \\text{ m/s}^2$"], correctAnswer: "$a(0) = -2\\pi^2\\sqrt{2} \\text{ m/s}^2$",
        lesson: "Oscillateurs", tags: ["physique", "mécanique", "difficile"]
    },
    {
        question: "Une pile est constituée des couples $Ag^+/Ag$ ($E^0 = +0,80$ V) et $Ni^{2+}/Ni$ ($E^0 = -0,25$ V). Quelle est la force électromotrice (f.e.m) standard de cette pile ?",
        type: "mcq", options: ["$1,05$ V", "$0,55$ V", "$-1,05$ V", "$-0,55$ V", "$1,30$ V"], correctAnswer: "$1,05$ V",
        lesson: "Piles et oxydoréduction", tags: ["chimie", "redox", "application"]
    },
    {
        question: "Dans la réaction d'estérification entre l'acide butanoïque et l'éthanol, quel est le nom de l'ester formé ?",
        type: "mcq", options: ["Butanoate d'éthyle", "Éthanoate de butyle", "Butanol d'éthyle", "Propanoate d'éthyle", "Butanoate de propyle"], correctAnswer: "Butanoate d'éthyle",
        lesson: "Chimie organique", tags: ["chimie", "nomenclature", "facile"]
    },
    {
        question: "Un mobile autoporteur de masse $m=500$ g est en mouvement circulaire uniforme à la vitesse $v=2$ m/s sur une table horizontale. Le rayon de la trajectoire est $R=40$ cm. Quelle est l'intensité de la force centripète ?",
        type: "mcq", options: ["$F=2,5$ N", "$F=5$ N", "$F=10$ N", "$F=20$ N", "$F=1$ N"], correctAnswer: "$F=5$ N",
        lesson: "Mouvement circulaire", tags: ["physique", "mécanique", "calcul"]
    },
    {
        question: "Une onde se propage le long d'une corde avec une célérité de $20 \\text{m/s}$. La distance entre deux crêtes successives est de 4 m. Quelle est la période temporelle $T$ de l'onde ?",
        type: "mcq", options: ["$T=0,1$ s", "$T=0,2$ s", "$T=0,5$ s", "$T=5$ s", "$T=80$ s"], correctAnswer: "$T=0,2$ s",
        lesson: "Les ondes mécaniques progressives", tags: ["physique", "ondes", "relation"]
    },
    {
        question: "On dissout 10,6 g de carbonate de sodium $Na_2CO_3$ dans l'eau pour obtenir 500 mL de solution. Quelle est la concentration molaire de la solution ? Données: $M(Na)=23, M(C)=12, M(O)=16$ g/mol.",
        type: "mcq", options: ["$C=0,1$ mol/L", "$C=0,2$ mol/L", "$C=0,05$ mol/L", "$C=0,5$ mol/L", "$C=1,0$ mol/L"], correctAnswer: "$C=0,2$ mol/L",
        lesson: "Concentrations molaires", tags: ["chimie", "calculs", "bases"]
    },
    {
        question: "L'énergie cinétique d'un électron est de $1,6 \\cdot 10^{-16}$ J. Quelle est sa vitesse, en négligeant les effets relativistes ? Donnée: $m_e = 9,1 \\cdot 10^{-31}$ kg.",
        type: "mcq", options: ["$5,9 \\cdot 10^6$ m/s", "$1,9 \\cdot 10^7$ m/s", "$3,5 \\cdot 10^{14}$ m/s", "$1,3 \\cdot 10^8$ m/s", "$8,8 \\cdot 10^5$ m/s"], correctAnswer: "$1,9 \\cdot 10^7$ m/s",
        lesson: "Travail et énergie cinétique", tags: ["physique", "mécanique", "calcul"]
    },
    {
        question: "La constante d'équilibre de la réaction $N_2(g) + 3H_2(g) \\rightleftharpoons 2NH_3(g)$ est $K_c = 4,0$ à une certaine température. Si à l'équilibre, $[N_2] = 0,1$ M et $[H_2] = 0,2$ M, quelle est la concentration de $NH_3$ ?",
        type: "mcq", options: ["$[NH_3] = 0,057$ M", "$[NH_3] = 0,032$ M", "$[NH_3] = 0,179$ M", "$[NH_3] = 0,0032$ M", "$[NH_3] = 0,8$ M"], correctAnswer: "$[NH_3] = 0,057$ M",
        lesson: "Équilibre chimique", tags: ["chimie", "calcul", "difficile"]
    },
    {
        question: "Une lentille convergente a une vergence $C = +5$ dioptries. Un objet est placé à 30 cm en avant de la lentille. Où se forme l'image ?",
        type: "mcq", options: ["À 60 cm derrière la lentille", "À 30 cm derrière la lentille", "À 20 cm derrière la lentille", "À 15 cm devant la lentille", "À 60 cm devant la lentille"], correctAnswer: "À 60 cm derrière la lentille",
        lesson: "Lentilles minces", tags: ["physique", "optique", "application"]
    },
    {
        question: "Quelle est la stéréochimie de la molécule de (S)-2-butanol ?",
        type: "mcq", options: ["Chirale, énantiomère R existe", "Achirale, pas d'énantiomère", "Chirale, diastéréoisomère existe", "Composé méso", "Isomère Z/E"], correctAnswer: "Chirale, énantiomère R existe",
        lesson: "Stéréochimie", tags: ["chimie", "organique", "conceptuel"]
    }
];

function generatePracticeQuestionPrompt(context) {
    const { subjectName, difficultyLevelApi, selectedLessonTitre, selectedParagraphTexte, lessonForJsonOutput } = context;

    // --- 1. اختيار مثال سياقي (الأهمية القصوى) ---
    // نبحث أولاً عن مثال من نفس الدرس المطلوب
    let relevantExample = exampleQuestions.find(q => q.lesson === selectedLessonTitre);
    
    // إذا لم نجد مثالاً مطابقاً، نختار مثالاً عشوائياً كخطة بديلة
    if (!relevantExample) {
        const randomIndex = Math.floor(Math.random() * exampleQuestions.length);
        relevantExample = exampleQuestions[randomIndex];
    }
    
    // ضبط الوسوم والموضوع ليتوافق مع سياق الطلب الحالي
    relevantExample.lesson = lessonForJsonOutput;
    relevantExample.tags = ["concours", "médecine", subjectName.toLowerCase(), difficultyLevelApi];

    const promptExpertise = `Vous êtes un expert concepteur de QCM d'excellence pour les concours de santé (médecine, pharmacie), spécialisé en Physique-Chimie. Votre signature est la création de questions pertinentes qui testent la réflexion et non la mémorisation simple.`;
    
    // --- 2. تعليمات جديدة ومشددة ---
    const specificGuidance = `
**RÈGLE D'OR n°1 : INSPIRATION, PAS IMITATION**
L'exemple JSON ci-dessous est un **guide de style, de structure et de difficulté**, PAS un modèle à copier. Votre mission est de créer une question **entièrement nouvelle et originale** à partir du paragraphe fourni. Analysez la *méthode* de l'exemple (demande-t-il un calcul en 2 étapes ? une analyse conceptuelle ?), mais appliquez-la à un **problème différent** et unique tiré du sujet.

**RÈGLE D'OR n°2 : QUALITÉ LaTeX IMPECCABLE**
Le rendu mathématique doit être parfait. Utilisez impérativement la syntaxe LaTeX correcte.
- **DO :** \`$^{238}_{92}\\\text{U}\` , \`$\\frac{1}{2}mv^2$\` , \`$1,6 \\cdot 10^{-19}$\`
- **DON'T :** \`U-238\` , \`1/2mv^2\` , \`1,6 * 10^-19\` , et surtout **JAMAIS** de texte parasite comme "ext" à l'intérieur des formules.`;

    // --- 3. استخدام المثال السياقي في صيغة الإخراج ---
    const outputFormat = `
**FORMAT DE SORTIE :** JSON STRICT (QCM avec 5 options). L'exemple suivant illustre le **niveau de qualité et de formatage attendu**.
\`\`\`json
${JSON.stringify(relevantExample, null, 2)}
\`\`\``;

    // --- 4. تجميع البرومبت النهائي مع التركيز على الهدف الحصري ---
    return `Vous êtes ${promptExpertise}\n\n${specificGuidance}\n\n**VOTRE MISSION :**\nCréez une question unique et de niveau concours en vous basant **exclusivement** sur le sujet suivant :\n- **Leçon :** "${selectedLessonTitre}"\n- **Contenu du paragraphe :** "${selectedParagraphTexte}"\n\n${outputFormat}`;
}

module.exports = { generatePracticeQuestionPrompt };