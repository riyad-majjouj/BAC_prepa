const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware'); // أعد استيراد protect
const { saveMcqProgress } = require('../controllers/progressController'); // أعد استيراد الكونترولر

// أعد middleware الحماية 'protect'
router.route('/').post(protect, saveMcqProgress);

// ... يمكنك ترك المسارات الأخرى معلقة الآن ...

module.exports = router;