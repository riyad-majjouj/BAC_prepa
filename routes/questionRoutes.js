// backend/routes/questionRoutes.js
const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middlewares/authMiddleware');
const {
    getQuestion,
    validateFreeTextAnswer,
    getAllQuestionsForAdmin,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    getQuestionHint,
    getDetailedAnswer
} = require('../controllers/questionController');

// --- User Routes - يجب وضع المسارات الأكثر تحديدًا أولاً ---

// User route - Validate a free-text answer
// Example: POST /api/questions/validate-answer
router.post('/validate-answer', protect, validateFreeTextAnswer);

// User route - Get a hint for a question
// Example: GET /api/questions/SOME_QUESTION_ID/hint
// هذا المسار يجب أن يكون قبل '/:subjectNameArabic/:levelApiValue'
router.get('/:questionId/hint', protect, getQuestionHint);

// User route - Get a detailed answer for a question
// Example: GET /api/questions/SOME_QUESTION_ID/detailed-answer
// هذا المسار يجب أن يكون قبل '/:subjectNameArabic/:levelApiValue'
router.get('/:questionId/detailed-answer', protect, getDetailedAnswer);

// User route - Get a question for practice
// Example: /api/questions/الرياضيات/Moyen
// هذا المسار أكثر عمومية ويجب أن يأتي بعد المسارات المحددة أعلاه
router.get('/:subjectNameArabic/:levelApiValue', protect, getQuestion);


// --- Admin Routes ---
// Example: POST /api/questions (create)
router.route('/')
    .post(protect, admin, createQuestion);

// Example: GET /api/questions/all-for-admin (get all for admin view)
router.route('/all-for-admin')
    .get(protect, admin, getAllQuestionsForAdmin);

// Admin routes for specific question by ID
// هذه المسارات يجب أن تكون الأخيرة لتجنب التعارض مع :questionId المستخدم في مسارات المستخدم
// Note: The specific user routes for hint/detailed-answer use :questionId in the first segment
// after /questions/, while this admin route uses :id.
// The key is that the user routes like /:questionId/hint have more segments or fixed strings
// making them more specific than a simple /:id.
// Example: PUT /api/questions/SOME_QUESTION_ID (update)
// Example: DELETE /api/questions/SOME_QUESTION_ID (delete)
router.route('/:id')
    .put(protect, admin, updateQuestion)
    .delete(protect, admin, deleteQuestion);

module.exports = router;