const mongoose = require('mongoose');

// ==================================================================================
// 1. إعدادات الاتصال وقاعدة البيانات
// ==================================================================================
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
// 4. دفعة جديدة من 12 سؤالاً
// ==================================================================================
const newGeneratedQuestions = [
    {
        text: "La partie imaginaire du complexe : $z = \\frac{(1+i\\sqrt{3})}{(1-i\\sqrt{3})^2}$ est :",
        options: ["$-\\frac{1}{12}$", "$\\sqrt{3}$", "0", "$\\frac{\\sqrt{3}}{2}$", "$-\\frac{1}{\\sqrt{3}}$"],
        correctAnswer: "0",
        level: "متوسط"
    },
    {
        text: "L'ensemble des solutions de l'équation : $\\frac{z+1}{z-1}=-1$ est :",
        options: ["$\\{\\frac{\\sqrt{3}}{2}+i\\}$", "$\\{\\frac{-1+i\\sqrt{3}}{2}, \\frac{-1-i\\sqrt{3}}{2}\\}$", "$\\{\\frac{\\sqrt{3}}{2}-i\\}$", "$\\{\\frac{-1+i\\sqrt{3}}{3}, \\frac{-1-i\\sqrt{3}}{3}\\}$", "0"],
        correctAnswer: "$\\{\\frac{-1+i\\sqrt{3}}{2}, \\frac{-1-i\\sqrt{3}}{2}\\}$",
        level: "متوسط"
    },
    {
        text: "Le domaine de définition de : $g(x) = \\sqrt{x^2-2x-2}$ est :",
        options: ["$]1-\\sqrt{3}, 1+\\sqrt{3}[$", "$\\mathbb{R}^*$", "$]-\\infty, 1-\\sqrt{3}] \\cup [1+\\sqrt{3}, +\\infty[$", "$\\mathbb{R} - \\{1-\\sqrt{3}, 1+\\sqrt{3}\\}$", "$\\mathbb{R} - ]1-\\sqrt{3}, 1+\\sqrt{3}[$"],
        correctAnswer: "$]-\\infty, 1-\\sqrt{3}] \\cup [1+\\sqrt{3}, +\\infty[$",
        level: "سهل"
    },
    {
        text: "La valeur de la limite : $\\lim_{x \\to +\\infty} \\frac{\\sqrt{2x^2+1}-\\sqrt{x+1}}{x}$ est :",
        options: ["$+\\infty$", "n'existe pas", "$\\sqrt{2}$", "$\\frac{1}{\\sqrt{2}}$", "0"],
        correctAnswer: "$\\sqrt{2}$",
        level: "سهل"
    },
    {
        text: "($U_n$) est une suite numérique définie par : $u_1 = 1$ et $u_{n+1} = 2u_n + \\frac{n+2}{n(n+1)}$. La raison de la suite $(V_n)$ définie par $V_n = u_n + \\frac{1}{n}$ est :",
        options: ["-1/2", "2", "0", "-2", "1/2"],
        correctAnswer: "2",
        level: "صعب"
    },
    {
        text: "Soit h la fonction définie par : $h(x) = \\frac{\\sin(\\pi x)}{x-1}$ pour $x \\ne 1$ et $h(1)=a; (a \\in \\mathbb{R})$. La valeur de a pour que h soit continue en $x=1$ est :",
        options: ["$\\pi$", "$\\frac{\\pi}{2}$", "$\\sqrt{2}$", "$-\\pi$", "$-\\frac{\\pi}{2}$"],
        correctAnswer: "$-\\pi$",
        level: "متوسط"
    },
    {
        text: "Soit g une fonction numérique définie et dérivable sur $I=]0, +\\infty[$; tel que : $g(x) = xg(\\frac{1}{x})$ pour $x \\in ]0, +\\infty[$ et $g(1)=1$. La valeur de $g'(1)$ est :",
        options: ["-2", "0", "1/2", "2/3", "-1/2"],
        correctAnswer: "1/2",
        level: "صعب"
    },
    {
        text: "La valeur de l'intégrale : $I = \\int_0^1 \\frac{1}{1+x} dx$ est :",
        options: ["-1/6", "0", "$\\ln(\\frac{1}{2})$", "$\\ln(2)$", "$2\\ln(\\frac{3}{2})$"],
        correctAnswer: "$\\ln(2)$",
        level: "متوسط"
    },
    {
        text: "La courbe représentative de la fonction f définie par : $f(x) = x + \\frac{x}{\\sqrt{1+2x^2}}$ admet au voisinage de $+\\infty$ une asymptote d'équation :",
        options: ["$y=x$", "$y=x+1$", "$y=\\frac{1}{\\sqrt{2}}x+1$", "$y=2x+\\frac{1}{2}$", "$y=x+\\frac{\\sqrt{2}}{2}$"],
        correctAnswer: "$y=x+\\frac{\\sqrt{2}}{2}$",
        level: "متوسط"
    },
    {
        text: "Dans le plan rapporté à un repère orthonormé, on considère les deux courbes de $f(x)=\\sqrt{x}$ et $g(x)=x^2$. La surface du domaine délimité par ces courbes et les droites $x=0$ et $x=1$ est :",
        options: ["$1/3 \\text{ cm}^2$", "$1/2 \\text{ cm}^2$", "$2/3 \\text{ cm}^2$", "$1 \\text{ cm}^2$", "$2(5-2\\sqrt{2}) \\text{ cm}^2$"],
        correctAnswer: "$1/3 \\text{ cm}^2$",
        level: "متوسط"
    },
    {
        text: "Soit h la fonction numérique définie sur $\\mathbb{R}$ et (C) sa courbe dans un repère orthonormé. Le point $\\Omega(1,2)$ est un centre de symétrie pour (C) si ($\\forall x \\in \\mathbb{R}$) on a :",
        options: ["$h(x) = 2x$", "$h(2-x) + h(x) = 4$", "$h(2-x) = h(x)$", "$h(1-x) = 2-h(x)$", "$h(-x)=-h(x)$"],
        correctAnswer: "$h(2-x) + h(x) = 4$",
        level: "سهل"
    },
    {
        text: "On jette deux dés équilibrés et numérotés de 1 à 6. La probabilité d'obtenir deux faces dont la somme des numéros est égale à 8 est :",
        options: ["5/36", "1/12", "6/36", "1/36", "8/36"],
        correctAnswer: "5/36",
        level: "سهل"
    }
];


const questionsToInsert = newGeneratedQuestions.map(q => ({
    ...q,
    academicLevel: CORRECT_ACADEMIC_LEVEL_ID,
    track: CORRECT_TRACK_ID,
    subject: CORRECT_SUBJECT_ID,
    type: "mcq",
    lesson: "FMD-FMP 2009"
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