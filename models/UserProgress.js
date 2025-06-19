// backend/models/UserProgress.js
const mongoose = require('mongoose');
const UserProgressSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
    userAnswer: { type: String, required: true },
    isCorrect: { type: Boolean, required: true },
    track: { type: String, required: false }, // ✅ -- تمت إضافة حقل الشعبة --
    attemptedAt: { type: Date, default: Date.now },
});
UserProgressSchema.index({ user: 1, question: 1 }, { unique: true });
const UserProgress = mongoose.model('UserProgress', UserProgressSchema);
module.exports = UserProgress;