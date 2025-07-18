const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
    getNotifications,
    markAsRead
} = require('../controllers/notificationController');

// Get all notifications for the logged-in user
router.route('/')
    .get(protect, getNotifications);

// Mark all notifications as read
router.route('/mark-as-read')
    .post(protect, markAsRead);

module.exports = router;