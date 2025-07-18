// back-end/models/TimedExamAttempt.js

const mongoose = require('mongoose');

// This schema doesn't need changes
const subQuestionAnswerSchema = new mongoose.Schema({
    subQuestionText: { type: String, required: true },
    subQuestionOrderInProblem: { type: Number, required: true },
    userAnswer: { type: mongoose.Schema.Types.Mixed, default: null },
    awardedPoints: { type: Number, default: 0 },
    aiFeedback: { type: String, default: "Pending grading." },
});

// [NEW] Unified schema for any item within a problem (content or question)
const problemItemSchema = new mongoose.Schema({
    itemType: {
        type: String,
        required: true,
        enum: ['content', 'question']
    },
    // Fields for 'content' type
    contentType: {
        type: String,
        enum: ['paragraph', 'subheading', 'instruction', 'separator', 'image']
    },
    text: { type: String },
    url: { type: String },
    aiDescription: { type: String },

    // Fields for 'question' type
    points: { type: Number },
    orderInProblem: { type: Number }, // This will be the unique identifier for a question within a problem
    questionType: {
        type: String,
        enum: ['free_text', 'mcq', 'true_false', 'matching_pairs', 'fill_table']
    },
    options: [{ type: String }],
    correctAnswer: { type: mongoose.Schema.Types.Mixed },
    group_a_items: [{ type: String }],
    group_b_items: [{ type: String }],
    correct_matches: { type: mongoose.Schema.Types.Mixed },
    table_headers: [{ type: String }],
    table_rows: { type: mongoose.Schema.Types.Mixed },
    correct_answers_table: { type: mongoose.Schema.Types.Mixed },

}, { _id: false });


const problemSchema = new mongoose.Schema({
    problemId: { type: String, required: true, default: () => new mongoose.Types.ObjectId().toString() },
    problemTitle: { type: String, required: true },
    
    // [REPLACED] problemContent and subQuestionsData are merged into problemItems
    problemItems: [problemItemSchema],

    orderInExam: { type: Number, required: true },
    problemTotalPossibleRawScore: { type: Number, default: 0 },
    problemRawScore: { type: Number, default: 0 },
    subQuestionAnswers: [subQuestionAnswerSchema], // This will store the answers, referenced by orderInProblem
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
    status: { type: String, enum: ['in-progress', 'completed', 'submitted', 'grading-failed', 'time-expired', 'timed-out'], default: 'in-progress' },
    source: { type: String, enum: ['ai_generated', 'db_devoir'], required: true },
    sourceDevoirId: { type: mongoose.Schema.Types.ObjectId, ref: 'Devoir', default: null },
    config: { type: mongoose.Schema.Types.Mixed, default: {} },
    expiresAt: { type: Date, index: { expires: '5h' } }
}, {
    timestamps: true
});

module.exports = mongoose.model('TimedExamAttempt', timedExamAttemptSchema);