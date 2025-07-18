// back-end/routes/uploadRoutes.js
const express = require('express');
const router = express.Router();
const { getUploadSignature } = require('../controllers/uploadController');
const { protect, admin } = require('../middlewares/authMiddleware');

// جميع المسارات هنا محمية وتتطلب صلاحيات أدمن
router.get('/signature', protect, admin, getUploadSignature);

module.exports = router;