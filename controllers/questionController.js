// back-end/controllers/questionController.js

const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const Question = require('../models/Question');
const Subject = require('../models/Subject');
const Track = require('../models/Track');
const AcademicLevel = require('../models/AcademicLevel');
const UserProgress = require('../models/UserProgress');
const TemporaryQuestion = require('../models/TemporaryQuestion');

const {
    generateAIQuestion,
    validateFreeTextAnswerWithAI,
    generateHintWithAI,
    generateDetailedAnswerWithAI
} = require('../utils/aiGeneralQuestionGenerator.js');

const { normalizeForPath } = require('../utils/aiGeneralQuestionGeneratorShared'); // <--- *** تم إضافة هذا السطر ***

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
    const { levelId: academicLevelId, trackId, subjectId, difficulty: difficultyApiValue } = req.query;

    if (!academicLevelId || !trackId || !subjectId || !difficultyApiValue) {
        return res.status(400).json({ message: "Academic level, track, subject, and difficulty are required." });
    }
    
    const levelForDbLookup = mapLevelToArabic(difficultyApiValue);

    try {
        const [academicLevelDoc, trackDoc, subjectDocForPromptName] = await Promise.all([
            AcademicLevel.findById(academicLevelId).select('name').lean(),
            Track.findById(trackId).select('name').lean(),
            Subject.findById(subjectId).select('name language').lean() // جلب اللغة أيضًا
        ]);

        if (!academicLevelDoc || !trackDoc || !subjectDocForPromptName) {
            console.error(`[GET_PRACTICE_QUESTION_ERROR] Could not find academic entities. Level: ${academicLevelId}, Track: ${trackId}, Subject: ${subjectId}`);
            return res.status(404).json({ message: "One or more academic entities not found." });
        }

        const subjectFileNameForPrompts = subjectDocForPromptName.name;
        const subjectLanguage = subjectDocForPromptName.language || 
                                (normalizeForPath(subjectDocForPromptName.name).includes('arab') || normalizeForPath(subjectDocForPromptName.name).includes('islamic') ? 'ar' : 
                                 normalizeForPath(subjectDocForPromptName.name).includes('engli') ? 'en' : 'fr');


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

        const probabilityToUseAi = 0.000001;
        const shouldUseAi = Math.random() < probabilityToUseAi || !availableDbQuestionDoc;


        if (!shouldUseAi && availableDbQuestionDoc) {
            const populatedQuestion = await Question.findById(availableDbQuestionDoc._id)
                .populate('subject', 'name language') // Populate language here too
                .populate('academicLevel', 'name')
                .populate('track', 'name')
                .lean();
            if (!populatedQuestion) {
                 console.error(`[GET_PRACTICE_QUESTION_ERROR] Failed to populate DB question ${availableDbQuestionDoc._id}`);
                 throw new Error("Failed to retrieve details for the selected DB question.");
            }
            
            return res.json({
                _id: populatedQuestion._id.toString(),
                question: populatedQuestion.text,
                type: populatedQuestion.type,
                options: populatedQuestion.options,
                subject: populatedQuestion.subject.name,
                level: mapLevelToApiValue(populatedQuestion.level),
                generatedBy: 'db',
                lesson: populatedQuestion.lesson,
                language: populatedQuestion.subject.language || subjectLanguage // Pass language
            });
        } else {
            // console.log(`[DECISION_RESULT_AI_PRACTICE] ${shouldUseAi ? 'Randomly chose AI' : 'No DB question available or AI preferred'}.`);
            const aiGeneratedData = await generateAIQuestion(
                academicLevelDoc.name,
                trackDoc.name,
                subjectDocForPromptName.name,
                difficultyApiValue,
                subjectFileNameForPrompts
                // subjectLanguage will be determined inside generateAIQuestion or passed if needed
            );

            if (!aiGeneratedData || !aiGeneratedData.question) {
                console.error("[GET_PRACTICE_QUESTION_ERROR] AI generation returned invalid data or null.");
                throw new Error("AI generation returned invalid data.");
            }

            const tempAiQuestionId = `ai_practice_${uuidv4()}`;
            await TemporaryQuestion.create({
                questionId: tempAiQuestionId,
                userId: userId,
                questionData: {
                    ...aiGeneratedData,
                    subjectName: subjectDocForPromptName.name,
                    trackName: trackDoc.name,
                    academicLevelName: academicLevelDoc.name,
                    apiDifficulty: difficultyApiValue,
                    language: aiGeneratedData.language || subjectLanguage // Store determined language
                }
            });

            const responseToFrontend = {
                _id: tempAiQuestionId,
                question: aiGeneratedData.question,
                type: aiGeneratedData.type,
                options: aiGeneratedData.options,
                subject: subjectDocForPromptName.name,
                level: difficultyApiValue,
                generatedBy: 'ai',
                lesson: aiGeneratedData.lesson,
                language: aiGeneratedData.language || subjectLanguage // Pass language
            };
            return res.json(responseToFrontend);
        }
    } catch (error) {
        console.error('[GET_PRACTICE_QUESTION_FATAL_ERROR] Error:', error.message, error.stack ? error.stack.substring(0,500) : '');
        const userErrorMessage = error.message.includes("AI Service Error") || error.message.includes("AI generation returned invalid data") || error.message.includes("AI prompt blocked")
            ? `An error occurred with the AI question generation service. Please try again later. (${error.message.substring(0, 100)})`
            : 'Internal Server Error while fetching question.';
        return res.status(500).json({ message: userErrorMessage, errorDetails: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
};

const getQuestionHint = async (req, res) => {
    const { questionId } = req.params;
    const userId = req.user.id || req.user._id;

    try {
        let questionTextForHint, subjectNameForHint, languageForHint = "ar";

        if (questionId.startsWith('ai_practice_')) {
            const tempQ = await TemporaryQuestion.findOne({ questionId, userId });
            if (tempQ && tempQ.questionData) {
                questionTextForHint = tempQ.questionData.question;
                subjectNameForHint = tempQ.questionData.subjectName;
                languageForHint = tempQ.questionData.language || // Use stored language
                                  (normalizeForPath(subjectNameForHint || "").includes("frensh") || normalizeForPath(subjectNameForHint || "").includes("physique") || normalizeForPath(subjectNameForHint || "").includes("math") || normalizeForPath(subjectNameForHint || "").includes("svt") ? "fr" :
                                  normalizeForPath(subjectNameForHint || "").includes("engli") ? "en" : "ar");
            } else {
                console.error(`[GET_HINT_AI_NOT_FOUND_IN_DB] Data for AI question ${questionId} not found in temporary DB for user ${userId}.`);
                return res.status(404).json({ message: "AI Question data for hint not found or has expired." });
            }
        } else if (mongoose.Types.ObjectId.isValid(questionId)) {
            const dbQ = await Question.findById(questionId).populate('subject', 'name language').lean(); // Populate language
            if (!dbQ) return res.status(404).json({ message: "DB Question not found." });
            questionTextForHint = dbQ.text;
            subjectNameForHint = dbQ.subject.name;
            languageForHint = dbQ.subject.language || // Use language from subject
                              (normalizeForPath(subjectNameForHint || "").includes("frensh") || normalizeForPath(subjectNameForHint || "").includes("physique") || normalizeForPath(subjectNameForHint || "").includes("math") || normalizeForPath(subjectNameForHint || "").includes("svt") ? "fr" :
                              normalizeForPath(subjectNameForHint || "").includes("engli") ? "en" : "ar");
        } else {
            return res.status(400).json({ message: "Invalid question identifier." });
        }
        // console.log(`[GET_HINT] QID: ${questionId}, Lang for hint: ${languageForHint}, Subject: ${subjectNameForHint}`);
        const hint = await generateHintWithAI(questionTextForHint, subjectNameForHint, languageForHint);
        res.json({ hint });
    } catch (error) {
        console.error(`[GET_HINT_ERROR] QID ${questionId}:`, error.message, error.stack ? error.stack.substring(0,500) : '');
        const userErrorMessage = error.message.includes("AI Service")
            ? `An error occurred with the AI hint generation service. Please try again later. (${error.message.substring(0, 100)})`
            : 'Error generating hint.';
        res.status(500).json({ message: userErrorMessage, errorDetails: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
};

const getDetailedAnswer = async (req, res) => {
    const { questionId } = req.params;
    const { userAnswerText } = req.query;
    const userId = req.user.id || req.user._id;

    try {
        let qDetails, subjectName, academicLevelName, trackName, displayLevel, correctAnswerFromSource, languageForExplanation = "ar";

        if (questionId.startsWith('ai_practice_')) {
            const tempQ = await TemporaryQuestion.findOne({ questionId: questionId, userId: userId });
            if (tempQ && tempQ.questionData) {
                const data = tempQ.questionData;
                qDetails = { question: data.question, type: data.type, options: data.options, correctAnswer: data.correctAnswer, lesson: data.lesson };
                subjectName = data.subjectName;
                academicLevelName = data.academicLevelName || "N/A";
                trackName = data.trackName || "N/A";
                displayLevel = data.apiDifficulty;
                correctAnswerFromSource = data.correctAnswer;
                languageForExplanation = data.language || // Use stored language
                                         (normalizeForPath(subjectName || "").includes("frensh") || normalizeForPath(subjectName || "").includes("physique") || normalizeForPath(subjectName || "").includes("math") || normalizeForPath(subjectName || "").includes("svt") ? "fr" :
                                         normalizeForPath(subjectName || "").includes("engli") ? "en" : "ar");
            } else {
                console.error(`[GET_DETAILED_ANSWER_AI_NOT_FOUND] AI Question data for ${questionId} (user ${userId}) not found or expired.`);
                return res.status(404).json({ message: "AI Question data for detailed answer not found or has expired." });
            }
        } else if (mongoose.Types.ObjectId.isValid(questionId)) {
            const dbQ = await Question.findById(questionId).populate('academicLevel track subject', 'name language').lean(); // Populate language
            if (!dbQ) return res.status(404).json({ message: "DB Question not found." });
            qDetails = { question: dbQ.text, type: dbQ.type, options: dbQ.options, correctAnswer: dbQ.correctAnswer, lesson: dbQ.lesson };
            subjectName = dbQ.subject.name;
            academicLevelName = dbQ.academicLevel?.name || "N/A";
            trackName = dbQ.track?.name || "N/A";
            displayLevel = mapLevelToApiValue(dbQ.level);
            correctAnswerFromSource = dbQ.correctAnswer;
            languageForExplanation = dbQ.subject.language || // Use language from subject
                                     (normalizeForPath(subjectName || "").includes("frensh") || normalizeForPath(subjectName || "").includes("physique") || normalizeForPath(subjectName || "").includes("math") || normalizeForPath(subjectName || "").includes("svt") ? "fr" :
                                     normalizeForPath(subjectName || "").includes("engli") ? "en" : "ar");
        } else {
            return res.status(400).json({ message: "Invalid question identifier." });
        }
        // console.log(`[GET_DETAILED_ANSWER] QID: ${questionId}, Lang for explanation: ${languageForExplanation}, Subject: ${subjectName}`);
        const detailedExplanation = await generateDetailedAnswerWithAI(
            qDetails.question,
            qDetails.type,
            subjectName,
            languageForExplanation,
            correctAnswerFromSource,
            userAnswerText
        );
        res.json({
            _id: questionId,
            question: qDetails.question, type: qDetails.type, options: qDetails.options,
            subject: subjectName, level: displayLevel, track: trackName, academicLevel: academicLevelName,
            lesson: qDetails.lesson,
            detailedExplanation,
            userProvidedAnswer: userAnswerText || null,
            language: languageForExplanation
        });
    } catch (error) {
        console.error(`[GET_DETAILED_ANSWER_ERROR] QID ${questionId}:`, error.message, error.stack ? error.stack.substring(0,500) : '');
        const userErrorMessage = error.message.includes("AI Service")
            ? `An error occurred with the AI detailed answer generation service. Please try again later. (${error.message.substring(0, 100)})`
            : 'Error generating detailed answer.';
        res.status(500).json({ message: userErrorMessage, errorDetails: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
};

const validateFreeTextAnswer = async (req, res) => {
    const { questionId, userAnswerText } = req.body;
    const userId = req.user.id || req.user._id;

    if (!questionId || userAnswerText === undefined || userAnswerText === null) {
        return res.status(400).json({ message: "Question ID and user answer are required." });
    }

    try {
        let questionText, subjectNameForAI, questionType, languageForValidation = "ar";
        let progressDataPayload = {};

        if (questionId.startsWith('ai_practice_')) {
            const tempQ = await TemporaryQuestion.findOne({ questionId: questionId, userId: userId });
            if (!tempQ || !tempQ.questionData) {
                return res.status(404).json({ message: "AI Question data for validation not found or has expired." });
            }
            
            const qData = tempQ.questionData;
            if (qData.type !== 'free_text') {
                return res.status(400).json({ message: 'This question is not a free-text question.' });
            }
            
            questionText = qData.question;
            subjectNameForAI = qData.subjectName;
            questionType = qData.type;
            languageForValidation = qData.language || // Use stored language
                                    (normalizeForPath(subjectNameForAI || "").includes("frensh") || normalizeForPath(subjectNameForAI || "").includes("physique") || normalizeForPath(subjectNameForAI || "").includes("math") || normalizeForPath(subjectNameForAI || "").includes("svt") ? "fr" :
                                     normalizeForPath(subjectNameForAI || "").includes("engli") ? "en" : "ar");
            
            const [levelModel, trackModel, subjectModel] = await Promise.all([
                AcademicLevel.findOne({ name: qData.academicLevelName }).select('_id').lean(),
                Track.findOne({ name: qData.trackName }).select('_id').lean(),
                Subject.findOne({ name: qData.subjectName }).select('_id').lean()
            ]);

            progressDataPayload = {
                isAiQuestion: true,
                aiQuestionText: qData.question,
                aiQuestionType: qData.type,
                aiQuestionCorrectAnswer: qData.correctAnswer,
                aiQuestionLesson: qData.lesson,
                academicLevel: levelModel?._id,
                track: trackModel?._id,
                subject: subjectModel?._id,
                difficultyLevel: mapLevelToArabic(qData.apiDifficulty),
            };

        } else if (mongoose.Types.ObjectId.isValid(questionId)) {
            const dbQ = await Question.findById(questionId).populate('subject', 'name language academicLevel track').lean();
            if (!dbQ || dbQ.type !== 'free_text' || !dbQ.subject?.name) {
                return res.status(404).json({ message: "DB free_text Question or subject not found." });
            }
            questionText = dbQ.text;
            subjectNameForAI = dbQ.subject.name;
            questionType = dbQ.type;
            languageForValidation = dbQ.subject.language || // Use language from subject
                                    (normalizeForPath(subjectNameForAI || "").includes("frensh") || normalizeForPath(subjectNameForAI || "").includes("physique") || normalizeForPath(subjectNameForAI || "").includes("math") || normalizeForPath(subjectNameForAI || "").includes("svt") ? "fr" :
                                     normalizeForPath(subjectNameForAI || "").includes("engli") ? "en" : "ar");

            progressDataPayload = {
                question: dbQ._id,
                isAiQuestion: false,
                academicLevel: dbQ.academicLevel?._id,
                track: dbQ.track?._id,
                subject: dbQ.subject._id,
                difficultyLevel: dbQ.level,
            };
        } else {
            return res.status(400).json({ message: "Invalid question identifier for validation." });
        }
        // console.log(`[VALIDATE_FREETEXT] QID: ${questionId}, Lang for validation: ${languageForValidation}, Subject: ${subjectNameForAI}`);
        const aiValidationResult = await validateFreeTextAnswerWithAI(questionText, userAnswerText, subjectNameForAI, languageForValidation);

        if (progressDataPayload.academicLevel && progressDataPayload.track && progressDataPayload.subject) {
            const finalProgressEntry = {
                user: userId,
                userAnswer: userAnswerText,
                isCorrect: aiValidationResult.isValid,
                attemptedAt: new Date(),
                ...progressDataPayload
            };
            await UserProgress.create(finalProgressEntry);
        } else {
            console.warn(`[VALIDATE_FREETEXT_PROGRESS_WARN] Could not save progress for QID ${questionId} due to missing academic context in payload.`);
        }
        
        res.json({
            isCorrect: aiValidationResult.isValid,
            feedback: aiValidationResult.feedback,
            questionId: questionId,
        });
    } catch (error) {
        console.error(`[VALIDATE_FREETEXT_ERROR] QID ${questionId || 'unknown'}:`, error.message, error.stack ? error.stack.substring(0,500) : '');
        const userErrorMessage = error.message.includes("AI Service")
            ? `An error occurred with the AI validation service. Please try again later. (${error.message.substring(0, 100)})`
            : 'Error validating answer.';
        res.status(500).json({ message: userErrorMessage, errorDetails: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
};

// --- Admin Routes ---
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
        console.error("Error creating question:", error);
        res.status(500).json({ message: 'Error creating question', error: error.message, stack: process.env.NODE_ENV === 'development' ? error.stack : undefined });
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
         console.error("Error updating question:", error);
         res.status(500).json({ message: 'Error updating question', error: error.message, stack: process.env.NODE_ENV === 'development' ? error.stack : undefined });
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
        console.error("Error deleting question:", err);
        res.status(500).json({message: "Server error while deleting question", error: err.message, stack: process.env.NODE_ENV === 'development' ? err.stack : undefined});
    }
};

const getAllQuestionsForAdmin = async (req, res) => {
    try {
        const { page = 1, limit = 10, subjectId, level, trackId, academicLevelId, searchTerm, generatedBy, type } = req.query;
        const queryFilter = {};
        if (academicLevelId) queryFilter.academicLevel = new mongoose.Types.ObjectId(academicLevelId);
        if (trackId) queryFilter.track = new mongoose.Types.ObjectId(trackId);
        if (subjectId) queryFilter.subject = new mongoose.Types.ObjectId(subjectId);
        if (level && ['سهل', 'متوسط', 'صعب'].includes(level) ) queryFilter.level = level;
        if (generatedBy) queryFilter.generatedBy = generatedBy;
        if (type) queryFilter.type = type;
        if (searchTerm) { queryFilter.text = { $regex: searchTerm, $options: 'i' }; }

        const questions = await Question.find(queryFilter)
            .populate('academicLevel', 'name')
            .populate('track', 'name')
            .populate('subject', 'name')
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit))
            .sort({ createdAt: -1 })
            .lean();
        
        const totalQuestions = await Question.countDocuments(queryFilter);

        res.status(200).json({ 
            questions, 
            totalPages: Math.ceil(totalQuestions / Number(limit)),
            currentPage: Number(page),
            totalQuestions
        });

    } catch (err) {
        console.error("--- [ADMIN_GET_ALL_QUESTIONS_ERROR] ---", err.message);
        console.error("Stack Trace:", err.stack);
        res.status(500).json({ message: 'Server error while finding questions.', error: err.message });
    }
};

const deleteQuestionsByCriteria = async (req, res) => {
    const { academicLevelId, trackId, subjectId } = req.body;
    if (!academicLevelId || !trackId || !subjectId) {
        return res.status(400).json({ message: "All three IDs (academicLevelId, trackId, subjectId) are required." });
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
            return res.status(200).json({ message: "No questions found matching criteria to delete.", deletedCount: 0 });
        }

        const progressDeletionResult = await UserProgress.deleteMany({ question: { $in: questionIdsToDelete } });
        const questionDeletionResult = await Question.deleteMany(filter);

        res.status(200).json({
            message: `Successfully deleted ${questionDeletionResult.deletedCount} questions and ${progressDeletionResult.deletedCount} associated progress entries.`,
            deletedQuestionsCount: questionDeletionResult.deletedCount,
            deletedProgressEntriesCount: progressDeletionResult.deletedCount,
        });
    } catch (error) {
        console.error("Error deleting questions by criteria:", error);
        res.status(500).json({ message: "Server error during bulk deletion of questions.", error: error.message, stack: process.env.NODE_ENV === 'development' ? error.stack : undefined });
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