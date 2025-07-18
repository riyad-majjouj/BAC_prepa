// back-end/routes/trackRoutes.js
const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middlewares/authMiddleware');
const { 
    getTracks, 
    createTrack, 
    updateTrack, 
    deleteTrack 
} = require('../controllers/trackController');

// Public route to get all tracks (can be filtered by levelId query param)
router.route('/').get(getTracks);

// Admin routes
router.route('/').post(protect, admin, createTrack);
router.route('/:id')
    .put(protect, admin, updateTrack)
    .delete(protect, admin, deleteTrack);

module.exports = router;