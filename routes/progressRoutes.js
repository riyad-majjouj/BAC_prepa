// backend/routes/progressRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { saveProgress, getUserProgressBySubject, getMyProgressSummary } = require('../controllers/progressController');

router.post('/', protect, saveProgress);
router.get('/my-summary', protect, getMyProgressSummary); // ✅ -- المسار الجديد --
router.get('/:subjectName', protect, getUserProgressBySubject); // هذا المسار قد يصبح غير ضروري أو يعاد تصميمه

module.exports = router;