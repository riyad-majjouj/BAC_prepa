// back-end/models/TimedExamAttempt.js
const mongoose = require('mongoose');

// مخطط فرعي للأسئلة الفرعية الأصلية (كما تم إنشاؤها بواسطة AI)
// هذه البيانات لا تتغير بعد إنشاء الاختبار
const OriginalSubQuestionSchema = new mongoose.Schema({
    text: { type: String, required: true },
    difficultyOrder: { type: Number, required: true }, // ترتيبه داخل التمرين
    points: { type: Number, required: true },       // النقاط المخصصة له
}, { _id: false });

// مخطط فرعي لإجابات المستخدم على الأسئلة الفرعية
const SubQuestionAnswerSchema = new mongoose.Schema({
    subQuestionText: { type: String, required: true }, // نص السؤال الفرعي (للمرجعية)
    subQuestionOrderInProblem: { type: Number, required: true }, // ترتيبه داخل التمرين
    subQuestionPoints: { type: Number, required: true }, // النقاط الأصلية للسؤال الفرعي
    userAnswer: { type: String, trim: true, default: null },
    aiFeedback: { type: String, default: null },
    awardedPoints: { type: Number, default: 0 },
}, { _id: false });

// مخطط فرعي لكل تمرين/مشكلة داخل الاختبار
const ProblemAttemptSchema = new mongoose.Schema({
    // لا يوجد problemQuestion (ObjectId) هنا لأن البيانات مضمنة
    problemTitle: { type: String, required: true, trim: true }, // عنوان التمرين
    problemText: { type: String, required: true, trim: true },   // نص التمرين الرئيسي
    problemLesson: { type: String, trim: true },                 // الدرس المرتبط (إن وجد)
    subQuestionsData: [OriginalSubQuestionSchema], // بيانات الأسئلة الفرعية الأصلية
    orderInExam: { type: Number, required: true }, // ترتيب هذا التمرين في الاختبار
    subQuestionAnswers: [SubQuestionAnswerSchema], // إجابات المستخدم على الأسئلة الفرعية
    problemRawScore: { type: Number, default: 0 }, // مجموع نقاط المستخدم لهذا التمرين
    problemTotalPossibleRawScore: { type: Number, required: true }, // مجموع النقاط الممكنة لهذا التمرين
}, { _id: false });


const TimedExamAttemptSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    academicLevel: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicLevel', required: true },
    track: { type: mongoose.Schema.Types.ObjectId, ref: 'Track', required: true },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    difficulty: { // الصعوبة العامة للاختبار
        type: String,
        required: true,
        enum: ['سهل', 'متوسط', 'صعب']
    },
    problems: [ProblemAttemptSchema], // مصفوفة من بيانات التمارين وإجابات المستخدم
    overallRawScore: { type: Number, default: 0 }, // مجموع نقاط المستخدم في الاختبار
    overallTotalPossibleRawScore: { type: Number, required: true }, // مجموع النقاط الممكنة للاختبار
    overallScoreOutOf20: { type: Number, default: 0 }, // النتيجة المحولة إلى مقياس من 20
    timeLimitMinutes: { type: Number, required: true },
    startTime: { type: Date, default: Date.now },
    endTime: { type: Date },
    status: {
        type: String,
        enum: ['in-progress', 'completed', 'timed-out', 'aborted', 'grading-failed'],
        default: 'in-progress',
        index: true
    },
    config: { // إعدادات الاختبار عند إنشائه
        numberOfProblems: Number,
        difficultyApiValue: String, // قيمة API للصعوبة المستخدمة في الإنشاء
        // يمكنك إضافة إعدادات أخرى هنا
    }
}, { timestamps: true });

const TimedExamAttempt = mongoose.model('TimedExamAttempt', TimedExamAttemptSchema);
module.exports = TimedExamAttempt;