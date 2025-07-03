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
    type: { type: String, default: "mcq" },
    text: { type: String, required: true },
    options: [String],
    correctAnswer: { type: String, required: true },
    lesson: { type: String, required: true },
    generatedBy: { type: String, default: "AI-assisted DB Seeder" },
}, { timestamps: true });

const Question = mongoose.model('Question', questionSchema, collectionName);

// ==================================================================================
// 3. المعرفات (IDs) للمادة والمسار
// ==================================================================================
const CORRECT_ACADEMIC_LEVEL_ID = '6856e58a42d2333b081f4379';
const CORRECT_TRACK_ID = '6856e61e42d2333b081f43c3';
const CORRECT_SUBJECT_ID = '6856e87942d2333b081f44c3';

// ==================================================================================
// 4. دفعة جديدة من 20 سؤالاً بمستوى صعوبة عالٍ
// ==================================================================================
const newGeneratedQuestions = [
    // --- Complex Numbers ---
    { text: "La forme exponentielle du nombre complexe $z = \\frac{(1+i\\sqrt{3})^3}{(1-i)^4}$ est :", options: ["$2e^{i\\pi}$", "$2e^{i\\frac{\\pi}{2}}$", "$4e^{-i\\pi}$", "$e^{i\\frac{3\\pi}{2}}$", "Autre réponse"], correctAnswer: "$2e^{i\\pi}$", level: "صعب" },
    { text: "Dans $\\mathbb{C}$, on considère la transformation $f$ qui à tout point $M(z)$ associe le point $M'(z')$ tel que $z' = (\\frac{1}{2} + i\\frac{\\sqrt{3}}{2})z + 1 - i$. Quelle est la nature de cette transformation ?", options: ["Une translation de vecteur $\\vec{u}(1,-1)$", "Une homothétie de rapport 2", "Une rotation d'angle $\\frac{\\pi}{3}$ et de centre d'affixe $1-i\\sqrt{3}$", "Une rotation d'angle $\\frac{\\pi}{6}$", "Une similitude directe"], correctAnswer: "Une rotation d'angle $\\frac{\\pi}{3}$ et de centre d'affixe $1-i\\sqrt{3}$", level: "صعب" },
    { text: "L'ensemble des points M d'affixe z tels que $|z-2i| = |z+1-i|$ est :", options: ["Un cercle de centre A(2i)", "La médiatrice du segment [AB] avec A(-1+i) et B(2i)", "Une droite passant par l'origine", "Un demi-plan", "L'ensemble vide"], correctAnswer: "La médiatrice du segment [AB] avec A(-1+i) et B(2i)", level: "متوسط" },
    { text: "Les solutions dans $\\mathbb{C}$ de l'équation $z^4 = -16$ sont :", options: ["$\\{\\pm 2i, \\pm 2\\}$", "$\\{\\sqrt{2}(1+i), \\sqrt{2}(-1+i), \\sqrt{2}(-1-i), \\sqrt{2}(1-i)\\}$", "$\\{2e^{i\\frac{\\pi}{4}}, 2e^{i\\frac{3\\pi}{4}}, 2e^{i\\frac{5\\pi}{4}}, 2e^{i\\frac{7\\pi}{4}}\\}$", "$\\{\\pm 1 \\pm i\\}$", "Autre réponse"], correctAnswer: "$\\{\\sqrt{2}(1+i), \\sqrt{2}(-1+i), \\sqrt{2}(-1-i), \\sqrt{2}(1-i)\\}$", level: "صعب" },
    
    // --- Sequences and Limits ---
    { text: "Calculer $\\lim_{x \\to 0} (1+2x)^{\\frac{1}{x}}$.", options: ["$1$", "$2$", "$e$", "$e^2$", "$+\\infty$"], correctAnswer: "$e^2$", level: "صعب" },
    { text: "On considère la suite $(u_n)$ définie par $u_0 = 1$ et $u_{n+1} = \\sqrt{6+u_n}$. La suite $(u_n)$ est :", options: ["Décroissante et non bornée", "Croissante et converge vers 3", "Décroissante et converge vers 2", "Périodique", "Géométrique"], correctAnswer: "Croissante et converge vers 3", level: "متوسط" },
    { text: "La valeur de la somme $S = \\sum_{k=0}^{10} \\binom{10}{k} 2^k$ est :", options: ["$2^{10}$", "$3^{10}$", "$10! \\cdot 2^{10}$", "$1024$", "Non calculable"], correctAnswer: "$3^{10}$", level: "صعب" },
    { text: "Quelle est la limite de la suite $v_n = \\frac{n!}{(n+1)! - n!}$ ?", options: ["$0$", "$1$", "$+\\infty$", "$\\frac{1}{2}$", "n'existe pas"], correctAnswer: "$0$", level: "متوسط" },

    // --- Integrals and Primitives ---
    { text: "La valeur de $\\int_{1}^{e} \\frac{\\ln(x)}{x^2} dx$ est :", options: ["$1 - \\frac{2}{e}$", "$1 + \\frac{1}{e}$", "$e-1$", "$1 - e^{-2}$", "Autre réponse"], correctAnswer: "$1 - \\frac{2}{e}$", level: "صعب" },
    { text: "Calculer l'aire de la surface délimitée par la courbe de la fonction $f(x)=x^2$ et la droite d'équation $y=x+2$.", options: ["$\\frac{9}{2}$", "$\\frac{13}{6}$", "$5$", "$\\frac{27}{2}$", "Autre réponse"], correctAnswer: "$\\frac{9}{2}$", level: "صعب" },
    { text: "Une primitive de la fonction $f(x) = \\frac{1}{x^2+2x+2}$ est :", options: ["$\\ln(x^2+2x+2)$", "$\\arctan(x+1)$", "$\\frac{-1}{x+1}$", "$\\arctan(x)$", "Autre réponse"], correctAnswer: "$\\arctan(x+1)$", level: "صعب" },
    
    // --- Differential Equations ---
    { text: "La solution générale de l'équation différentielle $y'' - 4y' + 4y = 0$ est de la forme :", options: ["$y(x) = (Ax+B)e^{2x}$", "$y(x) = Ae^{2x} + Be^{-2x}$", "$y(x) = A\\cos(2x)+B\\sin(2x)$", "$y(x) = Ae^{4x}$", "Autre réponse"], correctAnswer: "$y(x) = (Ax+B)e^{2x}$", level: "متوسط" },
    { text: "Trouver la solution de l'équation $y' + y = 2e^{-x}$ vérifiant $y(0) = 3$.", options: ["$y(x) = (2x+3)e^{-x}$", "$y(x) = 3e^{-x}$", "$y(x) = 2xe^{-x} + 3$", "$y(x) = e^x + 2e^{-x}$", "Autre réponse"], correctAnswer: "$y(x) = (2x+3)e^{-x}$", level: "صعب" },

    // --- 3D Geometry ---
    { text: "Quelle est l'équation du plan médiateur du segment [AB] avec $A(1,0,-1)$ et $B(3,2,1)$ ?", options: ["$x+y+z-3=0$", "$2x+2y-2=0$", "$x-y+z-1=0$", "$2x+y-z=0$", "Autre réponse"], correctAnswer: "$x+y+z-3=0$", level: "متوسط" },
    { text: "Calculer la distance du point $P(1,1,1)$ au plan d'équation $2x - y + 2z - 10 = 0$.", options: ["$1$", "$2$", "$\\frac{7}{3}$", "$3$", "$\\frac{10}{3}$"], correctAnswer: "$3$", level: "متوسط" },
    { text: "L'intersection de la sphère $(S): x^2+y^2+z^2 = 9$ et du plan $(P): z=1$ est :", options: ["Un point unique", "Un cercle de rayon $2\\sqrt{2}$", "Un cercle de rayon 3", "L'ensemble vide", "Deux points"], correctAnswer: "Un cercle de rayon $2\\sqrt{2}$", level: "متوسط" },
    
    // --- Various Calculus ---
    { text: "Soit la fonction $f(x) = x^x$ pour $x>0$. La valeur de sa dérivée $f'(e)$ est :", options: ["$e^e$", "$2e^e$", "$e^{e-1}$", "$1$", "Autre réponse"], correctAnswer: "$2e^e$", level: "صعب" },
    { text: "Si $f(x) = \\int_{0}^{x^2} \\sqrt{1+t^2} dt$, alors $f'(1)$ est égal à :", options: ["$\\sqrt{2}$", "$2\\sqrt{2}$", "$1$", "$\\frac{1}{\\sqrt{2}}$", "Autre réponse"], correctAnswer: "$2\\sqrt{2}$", level: "صعب" },
    { text: "Soit $A = \\begin{pmatrix} 2 & 1 \\\\ 1 & 2 \\end{pmatrix}$. Quelles sont les valeurs propres de la matrice A ?", options: ["$\\{1, 2\\}$", "$\\{2, 2\\}$", "$\\{1, 3\\}$", "$\\{0, 4\\}$", "La matrice n'a pas de valeurs propres réelles"], correctAnswer: "$\\{1, 3\\}$", level: "متوسط" },
    { text: "Dans un lancer de deux dés équilibrés, quelle est la probabilité que la somme des faces soit égale à 8 ?", options: ["$\\frac{1}{6}$", "$\\frac{5}{36}$", "$\\frac{1}{12}$", "$\\frac{7}{36}$", "$\\frac{1}{9}$"], correctAnswer: "$\\frac{5}{36}$", level: "متوسط" }
];


// تعديل جميع الأسئلة لإضافة البيانات الوصفية الموحدة
const questionsToInsert = newGeneratedQuestions.map(q => ({
    ...q,
    academicLevel: CORRECT_ACADEMIC_LEVEL_ID,
    track: CORRECT_TRACK_ID,
    subject: CORRECT_SUBJECT_ID,
    type: "mcq",
    lesson: "FMD-FMP 2023" // توحيد اسم الدرس
}));

// ==================================================================================
// 5. الوظيفة الرئيسية (للإضافة فقط)
// ==================================================================================
async function insertNewMathBatch() {
    console.log('محاولة الاتصال بقاعدة البيانات...');
    try {
        await mongoose.connect(dbURI);
        console.log('تم الاتصال بقاعدة البيانات بنجاح!');
        
        console.log(`\n--- جاري إضافة دفعة جديدة من ${questionsToInsert.length} سؤال في مادة الرياضيات... ---`);
        const insertResult = await Question.insertMany(questionsToInsert);
        console.log(`✅ تمت الإضافة بنجاح! عدد الأسئلة المضافة: ${insertResult.length}`);
        console.log("\nاكتملت عملية إضافة الدفعة الجديدة.");

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
insertNewMathBatch();