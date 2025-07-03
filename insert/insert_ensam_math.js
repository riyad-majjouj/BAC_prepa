const mongoose = require('mongoose');

// ==================================================================================
// 1. إعدادات الاتصال وقاعدة البيانات
// ==================================================================================
const dbURI = 'mongodb+srv://majoriyad:CUbNhg4PYp4Bc0vU@cluster0.bpqezif.mongodb.net/test?retryWrites=true&w=majority';
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
// 4. قائمة الأسئلة
// ==================================================================================

// --- الجزء الأول: الأسئلة الـ 25 المستخرجة من الامتحان (free_text) ---
const extractedQuestions = [
    { text: "Dans $[1, \\pi]$, l'équation $\\ln(x) e^x - \\cos(x) - 1 = 0$ admet : (Indiquer le nombre de solutions)", correctAnswer: "1 solution (par étude de fonction)", type: "free_text", level: "صعب" },
    { text: "Pour $n \\in \\mathbb{N}$, soit $S_n = 1 - \\frac{1}{3} + \\frac{1}{3^2} - \\dots - \\frac{1}{3^n}$. Quelle est la limite de $S_n$ ?", correctAnswer: "$\\frac{3}{4}$", type: "free_text", level: "صعب" },
    { text: "Soit $u_0 = \\frac{1}{2}$ et $u_{n+1} = \\sqrt{2+u_n}$ pour $\\forall n \\ge 0$. Sachant que la suite $(u_n)$ est croissante, quelle est sa limite ?", correctAnswer: "2", type: "free_text", level: "صعب" },
    { text: "Soit $f$ une fonction dérivable en 0 telle que $f(0)=0$ et $f'(0)=\\frac{1}{2}$. La limite $L = \\lim_{x \\to 0} \\frac{x}{f(x)+2f(x^2)+\\dots+nf(x^n)}$ est égale à :", correctAnswer: "2", type: "free_text", level: "صعب" },
    { text: "Soit $f(x)=\\frac{e^x - \\cos(x)}{x}$ si $x \\neq 0$ et $f(0)=0$. Quelle est la valeur de $f'(0)$ ?", correctAnswer: "$\\frac{1}{2}$", type: "free_text", level: "صعب" },
    { text: "Soit $f(x) = \\frac{e^x - \\ln(x)}{\\sqrt{x}}$. La courbe représentative de $f$ admet en $+\\infty$ : (Indiquer le type de branche infinie)", correctAnswer: "Branche parabolique de direction (Oy)", type: "free_text", level: "صعب" },
    { text: "Pour $z \\in \\mathbb{C}$, on note par $M(z)$ le point du plan complexe d'affixe $z$. L'ensemble $A = \\{ M(z) : 2z + 2\\bar{z} + z\\bar{z} = 0 \\}$ est :", correctAnswer: "Un cercle", type: "free_text", level: "صعب" },
    { text: "Dans l'espace muni d'un repère orthonormé $(O, \\vec{i}, \\vec{j}, \\vec{k})$ avec $||\\vec{i}||=||\\vec{j}||=||\\vec{k}||=1$ cm, on considère le plan (P) passant par O et de vecteur normal $\\vec{n}(2, -1, 3)$. La distance du point $A(1, 0, -1)$ au plan (P) est égale à :", correctAnswer: "$\\frac{1}{\\sqrt{14}}$", type: "free_text", level: "صعب" },
    { text: "Pour $n \\in \\mathbb{N}$, soit $I_n = \\int_{0}^{1} \\frac{x^n}{1+x^n} dx$ et $J_n = \\int_{0}^{1} \\frac{1}{1+x^n} dx$. Calculer la limite de $I_n + J_n$.", correctAnswer: "1", type: "free_text", level: "صعب" },
    { text: "Pour $n \\in \\mathbb{N}^*$ et $a \\in \\mathbb{R}$, soit le polynôme $P=X^n + aX^{n-1} + \\dots + aX + a$. Le nombre réel $P(1-a)$ est égale à :", correctAnswer: "$(1-a)^n + a$", type: "free_text", level: "صعب" },
    { text: "Soit $f$ une fonction de $\\mathbb{R}$ vers $\\mathbb{R}$ telle que $f(x-y)=f(x)f(y)$, $\\forall (x,y) \\in \\mathbb{R}^2$. Que peut-on dire de la fonction $f$ ?", correctAnswer: "$f(x) = a^x$ (fonction exponentielle)", type: "free_text", level: "صعب" },
    { text: "L'équation $1+\\cos(x)+\\cos(2x)=0$ admet dans $]-\\pi, \\pi]$ : (Indiquer le nombre de solutions)", correctAnswer: "4 solutions", type: "free_text", level: "صعب" },
    { text: "Dans $\\mathbb{Z}^2$, l'équation $x^3-3y^2=8$ admet : (Indiquer le nombre de paires de solutions entières)", correctAnswer: "2 paires de solutions : (2,2) et (2,-2)", type: "free_text", level: "صعب" },
    { text: "Le reste de la division euclidienne de $2022^{2023}$ par 7 est :", correctAnswer: "6", type: "free_text", level: "صعب" },
    { text: "Soit le chiffre des unités du nombre entier naturel $4444^{4444} + 6666^{4444}$.", correctAnswer: "2", type: "free_text", level: "صعب" },
    { text: "Une enquête révèle : la population féminine représente 48% de la population totale, 60% des filles possèdent des compétences et 20% des garçons sans compétences. Quelle est la probabilité P pour qu'un étudiant interrogé au hasard soit sans compétences ?", correctAnswer: "0,296", type: "free_text", level: "صعب" },
    { text: "Une agence de voyage propose de visiter 4 villes parmi 8 (Meknès, Fès, Taza, Rabat, Marrakech et Agadir). Quel est le nombre N de formules possibles si l'ordre de visite compte ?", correctAnswer: "1680", type: "free_text", level: "صعب" },
    { text: "En donnant la forme géométrique et la forme algébrique du nombre complexe $\\frac{1+i\\sqrt{3}}{2-2i}$, déterminer la valeur de $\\tan(\\frac{7\\pi}{12})$.", correctAnswer: "$- (2+\\sqrt{3})$", type: "free_text", level: "صعب" },
    { text: "Dans le plan complexe, on considère les points A, B, C et D d'affixes respectives a, b, c et d. Sachant que $a+c=b+d$ et $\\frac{c-a}{d-b}=i$, donner la nature du quadrilatère ABCD.", correctAnswer: "Un losange", type: "free_text", level: "صعب" },
    { text: "Calculer la limite $\\lim_{x \\to 1} f(x)$ où $f(x) = \\frac{\\sin(\\pi x)}{\\sqrt{x}-1}$.", correctAnswer: "$-2\\pi$", type: "free_text", level: "صعب" },
    { text: "Calculer l'intégrale $I = \\int_{0}^{\\frac{\\pi}{4}} \\frac{\\cos(x)-\\sin(x)}{\\cos(x)+\\sin(x)} dx$.", correctAnswer: "$\\frac{1}{2}\\ln(2)$", type: "free_text", level: "صعب" },
    { text: "Soit $f(x) = \\frac{\\sqrt{x+1}}{x+1}$ et soit $C_f$ sa courbe. Calculer le volume V du solide engendré par la rotation de $C_f$ autour de l'axe des abscisses et délimité par les plans d'équations $x=0$ et $x=1$.", correctAnswer: "$\\ln(2)$", type: "free_text", level: "صعب" },
    { text: "Déterminer l'équation cartésienne du plan (P) tangent à la sphère $S: x^2+y^2+z^2-2y-2z=0$ au point O.", correctAnswer: "y+z=0", type: "free_text", level: "صعب" },
    { text: "Sachant que la fonction $x \\mapsto \\cos(x)$ est une solution de $(E'): y''-2y'+2y=\\cos(x)+2\\sin(x)$, déterminer la solution particulière $y_0$ de (E) telle que sa courbe passe par l'origine O et ayant une tangente en O de coefficient directeur -1.", correctAnswer: "$y_0(x) = \\cos(x) - e^x\\cos(x)$", type: "free_text", level: "صعب" },
    { text: "Une boîte en carton ouverte sur le dessus a un volume de $32 \\text{cm}^3$ et une arête de la base de 4cm. Quelles doivent être ses dimensions pour que sa surface totale soit minimale ?", correctAnswer: "Base 4cm x 4cm, Hauteur 2cm", type: "free_text", level: "صعب" }
];


// --- الجزء الثاني: 20 سؤالاً جديداً بمستوى متوسط (mcq) ---
const newMcqQuestions = [
    { text: "Soit $f(x) = (x-1)e^{2x}$. Une primitive $F$ de $f$ sur $\\mathbb{R}$ est :", options: ["$F(x) = (\\frac{x}{2}-\\frac{3}{4})e^{2x}$", "$F(x) = x e^{2x}$", "$F(x) = (x-1)e^{2x}$", "$F(x) = \\frac{1}{2}(x-1)^2 e^{2x}$", "Aucune de ces réponses"], correctAnswer: "$F(x) = (\\frac{x}{2}-\\frac{3}{4})e^{2x}$", type: "mcq", level: "متوسط" },
    { text: "La limite de la suite $u_n = n(\\sqrt{1+\\frac{2}{n}} - 1)$ est :", options: ["$0$", "$1$", "$2$", "$\\frac{1}{2}$", "$+\\infty$"], correctAnswer: "$1$", type: "mcq", level: "متوسط" },
    { text: "Dans $\\mathbb{C}$, le nombre $(1-i)^8$ est égal à :", options: ["$16$", "$-16$", "$16i$", "$-16i$", "$256$"], correctAnswer: "$16$", type: "mcq", level: "متوسط" },
    { text: "La solution de l'équation différentielle $y' + 3y = 6$ avec $y(0)=1$ est :", options: ["$y(x)=2-e^{-3x}$", "$y(x)=e^{3x}$", "$y(x)=6-5e^{-3x}$", "$y(x)=2+e^{-3x}$", "$y(x)=1$"], correctAnswer: "$y(x)=2-e^{-3x}$", type: "mcq", level: "متوسط" },
    { text: "On tire simultanément 3 cartes d'un jeu de 32 cartes. Quelle est la probabilité d'obtenir exactement 2 As ?", options: ["$\\frac{C_4^2 \\cdot C_{28}^1}{C_{32}^3}$", "$\\frac{A_4^2 \\cdot A_{28}^1}{A_{32}^3}$", "$\\frac{2}{32}$", "$\\frac{4 \\times 28}{32 \\times 31 \\times 30}$", "Autre réponse"], correctAnswer: "$\\frac{C_4^2 \\cdot C_{28}^1}{C_{32}^3}$", type: "mcq", level: "متوسط" },
    { text: "La valeur moyenne de la fonction $f(x) = \\sin(x)$ sur l'intervalle $[0, \\pi]$ est :", options: ["$0$", "$\\frac{1}{\\pi}$", "$\\frac{2}{\\pi}$", "$1$", "2"], correctAnswer: "$\\frac{2}{\\pi}$", type: "mcq", level: "متوسط" },
    { text: "Soit la suite géométrique $(v_n)$ de premier terme $v_0=3$ et de raison $q=2$. La somme $S = v_0 + v_1 + \\dots + v_9$ est égale à :", options: ["$3(2^{10}-1)$", "$3(1-2^{10})$", "$3 \\cdot \\frac{2^9-1}{1}$", "$3069$", "3072"], correctAnswer: "$3(2^{10}-1)$", type: "mcq", level: "متوسط" },
    { text: "Dans l'espace, la droite (D) a pour représentation paramétrique $\\{x=1+2t, y=2-t, z=3+t\\}$. Lequel de ces points appartient à (D) ?", options: ["$(3,1,4)$", "$(1,2,3)$", "$(-1,3,2)$", "$(2,-1,1)$", "Aucun de ces points"], correctAnswer: "$(3,1,4)$", type: "mcq", level: "متوسط" },
    { text: "Résoudre dans $\\mathbb{R}$ l'inéquation $\\ln(x-1) + \\ln(x+1) < \\ln(3)$.", options: ["$]1, 2[$", "$]-2, 2[$", "$]1, +\\infty[$", "$]-\\infty, -2[ \\cup ]2, +\\infty[$", "Aucune solution"], correctAnswer: "$]1, 2[$", type: "mcq", level: "متوسط" },
    { text: "La dérivée de $g(x) = \\frac{e^x - 1}{e^x + 1}$ est :", options: ["$g'(x)=\\frac{2e^x}{(e^x+1)^2}$", "$g'(x)=\\frac{-2e^x}{(e^x+1)^2}$", "$g'(x)=1$", "$g'(x)=\\frac{e^{2x}-1}{(e^x+1)^2}$", "Autre réponse"], correctAnswer: "$g'(x)=\\frac{2e^x}{(e^x+1)^2}$", type: "mcq", level: "متوسط" },
    { text: "Le module du nombre complexe $z = 5 - 12i$ est :", options: ["7", "17", "13", "$\\sqrt{119}$", "169"], correctAnswer: "13", type: "mcq", level: "متوسط" },
    { text: "Une variable aléatoire X suit une loi binomiale $B(10, 0.4)$. Son espérance $E(X)$ et sa variance $V(X)$ sont :", options: ["$E(X)=4, V(X)=2.4$", "$E(X)=4, V(X)=6$", "$E(X)=10, V(X)=4$", "$E(X)=0.4, V(X)=2.4$", "Autre réponse"], correctAnswer: "$E(X)=4, V(X)=2.4$", type: "mcq", level: "متوسط" },
    { text: "Calculer l'intégrale $\\int_{0}^{1} (3x^2+e^x) dx$.", options: ["$e$", "$e-1$", "$e+1$", "$1+e$", "$e+2$"], correctAnswer: "$e$", type: "mcq", level: "متوسط" },
    { text: "Quelle est l'équation du plan passant par $A(1,-1,2)$ et de vecteur normal $\\vec{n}(2,3,-1)$ ?", options: ["$2x+3y-z+3=0$", "$x-y+2z=0$", "$2x+3y-z-3=0$", "$2x+3y-z=0$", "Aucune de ces réponses"], correctAnswer: "$2x+3y-z+3=0$", type: "mcq", level: "متوسط" },
    { text: "La limite de $\\frac{x^2 - 4}{x-2}$ quand $x \\to 2$ est :", options: ["0", "2", "4", "N'existe pas", "$+\\infty$"], correctAnswer: "4", type: "mcq", level: "متوسط" },
    { text: "Soit $f(x) = \\ln(2x-4)$. Le domaine de définition de $f$ est :", options: ["$]2, +\\infty[$", "$[2, +\\infty[$", "$\\mathbb{R}$", "$]0, +\\infty[$", "$]-\\infty, 2[$"], correctAnswer: "$]2, +\\infty[$", type: "mcq", level: "متوسط" },
    { text: "On jette une pièce de monnaie équilibrée 3 fois. Quelle est la probabilité d'obtenir exactement 2 'Face' ?", options: ["$\\frac{1}{8}$", "$\\frac{2}{8}$", "$\\frac{3}{8}$", "$\\frac{4}{8}$", "$\\frac{5}{8}$"], correctAnswer: "$\\frac{3}{8}$", type: "mcq", level: "متوسط" },
    { text: "L'argument principal du nombre complexe $z = -1-i$ est :", options: ["$\\frac{\\pi}{4}$", "$-\\frac{\\pi}{4}$", "$\\frac{3\\pi}{4}$", "$-\\frac{3\\pi}{4}$", "$\\frac{5\\pi}{4}$"], correctAnswer: "$-\\frac{3\\pi}{4}$", type: "mcq", level: "متوسط" },
    { text: "Soit la suite $u_n = 5 - 2n$. La valeur de $u_{10}$ est :", options: ["$-15$", "15", "25", "-25", "52"], correctAnswer: "$-15$", type: "mcq", level: "متوسط" },
    { text: "L'équation de la tangente à la courbe de $f(x)=x^3$ au point d'abscisse 1 est :", options: ["$y=3x-2$", "$y=x+1$", "$y=3x$", "$y=3x+1$", "$y=x^3$"], correctAnswer: "$y=3x-2$", type: "mcq", level: "متوسط" }
];


// دمج القائمتين
const allQuestions = [...extractedQuestions, ...newMcqQuestions];

// تعديل جميع الأسئلة لإضافة البيانات الوصفية الموحدة
const questionsToInsert = allQuestions.map(q => ({
    ...q,
    academicLevel: CORRECT_ACADEMIC_LEVEL_ID,
    track: CORRECT_TRACK_ID,
    subject: CORRECT_SUBJECT_ID,
    lesson: "ENSAM 2023" // توحيد اسم الدرس
}));

// ==================================================================================
// 5. الوظيفة الرئيسية (للإضافة فقط)
// ==================================================================================
async function insertEnsamMathData() {
    console.log('محاولة الاتصال بقاعدة البيانات...');
    try {
        await mongoose.connect(dbURI);
        console.log('تم الاتصال بقاعدة البيانات بنجاح!');
        
        console.log(`\n--- جاري إضافة دفعة جديدة من ${questionsToInsert.length} سؤال لـ ENSAM (Math)... ---`);
        const insertResult = await Question.insertMany(questionsToInsert);
        console.log(`✅ تمت الإضافة بنجاح! عدد الأسئلة المضافة: ${insertResult.length}`);
        console.log("\nاكتملت عملية إضافة دفعة ENSAM.");

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