// back-end/models/Subject.js (بعد التصحيح)
const mongoose = require('mongoose');

const SubjectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Subject name is required.'],
        trim: true
    },
    language: { // *** تمت إضافة هذا الحقل بناءً على استخدامه في الواجهة الأمامية والـ populate ***
        type: String,
        enum: ['ar', 'fr', 'en', 'general'], // 'general' للمواد التي ليست لغات محددة
        default: 'general'
    },
    track: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Track',
        required: [true, 'A subject must be associated with a track.'],
        index: true,
    },
    academicLevel: { // <--- *** تم إضافة هذا الحقل الضروري ***
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AcademicLevel',
        required: [true, 'A subject must be associated with an academic level.'],
        index: true,
    }
}, { timestamps: true });

// لضمان عدم تكرار نفس اسم المادة في نفس الشعبة ونفس المستوى الأكاديمي
SubjectSchema.index({ name: 1, track: 1, academicLevel: 1 }, { unique: true });

const Subject = mongoose.model('Subject', SubjectSchema);
module.exports = Subject;