// back-end/routes/progressRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware'); // Assuming you have this auth middleware
const { 
    saveMcqProgress,          // Renamed from saveProgress
    getUserProgressBySubject, 
    getMyProgressSummary 
} = require('../controllers/progressController');

// Route for saving MCQ progress
// The frontend sends a POST request to '/api/progress' for MCQs
router.route('/')
    .post(protect, saveMcqProgress); 

// Route for getting the overall progress summary for the logged-in user
router.route('/my-summary')
    .get(protect, getMyProgressSummary);

// Route for getting progress for a specific subject (by name)
// This might be less used with the new summary, or might need adjustment
router.route('/:subjectName')
    .get(protect, getUserProgressBySubject);

module.exports = router;