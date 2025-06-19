// backend/models/Question.js
const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
        required: [true, 'Subject is required for the question.']
    },
    level: {
        type: String,
        required: [true, 'Difficulty level is required.'],
        enum: {
            values: ['سهل', 'متوسط', 'صعب'],
            message: '{VALUE} is not a supported difficulty level.'
        },
    },
    track: { // الشعبة التي يستهدفها هذا السؤال
        type: String,
        required: [true, 'Track (filière) is required for the question.'],
        enum: {
            values: ['PC', 'SVT', 'SM', 'CONCOURS'],
            message: '{VALUE} is not a supported track.'
        }
    },
    type: {
        type: String,
        required: [true, 'Question type (mcq or free_text) is required.'],
        enum: {
            values: ['mcq', 'free_text'],
            message: '{VALUE} is not a supported question type.'
        },
        default: 'mcq',
    },
    text: {
        type: String,
        required: [true, 'Question text is required.'],
        trim: true,
    },
    options: {
        type: [String], // Array of strings for choices
        validate: [
            function (val) {
                // فقط مطلوب إذا كان النوع mcq، ويجب أن يحتوي على عنصرين على الأقل
                return this.type !== 'mcq' || (Array.isArray(val) && val.length >= 2 && val.every(opt => typeof opt === 'string' && opt.trim() !== ''));
            },
            'For MCQ questions, at least two non-empty options are required.'
        ],
        // إذا كان نوع السؤال free_text، سيكون هذا الحقل فارغًا أو غير موجود.
        // Mongoose سيحفظ مصفوفة فارغة إذا لم يتم توفير قيمة ولم يكن هناك default.
        // يمكننا إضافة default صريح إذا أردنا:
        default: function() {
            return this.type === 'free_text' ? [] : undefined;
        }
    },
    correctAnswer: {
        type: String,
        // لم يعد required بشكل عام، سيتم التحقق منه في pre.save بناءً على النوع
        // required: [true, 'Correct answer is required.'],
        trim: true,
        // إذا كان free_text، قد لا يكون هناك correctAnswer محدد مسبقًا
        // أو قد يكون نصًا وصفيًا عامًا.
        // سنجعلها مطلوبة فقط إذا كان النوع mcq وذلك في الـ pre.save hook
    },
    lesson: { // الدرس أو المحور المرتبط بالسؤال
        type: String,
        trim: true,
    },
    generatedBy: {
        type: String,
        enum: ['db', 'ai'],
        default: 'db',
    },
}, { timestamps: true });

// التحقق من الشروط قبل الحفظ
QuestionSchema.pre('save', function(next) {
    if (this.type === 'mcq') {
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
        // لأسئلة الكتابة الحرة، الإجابة الصحيحة قد لا تكون محددة مسبقًا أو قد لا تكون ضرورية
        // إذا لم يتم توفيرها، يمكننا تعيين قيمة افتراضية أو تركها فارغة.
        // إذا كانت ستُستخدم لاحقًا للمقارنة أو العرض، يجب تحديد سلوكها.
        // هنا سنجعلها اختيارية، أي يمكن أن تكون فارغة أو غير موجودة.
        // إذا لم يتم توفيرها من الـ AI (وهو المتوقع)، يمكن تركها كذلك.
        // أو وضع قيمة افتراضية تشير إلى أن التقييم سيتم بواسطة AI.
        if (!this.correctAnswer || String(this.correctAnswer).trim() === '') {
            this.correctAnswer = "AI_VALIDATION_REQUIRED"; // قيمة افتراضية للإشارة
        }
        // تأكد من أن options فارغة أو غير موجودة
        if (this.options && this.options.length > 0) {
            this.options = []; // فرض أن تكون فارغة لأسئلة free_text
        }
    }
    next();
});

const Question = mongoose.model('Question', QuestionSchema);
module.exports = Question;