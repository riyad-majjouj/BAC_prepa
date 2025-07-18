// back-end/models/TemporaryQuestion.js
const mongoose = require('mongoose');

const temporaryQuestionSchema = new mongoose.Schema({
    questionId: { type: String, required: true, unique: true },
    questionData: { type: Object, required: true },
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    createdAt: { 
        type: Date, 
        default: Date.now, 
        expires: '15m' // TTL (Time-To-Live): Auto-deletes after 15 minutes
    }
});

temporaryQuestionSchema.index({ userId: 1, questionId: 1 });

module.exports = mongoose.model('TemporaryQuestion', temporaryQuestionSchema);