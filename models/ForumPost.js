const mongoose = require('mongoose');

// مخطط الردود لدعم الردود المتداخلة
const ReplySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: [true, 'Reply content is required.'],
        trim: true
    },
    // حقل لتخزين الردود على هذا الرد
    replies: [this], // يشير إلى نفسه، مما يسمح بتداخل لا نهائي
    isBestAnswer: {
        type: Boolean,
        default: false
    },
    upvotes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, { timestamps: true });


const ForumPostSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    title: {
        type: String,
        required: [false, 'A title is required for the post.'],
        trim: true,
        maxlength: 200
    },
    content: {
        type: String,
        required: [true, 'Post content is required.'],
        trim: true
    },
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
        required: false
    },
    tags: [{
        type: String,
        trim: true
    }],
    isPublic: {
        type: Boolean,
        default: true,
        index: true
    },
    status: {
        type: String,
        enum: ['open', 'answered', 'closed'],
        default: 'open'
    },
    upvotes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    // [MODIFIED] تم استبدال حقل المشاهدات القديم
    viewedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    // أصبح الآن يحتوي على ردود يمكن أن تحتوي على ردود أخرى
    replies: [ReplySchema]
}, {
    timestamps: true
});

const ForumPost = mongoose.model('ForumPost', ForumPostSchema);

module.exports = ForumPost;