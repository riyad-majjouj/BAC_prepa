// backend/routes/subjectRoutes.js
const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middlewares/authMiddleware');
const {
    getSubjectsByMyTrack,
    createSubject,
    updateSubject,
    deleteSubject,
    getAllSubjectsForAdmin // <<<< استيراد الدالة الجديدة
} = require('../controllers/subjectController');

// User route
router.get('/my-track', protect, getSubjectsByMyTrack);

// Admin routes
router.route('/')
    .post(protect, admin, createSubject); //  POST /api/subjects

router.route('/all-for-admin') // <<<< إضافة المسار الجديد
    .get(protect, admin, getAllSubjectsForAdmin); // GET /api/subjects/all-for-admin

router.route('/:id') // <<<< تغيير :name إلى :id
    .put(protect, admin, updateSubject)    // PUT /api/subjects/:id
    .delete(protect, admin, deleteSubject); // DELETE /api/subjects/:id

module.exports = router;