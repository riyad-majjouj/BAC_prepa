const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    type: {
        type: String,
        required: true,
        enum: ['new_reply', 'best_answer', 'system_message']
    },
    message: {
        type: String,
        required: true
    },
    // الرابط سيشير إلى المشاركة في المنتدى
    link: {
        type: String,
        required: true
    },
    isRead: {
        type: Boolean,
        default: false,
        index: true
    }
}, {
    timestamps: true
});

const Notification = mongoose.model('Notification', NotificationSchema);

module.exports = Notification;