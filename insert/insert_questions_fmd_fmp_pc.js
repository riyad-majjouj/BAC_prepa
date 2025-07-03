const mongoose = require('mongoose');

// ==================================================================================
// 1. الإعدادات
// ==================================================================================
const dbURI = 'mongodb+srv://majoriyad:CUbNhg4PYp4Bc0vU@cluster0.bpqezif.mongodb.net/test?retryWrites=true&w=majority';
const collectionName = 'questions';

// ==================================================================================
// 2. تعريف البنية (Schema)
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
// 3. المعرفات (IDs) الصحيحة
// ==================================================================================
const CORRECT_ACADEMIC_LEVEL_ID = '6856e58a42d2333b081f4379';
const CORRECT_TRACK_ID = '6856e61e42d2333b081f43c3';
const CORRECT_SUBJECT_ID = '6856e88342d2333b081f44cc';

// ==================================================================================
// 4. قائمة الأسئلة (الأساسية + الصعبة الجديدة)
// ==================================================================================

// --- الجزء الأول: الأسئلة المستخرجة من الامتحان (تم تصحيحها) ---
const examQuestions = [
    {
        text: "Le noyau de thorium $^{230}_{90}Th$ subit une série de désintégrations $\\alpha$ et $\\beta^-$ pour donner le noyau de plomb $^{206}_{82}Pb$. L'équation globale s'écrit : $^{230}_{90}Th \\to ^{206}_{82}Pb + x\\alpha + y\\beta^-$. Quelles sont les valeurs de x et y ?",
        options: ["x = 6 et y = 6", "x = 2 et y = 4", "x = 6 et y = 4", "x = 4 et y = 4", "x = 4 et y = 2"],
        correctAnswer: "x = 6 et y = 4",
        level: "متوسط"
    },
    // ... يمكنك إضافة بقية الأسئلة المستخرجة من الامتحان هنا بنفس الطريقة ...
];

// --- الجزء الثاني: 10 أسئلة جديدة بمستوى صعوبة أعلى ---
const harderGeneratedQuestions = [
    {
        text: "Dans un circuit RC série, la tension aux bornes du condensateur lors de sa charge est $u_C(t) = 12(1 - e^{-50t})$. Le circuit est alimenté par un générateur de f.e.m E. Quelle est la valeur de la résistance R si la capacité est $C = 100 \\mu F$ ?",
        options: ["R = 100 Ω", "R = 200 Ω", "R = 50 Ω", "R = 1 kΩ", "R = 500 Ω"],
        correctAnswer: "R = 200 Ω",
        level: "صعب"
    },
    {
        text: "L'activité A d'un échantillon radioactif est de 800 Bq à l'instant t=0. Sa demi-vie est $t_{1/2} = 15$ heures. Quelle sera son activité après 60 heures ?",
        options: ["A = 400 Bq", "A = 200 Bq", "A = 100 Bq", "A = 50 Bq", "A = 25 Bq"],
        correctAnswer: "A = 50 Bq",
        level: "صعب"
    },
    {
        text: "On titre 20,0 mL d'une solution d'acide éthanoïque $CH_3COOH$ de concentration $C_A = 0,10 mol.L^{-1}$ par une solution de soude $NaOH$ de concentration $C_B = 0,10 mol.L^{-1}$. Donnée: $pK_a(CH_3COOH/CH_3COO^-) = 4,8$. Quel est le pH de la solution après l'ajout de 10,0 mL de soude ?",
        options: ["pH = 2,87", "pH = 4,80", "pH = 5,74", "pH = 7,00", "pH = 8,72"],
        correctAnswer: "pH = 4,80",
        level: "صعب"
    },
    {
        text: "Un skieur de masse 80 kg aborde un tremplin avec une vitesse de 20 m/s. Le tremplin fait un angle de 30° avec l'horizontale. Quelle est l'équation de la trajectoire $y(x)$ du skieur après avoir quitté le tremplin ? (On prend $g = 10 m.s^{-2}$ et l'origine au point de décollage).",
        options: ["$y(x) = \\frac{\\sqrt{3}}{3}x - \\frac{1}{60}x^2$", "$y(x) = \\sqrt{3}x - \\frac{1}{30}x^2$", "$y(x) = x - 0,05x^2$", "$y(x) = 0,5x - \\frac{1}{80}x^2$", "$y(x) = \\frac{\\sqrt{3}}{2}x - \\frac{1}{40}x^2$"],
        correctAnswer: "$y(x) = \\frac{\\sqrt{3}}{3}x - \\frac{1}{60}x^2$",
        level: "صعب"
    },
    {
        text: "L'équation horaire d'un oscillateur harmonique est $x(t) = 0,05 \\cos(20\\pi t + \\frac{\\pi}{2})$. Quelle est la vitesse maximale de l'oscillateur ?",
        options: ["$v_{max} = 1 m/s$", "$v_{max} = \\pi$ m/s", "$v_{max} = 20\\pi$ m/s", "$v_{max} = 0,05$ m/s", "$v_{max} = 1000$ m/s"],
        correctAnswer: "$v_{max} = \\pi$ m/s",
        level: "صعب"
    },
    {
        text: "On réalise la diffraction de la lumière par une fente de largeur $a$. L'écart angulaire $\\theta$ est lié à la longueur d'onde $\\lambda$ par $\\theta = \\frac{\\lambda}{a}$. Si on utilise une lumière bleue ($\\lambda_1 = 450 nm$) puis une lumière rouge ($\\lambda_2 = 700 nm$) avec la même fente, comment varie la largeur de la tache centrale L ?",
        options: ["L ne change pas", "L augmente d'environ 55%", "L diminue d'environ 55%", "L double", "L est divisée par deux"],
        correctAnswer: "L augmente d'environ 55%",
        level: "صعب"
    },
    {
        text: "Dans un circuit RL, l'équation différentielle est $L\\frac{di}{dt} + ri = E$. A t=0, l'intensité est nulle. Quelle est l'expression de l'énergie magnétique $E_m$ emmagasinée dans la bobine à l'instant $t$ ?",
        options: ["$E_m = \\frac{1}{2} L (\\frac{E}{r})^2 (1 - e^{-\\frac{r}{L}t})^2$", "$E_m = \\frac{1}{2} L (\\frac{E}{r}) (1 - e^{-\\frac{r}{L}t})$", "$E_m = \\frac{1}{2} \\frac{E^2}{r} t$", "$E_m = \\frac{1}{2} C E^2$", "$E_m = \\frac{1}{2} L I_{max}^2$"],
        correctAnswer: "$E_m = \\frac{1}{2} L (\\frac{E}{r})^2 (1 - e^{-\\frac{r}{L}t})^2$",
        level: "صعب"
    },
    {
        text: "On considère la réaction $2NO_2(g) \\rightleftharpoons N_2O_4(g)$. À l'équilibre, on a 0,2 mol de $NO_2$ et 0,4 mol de $N_2O_4$ dans un volume de 2 L. Quelle est la valeur de la constante d'équilibre $K_c$ ?",
        options: ["$K_c = 2$", "$K_c = 10$", "$K_c = 20$", "$K_c = 40$", "$K_c = 0,1$"],
        correctAnswer: "$K_c = 20$",
        level: "صعب"
    },
    {
        text: "Un satellite géostationnaire orbite autour de la Terre. Quelle est la seule proposition correcte le concernant ?",
        options: ["Sa période de révolution est de 24 heures.", "Il peut être placé au-dessus de n'importe quel point du globe.", "Son orbite est elliptique.", "Sa vitesse augmente à mesure qu'il s'éloigne de la Terre.", "Il n'est pas soumis à la gravitation terrestre."],
        correctAnswer: "Sa période de révolution est de 24 heures.",
        level: "متوسط"
    },
    {
        text: "Quelle est la force électromotrice (f.e.m) d'une pile Daniell (Cu/Zn) sachant que $E^0(Cu^{2+}/Cu) = +0,34 V$ et $E^0(Zn^{2+}/Zn) = -0,76 V$ ?",
        options: ["f.e.m = 0,42 V", "f.e.m = -0,42 V", "f.e.m = 1,10 V", "f.e.m = -1,10 V", "f.e.m = 0,55 V"],
        correctAnswer: "f.e.m = 1,10 V",
        level: "متوسط"
    }
];

// دمج القائمتين
const allQuestions = [...examQuestions, ...harderGeneratedQuestions];

// تعديل جميع الأسئلة لإضافة البيانات الوصفية الموحدة
const questionsToInsert = allQuestions.map(q => ({
    ...q,
    academicLevel: CORRECT_ACADEMIC_LEVEL_ID,
    track: CORRECT_TRACK_ID,
    subject: CORRECT_SUBJECT_ID,
    type: "mcq",
    lesson: "FMD-FMP 2023"
}));

// ==================================================================================
// 5. الوظيفة الرئيسية لتنفيذ الحذف المضمون ثم الإضافة الكاملة
// ==================================================================================
async function cleanAndInsertData() {
    console.log('محاولة الاتصال بقاعدة البيانات...');
    const connection = await mongoose.connect(dbURI);
    console.log('تم الاتصال بقاعدة البيانات بنجاح!');
    
    try {
        // --- الخطوة 1: حذف جميع الأسئلة الموجودة مسبقاً لهذا الدرس ---
        console.log(`\n--- الخطوة 1: جاري حذف جميع الأسئلة القديمة للدرس "FMD-FMP 2023" ---`);
        const deleteFilter = { lesson: "FMD-FMP 2023" };
        const deleteResult = await Question.deleteMany(deleteFilter);
        console.log(`✅ تم الحذف بنجاح! عدد المستندات المحذوفة: ${deleteResult.deletedCount}`);
        
        // --- الخطوة 2: إضافة المجموعة الجديدة والكاملة من الأسئلة ---
        console.log(`\n--- الخطوة 2: جاري إضافة ${questionsToInsert.length} سؤال جديد ومحسّن... ---`);
        const insertResult = await Question.insertMany(questionsToInsert);
        console.log(`✅ تمت الإضافة بنجاح! عدد الأسئلة المضافة: ${insertResult.length}`);
        console.log("\nاكتملت العملية بنجاح. تم تنظيف الدرس وإضافة الأسئلة الجديدة.");

    } catch (error) {
        console.error('❌ حدث خطأ أثناء العملية:', error);
    } finally {
        await connection.connection.close();
        console.log('\nتم إغلاق الاتصال بقاعدة البيانات.');
    }
}

// ==================================================================================
// 6. تشغيل الوظيفة الرئيسية
// ==================================================================================
cleanAndInsertData();