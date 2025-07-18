// back-end/routes/examRoutes.js
const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middlewares/authMiddleware');
const { checkUsageLimit } = require('../middlewares/usageLimitMiddleware');
 // افترض أن admin middleware موجود إذا احتجت إليه
const {
    startExam,
    submitExam,
    getExamAttemptResults, // <-- تم تصحيح الاسم هنا
    getExamHistoryForUser, // <-- إضافة الدالة الجديدة
    deleteExamAttempt      // <-- إضافة الدالة الجديدة
} = require('../controllers/examController'); // تأكد من أن المسار صحيح

// --- Timed Exam Routes (Protected) ---

// POST /api/exams/start - Starts a new timed exam session
// Body: { academicLevelId, trackId, subjectId, difficulty, examType (optional, defaults to 'ai') }
router.post('/start', protect, checkUsageLimit('exam'), startExam);

// POST /api/exams/:attemptId/submit - Submits answers for an ongoing exam
// Body: { problemAnswers: [{ problemOrderInExam: Number, problemId: String, subQuestionAnswers: [{ orderInProblem: Number, userAnswer: Mixed }] }] }
router.post('/:attemptId/submit', protect, submitExam);

// GET /api/exams/:attemptId/results - Fetches the results of a completed/timed-out exam
router.get('/:attemptId/results', protect, getExamAttemptResults); // <-- تم تصحيح الاسم هنا

// GET /api/exams/history - Fetches user's exam history
router.get('/history', protect, getExamHistoryForUser);

// DELETE /api/exams/:attemptId - Deletes an exam attempt (user for their own, or admin)
router.delete('/:attemptId', protect, deleteExamAttempt);


// مثال لمسار محمي بواسطة الأدمن فقط إذا أردت إضافة مسارات خاصة بالأدمن لاحقًا
// router.get('/admin/all-attempts', protect, admin, getAllExamAttemptsForAdmin);

module.exports = router;