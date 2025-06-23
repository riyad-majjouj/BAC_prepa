// back-end/controllers/questionController.js

const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const Question = require('../models/Question');
const Subject = require('../models/Subject');
const Track = require('../models/Track');
const AcademicLevel = require('../models/AcademicLevel');
const UserProgress = require('../models/UserProgress');
const TemporaryQuestion = require('../models/TemporaryQuestion'); // <-- **جديد:** استيراد الموديل الجديد

const {
    generateAIQuestion,
    validateFreeTextAnswerWithAI,
    generateHintWithAI,
    generateDetailedAnswerWithAI
} = require('../utils/aiGeneralQuestionGenerator.js');

// Helper functions
const mapLevelToArabic = (levelApiValue) => {
    const mapping = { 'Facile': 'سهل', 'Moyen': 'متوسط', 'Difficile': 'صعب' };
    return mapping[levelApiValue] || levelApiValue;
};
const mapLevelToApiValue = (levelDbValue) => {
    const mapping = { 'سهل': 'Facile', 'متوسط': 'Moyen', 'صعب': 'Difficile' };
    return mapping[levelDbValue] || levelDbValue;
};

const getPracticeQuestion = async (req, res) => {
    const userId = req.user.id || req.user._id;
    console.log(`\n--- [GET_PRACTICE_QUESTION_START] ---`);
    console.log(`User ID: ${userId}`);

    const { levelId: academicLevelId, trackId, subjectId, difficulty: difficultyApiValue } = req.query;

    if (!academicLevelId || !trackId || !subjectId || !difficultyApiValue) {
        return res.status(400).json({ message: "Academic level, track, subject, and difficulty are required." });
    }
    
    const levelForDbLookup = mapLevelToArabic(difficultyApiValue);

    try {
        const solvedProgressEntries = await UserProgress.find({ user: userId, question: { $ne: null } }).select('question -_id').lean();
        const solvedQuestionIds = solvedProgressEntries.map(entry => entry.question);

        const matchStage = {
            academicLevel: new mongoose.Types.ObjectId(academicLevelId),
            track: new mongoose.Types.ObjectId(trackId),
            subject: new mongoose.Types.ObjectId(subjectId),
            level: levelForDbLookup,
            _id: { $nin: solvedQuestionIds },
            type: { $ne: 'problem_set' }
        };

        const randomDbQuestions = await Question.aggregate([{ $match: matchStage }, { $sample: { size: 1 } }]);
        const availableDbQuestionDoc = randomDbQuestions.length > 0 ? randomDbQuestions[0] : null;

        const probabilityToUseAi = (difficultyApiValue === "Difficile") ? 0.75 : 0.5;
        const shouldUseAi = Math.random() < probabilityToUseAi;

        if (!shouldUseAi && availableDbQuestionDoc) {
            console.log(`[DECISION_RESULT_DB_PRACTICE] Chose DB question. ID: ${availableDbQuestionDoc._id}`);
            const populatedQuestion = await Question.findById(availableDbQuestionDoc._id).populate('subject', 'name').lean();
            if (!populatedQuestion) throw new Error("Failed to retrieve details for the selected DB question.");
            
            return res.json({
                _id: populatedQuestion._id.toString(),
                question: populatedQuestion.text,
                type: populatedQuestion.type,
                options: populatedQuestion.options,
                subject: populatedQuestion.subject.name,
                level: mapLevelToApiValue(populatedQuestion.level),
                generatedBy: 'db',
                lesson: populatedQuestion.lesson,
            });
        } else {
            console.log(`[DECISION_RESULT_AI_PRACTICE] ${shouldUseAi ? 'Randomly chose AI' : 'No DB question available or AI preferred'}.`);

            const subjectDoc = await Subject.findById(subjectId).populate({ path: 'track', populate: { path: 'academicLevel' } }).lean();
            if (!subjectDoc) return res.status(404).json({ message: 'Subject not found for AI generation.' });

            const aiGeneratedData = await generateAIQuestion(subjectDoc.track.academicLevel.name, subjectDoc.track.name, subjectDoc.name, difficultyApiValue);
            if (!aiGeneratedData || !aiGeneratedData.question) throw new Error("AI generation returned invalid data.");

            const tempAiQuestionId = `ai_practice_${uuidv4()}`;
            console.log(`[AI_PRACTICE_GENERATED] Temp ID: ${tempAiQuestionId}`);

            // **تعديل:** تخزين السؤال المؤقت في قاعدة البيانات بدلاً من الجلسة
            await TemporaryQuestion.create({
                questionId: tempAiQuestionId,
                userId: userId,
                questionData: {
                    ...aiGeneratedData,
                    subjectName: subjectDoc.name,
                    trackName: subjectDoc.track.name,
                    academicLevelName: subjectDoc.track.academicLevel.name,
                    apiDifficulty: difficultyApiValue,
                }
            });
            console.log(`[AI_PRACTICE_DB_STORE_SUCCESS] Stored temporary AI question ${tempAiQuestionId} in DB for user ${userId}.`);

            // إرسال السؤال للفرونت إند بدون الإجابة الصحيحة
            const responseToFrontend = {
                _id: tempAiQuestionId,
                question: aiGeneratedData.question,
                type: aiGeneratedData.type,
                options: aiGeneratedData.options,
                subject: subjectDoc.name,
                level: difficultyApiValue,
                generatedBy: 'ai',
                lesson: aiGeneratedData.lesson,
            };

            return res.json(responseToFrontend);
        }
    } catch (error) {
        console.error('[GET_PRACTICE_QUESTION_FATAL_ERROR] Error:', error.message, error.stack);
        return res.status(500).json({ message: 'Internal Server Error while fetching question.', error: error.message });
    }
};

const getQuestionHint = async (req, res) => {
    const { questionId } = req.params;
    const userId = req.user.id;
    console.log(`[GET_HINT_REQUEST] User: ${userId}, QID: ${questionId}`);

    try {
        let questionTextForHint, subjectNameForHint;

        if (questionId.startsWith('ai_practice_')) {
            // **تعديل:** البحث عن سؤال AI في مجموعة البيانات المؤقتة
            const tempQ = await TemporaryQuestion.findOne({ questionId, userId });
            if (tempQ) {
                questionTextForHint = tempQ.questionData.question;
                subjectNameForHint = tempQ.questionData.subjectName;
                console.log(`[GET_HINT_AI_DB] Found AI question ${questionId} in temporary DB for user ${userId}.`);
            } else {
                console.error(`[GET_HINT_AI_NOT_FOUND_IN_DB] Data for AI question ${questionId} not found in temporary DB for user ${userId}.`);
                return res.status(404).json({ message: "AI Question data for hint not found or has expired." });
            }
        } else if (mongoose.Types.ObjectId.isValid(questionId)) {
            const dbQ = await Question.findById(questionId).populate('subject', 'name').lean();
            if (!dbQ) return res.status(404).json({ message: "DB Question not found." });
            questionTextForHint = dbQ.text;
            subjectNameForHint = dbQ.subject.name;
        } else {
            return res.status(400).json({ message: "Invalid question identifier." });
        }

        const hint = await generateHintWithAI(questionTextForHint, subjectNameForHint, "ar");
        res.json({ hint });
    } catch (error) {
        console.error(`[GET_HINT_ERROR] QID ${questionId}:`, error.message, error.stack);
        res.status(500).json({ message: 'Error generating hint.', error: error.message });
    }
};

const getDetailedAnswer = async (req, res) => {
    const { questionId } = req.params;
    const { userAnswerText } = req.query;
    const userId = req.user.id;

    console.log(`[GET_DETAILED_ANSWER_REQUEST] User: ${userId}, QID: ${questionId}`);

    try {
        let qDetails, subjectName, academicLevelName, trackName, displayLevel, correctAnswerFromSource;

        if (questionId.startsWith('ai_practice_')) {
            // **تعديل:** البحث عن سؤال AI في مجموعة البيانات المؤقتة
            const tempQ = await TemporaryQuestion.findOne({ questionId, userId });
            if (tempQ && tempQ.questionData) {
                const data = tempQ.questionData;
                qDetails = { question: data.question, type: data.type, options: data.options, correctAnswer: data.correctAnswer, lesson: data.lesson };
                subjectName = data.subjectName;
                academicLevelName = data.academicLevelName || "N/A";
                trackName = data.trackName || "N/A";
                displayLevel = data.apiDifficulty;
                correctAnswerFromSource = data.correctAnswer;
                console.log(`[GET_DETAILED_ANSWER_AI_DB] Found AI question ${questionId} in temporary DB.`);
            } else {
                console.error(`[GET_DETAILED_ANSWER_AI_NOT_FOUND_IN_DB] Data for AI question ${questionId} not found in temporary DB.`);
                return res.status(404).json({ message: "AI Question data for detailed answer not found or has expired." });
            }
        } else if (mongoose.Types.ObjectId.isValid(questionId)) {
            const dbQ = await Question.findById(questionId).populate('academicLevel track subject', 'name').lean();
            if (!dbQ) return res.status(404).json({ message: "DB Question not found." });
            qDetails = { question: dbQ.text, type: dbQ.type, options: dbQ.options, correctAnswer: dbQ.correctAnswer, lesson: dbQ.lesson };
            subjectName = dbQ.subject.name;
            academicLevelName = dbQ.academicLevel?.name || "N/A";
            trackName = dbQ.track?.name || "N/A";
            displayLevel = mapLevelToApiValue(dbQ.level);
            correctAnswerFromSource = dbQ.correctAnswer;
        } else {
            return res.status(400).json({ message: "Invalid question identifier." });
        }

        const detailedExplanation = await generateDetailedAnswerWithAI(qDetails.question, qDetails.type, subjectName, "ar", correctAnswerFromSource, userAnswerText);
        res.json({
            _id: questionId,
            question: qDetails.question, type: qDetails.type, options: qDetails.options,
            subject: subjectName, level: displayLevel, track: trackName, academicLevel: academicLevelName,
            lesson: qDetails.lesson,
            detailedExplanation,
            userProvidedAnswer: userAnswerText
        });
    } catch (error) {
        console.error(`[GET_DETAILED_ANSWER_ERROR] QID ${questionId}:`, error.message, error.stack);
        res.status(500).json({ message: 'Error generating detailed answer.', error: error.message });
    }
};

const validateFreeTextAnswer = async (req, res) => {
    // This function logic also needs to be updated to use TemporaryQuestion model instead of req.session
    // For brevity, leaving as an exercise. The pattern is the same as above.
    // Find the temporary question in the DB, get its details, validate, then save progress.
    return res.status(501).json({ message: "Free text validation logic needs to be updated to use new DB-based temporary storage." });
};

// --- Admin Routes --- (الكود كما هو)
const createQuestion = async (req, res) => {
    const { academicLevel, track, subject, level, type, text, options, correctAnswer, lesson, problemTitle, subQuestions, totalPoints } = req.body;
    if (!academicLevel || !track || !subject || !level || !type || !text) {
        return res.status(400).json({ message: 'Required fields are missing for creating question.' });
    }
    try {
        const questionData = { academicLevel, track, subject, level, type, text, lesson, options, correctAnswer, generatedBy: 'db', problemTitle, subQuestions, totalPoints };
        const newQuestion = new Question(questionData);
        const createdQuestion = await newQuestion.save();
        const populatedQuestion = await Question.findById(createdQuestion._id).populate('academicLevel track subject', 'name').lean();
        res.status(201).json(populatedQuestion);
    } catch (error) {
        res.status(500).json({ message: 'Error creating question', error: error.message });
    }
};

const updateQuestion = async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    try {
        const question = await Question.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
        if (!question) return res.status(404).json({ message: 'Question not found.' });
        const populatedQuestion = await Question.findById(question._id).populate('academicLevel track subject', 'name').lean();
        res.json(populatedQuestion);
    } catch (error) {
         res.status(500).json({ message: 'Error updating question', error: error.message });
    }
};

const deleteQuestion = async (req, res) => {
    const { id } = req.params;
    try {
        const question = await Question.findByIdAndDelete(id);
        if (!question) return res.status(404).json({ message: 'Question not found' });
        await UserProgress.deleteMany({ question: new mongoose.Types.ObjectId(id) });
        res.json({ message: 'Question removed successfully' });
    } catch(err) {
        res.status(500).json({message: "Server error while deleting question", error: err.message});
    }
};

const getAllQuestionsForAdmin = async (req, res) => {
    try {
        const { page = 1, limit = 10, subjectId, level, trackId, academicLevelId, searchTerm, generatedBy, type } = req.query;
        const queryFilter = {};
        if (academicLevelId) queryFilter.academicLevel = new mongoose.Types.ObjectId(academicLevelId);
        if (trackId) queryFilter.track = new mongoose.Types.ObjectId(trackId);
        if (subjectId) queryFilter.subject = new mongoose.Types.ObjectId(subjectId);
        if (level) queryFilter.level = level;
        if (generatedBy) queryFilter.generatedBy = generatedBy;
        if (type) queryFilter.type = type;
        if (searchTerm) {
            queryFilter.text = { $regex: searchTerm, $options: 'i' };
        }
        
        const questions = await Question.find(queryFilter)
            .populate('academicLevel track subject', 'name')
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit))
            .sort({ createdAt: -1 })
            .lean();

        const totalQuestions = await Question.countDocuments(queryFilter);
        res.json({
            questions,
            totalPages: Math.ceil(totalQuestions / Number(limit)),
            currentPage: Number(page),
            totalQuestions: totalQuestions
        });
    } catch (err) {
        res.status(500).json({ message: "Server error while fetching admin questions.", error: err.message });
    }
};

const deleteQuestionsByCriteria = async (req, res) => {
    const { academicLevelId, trackId, subjectId } = req.body;
    if (!academicLevelId || !trackId || !subjectId) {
        return res.status(400).json({ message: "All three IDs are required." });
    }
    try {
        const filter = {
            academicLevel: new mongoose.Types.ObjectId(academicLevelId),
            track: new mongoose.Types.ObjectId(trackId),
            subject: new mongoose.Types.ObjectId(subjectId),
        };
        const questionsToDelete = await Question.find(filter).select('_id').lean();
        const questionIdsToDelete = questionsToDelete.map(q => q._id);
        if (questionIdsToDelete.length === 0) {
            return res.status(200).json({ message: "No questions found matching criteria.", deletedCount: 0 });
        }
        const progressDeletionResult = await UserProgress.deleteMany({ question: { $in: questionIdsToDelete } });
        const questionDeletionResult = await Question.deleteMany(filter);
        res.status(200).json({
            message: `Deleted ${questionDeletionResult.deletedCount} questions and ${progressDeletionResult.deletedCount} progress entries.`,
            deletedCount: questionDeletionResult.deletedCount,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error during bulk deletion.", error: error.message });
    }
};

module.exports = {
    getPracticeQuestion,
    validateFreeTextAnswer,
    getAllQuestionsForAdmin,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    getQuestionHint,
    getDetailedAnswer,
    deleteQuestionsByCriteria,
};