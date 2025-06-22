// back-end/routes/examRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware'); // Assuming you have general user protection
const {
    startExam,
    submitExam,
    getExamResults
} = require('../controllers/examController');

// --- Timed Exam Routes (Protected) ---

// POST /api/exams/start - Starts a new timed exam session
// Body: { academicLevelId, trackId, subjectId, difficulty, [numberOfQuestions (optional)], [timeLimitMinutes (optional)] }
router.post('/start', protect, startExam);

// POST /api/exams/:examAttemptId/submit - Submits answers for an ongoing exam
// Body: { answers: [{ questionId: String, userAnswer: String }] }
router.post('/:examAttemptId/submit', protect, submitExam);

// GET /api/exams/:examAttemptId/results - Fetches the results of a completed/timed-out exam
router.get('/:examAttemptId/results', protect, getExamResults);

module.exports = router;