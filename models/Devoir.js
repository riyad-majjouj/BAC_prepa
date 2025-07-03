// back-end/models/Devoir.js

const mongoose = require('mongoose');

// =================================================================
// ---> تم تعديل هذا المخطط الفرعي لدعم أنواع الأسئلة الجديدة
// =================================================================
const ComponentSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['exercise_title', 'paragraph', 'image', 'question']
    },
    
    // --- حقول مشتركة ---
    text: { type: String }, // نص للتمرين، الفقرة، أو السؤال
    url: { type: String },  // رابط الصورة
    aiDescription: { type: String }, // وصف الصورة للذكاء الاصطناعي

    // --- حقول خاصة بالأسئلة (Question) ---
    points: { type: Number, default: 0 },
    questionType: { 
        type: String, 
        // تمت إضافة الأنواع الجديدة هنا
        enum: ['free_text', 'mcq', 'true_false', 'matching_pairs', 'fill_table'] 
    },
    // حقل للخيارات في MCQ
    options: [String],
    // حقل للإجابة الصحيحة في MCQ و true/false
    correctAnswer: String,

    // --- حقول جديدة لـ matching_pairs (صل بسهم) ---
    groupA: [String], // عناصر القائمة الأولى
    groupB: [String], // عناصر القائمة الثانية
    correctMatches: { type: mongoose.Schema.Types.Mixed }, // مثال: { "عنصر من A": "عنصر من B" }

    // --- حقول جديدة لـ fill_table (ملء الجدول) ---
    tableHeaders: [String], // عناوين أعمدة الجدول
    // هيكل الجدول: مصفوفة من الصفوف، كل صف هو مصفوفة من الخلايا
    // الخلية هي كائن: { value: String, editable: Boolean }
    tableRows: { type: mongoose.Schema.Types.Mixed }, 
    // الإجابات الصحيحة للخلايا القابلة للتعديل
    // مثال: { "0-1": "الإجابة الصحيحة للخلية في الصف 0 العمود 1" }
    tableCorrectAnswers: { type: mongoose.Schema.Types.Mixed },

}, { _id: false });


// المخطط الرئيسي للفرض - لا يحتاج تعديل
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
    
    components: [ComponentSchema],

    totalPoints: { type: Number, default: 0 },
    createdBy: { type: String, default: 'admin' }
}, { timestamps: true });


// Middleware لحساب النقاط - لا يحتاج تعديل
DevoirSchema.pre('save', function(next) {
    this.totalPoints = this.components.reduce((total, component) => {
        if (component.type === 'question' && typeof component.points === 'number') {
            return total + component.points;
        }
        return total;
    }, 0);
    next();
});

const Devoir = mongoose.model('Devoir', DevoirSchema);
module.exports = Devoir;