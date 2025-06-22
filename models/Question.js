// back-end/models/Question.js
const mongoose = require('mongoose');

// تعريف مخطط فرعي للأسئلة الفرعية داخل التمرين/المشكلة
const SubQuestionSchema = new mongoose.Schema({
    text: { type: String, required: true, trim: true },
    difficultyOrder: { type: Number, required: true }, // ترتيب الصعوبة/العرض داخل التمرين
    points: { type: Number, required: true, min: 0 },
}, { _id: false });


const QuestionSchema = new mongoose.Schema({
    academicLevel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AcademicLevel',
        required: [true, 'Academic Level is required for the question/problem.'],
        index: true,
    },
    track: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Track',
        required: [true, 'Track is required for the question/problem.'],
        index: true,
    },
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
        required: [true, 'Subject is required for the question/problem.'],
        index: true,
    },
    level: {
        type: String,
        required: [true, 'Difficulty level is required.'],
        enum: {
            values: ['سهل', 'متوسط', 'صعب'],
            message: '{VALUE} is not a supported difficulty level.'
        },
    },
    type: {
        type: String,
        required: true,
        enum: ['mcq', 'free_text', 'problem_set'],
        default: 'mcq',
    },
    text: {
        type: String,
        required: [true, 'Question/Problem text is required.'],
        trim: true,
    },
    options: {
        type: [String],
        validate: [
            function (val) {
                if (this.type === 'mcq') {
                    return Array.isArray(val) && val.length >= 2 && val.every(opt => typeof opt === 'string' && opt.trim() !== '');
                }
                return true;
            },
            'For MCQ questions, at least two non-empty options are required.'
        ],
        default: function() {
            return (this.type === 'free_text' || this.type === 'problem_set') ? [] : undefined;
        }
    },
    correctAnswer: {
        type: String,
        trim: true,
    },
    lesson: {
        type: String,
        trim: true,
    },
    generatedBy: {
        type: String,
        enum: ['db', 'ai', 'ai-exam'],
        default: 'db',
    },
    subQuestions: {
        type: [SubQuestionSchema],
        default: undefined,
        validate: [
            function(val) { return this.type !== 'problem_set' || (Array.isArray(val) && val.length > 0); },
            'Problem sets must have at least one sub-question.'
        ]
    },
    totalPoints: {
        type: Number,
        default: undefined,
        min: 0,
        validate: [
            function(val) { return this.type !== 'problem_set' || (typeof val === 'number' && val > 0); },
            'Problem sets must have a totalPoints value greater than 0.'
        ]
    },
    problemTitle: {
        type: String,
        trim: true,
        default: undefined,
    }
}, { timestamps: true });

// --- قم بإزالة أو تعليق هذه الأسطر ---
// QuestionSchema.path('academicLevel').ref('AcademicLevel').required(true);
// QuestionSchema.path('track').ref('Track').required(true);
// QuestionSchema.path('subject').ref('Subject').required(true);
// QuestionSchema.path('level').enum(['سهل', 'متوسط', 'صعب']).required(true); // هذا السطر يسبب الخطأ
// QuestionSchema.path('generatedBy').enum(['db', 'ai', 'ai-exam']).default('db');
// QuestionSchema.path('options').default(function() { return (this.type === 'free_text' || this.type === 'problem_set') ? [] : undefined; });
// --- نهاية الأسطر المطلوب إزالتها أو تعليقها ---


QuestionSchema.pre('save', function(next) {
    if (this.type === 'problem_set') {
        this.options = [];
        this.correctAnswer = undefined;
        if (!this.subQuestions || this.subQuestions.length === 0) {
            return next(new Error('A problem_set must contain subQuestions.'));
        }
        const calculatedPoints = this.subQuestions.reduce((sum, sq) => sum + (sq.points || 0), 0);
        if (typeof this.totalPoints !== 'number' || this.totalPoints !== calculatedPoints) {
            console.warn(`Problem set ${this.problemTitle || this.text.substring(0,20)}...: totalPoints (${this.totalPoints}) mismatch with sum of subQuestions points (${calculatedPoints}). Adjusting totalPoints.`);
            this.totalPoints = calculatedPoints;
        }
        if (this.totalPoints === 0 && this.subQuestions.length > 0) { // Check added: ensure totalPoints isn't zero if subQs exist
            return next(new Error('A problem_set total points cannot be zero if it has subQuestions with points. Check subQuestion points or AI generation logic.'));
        }
    } else if (this.type === 'mcq') {
        if (!this.options || !Array.isArray(this.options) || this.options.length < 2) {
            return next(new Error('MCQ questions must have at least two options.'));
        }
        if (!this.correctAnswer || String(this.correctAnswer).trim() === '') {
            return next(new Error('For MCQ questions, correctAnswer is required.'));
        }
        const trimmedOptions = this.options.map(opt => String(opt).trim());
        if (!trimmedOptions.includes(String(this.correctAnswer).trim())) {
            return next(new Error('For MCQ questions, the correct answer must be one of the provided options.'));
        }
    } else if (this.type === 'free_text') {
        if (!this.correctAnswer || String(this.correctAnswer).trim() === '') {
            this.correctAnswer = "AI_VALIDATION_REQUIRED";
        }
    }
    next();
});

const Question = mongoose.model('Question', QuestionSchema);
module.exports = Question;