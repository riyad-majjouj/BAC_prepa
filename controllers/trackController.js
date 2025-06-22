// back-end/controllers/trackController.js
const Track = require('../models/Track');
const AcademicLevel = require('../models/AcademicLevel'); // للتأكد من وجود المستوى

// @desc    Get all tracks, optionally filtered by academic level
// @route   GET /api/tracks or GET /api/tracks?levelId=...
// @access  Public (or Private)
exports.getTracks = async (req, res) => {
    try {
        const query = req.query.levelId ? { academicLevel: req.query.levelId } : {};
        const tracks = await Track.find(query).populate('academicLevel', 'name');
        res.json(tracks);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create a new track
// @route   POST /api/tracks
// @access  Private/Admin
exports.createTrack = async (req, res) => {
    const { name, description, academicLevel } = req.body;
    try {
        // التحقق من وجود المستوى الدراسي قبل إنشاء الشعبة
        const levelExists = await AcademicLevel.findById(academicLevel);
        if (!levelExists) {
            return res.status(404).json({ message: 'Associated academic level not found.' });
        }

        const newTrack = new Track({ name, description, academicLevel });
        await newTrack.save();
        res.status(201).json(newTrack);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update a track
// @route   PUT /api/tracks/:id
// @access  Private/Admin
exports.updateTrack = async (req, res) => {
    try {
        // إذا تم تغيير المستوى، تأكد من وجود المستوى الجديد
        if (req.body.academicLevel) {
            const levelExists = await AcademicLevel.findById(req.body.academicLevel);
            if (!levelExists) {
                return res.status(404).json({ message: 'New associated academic level not found.' });
            }
        }

        const track = await Track.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!track) {
            return res.status(404).json({ message: 'Track not found' });
        }
        res.json(track);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a track
// @route   DELETE /api/tracks/:id
// @access  Private/Admin
exports.deleteTrack = async (req, res) => {
    try {
        const track = await Track.findById(req.params.id);
        if (!track) {
            return res.status(404).json({ message: 'Track not found' });
        }

        // لاحقًا: نضيف منطقًا للتحقق من وجود مواد مرتبطة بهذه الشعبة قبل حذفها
        // const subjects = await require('../models/Subject').find({ track: req.params.id });
        // if (subjects.length > 0) {
        //     return res.status(400).json({ message: 'Cannot delete track. It has associated subjects.' });
        // }
        
        await track.deleteOne();
        res.json({ message: 'Track removed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};