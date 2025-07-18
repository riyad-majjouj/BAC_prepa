// back-end/models/UserProgress.js
const mongoose = require('mongoose');

const UserProgressSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    // --- الحقول المشتركة ---
    userAnswer: {
        type: String,
        required: true,
        trim: true,
    },
    isCorrect: {
        type: Boolean,
        required: true
    },
    attemptedAt: {
        type: Date,
        default: Date.now
    },
    pointsAwarded: { // النقاط الممنوحة لهذا التقدم المحدد
        type: Number,
        default: 0
    },

    // --- حقول لسؤال من قاعدة البيانات (DB Question) ---
    question: { // ObjectId لسؤال من مجموعة Questions
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
        index: true, // سيكون مطلوبًا بشكل مشروط عبر pre-save hook
        default: null
    },

    // --- حقول لسؤال تم إنشاؤه بواسطة AI (AI Question) ---
    isAiQuestion: {
        type: Boolean,
        default: false,
        index: true
    },
    aiQuestionText: {
        type: String,
        trim: true
    },
    aiQuestionType: {
        type: String,
        trim: true,
    },
    aiQuestionOptions: {
        type: [String],
        default: undefined
    },
    aiQuestionCorrectAnswer: {
        type: String,
        trim: true
    },
    aiQuestionLesson: {
        type: String,
        trim: true
    },
    // aiQuestionTemporaryId: { // اختياري: إذا كنت تريد تخزين المعرف المؤقت الأصلي
    //     type: String,
    //     index: true // قم بفهرسته إذا كنت ستبحث به كثيرًا
    // },

    // --- حقول السياق الأكاديمي (مهمة لكليهما) ---
    academicLevel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AcademicLevel',
        required: [true, 'Academic Level context is required for progress.'],
        index: true,
    },
    track: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Track',
        required: [true, 'Track context is required for progress.'],
        index: true,
    },
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
        required: [true, 'Subject context is required for progress.'],
        index: true,
    },
    difficultyLevel: { // 'سهل', 'متوسط', 'صعب' (قيمة DB المخزنة)
        type: String,
        required: [true, 'Difficulty level context is required for progress.'],
        enum: ['سهل', 'متوسط', 'صعب'],
    },

    // --- حقول خاصة بسياق الاختبار ---
    examContext: {
        timedExamAttempt: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'TimedExamAttempt',
            index: true
        },
        problemTitle: String,
        problemOrder: Number,
        subQuestionText: String,
        subQuestionOrder: Number,
        aiGeneratedFeedback: String, // التقييم من AI (يمكن أن يكون هنا أو في TimedExamAttempt)
        subQuestionMaxPoints: Number, // النقاط القصوى للسؤال الفرعي
    }

}, { timestamps: true });

// Middleware (pre-save hook) للتحقق من صحة الحقول المطلوبة بشكل مشروط
UserProgressSchema.pre('save', function(next) {
    if (this.isAiQuestion) {
        this.question = undefined; // تأكد من أن حقل question (ObjectId) فارغ لأسئلة AI

        // إذا كان التقدم لسؤال AI عام (وليس جزءًا من اختبار)، تأكد من وجود تفاصيل السؤال
        if (!this.examContext || !this.examContext.timedExamAttempt) {
            if (!this.aiQuestionText || this.aiQuestionText.trim() === '') {
                return next(new Error('For AI practice questions, aiQuestionText is required.'));
            }
            if (!this.aiQuestionType || this.aiQuestionType.trim() === '') {
                return next(new Error('For AI practice questions, aiQuestionType is required.'));
            }
            // يمكنك إضافة المزيد من التحققات هنا إذا لزم الأمر
        }
    } else { // إذا لم يكن سؤال AI (أي سؤال DB)
        if (!this.question) { // this.question يجب أن يكون ObjectId
            return next(new Error('For DB questions, the question ObjectId is required.'));
        }
        // مسح حقول AI إذا لم يكن سؤال AI (للنظافة)
        this.aiQuestionText = undefined;
        this.aiQuestionType = undefined;
        this.aiQuestionOptions = undefined;
        this.aiQuestionCorrectAnswer = undefined;
        this.aiQuestionLesson = undefined;
        // this.aiQuestionTemporaryId = undefined;
    }
    next();
});

// الفهرس الفريد: يضمن أن المستخدم لا يجيب على نفس السؤال (من DB) أكثر من مرة.
// هذا الفلتر الجزئي يطبق الفهرس فقط عندما يكون حقل 'question' موجودًا وقيمته ليست null.
// هذا يعني أنه يتجاهل المستندات التي يكون فيها 'question' هو null (أي أسئلة AI).
UserProgressSchema.index({ user: 1, question: 1 }, {
    unique: true,
    partialFilterExpression: { question: { $exists: true, $ne: null } }
});

// (اختياري) فهرس لأسئلة الاختبار لضمان التفرد لكل سؤال فرعي في محاولة اختبار معينة
// إذا كنت تريد التأكد من أن المستخدم يجيب على كل سؤال فرعي في الاختبار مرة واحدة فقط لكل محاولة.
UserProgressSchema.index(
    {
        user: 1,
        'examContext.timedExamAttempt': 1,
        'examContext.problemOrder': 1,
        'examContext.subQuestionOrder': 1
    },
    {
        unique: true,
        partialFilterExpression: { 'examContext.timedExamAttempt': { $exists: true } }
    }
);


const UserProgress = mongoose.model('UserProgress', UserProgressSchema);
module.exports = UserProgress;