// backend/controllers/subjectController.js
const Subject = require('../models/Subject');

// @desc    Get subjects by user's track
// @route   GET /api/subjects/my-track
// @access  Private
const getSubjectsByMyTrack = async (req, res) => {
    const userTrack = req.user.track;

    if (!userTrack || userTrack === 'غير محدد') {
        return res.status(400).json({ message: 'User has not selected a track yet.' });
    }

    try {
        const subjects = await Subject.find({ tracks: userTrack });
        if (userTrack === 'CONCOURS') {
            const filteredSubjects = subjects.filter(sub => sub.name.toLowerCase() !== 'english' && sub.name.toLowerCase() !== 'اللغة الانجليزية');
            return res.json(filteredSubjects);
        }
        res.json(subjects);
    } catch (error) {
        console.error('Error in getSubjectsByMyTrack:', error);
        res.status(500).json({ message: 'Server Error when fetching subjects by track' });
    }
};

// --- Admin Routes ---

// @desc    Get all subjects (for admin)
// @route   GET /api/subjects/all-for-admin
// @access  Private/Admin
const getAllSubjectsForAdmin = async (req, res) => {
    try {
        const subjects = await Subject.find({}); // جلب كل المواد
        res.json(subjects);
    } catch (error) {
        console.error('Error in getAllSubjectsForAdmin:', error);
        res.status(500).json({ message: 'Server Error when fetching all subjects' });
    }
};

// @desc    Create a new subject
// @route   POST /api/subjects
// @access  Private/Admin
const createSubject = async (req, res) => {
    const { name, tracks } = req.body;

    if (!name || !tracks || !Array.isArray(tracks) || tracks.length === 0) {
        return res.status(400).json({ message: 'Name and at least one track are required for the subject.' });
    }

    const allowedTracksValues = ['PC', 'SVT', 'SM', 'CONCOURS'];
    for (const track of tracks) {
        if (!allowedTracksValues.includes(track)) {
            return res.status(400).json({ message: `Invalid track value: ${track}. Allowed tracks are: ${allowedTracksValues.join(', ')}.` });
        }
    }

    try {
        const subjectExists = await Subject.findOne({ name });
        if (subjectExists) {
            return res.status(400).json({ message: 'Subject with this name already exists.' });
        }

        const subject = new Subject({ name, tracks });
        const createdSubject = await subject.save();
        res.status(201).json(createdSubject);
    } catch (error) {
        console.error('Error in createSubject:', error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((val) => val.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        res.status(500).json({ message: 'Server Error when creating subject', error: error.message });
    }
};

// @desc    Update a subject by name
// @route   PUT /api/subjects/:name
// @access  Private/Admin
const updateSubject = async (req, res) => {
    const { id } = req.params; // <<<< الحصول على ID من params
    const { name: newName, tracks } = req.body; // الاسم الجديد والشعب الجديدة من الـ body

    // ... (نفس منطق التحقق من newName و tracks)
    if ((!newName && (!tracks || !Array.isArray(tracks) || tracks.length === 0))) { // إذا لم يتم إرسال أي شيء للتحديث أو تم إرسال tracks بشكل خاطئ
         return res.status(400).json({ message: 'Either a new name or a valid tracks array (with at least one track) must be provided for update.' });
    }
    if (tracks) { // فقط إذا تم إرسال tracks
        const allowedTracksValues = ['PC', 'SVT', 'SM', 'CONCOURS'];
        for (const track of tracks) {
            if (!allowedTracksValues.includes(track)) {
                return res.status(400).json({ message: `Invalid track value: ${track}. Allowed tracks are: ${allowedTracksValues.join(', ')}.` });
            }
        }
    }


    try {
        const subject = await Subject.findById(id); // <<<< البحث باستخدام findById
        if (!subject) {
            return res.status(404).json({ message: `Subject with ID '${id}' not found.` });
        }

        if (newName && newName !== subject.name) {
            const subjectWithNewNameExists = await Subject.findOne({ name: newName, _id: { $ne: id } }); // تأكد أن الاسم الجديد لا يستخدمه مستند آخر
            if (subjectWithNewNameExists) {
                return res.status(400).json({ message: `Another subject with the name '${newName}' already exists.` });
            }
            subject.name = newName;
        }
        
        if (tracks) {
            subject.tracks = tracks;
        }

        const updatedSubject = await subject.save();
        res.json(updatedSubject);
    } catch (error) {
        // ... (نفس معالجة الخطأ)
        console.error('Error in updateSubject:', error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((val) => val.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        if (error.kind === 'ObjectId' && error.path === '_id') { // خطأ في صيغة الـ ID
            return res.status(400).json({ message: `Invalid subject ID format: ${id}` });
        }
        res.status(500).json({ message: 'Error updating subject', error: error.message });
    }
};

// @desc    Delete a subject by ID <<<< تغيير الوصف
// @route   DELETE /api/subjects/:id <<<< تغيير المسار في التعليق
// @access  Private/Admin
const deleteSubject = async (req, res) => {
    const { id } = req.params; // <<<< الحصول على ID
    try {
        const subject = await Subject.findByIdAndDelete(id); // <<<< الحذف باستخدام findByIdAndDelete
        if (subject) {
            res.json({ message: `Subject '${subject.name}' (ID: ${id}) removed successfully.` });
        } else {
            res.status(404).json({ message: `Subject with ID '${id}' not found.` });
        }
    } catch (error) {
        // ... (نفس معالجة الخطأ)
         console.error('Error in deleteSubject:', error);
        if (error.kind === 'ObjectId' && error.path === '_id') {
            return res.status(400).json({ message: `Invalid subject ID format: ${id}` });
        }
        res.status(500).json({ message: 'Server Error when deleting subject', error: error.message });
    }
};
module.exports = {
    getSubjectsByMyTrack,
    createSubject,
    updateSubject,
    deleteSubject,
    getAllSubjectsForAdmin // <<<< إضافة الدالة إلى exports
};