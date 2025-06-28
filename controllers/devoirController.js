const Devoir = require('../models/Devoir');
const mongoose = require('mongoose');

// @desc    Get all devoirs for admin (paginated and filtered)
// @route   GET /api/devoirs/admin
// @access  Private/Admin
const getAllDevoirsForAdmin = async (req, res) => {
    try {
        const { page = 1, limit = 10, subjectId, trackId, academicLevelId } = req.query;
        const queryFilter = {};
        if (academicLevelId) queryFilter.academicLevel = new mongoose.Types.ObjectId(academicLevelId);
        if (trackId) queryFilter.track = new mongoose.Types.ObjectId(trackId);
        if (subjectId) queryFilter.subject = new mongoose.Types.ObjectId(subjectId);

        const devoirs = await Devoir.find(queryFilter)
            .populate('academicLevel', 'name')
            .populate('track', 'name')
            .populate('subject', 'name')
            // لا نرسل كل تفاصيل الأسئلة في القائمة الرئيسية لتخفيف الحمل
            .select('-problems') 
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit))
            .sort({ createdAt: -1 })
            .lean();
        
        const totalDevoirs = await Devoir.countDocuments(queryFilter);

        res.status(200).json({ 
            devoirs, 
            totalPages: Math.ceil(totalDevoirs / Number(limit)),
            currentPage: Number(page),
            totalDevoirs
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error while finding devoirs.', error: err.message });
    }
};

// @desc    Get a single devoir by ID with full details
// @route   GET /api/devoirs/:id
// @access  Private/Admin
const getDevoirById = async (req, res) => {
    try {
        const devoir = await Devoir.findById(req.params.id)
            .populate('academicLevel', 'name')
            .populate('track', 'name')
            .populate('subject', 'name');

        if (!devoir) {
            return res.status(404).json({ message: 'Devoir not found' });
        }
        res.json(devoir);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


// @desc    Create a new devoir
// @route   POST /api/devoirs
// @access  Private/Admin
const createDevoir = async (req, res) => {
    try {
        const newDevoir = new Devoir(req.body);
        const savedDevoir = await newDevoir.save();
        res.status(201).json(savedDevoir);
    } catch (error) {
        console.error("Error creating devoir:", error);
        res.status(400).json({ message: 'Error creating devoir', error: error.message });
    }
};

// @desc    Update a devoir
// @route   PUT /api/devoirs/:id
// @access  Private/Admin
const updateDevoir = async (req, res) => {
    try {
        const updatedDevoir = await Devoir.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!updatedDevoir) {
            return res.status(404).json({ message: 'Devoir not found.' });
        }
        res.json(updatedDevoir);
    } catch (error) {
         res.status(400).json({ message: 'Error updating devoir', error: error.message });
    }
};

// @desc    Delete a devoir
// @route   DELETE /api/devoirs/:id
// @access  Private/Admin
const deleteDevoir = async (req, res) => {
    const { id } = req.params;
    try {
        const devoir = await Devoir.findByIdAndDelete(id);
        if (!devoir) return res.status(404).json({ message: 'Devoir not found' });
        res.json({ message: 'Devoir removed successfully' });
    } catch(err) {
        res.status(500).json({message: "Server error while deleting devoir", error: err.message});
    }
};

module.exports = {
    getAllDevoirsForAdmin,
    getDevoirById,
    createDevoir,
    updateDevoir,
    deleteDevoir,
};