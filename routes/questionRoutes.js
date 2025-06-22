// back-end/routes/questionRoutes.js
const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middlewares/authMiddleware'); // تأكد من المسارات الصحيحة
const {
    getPracticeQuestion,
    validateFreeTextAnswer,
    getAllQuestionsForAdmin,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    getQuestionHint,         // <--- دالة المتحكم
    getDetailedAnswer,     // <--- دالة المتحكم
    deleteQuestionsByCriteria
} = require('../controllers/questionController'); // تأكد من المسارات الصحيحة

// --- User Routes ---
router.get('/practice', protect, getPracticeQuestion);

// تغيير مسارات التلميح والإجابة التفصيلية إلى GET
router.get('/:questionId/hint', protect, getQuestionHint);             // <--- تغيير إلى GET
router.get('/:questionId/detailed-answer', protect, getDetailedAnswer); // <--- تغيير إلى GET

// مسار التحقق من الإجابة (يبقى POST لأنه يرسل بيانات إجابة المستخدم)
router.post('/validate-answer', protect, validateFreeTextAnswer);

// --- Admin Routes ---
router.route('/')
    .post(protect, admin, createQuestion);

router.route('/all-for-admin')
    .get(protect, admin, getAllQuestionsForAdmin);

router.route('/delete-by-criteria')
    .delete(protect, admin, deleteQuestionsByCriteria);

router.route('/:id')
    .put(protect, admin, updateQuestion)
    .delete(protect, admin, deleteQuestion);

module.exports = router;