const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
    createPost,
    getPublicPosts,
    getPostById,
    addReply,
    toggleUpvotePost,
    toggleUpvoteReply // <-- استيراد الدالة الجديدة
} = require('../controllers/forumController');

router.route('/posts')
    .get(getPublicPosts)
    .post(protect, createPost);

router.route('/posts/:id')
    .get(getPostById);

router.route('/posts/:id/replies')
    .post(protect, addReply);

router.route('/posts/:id/upvote')
    .post(protect, toggleUpvotePost);

// [NEW] إضافة مسار الإعجاب بالرد
router.route('/posts/:postId/replies/:replyId/upvote')
    .post(protect, toggleUpvoteReply);

module.exports = router;