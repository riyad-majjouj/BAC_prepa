// models/Subject.js
const mongoose = require('mongoose');

const SubjectSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    // المادة يمكن أن تكون في أكثر من شعبة (مثال: الرياضيات)
    tracks: [{
        type: String,
        required: true,
        enum: ['PC', 'SVT', 'SM', 'CONCOURS']
    }]
});

const Subject = mongoose.model('Subject', SubjectSchema);
module.exports = Subject;