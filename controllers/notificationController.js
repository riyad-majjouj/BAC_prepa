const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Get user's notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user._id })
            .populate('sender', 'name')
            .sort({ createdAt: -1 })
            .limit(20); // Limit to the most recent 20

        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching notifications.', error: error.message });
    }
};

// @desc    Mark notifications as read
// @route   POST /api/notifications/mark-as-read
// @access  Private
const markAsRead = async (req, res) => {
    try {
        // Mark all of the user's unread notifications as read
        await Notification.updateMany(
            { recipient: req.user._id, isRead: false },
            { $set: { isRead: true } }
        );

        // Reset the unread count on the user model
        await User.findByIdAndUpdate(req.user._id, { $set: { unreadNotifications: 0 } });

        res.status(200).json({ message: 'All notifications marked as read.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error marking notifications.', error: error.message });
    }
};

module.exports = {
    getNotifications,
    markAsRead
};