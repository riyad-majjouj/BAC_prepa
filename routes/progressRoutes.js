const express = require('express');
const router = express.Router();
// لا حاجة لـ protect أو الكونترولر في هذا الاختبار
// const { protect } = require('../middlewares/authMiddleware');
// const { saveMcqProgress } = require('../controllers/progressController');

// هذا هو التعريف الوحيد في الملف بأكمله
router.post('/', (req, res) => {
  console.log('[DEBUG] POST /api/progress route was hit successfully!');
  res.status(200).json({ message: 'Progress route hit successfully!' });
});

// قم بالتعليق على المسارات الأخرى مؤقتاً
/*
router.route('/my-summary')
    .get(protect, getMyProgressSummary);

router.route('/:subjectName')
    .get(protect, getUserProgressBySubject);
*/

module.exports = router;