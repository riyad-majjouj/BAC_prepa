const express = require('express');
const router = express.Router();
// لم نعد بحاجة لاستيراد handleStripeWebhook هنا
const { createCheckoutSession } = require('../controllers/paymentController');
const { protect } = require('../middlewares/authMiddleware');

// @desc    إنشاء جلسة دفع للاشتراك
// @route   POST /api/payments/create-subscription
// @access  Private (هذا المسار سيظل محميًا)
router.post('/create-subscription', protect, createCheckoutSession);

// تم حذف مسار الـ Webhook من هنا لأنه تم نقله إلى server.js
// هذا يضمن أن هذا المسار فقط هو الذي يستخدم الجسم "الخام"، بينما المسارات الأخرى
// مثل 'create-subscription' تستخدم الجسم المحلل كـ JSON بشكل صحيح.




module.exports = router;