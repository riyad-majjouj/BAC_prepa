// back-end/models/TimedExamAttempt.js

const mongoose = require('mongoose');

// هذا المخطط لا يحتاج تعديلاً لأن userAnswer من نوع Mixed
const subQuestionAnswerSchema = new mongoose.Schema({
    subQuestionText: { type: String, required: true },
    subQuestionOrderInProblem: { type: Number, required: true },
    subQuestionPoints: { type: Number, default: 0 },
    userAnswer: { type: mongoose.Schema.Types.Mixed, default: null }, // يستطيع تخزين نص أو كائن
    awardedPoints: { type: Number, default: 0 },
    aiFeedback: { type: String, default: "Pending grading." },
});


// =================================================================
// ---> تم تعديل هذا المخطط لتخزين بيانات الأسئلة الجديدة للطالب
// =================================================================
const subQuestionDataSchema = new mongoose.Schema({
    text: { type: String, required: true },
    points: { type: Number, required: true, default: 1 },
    difficultyOrder: { type: Number, required: true },
    type: {
        type: String,
        required: true,
        // تمت إضافة الأنواع الجديدة هنا بشكل متوافق مع الواجهات
        enum: [
            'free_text',
            'mcq',
            'true_false',
            'true_false_justify',
            'matching_pairs', // نوع "صل بسهم"
            'fill_table',     // نوع "املأ الجدول"
            // الأنواع الأخرى الموجودة مسبقًا
            'gap_filling',
            'gap_filling_multiple_choice',
            'section_title',
            'instruction_group',
        ],
        default: 'free_text'
    },
    // حقول للأنواع المختلفة
    options: [{ type: String }],
    correctAnswer: { type: mongoose.Schema.Types.Mixed }, // يمكن أن يكون نصاً أو كائناً
    imageUrl: { type: String, default: null },

    // --- حقول جديدة لـ matching_pairs (صل بسهم) ---
    group_a_items: [{ type: String }], // القائمة أ
    group_b_items: [{ type: String }], // القائمة ب
    correct_matches: { type: mongoose.Schema.Types.Mixed }, // الإجابات الصحيحة

    // --- حقول جديدة لـ fill_table (املأ الجدول) ---
    table_headers: [{ type: String }], // عناوين الأعمدة
    table_rows: { type: mongoose.Schema.Types.Mixed }, // هيكل الجدول
    correct_answers_table: { type: mongoose.Schema.Types.Mixed }, // الإجابات الصحيحة للجدول

    // حقول أخرى موجودة مسبقًا
    correct_answer_details: { type: mongoose.Schema.Types.Mixed },
    isWritingPrompt: { type: Boolean, default: false },
});

const problemSchema = new mongoose.Schema({
    problemId: { type: String, required: true, default: () => new mongoose.Types.ObjectId().toString() },
    problemTitle: { type: String, required: true },
    problemText: { type: String, default: '' },
    problemLesson: { type: String },
    orderInExam: { type: Number, required: true },
    problemTotalPossibleRawScore: { type: Number, default: 0 },
    problemRawScore: { type: Number, default: 0 },
    subQuestionsData: [subQuestionDataSchema],
    subQuestionAnswers: [subQuestionAnswerSchema],
});

const timedExamAttemptSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    academicLevel: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicLevel', required: true },
    track: { type: mongoose.Schema.Types.ObjectId, ref: 'Track', required: true },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    difficulty: { type: String, enum: ['سهل', 'متوسط', 'صعب'], required: true },
    problems: [problemSchema],
    overallTotalPossibleRawScore: { type: Number, default: 0 },
    overallRawScore: { type: Number, default: 0 },
    overallScoreOutOf20: { type: Number, default: 0 },
    timeLimitMinutes: { type: Number, required: true },
    startTime: { type: Date, default: Date.now },
    endTime: { type: Date },
    status: { type: String, enum: ['in-progress', 'completed', 'submitted', 'grading-failed', 'time-expired', 'timed-out'], default: 'in-progress' }, // أضفت timed-out للتوافق
    source: { type: String, enum: ['ai_generated', 'db_devoir'], required: true },
    sourceDevoirId: { type: mongoose.Schema.Types.ObjectId, ref: 'Devoir', default: null },
    config: { type: mongoose.Schema.Types.Mixed, default: {} },
    expiresAt: { type: Date, index: { expires: '5h' } }
}, {
    timestamps: true
});

module.exports = mongoose.model('TimedExamAttempt', timedExamAttemptSchema);