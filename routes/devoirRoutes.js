const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
    getAllDevoirsForAdmin,
    createDevoir,
    updateDevoir,
    deleteDevoir,
    getDevoirById,
    analyzeDevoirFromFile
} = require('../controllers/devoirController');
const { protect, admin } = require('../middlewares/authMiddleware'); // افترض أن لديك middleware للحماية
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // حد 10MB للملف
    fileFilter: (req, file, cb) => {
        // السماح فقط بملفات PDF والصور
        if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only PDF and image files are allowed.'), false);
        }
    }
});

// All routes are protected and require admin access
router.route('/')
    .post(protect, admin, createDevoir);

router.route('/admin')
    .get(protect, admin, getAllDevoirsForAdmin);
    
router.route('/:id')
    .get(protect, admin, getDevoirById) // أضف هذا السطر
    .put(protect, admin, updateDevoir)
    .delete(protect, admin, deleteDevoir);

router.route('/analyze-from-file')
    .post(protect, admin, upload.single('file'), analyzeDevoirFromFile);    

module.exports = router;