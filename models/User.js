const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    googleId: { type: String },
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
    unreadNotifications: {
        type: Number,
        default: 0,
        min: 0
    },
    stripeCustomerId: {
        type: String,
    },
    subscription: {
        subscriptionId: String,
        plan: { type: String, enum: ['free', 'premium'], default: 'free' },
        status: {
            type: String,
            enum: ['active', 'inactive', 'canceled', 'past_due', 'incomplete'],
            default: 'inactive'
        },
        currentPeriodEnd: Date,
    },
    
    // --- [FIXED] تعديل مخطط الاستخدام لضمان وجود قيم افتراضية ---
    usage: {
        type: {
            dailyQuestionCount: { type: Number, default: 0 },
            dailyExamCount: { type: Number, default: 0 },
            lastUsageDate: { type: Date }
        },
        // إضافة قيمة افتراضية للكائن بأكمله
        // هذا يضمن أن 'user.usage' لن يكون 'undefined' أبدًا
        default: () => ({
            dailyQuestionCount: 0,
            dailyExamCount: 0,
            lastUsageDate: null
        }),
        required: true // نجعل الحقل مطلوبًا لضمان تطبيق القيمة الافتراضية
    }
}, { timestamps: true });

// Hash password before saving
UserSchema.pre('save', async function (next) {
    // التأكد من وجود حقل الاستخدام قبل محاولة الوصول إليه
    if (!this.usage) {
        this.usage = { dailyQuestionCount: 0, dailyExamCount: 0 };
    }

    if (!this.isModified('password') || !this.password) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to compare entered password with hashed password
UserSchema.methods.matchPassword = async function (enteredPassword) {
    if (!this.password) return false;
    return await bcrypt.compare(enteredPassword, this.password);
};

// دالة لإعادة تعيين العداد اليومي
UserSchema.methods.resetDailyUsage = function () {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // التأكد من وجود 'usage' قبل استخدامه
    if (!this.usage) {
        this.usage = { dailyQuestionCount: 0, dailyExamCount: 0, lastUsageDate: new Date() };
        return this;
    }

    if (!this.usage.lastUsageDate || this.usage.lastUsageDate < today) {
        this.usage.dailyQuestionCount = 0;
        this.usage.dailyExamCount = 0;
        this.usage.lastUsageDate = new Date();
    }
    return this;
};

const User = mongoose.model('User', UserSchema);
module.exports = User;