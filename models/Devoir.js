const mongoose = require('mongoose');

// =================================================================
// ---> تم تعديل هذا المخطط الفرعي لدعم أنواع المكونات الجديدة
// =================================================================
const ComponentSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: [
            'exercise_title', 
            'paragraph', 
            'image', 
            'question',
            // [NEW] إضافة الأنواع الجديدة
            'separator', 
            'subheading', 
            'instruction'
        ]
    },
    
    // --- حقول مشتركة ---
    text: { type: String }, // نص للتمرين، الفقرة، السؤال, العنوان الفرعي، التعليمات
    url: { type: String },  // رابط الصورة
    aiDescription: { type: String }, // وصف الصورة للذكاء الاصطناعي

    // --- حقول خاصة بالأسئلة (Question) ---
    points: { type: Number, default: 0 },
    questionType: { 
        type: String, 
        enum: ['free_text', 'mcq', 'true_false', 'matching_pairs', 'fill_table'] 
    },
    options: [String],
    correctAnswer: String,
    groupA: [String],
    groupB: [String],
    correctMatches: { type: mongoose.Schema.Types.Mixed }, 
    tableHeaders: [String],
    tableRows: { type: mongoose.Schema.Types.Mixed }, 
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
    
    components: [ComponentSchema], // سيستخدم المخطط المحدث

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