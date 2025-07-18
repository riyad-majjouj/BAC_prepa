// back-end/controllers/academicLevelController.js
const AcademicLevel = require('../models/AcademicLevel');

// @desc    Get all academic levels
// @route   GET /api/academic-levels
// @access  Public (or Private if you prefer)
exports.getAcademicLevels = async (req, res) => {
    try {
        const levels = await AcademicLevel.find().sort('order');
        res.json(levels);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create a new academic level
// @route   POST /api/academic-levels
// @access  Private/Admin
exports.createAcademicLevel = async (req, res) => {
    const { name, description, order } = req.body;
    try {
        const newLevel = new AcademicLevel({ name, description, order });
        await newLevel.save();
        res.status(201).json(newLevel);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Academic level with this name already exists.' });
        }
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update an academic level
// @route   PUT /api/academic-levels/:id
// @access  Private/Admin
exports.updateAcademicLevel = async (req, res) => {
    try {
        const level = await AcademicLevel.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!level) {
            return res.status(404).json({ message: 'Academic level not found' });
        }
        res.json(level);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete an academic level
// @route   DELETE /api/academic-levels/:id
// @access  Private/Admin
exports.deleteAcademicLevel = async (req, res) => {
    try {
        const level = await AcademicLevel.findById(req.params.id);
        if (!level) {
            return res.status(404).json({ message: 'Academic level not found' });
        }
        
        // لاحقًا: نضيف منطقًا للتحقق من وجود شعب مرتبطة بهذا المستوى قبل حذفه
        // const tracks = await require('../models/Track').find({ academicLevel: req.params.id });
        // if (tracks.length > 0) {
        //     return res.status(400).json({ message: 'Cannot delete level. It has associated tracks.' });
        // }

        await level.deleteOne(); // Use deleteOne()
        res.json({ message: 'Academic level removed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};