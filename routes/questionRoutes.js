// back-end/routes/questionRoutes.js

const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middlewares/authMiddleware');
const {
    getPracticeQuestion,
    validateFreeTextAnswer,
    getAllQuestionsForAdmin,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    getQuestionHint,
    getDetailedAnswer,
    deleteQuestionsByCriteria,
    // لنفترض أن لديك دالة getQuestionById إذا كنت تريد مسار GET لـ /:id
    // getQuestionById
} = require('../controllers/questionController');

// =================================================================
// 1. المسارات العامة والثابتة للمستخدمين (User-facing specific routes)
// =================================================================
// هذه المسارات لا تحتوي على متغيرات ديناميكية في بدايتها، لذا تأتي أولاً.

// GET /api/questions/practice
router.get('/practice', protect, getPracticeQuestion);

// POST /api/questions/validate-answer
router.post('/validate-answer', protect, validateFreeTextAnswer);


// =================================================================
// 2. المسارات الديناميكية للمستخدمين (User-facing dynamic routes)
// =================================================================
// هذه المسارات تبدأ بمتغير ديناميكي، ولكنها محددة بأجزاء ثابتة بعدها.
// هذا الترتيب يضمن أن "/:questionId/hint" لا يتم الخلط بينه وبين "/:id" العام.

// GET /api/questions/:questionId/hint
router.get('/:questionId/hint', protect, getQuestionHint);

// GET /api/questions/:questionId/detailed-answer
router.get('/:questionId/detailed-answer', protect, getDetailedAnswer);


// =================================================================
// 3. المسارات العامة للإدارة (Admin-facing specific/static routes)
// =================================================================
// هذه المسارات خاصة بالمسؤولين ولا تتضارب مع المسارات العامة للمستخدمين.

// POST /api/questions/
// ملاحظة: تم نقل هذا من router.route('/') ليكون أكثر وضوحًا
router.post('/', protect, admin, createQuestion);

router.get('/all-for-admin', (req, res, next) => {
    console.log("--- [ROUTE] /api/questions/all-for-admin reached ---"); // سجل مهم
    next(); // استمر إلى الـ middlewares التالية (protect, admin) ثم controller
}, protect, admin, getAllQuestionsForAdmin);

// DELETE /api/questions/delete-by-criteria
router.delete('/delete-by-criteria', protect, admin, deleteQuestionsByCriteria);


// =================================================================
// 4. المسارات الديناميكية العامة (Catch-all dynamic routes)
// =================================================================
// هذا المسار هو الأكثر عمومية ويجب أن يأتي في النهاية.
// سيلتقط أي طلب لـ /api/questions/some-id لم يتطابق مع أي من المسارات المحددة أعلاه.

// PUT, DELETE /api/questions/:id
router.route('/:id')
    // قد ترغب في إضافة مسار GET هنا إذا كنت بحاجة إليه
    // .get(protect, getQuestionById) 
    .put(protect, admin, updateQuestion)
    .delete(protect, admin, deleteQuestion);


module.exports = router;