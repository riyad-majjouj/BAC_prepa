// back-end/models/AcademicLevel.js
const mongoose = require('mongoose');

const AcademicLevelSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Academic level name is required.'],
        unique: true,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    // حقل للترتيب، يسهل عرض المستويات بالترتيب الصحيح في الواجهة الأمامية
    order: {
        type: Number,
        default: 0,
    },
}, { timestamps: true });

const AcademicLevel = mongoose.model('AcademicLevel', AcademicLevelSchema);
module.exports = AcademicLevel;