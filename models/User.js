// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String }, // ليس مطلوباً لمستخدمي جوجل
    googleId: { type: String }, // لتخزين معرف جوجل
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    track: {
        type: String,
        enum: ['PC', 'SVT', 'SM', 'CONCOURS', 'غير محدد'],
        default: 'غير محدد',
    },
    // سنقوم بتتبع التقدم التفصيلي في نموذج منفصل (UserProgress)
}, { timestamps: true });

// Hash password before saving
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password') || !this.password) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to compare entered password with hashed password
UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', UserSchema);
module.exports = User;