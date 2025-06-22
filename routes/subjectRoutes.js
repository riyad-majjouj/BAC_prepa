// back-end/routes/subjectRoutes.js
const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middlewares/authMiddleware');
const { 
    getSubjects,
    getSubjectById,
    createSubject,
    updateSubject,
    deleteSubject
} = require('../controllers/subjectController');

// Public route to get all subjects (can be filtered by trackId query param)
// مثال: /api/subjects?trackId=60d21b4667d0d8992e610c85
router.route('/')
    .get(getSubjects);

// Admin routes
router.route('/')
    .post(protect, admin, createSubject);

router.route('/:id')
    .get(protect, admin, getSubjectById) // يمكن أن تكون متاحة للمستخدمين العاديين أيضًا إذا احتجت ذلك
    .put(protect, admin, updateSubject)
    .delete(protect, admin, deleteSubject);

module.exports = router;