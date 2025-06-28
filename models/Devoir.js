const mongoose = require('mongoose');

// مخطط فرعي للأسئلة (الأسئلة التي تحت التعليمات)
const SubQuestionSchema = new mongoose.Schema({
    text: { type: String, required: true },
    points: { type: Number, required: true, min: 0 },
    // أنواع جديدة للأسئلة كما طلبت
    questionType: {
        type: String,
        required: true,
        enum: ['free_text', 'mcq', 'match_arrows', 'fill_table', 'true_false'],
        default: 'free_text',
    },
    // بيانات إضافية حسب نوع السؤال
    options: [String], // لأسئلة MCQ
    correctAnswer: String, // لأسئلة MCQ أو true_false
    // لأسئلة صل بسهم: مصفوفة من الأزواج
    matchingPairs: [{
        prompt: String,
        answer: String,
    }],
    // لأسئلة ملء الجدول: هيكل للجدول
    tableStructure: {
        headers: [String],
        rows: [[String]] // مصفوفة من المصفوفات لتمثيل الصفوف والخلايا
    }
}, { _id: false });

// مخطط فرعي للتعليمات (فهم النص, درس لغوي...)
const InstructionSchema = new mongoose.Schema({
    title: { type: String, required: true }, // مثال: "أولاً: فهم النص"
    content: { type: String }, // نص التعليمة أو وصفها
    imageUrl: { type: String }, // رابط الصورة إذا كانت التعليمة صورة
    subQuestions: [SubQuestionSchema] // الأسئلة التابعة لهذه التعليمة
}, { _id: false });

// مخطط فرعي للتمرين/الوضعية (Problem/Situation)
const ProblemSchema = new mongoose.Schema({
    title: { type: String, required: true }, // مثال: "دراسة نص الانطلاق"
    context: { type: String, required: true }, // نص الوضعية/المشكلة
    instructions: [InstructionSchema] // التعليمات التابعة لهذه الوضعية
}, { _id: false });

// المخطط الرئيسي للفرض
const DevoirSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'A title is required for the exam set.'],
        trim: true,
    },
    academicLevel: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicLevel', required: true, index: true },
    track: { type: mongoose.Schema.Types.ObjectId, ref: 'Track', required: true, index: true },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true, index: true },
    difficulty: { type: String, required: true, enum: ['سهل', 'متوسط', 'صعب'] },
    timeLimitMinutes: { type: Number, required: true, min: 10 },
    
    // *** الجزء الذي تم تعديله جذرياً ***
    // لم نعد نشير إلى موديل Question، بل نضمّن التمارين مباشرة
    problems: [ProblemSchema], 

    totalPoints: { type: Number, default: 0 },
    createdBy: { type: String, default: 'admin' }
}, { timestamps: true });

// Middleware لحساب مجموع النقاط تلقائياً قبل الحفظ
DevoirSchema.pre('save', function(next) {
    let total = 0;
    this.problems.forEach(problem => {
        problem.instructions.forEach(instruction => {
            instruction.subQuestions.forEach(sq => {
                total += sq.points || 0;
            });
        });
    });
    this.totalPoints = total;
    next();
});

const Devoir = mongoose.model('Devoir', DevoirSchema);
module.exports = Devoir;