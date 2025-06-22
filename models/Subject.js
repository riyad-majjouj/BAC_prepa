// back-end/models/Subject.js
const mongoose = require('mongoose');

const SubjectSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: [true, 'Subject name is required.'],
        trim: true
    },
    // تم تغيير الهيكلية: المادة الآن تنتمي إلى شعبة واحدة محددة
    // هذا يسمح بوجود "الرياضيات" في شعبة العلوم الفيزيائية و "الرياضيات" في شعبة العلوم الرياضية ككيانين منفصلين إذا لزم الأمر
    track: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Track',
        required: [true, 'A subject must be associated with a track.'],
        index: true,
    }
}, { timestamps: true });

// لضمان عدم تكرار نفس اسم المادة في نفس الشعبة
SubjectSchema.index({ name: 1, track: 1 }, { unique: true });

const Subject = mongoose.model('Subject', SubjectSchema);
module.exports = Subject;