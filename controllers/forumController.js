const ForumPost = require('../models/ForumPost');
const User = require('../models/User');
const Notification = require('../models/Notification');
const mongoose = require('mongoose');

// [NEW] دالة مساعدة لإنشاء الإشعارات وتحديث عداد المستخدم
const createNotification = async (recipientId, senderId, type, message, link) => {
    // لا نرسل إشعاراً إذا كان المستخدم يتفاعل مع محتواه الخاص
    if (recipientId.toString() === senderId.toString()) {
        return;
    }
    
    try {
        // 1. إنشاء مستند الإشعار
        await Notification.create({
            recipient: recipientId,
            sender: senderId,
            type: type,
            message: message,
            link: link,
        });

        // 2. زيادة عداد الإشعارات غير المقروءة للمستلم
        // استخدام $inc لضمان عدم حدوث race conditions
        await User.findByIdAndUpdate(recipientId, { $inc: { unreadNotifications: 1 } });

    } catch (error) {
        console.error('Failed to create notification:', error);
    }
};


// @desc    Create a new forum post
// @route   POST /api/forum/posts
// @access  Private
const createPost = async (req, res) => {
    const { content } = req.body;

    if (!content) {
        return res.status(400).json({ message: 'Content is required.' });
    }

    try {
        const title = content.split('\n')[0].substring(0, 150);

        const post = new ForumPost({
            user: req.user._id,
            title,
            content,
            subject: req.body.subject || null,
            isPublic: true,
        });

        const createdPost = await post.save();
        res.status(201).json(createdPost);
    } catch (error) {
        res.status(500).json({ message: 'Server error creating post.', error: error.message });
    }
};

// @desc    Get all public forum posts (paginated)
// @route   GET /api/forum/posts
// @access  Public
const getPublicPosts = async (req, res) => {
    const pageSize = 10;
    const page = Number(req.query.pageNumber) || 1;

    try {
        const count = await ForumPost.countDocuments({ isPublic: true });
        const posts = await ForumPost.find({ isPublic: true })
            .populate('user', 'name')
            .sort({ createdAt: -1 })
            .limit(pageSize)
            .skip(pageSize * (page - 1));

        res.json({ posts, page, pages: Math.ceil(count / pageSize) });
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching posts.', error: error.message });
    }
};


// @desc    Get a single post by ID with deep population
// @route   GET /api/forum/posts/:id
// @access  Public
const getPostById = async (req, res) => {
    try {
        const post = await ForumPost.findById(req.params.id)
            .populate('user', 'name')
            .populate('subject', 'name')
            .populate({
                path: 'replies',
                populate: { path: 'user', select: 'name' }
            })
            .populate({
                path: 'replies',
                populate: {
                    path: 'replies',
                    populate: { path: 'user', select: 'name' }
                }
            });

        if (!post) {
            return res.status(404).json({ message: 'Post not found.' });
        }
        
        const viewerId = req.user?._id;

        if (viewerId && post.user._id.toString() !== viewerId.toString() && !post.viewedBy.includes(viewerId)) {
            post.viewedBy.push(viewerId);
            await post.save({ validateBeforeSave: false });
        }

        res.status(200).json(post);
    } catch (error) {
        console.error("Error in getPostById:", error);
        res.status(500).json({ message: 'Server error fetching post.', error: error.message });
    }
};

// @desc    Add a reply to a post or to another reply
// @route   POST /api/forum/posts/:id/replies
// @access  Private
const addReply = async (req, res) => {
    const { content, parentReplyId } = req.body;
    const { id: postId } = req.params;

    if (!content) {
        return res.status(400).json({ message: 'Reply content cannot be empty.' });
    }

    try {
        const post = await ForumPost.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found.' });
        }

        const newReply = {
            user: req.user._id,
            content: content,
            replies: []
        };
        
        let parentReply = null;
        if (parentReplyId) {
            parentReply = post.replies.id(parentReplyId);
            if (!parentReply) {
                return res.status(404).json({ message: 'Parent reply not found.' });
            }
            parentReply.replies.push(newReply);
        } else {
            post.replies.push(newReply);
        }

        const updatedPost = await post.save();
        
        // [NEW LOGIC] إنشاء إشعار بعد حفظ الرد بنجاح
        const postLink = `/forum/posts/${post._id}`;
        const sender = req.user;
        
        if (parentReply) {
            // إشعار لصاحب الرد الأصلي
            await createNotification(
                parentReply.user, // recipient
                sender._id, // sender
                'new_reply',
                `${sender.name} رد على تعليقك.`,
                postLink
            );
        } else {
            // إشعار لصاحب المشاركة الرئيسية
            await createNotification(
                post.user, // recipient
                sender._id, // sender
                'new_reply',
                `${sender.name} رد على مشاركتك: "${post.title.substring(0, 30)}..."`,
                postLink
            );
        }

        // إعادة جلب المشاركة مع بيانات المستخدمين لإرسالها للواجهة
        await updatedPost.populate([
            { path: 'user', select: 'name' },
            { path: 'replies.user', select: 'name' },
            { path: 'replies.replies.user', select: 'name' }
        ]);

        res.status(201).json(updatedPost);

    } catch (error) {
        console.error("Error adding reply:", error);
        res.status(500).json({ message: 'Server error adding reply.', error: error.message });
    }
};

// @desc    Toggle upvote on a post
// @route   POST /api/forum/posts/:id/upvote
// @access  Private
const toggleUpvotePost = async (req, res) => {
    try {
        const post = await ForumPost.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found.' });
        }

        const userId = req.user._id;
        const upvoteIndex = post.upvotes.findIndex(id => id.equals(userId));

        if (upvoteIndex > -1) {
            post.upvotes.splice(upvoteIndex, 1);
        } else {
            post.upvotes.push(userId);
            // [NEW LOGIC] إرسال إشعار فقط عند إضافة الإعجاب
            await createNotification(
                post.user,
                req.user._id,
                'system_message', // يمكن تغييره إلى 'new_upvote' إذا أضفته في المودل
                `${req.user.name} أعجب بمشاركتك: "${post.title.substring(0, 30)}..."`,
                `/forum/posts/${post._id}`
            );
        }

        await post.save();
        res.status(200).json({ upvotes: post.upvotes, _id: post._id });

    } catch (error) {
        res.status(500).json({ message: 'Server error upvoting post.', error: error.message });
    }
};

// @desc    Toggle upvote on a reply
// @route   POST /api/forum/posts/:postId/replies/:replyId/upvote
// @access  Private
const toggleUpvoteReply = async (req, res) => {
    const { postId, replyId } = req.params;

    try {
        const post = await ForumPost.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found.' });
        }

        let reply = post.replies.id(replyId);
        if (!reply) {
           for (const topLevelReply of post.replies) {
                reply = topLevelReply.replies.id(replyId);
                if (reply) break;
            }
        }
        
        if (!reply) {
            return res.status(404).json({ message: 'Reply not found.' });
        }

        const userId = req.user._id;
        const upvoteIndex = reply.upvotes.findIndex(id => id.equals(userId));

        if (upvoteIndex > -1) {
            reply.upvotes.splice(upvoteIndex, 1);
        } else {
            reply.upvotes.push(userId);
            // [NEW LOGIC] إرسال إشعار فقط عند إضافة الإعجاب
             await createNotification(
                reply.user,
                req.user._id,
                'system_message',
                `${req.user.name} أعجب بردك في مشاركة: "${post.title.substring(0, 30)}..."`,
                `/forum/posts/${post._id}`
            );
        }

        await post.save();
        res.status(200).json({ 
            replyId: reply._id, 
            upvotes: reply.upvotes 
        });

    } catch (error) {
        console.error('Error toggling upvote on reply:', error);
        res.status(500).json({ message: 'Server error upvoting reply.', error: error.message });
    }
};

module.exports = {
    createPost,
    getPublicPosts,
    getPostById,
    addReply,
    toggleUpvotePost,
    toggleUpvoteReply
};