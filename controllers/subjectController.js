// back-end/controllers/subjectController.js

const Subject = require('../models/Subject');
const Track = require('../models/Track'); // نحتاجه للتحقق

// @desc    Get all subjects, optionally filtered by track ID
// @route   GET /api/subjects?trackId=...
// @access  Public (or Private)
exports.getSubjects = async (req, res) => {
    try {
        const query = req.query.trackId ? { track: req.query.trackId } : {};
        // .populate('track', 'name') لجلب اسم الشعبة مع المادة
        const subjects = await Subject.find(query).populate('track', 'name');
        res.json(subjects);
    } catch (error) {
        console.error('Error fetching subjects:', error);
        res.status(500).json({ message: 'Server Error while fetching subjects' });
    }
};

// @desc    Get a single subject by ID
// @route   GET /api/subjects/:id
// @access  Private/Admin
exports.getSubjectById = async (req, res) => {
    try {
        const subject = await Subject.findById(req.params.id).populate('track', 'name');
        if (!subject) {
            return res.status(404).json({ message: 'Subject not found' });
        }
        res.json(subject);
    } catch (error) {
        console.error('Error fetching subject by ID:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create a new subject
// @route   POST /api/subjects
// @access  Private/Admin
exports.createSubject = async (req, res) => {
    const { name, track: trackId } = req.body;
    if (!name || !trackId) {
        return res.status(400).json({ message: 'Subject name and track ID are required.' });
    }

    try {
        // التحقق من وجود الشعبة
        const trackExists = await Track.findById(trackId);
        if (!trackExists) {
            return res.status(404).json({ message: 'Associated track not found.' });
        }

        // التحقق من أن المادة غير موجودة بالفعل في هذه الشعبة
        const subjectExists = await Subject.findOne({ name, track: trackId });
        if (subjectExists) {
            return res.status(400).json({ message: `Subject '${name}' already exists in this track.` });
        }

        const newSubject = new Subject({ name, track: trackId });
        const createdSubject = await newSubject.save();
        
        // جلب البيانات مع اسم الشعبة لإرسالها للواجهة
        const populatedSubject = await Subject.findById(createdSubject._id).populate('track', 'name');

        res.status(201).json(populatedSubject);
    } catch (error) {
        console.error('Error creating subject:', error);
        res.status(400).json({ message: 'Error creating subject', error: error.message });
    }
};

// @desc    Update a subject
// @route   PUT /api/subjects/:id
// @access  Private/Admin
exports.updateSubject = async (req, res) => {
    const { name, track: trackId } = req.body;

    try {
        const subject = await Subject.findById(req.params.id);
        if (!subject) {
            return res.status(404).json({ message: 'Subject not found' });
        }

        // إذا تم تغيير الشعبة، تأكد من وجودها
        if (trackId) {
            const trackExists = await Track.findById(trackId);
            if (!trackExists) {
                return res.status(404).json({ message: 'New associated track not found.' });
            }
            subject.track = trackId;
        }

        if (name) {
            subject.name = name;
        }
        
        const updatedSubject = await subject.save();

        // جلب البيانات مع اسم الشعبة لإرسالها للواجهة
        const populatedSubject = await Subject.findById(updatedSubject._id).populate('track', 'name');

        res.json(populatedSubject);
    } catch (error) {
        console.error('Error updating subject:', error);
        // التعامل مع خطأ التكرار إذا حدث
        if (error.code === 11000) {
             return res.status(400).json({ message: `Another subject with this name may already exist in the target track.` });
        }
        res.status(400).json({ message: 'Error updating subject', error: error.message });
    }
};

// @desc    Delete a subject
// @route   DELETE /api/subjects/:id
// @access  Private/Admin
exports.deleteSubject = async (req, res) => {
    try {
        const subject = await Subject.findById(req.params.id);
        if (!subject) {
            return res.status(404).json({ message: 'Subject not found' });
        }

        // لاحقًا: نضيف منطقًا للتحقق من وجود أسئلة مرتبطة بهذه المادة قبل حذفها
        // const questions = await require('../models/Question').find({ subject: req.params.id });
        // if (questions.length > 0) {
        //     return res.status(400).json({ message: 'Cannot delete subject. It has associated questions.' });
        // }

        await subject.deleteOne();
        res.json({ message: 'Subject removed successfully' });
    } catch (error) {
        console.error('Error deleting subject:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};