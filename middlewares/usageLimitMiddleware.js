const asyncHandler = require('express-async-handler');
const User = require('../models/User');

const FREE_PLAN_LIMITS = {
    questions: 3,
    exams: 1,
};

const checkUsageLimit = (type) => asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user._id);

    if (!user) {
        res.status(401);
        throw new Error('User not found');
    }
    
    // المستخدمون الأدمن والمستخدمون أصحاب الاشتراك المدفوع لديهم وصول غير محدود
    if (user.role === 'admin' || (user.subscription && user.subscription.plan === 'premium' && user.subscription.status === 'active')) {
        return next();
    }

    // --- منطق المستخدم المجاني ---
    // إعادة تعيين العدادات إذا كان يومًا جديدًا
    user.resetDailyUsage();

    if (type === 'question') {
        if (user.usage.dailyQuestionCount >= FREE_PLAN_LIMITS.questions) {
            res.status(429); // 429 Too Many Requests
            throw new Error('لقد وصلت إلى الحد الأقصى للأسئلة المجانية اليوم. قم بالترقية للوصول غير المحدود.');
        }
        user.usage.dailyQuestionCount += 1;
    } else if (type === 'exam') {
        if (user.usage.dailyExamCount >= FREE_PLAN_LIMITS.exams) {
            res.status(429);
            throw new Error('لقد وصلت إلى الحد الأقصى للاختبارات المجانية اليوم. قم بالترقية للوصول غير المحدود.');
        }
        user.usage.dailyExamCount += 1;
    }

    await user.save();
    next();
});

module.exports = { checkUsageLimit };