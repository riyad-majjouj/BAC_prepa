const mongoose = require('mongoose');

// ==================================================================================
// 1. إعدادات الاتصال وقاعدة البيانات
// ==================================================================================
// تأكد من أن هذا الـ URI صحيح
const dbURI = 'mongodb+srv://majoriyad:ohX8v7WGQEfI56GR@cluster0.bpqezif.mongodb.net/test?retryWrites=true&w=majority';
const collectionName = 'questions';

// ==================================================================================
// 2. تعريف بنية السؤال (Schema)
// ==================================================================================
const questionSchema = new mongoose.Schema({
    academicLevel: { type: mongoose.Schema.Types.ObjectId, required: true },
    track: { type: mongoose.Schema.Types.ObjectId, required: true },
    subject: { type: mongoose.Schema.Types.ObjectId, required: true },
    level: { type: String, required: true },
    type: { type: String, required: true },
    text: { type: String, required: true },
    options: [String], // ليس مطلوباً للأسئلة من نوع free_text
    correctAnswer: { type: String, required: true },
    lesson: { type: String, required: true },
    generatedBy: { type: String, default: "DB Seeder" },
}, { timestamps: true });

const Question = mongoose.model('Question', questionSchema, collectionName);

// ==================================================================================
// 3. المعرفات (IDs) المستخرجة من الصورة الخاصة بـ ENSAM
// ==================================================================================
const CORRECT_ACADEMIC_LEVEL_ID = '6856e58a42d2333b081f4379';
const CORRECT_TRACK_ID = '6856e5fa42d2333b081f43ae';
const CORRECT_SUBJECT_ID = '6856e78b42d2333b081f444f';

// ==================================================================================
// 4. قائمة الأسئلة (الدفعة الرابعة)
// ==================================================================================
const allQuestions = [
    // --- More from 2016 Exam ---
    {
        text: "Dans une boite se trouvent 14 jetons 'SAHARA MAROCAIN'. On tire simultanément 5 jetons. On répète l'expérience 3 fois en remettant les jetons. Quelle est la probabilité d'obtenir 3 fois le mot 'SMARA'?",
        options: ["(1000)/(1001)³", "1/(1001)³", "1002/(1001)³", "1003/(1001)³"],
        correctAnswer: "1/(1001)³",
        type: "mcq",
        level: "صعب",
        lesson: "Probabilités (Loi Binomiale)"
    },
    {
        text: "Soit $I_n = \\int_0^1 x e^{-nx^2} dx$. Choisir la bonne réponse :",
        options: ["$I_n = \\frac{1}{2n}(1 - e^{-n})$", "$I_n$ est minoré par 1", "$I_n$ converge vers 0", "Aucunes des trois réponses"],
        correctAnswer: "$I_n$ converge vers 0",
        type: "mcq",
        level: "متوسط",
        lesson: "Suites et Intégrales"
    },
    // --- More from 2015 Exam ---
    {
        text: "Soit A: 'Il existe un polynôme P(x) = ax³+bx²+cx+d à coeffs dans Z tel que P(1)=1 et P(2015)=2'. Dire si A est vraie ou fausse.",
        correctAnswer: "Fausse (car P(2015)-P(1) doit être divisible par 2015-1)",
        type: "free_text",
        level: "صعب",
        lesson: "Arithmétique et Polynômes"
    },
    {
        text: "Déterminer la primitive F de la fonction $x \\mapsto \\frac{1}{x\\ln(x)}$ sur $]1, +\\infty[$ qui vaut 1 en e.",
        correctAnswer: "$F(x) = \\ln(\\ln x) + 1$",
        type: "free_text",
        level: "متوسط",
        lesson: "Calcul de primitives"
    },
    {
        text: "On considère un rectangle de longueur x. Déterminer la valeur minimale P_m du périmètre sachant que sa surface est 100.",
        correctAnswer: "$P_m = 40$",
        type: "free_text",
        level: "متوسط",
        lesson: "Optimisation"
    },
    {
        text: "Soit $f(x) = \\frac{e^x-1}{x} + \\ln(x)$. La courbe de f...",
        options: ["admet en +∞ une branche parabolique de direction y=0", "admet une asymptote oblique en +∞", "est au-dessus de la droite y=0", "aucune des trois réponses"],
        correctAnswer: "admet en +∞ une branche parabolique de direction y=0",
        type: "mcq",
        level: "متوسط",
        lesson: "Étude de fonctions (Branches infinies)"
    },
    // --- More from 2014 Exam ---
    {
        text: "Résoudre, dans $[0, 2\\pi]^2$, le système : $\\begin{cases} \\sqrt{2} \\cos x - \\cos y = 1/2 \\\\ \\sin x + \\cos y = \\sqrt{2} \\end{cases}$",
        correctAnswer: "La question semble mal posée ou très difficile.",
        type: "free_text",
        level: "صعب",
        lesson: "Systèmes d'équations trigonométriques"
    },
    {
        text: "Calculer $I = \\lim_{x \\to +\\infty} \\int_x^{x+\\sin x} \\frac{1}{(1+t^2)^2} dt$.",
        correctAnswer: "0",
        type: "free_text",
        level: "صعب",
        lesson: "Limites et Intégrales"
    },
    {
        text: "Une boite B₁ contient 2 jetons (1,3). Une boite B₂ (2,2). Une boite B₃ (1,0). On tire a de B₁, b de B₂, c de B₃. Quelle est la probabilité que ax²+bx+c=0 admette des racines réelles ?",
        options: ["0.5", "0.25", "0.75", "1"],
        correctAnswer: "0.75",
        type: "mcq",
        level: "متوسط",
        lesson: "Probabilités"
    },
    {
        text: "Dans l'espace, on considère les points A(-1,1,1) et B(7,-5,5). Soit S la sphère de diamètre [AB]. Le plan tangent à S au point C(1,1,-1) est :",
        options: ["2x-3y+4z+5=0", "4x+3y+2z-5=0", "2x+2y-z-5=0", "4x+2y+2z-5=0"],
        correctAnswer: "4x+3y+2z-5=0",
        type: "mcq",
        level: "متوسط",
        lesson: "Géométrie dans l'espace"
    },
    {
        text: "Soit la suite $u_n = \\int_{n^2}^{(n+1)^2} e^{-\\sqrt{t}} dt$. Alors...",
        options: ["$\\lim u_n = +\\infty$", "$\\lim u_n = 0$", "$\\lim u_n = 1$", "$\\lim u_n = e$"],
        correctAnswer: "$\\lim u_n = 0$",
        type: "mcq",
        level: "صعب",
        lesson: "Suites et Intégrales"
    },
    // --- More from 2013 Exam ---
    {
        text: "Déterminer l'ensemble des réels x vérifiant : $\\frac{2x+1}{x+1} \\le \\frac{2-3x}{2-x}$.",
        correctAnswer: "$x \\in ]-1, 0] \\cup [1, 2[$",
        type: "free_text",
        level: "متوسط",
        lesson: "Inéquations rationnelles"
    },
    {
        text: "Soit $a$ un paramètre réel et $f_a(x) = e^{-x} + ax$. Déterminer le point d'intersection $M(x_0, y_0)$ de la tangente à $C_{f_a}$ au point d'abscisse $x_0$ avec l'axe (O,j).",
        correctAnswer: "$M(0, e^{-x_0}(1+x_0))$",
        type: "free_text",
        level: "متوسط",
        lesson: "Géométrie Analytique et Dérivation"
    },
    {
        text: "Calculer $I = \\int_0^x (t-1)e^{-t} dt$ avec $x \\in \\mathbb{R}$.",
        correctAnswer: "$I = -xe^{-x}$",
        type: "free_text",
        level: "متوسط",
        lesson: "Calcul Intégral (Intégration par parties)"
    },
    {
        text: "Comment faire 21 avec les chiffres 1, 5, 6, 7 utilisés une fois chacun, et les opérateurs +, -, *, / ?",
        correctAnswer: "$6 / (1 - 5/7)$",
        type: "free_text",
        level: "متوسط",
        lesson: "Logique et Calcul"
    },
    // --- More from 2012 Exam ---
    {
        text: "Soit $I_n = \\int_0^1 \\frac{t^n}{1+t} dt$. Trouver une relation entre $I_n$ et $I_{n-1}$.",
        correctAnswer: "$I_n + I_{n-1} = 1/n$",
        type: "free_text",
        level: "متوسط",
        lesson: "Calcul Intégral (Relation de récurrence)"
    },
    // --- More from 2011 Exam ---
    {
        text: "Traduire à l'aide des quantificateurs: 'La fonction f est constante sur [0,5]'",
        correctAnswer: "$\\exists c \\in \\mathbb{R}, \\forall x \\in [0,5], f(x)=c$",
        type: "free_text",
        level: "سهل",
        lesson: "Logique et Quantificateurs"
    },
    {
        text: "Traduire à l'aide des quantificateurs: 'La fonction g n'est pas injective sur l'ensemble E'",
        correctAnswer: "$\\exists x_1 \\in E, \\exists x_2 \\in E, (x_1 \\neq x_2 \\text{ et } g(x_1)=g(x_2))$",
        type: "free_text",
        level: "سهل",
        lesson: "Logique et Quantificateurs"
    },
    {
        text: "Traduire à l'aide des quantificateurs: 'Tout réel possède une racine carrée dans R'",
        correctAnswer: "$\\forall x \\in \\mathbb{R}, \\exists y \\in \\mathbb{R}, y^2=x$",
        type: "free_text",
        level: "سهل",
        lesson: "Logique et Quantificateurs"
    },
    // --- Miscellaneous additions from various years ---
    {
        text: "Soit $a \\in ]0, \\pi[$. Calculer $D = \\int_a^{\\pi-a} \\frac{x}{\\sin(x)} dx$.",
        correctAnswer: "La question est mal posée, l'intégrale diverge. Peut-être une erreur de frappe.",
        type: "free_text",
        level: "صعب",
        lesson: "Calcul Intégral"
    },
    {
        text: "La proposition (p): n∈N est pair. La proposition (q): n∈N est impair. q est-elle la négation de p?",
        correctAnswer: "Oui",
        type: "free_text",
        level: "سهل",
        lesson: "Logique"
    },
    {
        text: "La proposition (p): f est paire. La proposition (q): f est impaire. q est-elle la négation de p?",
        correctAnswer: "Non",
        type: "free_text",
        level: "سهل",
        lesson: "Logique et Propriétés des fonctions"
    },
    {
        text: "Calculer la partie réelle et imaginaire du complexe $(1+i\\sqrt{3})^9$.",
        correctAnswer: "$-512$",
        type: "free_text",
        level: "متوسط",
        lesson: "Nombres Complexes"
    },
    {
        text: "Au fond d'un puits de 12m se trouve un escargot. Le jour il grimpe de 3m, la nuit il glisse de 2m. Il commence le 1er juin à 8h. Quel jour et heure sortira-t-il?",
        correctAnswer: "Le 10 juin à 8h du matin.",
        type: "free_text",
        level: "متوسط",
        lesson: "Logique et Suites"
    },
    {
        text: "Calculer l'intégrale $\\int_2^3 \\ln(\\frac{x+1}{x-1}) dx$.",
        correctAnswer: "$4\\ln(4)-3\\ln(3)-2\\ln(2)$",
        type: "free_text",
        level: "متوسط",
        lesson: "Calcul Intégral (Intégration par parties)"
    },
    {
        text: "Déterminer l'ensemble $f(I)$ pour $f(x) = \\frac{1}{x^2-1}$ et $I = ]0,1[$.",
        correctAnswer: "$]-\\infty, -1[$",
        type: "free_text",
        level: "سهل",
        lesson: "Image d'un ensemble par une fonction"
    },
    {
        text: "Déterminer l'ensemble $f(I)$ pour $f(x) = \\sin(x)$ et $I = ]0, \\pi]$.",
        correctAnswer: "$]0, 1]$",
        type: "free_text",
        level: "سهل",
        lesson: "Image d'un ensemble par une fonction"
    },
    {
        text: "Citer parmi les propositions A: (P⇒Q)⇒R, B: (P et Q)⇒R, C: P⇒(Q⇒R), D: (P⇒R) et (Q⇒R), celles qui sont équivalentes.",
        correctAnswer: "B et C sont équivalentes.",
        type: "free_text",
        level: "متوسط",
        lesson: "Logique et Raisonnement"
    },
    {
        text: "Résoudre dans $\\mathbb{R}$ l'équation : $3^{2x} + 4^{x} = 5^{x}$",
        correctAnswer: "La question est probablement une erreur de frappe pour $3^x+4^x=5^x$. Si oui, la solution est x=2.",
        type: "free_text",
        level: "متوسط",
        lesson: "Équations avec exponentielles"
    },
    {
        text: "Soit la fonction $f(x) = x \\ln(1+x)$. La limite de $f'(x)$ quand $x$ tend vers $-1^+$ est $+\\infty$.",
        correctAnswer: "Faux (la limite est $-\\infty$)",
        type: "free_text",
        level: "متوسط",
        lesson: "Limites et Dérivabilité"
    },
    {
        text: "Une usine produit des pièces, 2% sont défectueuses. 97% des bonnes sont acceptées, 99% des défectueuses sont rejetées. Quelle est la probabilité P qu'une pièce soit bonne ET rejetée ?",
        correctAnswer: "$P = 0.98 \\times 0.03 = 0.0294$",
        type: "free_text",
        level: "متوسط",
        lesson: "Probabilités conditionnelles"
    },
    {
        text: "Soit S la sphère d'équation $x^2+y^2+z^2-2x-2y+1=0$. Le plan tangent à S au point O(0,0,0) est $x+y=0$.",
        correctAnswer: "Faux, le point O n'appartient pas à la sphère.",
        type: "free_text",
        level: "متوسط",
        lesson: "Géométrie dans l'espace"
    },
    {
        text: "La fonction $f(x) = \\tan(x)$ est définie sur $\\mathbb{R} \\setminus \\{ \\pi/2 + k\\pi \\}$. Sa primitive $F(x) = -\\ln|\\cos(x)|$ est définie sur le même ensemble.",
        correctAnswer: "Vrai",
        type: "free_text",
        level: "سهل",
        lesson: "Domaine de définition"
    },
    {
        text: "Soit $f(x) = x - \\ln(e^x+1)$. Cette fonction admet une asymptote oblique d'équation $y=0$ en $+\\infty$.",
        correctAnswer: "Vrai",
        type: "free_text",
        level: "متوسط",
        lesson: "Limites et Asymptotes"
    },
    {
        text: "La suite $u_n = (-1)^n + 1/n$ est convergente.",
        correctAnswer: "Faux",
        type: "free_text",
        level: "سهل",
        lesson: "Suites Numériques"
    },
    {
        text: "L'intégrale $\\int_0^{+\\infty} e^{-x} dx$ converge et vaut 1.",
        correctAnswer: "Vrai",
        type: "free_text",
        level: "متوسط",
        lesson: "Intégrales Généralisées"
    },
    {
        text: "Le nombre de solutions de l'équation $x^3 = x+1$ dans $\\mathbb{R}$ est :",
        correctAnswer: "1",
        type: "free_text",
        level: "متوسط",
        lesson: "Théorème des valeurs intermédiaires"
    },
    {
        text: "Soit A une matrice carrée de taille n. Si $A^2=0$, alors $A=0$.",
        correctAnswer: "Faux",
        type: "free_text",
        level: "متوسط",
        lesson: "Matrices"
    },
    {
        text: "La fonction $f(x)=|x|\\sin(x)$ est dérivable en 0.",
        correctAnswer: "Vrai",
        type: "free_text",
        level: "متوسط",
        lesson: "Dérivabilité"
    },
    {
        text: "Le nombre de permutations de l'ensemble {a, b, c, d} est :",
        correctAnswer: "$4! = 24$",
        type: "free_text",
        level: "سهل",
        lesson: "Dénombrement"
    },
    {
        text: "Si $z$ est un nombre complexe tel que $|z|=1$, alors $z+\\frac{1}{z}$ est un nombre réel.",
        correctAnswer: "Vrai",
        type: "free_text",
        level: "متوسط",
        lesson: "Nombres Complexes"
    }
];

// ==================================================================================
// 5. الوظيفة الرئيسية
// ==================================================================================
async function insertEnsamMathData() {
    console.log('محاولة الاتصال بقاعدة البيانات...');
    try {
        await mongoose.connect(dbURI);
        console.log('تم الاتصال بقاعدة البيانات بنجاح!');
        
        const questionsToInsert = allQuestions.map(q => ({
            ...q,
            academicLevel: CORRECT_ACADEMIC_LEVEL_ID,
            track: CORRECT_TRACK_ID,
            subject: CORRECT_SUBJECT_ID,
        }));

        console.log(`\n--- جاري إضافة الدفعة الرابعة من ${questionsToInsert.length} سؤال لـ ENSAM (Math)... ---`);
        const insertResult = await Question.insertMany(questionsToInsert);
        console.log(`✅ تمت الإضافة بنجاح! عدد الأسئلة المضافة: ${insertResult.length}`);
        
    } catch (error) {
        console.error('❌ حدث خطأ أثناء عملية الإضافة:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\nتم إغلاق الاتصال بقاعدة البيانات.');
    }
}

// ==================================================================================
// 6. تشغيل الوظيفة الرئيسية
// ==================================================================================
insertEnsamMathData();