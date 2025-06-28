const express = require('express');
const router = express.Router();
const {
    getAllDevoirsForAdmin,
    createDevoir,
    updateDevoir,
    deleteDevoir,
    getDevoirById
} = require('../controllers/devoirController');
const { protect, admin } = require('../middlewares/authMiddleware'); // افترض أن لديك middleware للحماية

// All routes are protected and require admin access
router.route('/')
    .post(protect, admin, createDevoir);

router.route('/admin')
    .get(protect, admin, getAllDevoirsForAdmin);
    
router.route('/:id')
    .get(protect, admin, getDevoirById) // أضف هذا السطر
    .put(protect, admin, updateDevoir)
    .delete(protect, admin, deleteDevoir);

module.exports = router;