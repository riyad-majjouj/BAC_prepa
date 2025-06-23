// back-end/routes/progressRoutes.js

const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { 
    saveMcqProgress,
    getUserProgressBySubject, 
    getMyProgressSummary 
} = require('../controllers/progressController');

// =================================================================
// 1. المسارات المحددة والثابتة (Specific Routes)
// =================================================================
// هذه المسارات لها أسماء ثابتة ويجب أن تأتي قبل أي مسارات ديناميكية.

// GET /api/progress/my-summary
// هذا المسار للحصول على ملخص التقدم العام للمستخدم المسجل دخوله
router.get('/my-summary', protect, getMyProgressSummary);


// =================================================================
// 2. المسارات التي تستخدم أفعالاً مختلفة على نفس المسار الأساسي
// =================================================================
// هذا المسار هو المسار الرئيسي لحفظ التقدم لأسئلة MCQ.
// POST /api/progress
router.route('/')
    .post(protect, saveMcqProgress); 


// =================================================================
// 3. المسارات الديناميكية العامة (Catch-all Dynamic Routes)
// =================================================================
// هذا المسار الديناميكي يجب أن يأتي في النهاية لأنه سيلتقط أي شيء
// لم يتطابق مع المسارات المحددة أعلاه (مثل /api/progress/some-subject-name).

// GET /api/progress/:subjectName
router.get('/:subjectName', protect, getUserProgressBySubject);


module.exports = router;