// back-end/models/Track.js
const mongoose = require('mongoose');

const TrackSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Track name is required.'],
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    // كل شعبة تنتمي إلى مستوى دراسي واحد
    academicLevel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AcademicLevel',
        required: [true, 'A track must be associated with an academic level.'],
        index: true, // مهم لتحسين أداء الاستعلامات
    },
}, { timestamps: true });

const Track = mongoose.model('Track', TrackSchema);
module.exports = Track;