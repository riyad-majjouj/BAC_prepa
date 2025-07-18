// back-end/routes/academicLevelRoutes.js
const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middlewares/authMiddleware');
const { 
    getAcademicLevels, 
    createAcademicLevel, 
    updateAcademicLevel, 
    deleteAcademicLevel 
} = require('../controllers/academicLevelController');

// Public route to get all levels
router.route('/').get(getAcademicLevels);

// Admin routes
router.route('/').post(protect, admin, createAcademicLevel);
router.route('/:id')
    .put(protect, admin, updateAcademicLevel)
    .delete(protect, admin, deleteAcademicLevel);

module.exports = router;