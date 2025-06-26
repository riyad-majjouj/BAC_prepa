// back-end/controllers/subjectController.js
const mongoose = require('mongoose');
const Subject = require('../models/Subject');
const Track = require('../models/Track');
const AcademicLevel = require('../models/AcademicLevel');

exports.getSubjects = async (req, res) => {
    try {
        const { trackId, levelId, populate } = req.query;
        const filter = {};
        if (trackId) {
            if (!mongoose.Types.ObjectId.isValid(trackId)) return res.status(400).json({ message: 'Invalid track ID format.' });
            filter.track = trackId;
        }
        if (levelId) {
            if (!mongoose.Types.ObjectId.isValid(levelId)) return res.status(400).json({ message: 'Invalid academic level ID format.' });
            filter.academicLevel = levelId;
        }

        let query = Subject.find(filter);

        if (populate) {
            const populatePaths = populate.split(',');
            if (populatePaths.includes('track')) query = query.populate('track', 'name');
            if (populatePaths.includes('academicLevel')) query = query.populate('academicLevel', 'name');
        }
        
        const subjects = await query.sort({ name: 1 }).lean();
        res.json(subjects);
    } catch (error) {
        console.error('Error fetching subjects:', error);
        res.status(500).json({ message: 'Server Error while fetching subjects' });
    }
};

exports.getSubjectById = async (req, res) => {
    try {
        const { id } = req.params;
        const { populate } = req.query;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid subject ID format' });
        }

        let query = Subject.findById(id).select('name language academicLevel track');

        // Default population if not specified by query, or respect query
        const populateFields = populate ? populate.split(',') : ['track', 'academicLevel'];
        if (populateFields.includes('track')) query = query.populate('track', 'name');
        if (populateFields.includes('academicLevel')) query = query.populate('academicLevel', 'name');
        
        const subject = await query.lean();

        if (!subject) {
            return res.status(404).json({ message: 'Subject not found' });
        }
        res.json(subject);
    } catch (error) {
        console.error('Error fetching subject by ID:', error.message);
        if (error.name === 'StrictPopulateError') {
            return res.status(500).json({ message: `Server configuration error: Populate path (${error.path}) not in schema. Check Subject model.` });
        }
        res.status(500).json({ message: 'Server Error while fetching subject details' });
    }
};

exports.createSubject = async (req, res) => {
    const { name, language, track: trackId, academicLevel: academicLevelId } = req.body;

    if (!name || !trackId || !academicLevelId) {
        return res.status(400).json({ message: 'Subject name, track ID, and academic level ID are required.' });
    }
    if (language && !['ar', 'fr', 'en', 'general'].includes(language)) {
        return res.status(400).json({ message: 'Invalid language value. Must be ar, fr, en, or general.' });
    }

    try {
        if (!mongoose.Types.ObjectId.isValid(trackId)) return res.status(400).json({ message: 'Invalid track ID format.'});
        if (!mongoose.Types.ObjectId.isValid(academicLevelId)) return res.status(400).json({ message: 'Invalid academic level ID format.'});

        const trackExists = await Track.findById(trackId);
        if (!trackExists) return res.status(404).json({ message: 'Associated track not found.' });
        
        const academicLevelExists = await AcademicLevel.findById(academicLevelId);
        if (!academicLevelExists) return res.status(404).json({ message: 'Associated academic level not found.' });

        const newSubjectData = {
            name,
            language: language || 'general',
            track: trackId,
            academicLevel: academicLevelId
        };

        const newSubject = new Subject(newSubjectData);
        const createdSubject = await newSubject.save();
        
        const populatedSubject = await Subject.findById(createdSubject._id)
            .populate('track', 'name')
            .populate('academicLevel', 'name');

        res.status(201).json(populatedSubject);
    } catch (error) {
        console.error('Error creating subject:', error.message);
        if (error.code === 11000 || (error.message && error.message.includes('duplicate key error'))) {
             return res.status(400).json({ message: `Subject '${name}' already exists for the specified track and academic level.` });
        }
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((val) => val.message);
            return res.status(400).json({ message: "Validation Error: " + messages.join(', ') });
        }
        res.status(500).json({ message: 'Error creating subject', errorDetails: error.message });
    }
};

exports.updateSubject = async (req, res) => {
    const { name, language, track: trackId, academicLevel: academicLevelId } = req.body;
    const { id: subjectId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(subjectId)) {
        return res.status(400).json({ message: 'Invalid subject ID format for update.' });
    }

    try {
        const subject = await Subject.findById(subjectId);
        if (!subject) {
            return res.status(404).json({ message: 'Subject not found' });
        }

        // Update fields if provided
        if (name) subject.name = name;
        if (language) {
            if (!['ar', 'fr', 'en', 'general'].includes(language)) {
                return res.status(400).json({ message: 'Invalid language value for update.' });
            }
            subject.language = language;
        }
        if (trackId) {
            if (!mongoose.Types.ObjectId.isValid(trackId)) return res.status(400).json({ message: 'Invalid new track ID format.'});
            const trackExists = await Track.findById(trackId);
            if (!trackExists) return res.status(404).json({ message: 'New associated track not found.' });
            subject.track = trackId;
        }
        if (academicLevelId) {
            if (!mongoose.Types.ObjectId.isValid(academicLevelId)) return res.status(400).json({ message: 'Invalid new academic level ID format.'});
            const levelExists = await AcademicLevel.findById(academicLevelId);
            if (!levelExists) return res.status(404).json({ message: 'New associated academic level not found.' });
            subject.academicLevel = academicLevelId;
        }
        
        const updatedSubjectInstance = await subject.save();
        const populatedSubject = await Subject.findById(updatedSubjectInstance._id)
            .populate('track', 'name')
            .populate('academicLevel', 'name');

        res.json(populatedSubject);
    } catch (error) {
        console.error('Error updating subject:', error.message);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: "Validation Error: " + messages.join(', ') });
        }
        if (error.code === 11000 || (error.message && error.message.includes('duplicate key error'))) {
             return res.status(400).json({ message: `Update failed. The new name/track/level combination might already exist.` });
        }
        res.status(500).json({ message: 'Error updating subject', errorDetails: error.message });
    }
};

exports.deleteSubject = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'Invalid subject ID format for deletion.' });
        }
        const subject = await Subject.findById(req.params.id);
        if (!subject) {
            return res.status(404).json({ message: 'Subject not found' });
        }
        
        // Consider implications: deleting questions, user progress related to this subject?
        // For now, direct delete.
        await subject.deleteOne();
        res.json({ message: 'Subject removed successfully' });
    } catch (error) {
        console.error('Error deleting subject:', error);
        res.status(500).json({ message: 'Server Error while deleting subject', error: error.message });
    }
};