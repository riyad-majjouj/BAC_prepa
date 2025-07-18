// routes/userRoutes.js
const express = require('express');
// استيراد كلتا الدالتين
const { updateUserProfile, getUserProfile } = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');
const router = express.Router();

router.route('/profile')
    .get(protect, getUserProfile)     // <-- أضف هذا السطر لمعالجة طلبات GET
    .put(protect, updateUserProfile); // هذا السطر موجود بالفعل

module.exports = router;