// back-end/controllers/progressController.js

const mongoose = require('mongoose');
const UserProgress = require('../models/UserProgress');
const Question = require('../models/Question');
const TemporaryQuestion = require('../models/TemporaryQuestion'); // <-- **جديد:** استيراد الموديل الجديد
const AcademicLevel = require('../models/AcademicLevel');
const Track = require('../models/Track');
const Subject = require('../models/Subject');
const TimedExamAttempt = require('../models/TimedExamAttempt');

// Helper functions
const mapLevelToArabic = (levelApiValue) => {
    const mapping = { 'Facile': 'سهل', 'Moyen': 'متوسط', 'Difficile': 'صعب' };
    return mapping[levelApiValue] || levelApiValue;
};
const mapLevelToApiValue = (levelDbValue) => {
    const mapping = { 'سهل': 'Facile', 'متوسط': 'Moyen', 'صعب': 'Difficile' };
    return mapping[levelDbValue] || levelDbValue;
};

const saveMcqProgress = async (req, res) => {
    const {
        questionId,
        userAnswer,
        academicLevel: academicLevelIdString,
        track: trackIdString,
        subject: subjectIdString,
        difficulty: apiDifficultyValue
    } = req.body;

    const userId = req.user._id;

    console.log('[SAVE_MCQ_PROGRESS_START] User:', userId, 'QID:', questionId);

    if (!questionId || userAnswer === undefined || !academicLevelIdString || !trackIdString || !subjectIdString || !apiDifficultyValue) {
        return res.status(400).json({ message: 'Missing required fields.' });
    }

    const difficultyForDb = mapLevelToArabic(apiDifficultyValue);

    try {
        let isCorrect;
        let correctAnswerFromSource;
        let progressData = {
            user: userId,
            userAnswer: userAnswer.trim(),
            academicLevel: new mongoose.Types.ObjectId(academicLevelIdString),
            track: new mongoose.Types.ObjectId(trackIdString),
            subject: new mongoose.Types.ObjectId(subjectIdString),
            difficultyLevel: difficultyForDb,
            attemptedAt: new Date(),
            pointsAwarded: 0,
        };

        const isAiPracticeQuestion = typeof questionId === 'string' && questionId.startsWith('ai_practice_');

        if (isAiPracticeQuestion) {
            console.log(`[SAVE_MCQ_AI_PROGRESS_ATTEMPT] Processing AI question ID: ${questionId}`);
            
            // **تعديل:** البحث عن السؤال المؤقت في قاعدة البيانات بدلاً من الجلسة
            const tempQuestion = await TemporaryQuestion.findOne({ questionId: questionId, userId: userId });

            if (!tempQuestion) {
                console.error(`[SAVE_MCQ_AI_PROGRESS_DB_FAIL] AI Question ${questionId} not found in temporary DB for user ${userId}.`);
                return res.status(404).json({ message: 'AI question data not found or has expired. Please try a new question.' });
            }

            const aiQuestionDetails = tempQuestion.questionData;
            
            if (aiQuestionDetails.type !== 'mcq') {
                return res.status(400).json({ message: 'The identified AI question is not an MCQ.' });
            }

            correctAnswerFromSource = aiQuestionDetails.correctAnswer;
            isCorrect = correctAnswerFromSource.trim().toLowerCase() === userAnswer.trim().toLowerCase();

            progressData = {
                ...progressData,
                isAiQuestion: true,
                aiQuestionText: aiQuestionDetails.question,
                aiQuestionType: aiQuestionDetails.type,
                aiQuestionOptions: aiQuestionDetails.options,
                aiQuestionCorrectAnswer: correctAnswerFromSource,
                aiQuestionLesson: aiQuestionDetails.lesson,
                isCorrect,
            };
            
            // **جديد:** حذف السؤال المؤقت بعد استخدامه
            // await TemporaryQuestion.deleteOne({ _id: tempQuestion._id });
            console.log(`[SAVE_MCQ_AI_PROGRESS_SUCCESS] AI Q ${questionId} from temp DB. Correct: ${isCorrect}.`);

        } else if (mongoose.Types.ObjectId.isValid(questionId)) {
            const questionFromDb = await Question.findById(questionId).select('correctAnswer type').lean();
            if (!questionFromDb) return res.status(404).json({ message: 'DB Question not found.' });
            if (questionFromDb.type !== 'mcq') return res.status(400).json({ message: 'This DB question is not an MCQ.' });

            correctAnswerFromSource = questionFromDb.correctAnswer;
            isCorrect = correctAnswerFromSource.trim().toLowerCase() === userAnswer.trim().toLowerCase();
            progressData = { ...progressData, question: new mongoose.Types.ObjectId(questionId), isAiQuestion: false, isCorrect };

        } else {
            return res.status(400).json({ message: 'Invalid questionId format.' });
        }
        
        const newProgress = new UserProgress(progressData);
        await newProgress.save();
        console.log(`[SAVE_MCQ_PROGRESS_RECORD_SAVED] Progress record saved for user ${userId}, QID ${questionId}.`);

        res.status(201).json({
            isCorrect,
            correctAnswer: correctAnswerFromSource,
        });

    } catch (error) {
        console.error("[SAVE_MCQ_PROGRESS_ERROR] Error saving MCQ progress:", error.message, error.stack);
        res.status(500).json({ message: 'Server error while saving progress.', error: error.message });
    }
};

const getMyProgressSummary = async (req, res) => {
    const userId = req.user._id;
    try {
        const allUserProgressRecords = await UserProgress.find({ user: userId })
            .populate('academicLevel', 'name order')
            .populate('track', 'name')
            .populate('subject', 'name')
            .sort({ attemptedAt: -1 })
            .lean();
        
        const allExamAttempts = await TimedExamAttempt.find({ user: userId, status: { $in: ['completed', 'timed-out'] } })
            .populate('subject', 'name')
            .select('subject overallScoreOutOf20 status startTime')
            .sort({ startTime: -1 })
            .lean();

        const summary = {
            generalPracticeStats: { totalAttempted: 0, totalCorrect: 0, accuracy: 0, totalPoints: 0 },
            progressByTrack: {},
            examHistory: { totalExamsTaken: 0, averageScoreOutOf20: null, exams: [] },
            lastActivity: null
        };

        if (allUserProgressRecords.length > 0) {
            summary.lastActivity = allUserProgressRecords[0].attemptedAt;
            allUserProgressRecords.forEach(record => {
                summary.generalPracticeStats.totalAttempted++;
                if (record.isCorrect) summary.generalPracticeStats.totalCorrect++;
                const trackName = record.track?.name || 'شعبة غير محددة';
                if (!summary.progressByTrack[trackName]) {
                    summary.progressByTrack[trackName] = { totalAttempted: 0, totalCorrect: 0, subjects: {} };
                }
                summary.progressByTrack[trackName].totalAttempted++;
                if (record.isCorrect) summary.progressByTrack[trackName].totalCorrect++;
                // ... (rest of the logic)
            });
        }

        if (allExamAttempts.length > 0) {
            summary.examHistory.totalExamsTaken = allExamAttempts.length;
            let sumOfScores = 0;
            allExamAttempts.forEach(exam => {
                if (typeof exam.overallScoreOutOf20 === 'number') {
                    sumOfScores += exam.overallScoreOutOf20;
                }
                summary.examHistory.exams.push({
                    examId: exam._id,
                    subjectName: exam.subject?.name || 'مادة غير محددة',
                    scoreOutOf20: exam.overallScoreOutOf20,
                    status: exam.status,
                    startTime: exam.startTime,
                });
            });
            if (summary.examHistory.totalExamsTaken > 0) {
                summary.examHistory.averageScoreOutOf20 = sumOfScores / allExamAttempts.length;
            }
        }
        
        res.json(summary);
    } catch (error) {
        res.status(500).json({ message: "Server error fetching summary.", error: error.message });
    }
};

const getUserProgressBySubject = async (req, res) => {
    const { subjectName } = req.params;
    const userId = req.user._id;
    try {
        const subjectDoc = await Subject.findOne({ name: subjectName }).lean();
        if (!subjectDoc) return res.status(404).json({ message: 'Subject not found' });
        
        const progressRecords = await UserProgress.find({ user: userId, subject: subjectDoc._id }).populate('question', 'text level type').lean();
        const totalQuestionsInDbForThisSubject = await Question.countDocuments({ subject: subjectDoc._id });
        
        res.json({
            subjectName: subjectDoc.name,
            totalQuestionsInDbForSubject,
            questionsAnsweredByMe: progressRecords.length,
            myCorrectAnswers: progressRecords.filter(p => p.isCorrect).length,
            progressDetails: progressRecords,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching subject progress.', error: error.message });
    }
};

module.exports = {
    saveMcqProgress,
    getUserProgressBySubject,
    getMyProgressSummary
};