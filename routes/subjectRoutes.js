// back-end/routes/subjectRoutes.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose'); // <--- *** تم إضافة هذا السطر ***
const { protect, admin } = require('../middlewares/authMiddleware'); // افتراض أن هذا المسار صحيح
const Subject = require('../models/Subject'); // <--- *** تم إضافة هذا السطر (تأكد من المسار) ***

const { 
    getSubjects,
    getSubjectById, // هذه الدالة قد تكون هي نفسها التي تنفذ GET /:id
    createSubject,
    updateSubject,
    deleteSubject
} = require('../controllers/subjectController'); // افتراض أن هذه هي وحدات التحكم الخاصة بك

// Public route to get all subjects (can be filtered by trackId query param)
// مثال: /api/subjects?trackId=60d21b4667d0d8992e610c85
// أو /api/subjects?levelId=...&trackId=...
router.route('/')
    .get(getSubjects); // هذه الدالة يجب أن تكون معرفة في subjectController

// Admin routes for creating subjects
router.route('/')
    .post(protect, admin, createSubject); // هذه الدالة يجب أن تكون معرفة في subjectController

// Route for getting a single subject's details (for TimedExam.tsx)
// هذا المسار يجب أن يكون قبل المسار العام /:id إذا كنت تستخدم :id لمعرفات أخرى غير التفاصيل
// أو تأكد من أن /:id يعالج فقط معرفات المواد وليس كلمة "details"
router.get('/details/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) { // الآن mongoose معرف
            return res.status(400).json({ message: 'Invalid subject ID format' });
        }

        const subject = await Subject.findById(id) // الآن Subject معرف
                                     .select('name language academicLevel track')
                                     .populate('academicLevel', 'name') // إذا أردت جلب اسم المستوى
                                     .populate('track', 'name')         // إذا أردت جلب اسم المسار
                                     .lean(); 

        if (!subject) {
            return res.status(404).json({ message: 'Subject not found' });
        }
        res.json(subject);
    } catch (error) {
        console.error("Error fetching subject details by ID:", error);
        res.status(500).json({ message: 'Server error fetching subject details' });
    }
});

// Routes for specific subject by ID (for admin or general viewing if needed)
// تأكد أن هذا المسار لا يتداخل مع '/details/:id'.
// إذا كان getSubjectById من controller يتعامل مع GET /:id، فلا حاجة لهذا المسار بشكل منفصل
// إلا إذا كان له منطق مختلف.
router.route('/:id')
    .get(getSubjectById) // هذه الدالة يجب أن تكون معرفة في subjectController
    .put(protect, admin, updateSubject) // هذه الدالة يجب أن تكون معرفة في subjectController
    .delete(protect, admin, deleteSubject); // هذه الدالة يجب أن تكون معرفة في subjectController


module.exports = router;