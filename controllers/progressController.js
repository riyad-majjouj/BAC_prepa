// back-end/controllers/progressController.js
const UserProgress = require('../models/UserProgress');
const Question = require('../models/Question');
const mongoose = require('mongoose');
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

    if (!req.user || !req.user._id) {
        console.error("[SAVE_MCQ_PROGRESS_AUTH_FAIL] User not authenticated or ID missing.");
        return res.status(401).json({ message: "User not authenticated." });
    }
    const userId = req.user._id;

    console.log('[SAVE_MCQ_PROGRESS_START] User:', userId, 'QID:', questionId, 'Body:', req.body);

    if (!questionId || userAnswer === undefined || userAnswer === null ||
        !academicLevelIdString || !trackIdString || !subjectIdString || !apiDifficultyValue) {
        console.error("[SAVE_MCQ_PROGRESS_VALIDATION_FAIL] Missing required fields. Received:", req.body);
        return res.status(400).json({ message: 'Question ID, user answer, academicLevel, track, subject, and difficulty are all required.' });
    }

    const contextIdsToValidate = { academicLevel: academicLevelIdString, track: trackIdString, subject: subjectIdString };
    for (const key in contextIdsToValidate) {
        if (!mongoose.Types.ObjectId.isValid(contextIdsToValidate[key])) {
            console.error(`[SAVE_MCQ_PROGRESS_VALIDATION_FAIL] Invalid ObjectId format for context ${key}: ${contextIdsToValidate[key]}`);
            return res.status(400).json({ message: `Invalid ID format for ${key}.` });
        }
    }

    const difficultyForDb = mapLevelToArabic(apiDifficultyValue);
    if (!['سهل', 'متوسط', 'صعب'].includes(difficultyForDb)) {
        console.error("[SAVE_MCQ_PROGRESS_VALIDATION_FAIL] Invalid difficulty value provided:", apiDifficultyValue);
        return res.status(400).json({ message: `Invalid difficulty value '${apiDifficultyValue}'. Expected 'Facile', 'Moyen', or 'Difficile'.` });
    }

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
             console.log('[DEBUG_PROGRESS_CONTROLLER_START] Full session content at start of saveMcqProgress:', JSON.stringify(req.session, null, 2));
            console.log(`[DEBUG_PROGRESS_CONTROLLER] Attempting to find question ID "${questionId}" in req.session.tempAiPracticeQuestions.`);
             if (!req.session || !req.session.tempAiPracticeQuestions || !req.session.tempAiPracticeQuestions[questionId]) {
                console.error(`[SAVE_MCQ_AI_PROGRESS_SESSION_FAIL] AI Question ${questionId} not found in session.`);
                if (req.session && req.session.tempAiPracticeQuestions) {
                     // هذا سيطبع المفاتيح الموجودة إذا كان الكائن موجوداً ولكنه لا يحتوي على ID السؤال الحالي
                     console.error(`[DEBUG_PROGRESS_CONTROLLER] Keys found in tempAiPracticeQuestions: ${Object.keys(req.session.tempAiPracticeQuestions).join(', ')}`);
                } else {
                    console.error('[DEBUG_PROGRESS_CONTROLLER] req.session.tempAiPracticeQuestions is null or undefined.');
                }
                return res.status(404).json({ message: 'AI question details not found in session. Cannot verify answer.' });
            }
            const aiQuestionDetails = req.session.tempAiPracticeQuestions[questionId];

            if (aiQuestionDetails.type !== 'mcq') {
                console.error(`[SAVE_MCQ_AI_PROGRESS_TYPE_ERROR] AI Question ${questionId} in session is not an MCQ. Type: ${aiQuestionDetails.type}`);
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
            console.log(`[SAVE_MCQ_AI_PROGRESS_SESSION_SUCCESS] AI Q ${questionId} from session. Correct: ${isCorrect}. Correct Answer: ${correctAnswerFromSource}`);
        } else if (mongoose.Types.ObjectId.isValid(questionId)) {
            console.log(`[SAVE_MCQ_DB_PROGRESS_ATTEMPT] Processing DB question ID: ${questionId}`);
            const questionFromDb = await Question.findById(questionId)
                .select('correctAnswer type academicLevel track subject level')
                .lean();

            if (!questionFromDb) {
                console.error(`[SAVE_MCQ_DB_PROGRESS_NOT_FOUND] DB Question with ID ${questionId} not found.`);
                return res.status(404).json({ message: 'DB Question not found.' });
            }
            if (questionFromDb.type !== 'mcq') {
                console.error(`[SAVE_MCQ_DB_PROGRESS_TYPE_ERROR] DB Question ${questionId} is not an MCQ. Type: ${questionFromDb.type}`);
                return res.status(400).json({ message: 'This DB question is not an MCQ.' });
            }

            if (questionFromDb.academicLevel.toString() !== academicLevelIdString ||
                questionFromDb.track.toString() !== trackIdString ||
                questionFromDb.subject.toString() !== subjectIdString ||
                questionFromDb.level !== difficultyForDb) {
                console.error(`[SAVE_MCQ_DB_PROGRESS_CONTEXT_MISMATCH] Context mismatch for DB question ${questionId}.`);
                return res.status(400).json({ message: 'DB Question context does not match submitted context.' });
            }

            correctAnswerFromSource = questionFromDb.correctAnswer;
            isCorrect = correctAnswerFromSource.trim().toLowerCase() === userAnswer.trim().toLowerCase();

            progressData = {
                ...progressData,
                question: new mongoose.Types.ObjectId(questionId),
                isAiQuestion: false,
                isCorrect,
            };
            console.log(`[SAVE_MCQ_DB_PROGRESS_SUCCESS] DB Q ${questionId}. Correct: ${isCorrect}. Correct Answer: ${correctAnswerFromSource}`);
        } else {
            console.error(`[SAVE_MCQ_PROGRESS_INVALID_QID] Invalid questionId format: ${questionId}`);
            return res.status(400).json({ message: 'Invalid questionId format. Must be ObjectId or ai_practice_UUID.' });
        }

        if (!progressData.isAiQuestion && progressData.question) {
            const existingProgress = await UserProgress.findOne({ user: userId, question: progressData.question });
            if (existingProgress) {
                console.warn(`[SAVE_MCQ_PROGRESS_ALREADY_ANSWERED_DB] User ${userId} already answered DB Q ${questionId}.`);
                return res.status(200).json({
                    message: 'Question already answered by this user.',
                    isCorrect: existingProgress.isCorrect,
                    correctAnswer: correctAnswerFromSource,
                    userAnswer: existingProgress.userAnswer
                });
            }
        }
        
        const newProgress = new UserProgress(progressData);
        await newProgress.save();
        console.log(`[SAVE_MCQ_PROGRESS_RECORD_SAVED] Progress record saved for user ${userId}, QID ${questionId}. DB ID: ${newProgress._id}`);

        res.status(201).json({
            isCorrect,
            correctAnswer: correctAnswerFromSource,
        });

    } catch (error) {
        console.error("[SAVE_MCQ_PROGRESS_ERROR] Error saving MCQ progress:", error.message, error.stack);
        if (error.name === 'ValidationError' || error.name === 'CastError') {
            return res.status(400).json({ message: `Validation/Cast Error: ${error.message}` });
        }
        if (error.code === 11000) {
            console.warn(`[SAVE_MCQ_PROGRESS_DUPLICATE_KEY_ERROR_FINAL] User ${userId}, QID ${questionId}. Error: ${error.message}`);
            let existingData = { message: 'This specific question attempt might already be recorded (duplicate key).' };
            if (correctAnswerFromSource !== undefined && typeof isCorrect === 'boolean') {
                existingData.correctAnswer = correctAnswerFromSource;
                existingData.isCorrect = isCorrect;
            }
             return res.status(409).json(existingData);
        }
        res.status(500).json({ message: 'Server error while saving progress.', error: error.message });
    }
};

const getMyProgressSummary = async (req, res) => {
    if (!req.user || !req.user._id) {
        console.error("[GET_MY_SUMMARY_AUTH_FAIL] User not authenticated.");
        return res.status(401).json({ message: "User not authenticated." });
    }
    const userId = req.user._id;
    console.log(`[GET_MY_SUMMARY_START] Fetching progress summary for user: ${userId}`);

    try {
        console.log(`[GET_MY_SUMMARY_DEBUG] About to query UserProgress for user: ${userId}`);
        const allUserProgressRecords = await UserProgress.find({ user: new mongoose.Types.ObjectId(userId) }) // تأكد من استخدام ObjectId هنا
            .populate('academicLevel', 'name order')
            .populate('track', 'name') // هذا هو المكان المحتمل للمشكلة إذا كانت record.track غير موجودة أحيانًا
            .populate('subject', 'name')
            .sort({ attemptedAt: -1 })
            .lean();
        console.log(`[GET_MY_SUMMARY_DEBUG] Found ${allUserProgressRecords.length} UserProgress records.`);

        console.log(`[GET_MY_SUMMARY_DEBUG] About to query TimedExamAttempt for user: ${userId}`);
        const allExamAttempts = await TimedExamAttempt.find({ user: new mongoose.Types.ObjectId(userId), status: { $in: ['completed', 'timed-out', 'grading-failed'] } }) // تأكد من استخدام ObjectId هنا
            .populate('subject', 'name')
            .select('subject overallRawScore overallTotalPossibleRawScore overallScoreOutOf20 status startTime endTime')
            .sort({ startTime: -1 })
            .lean();
        console.log(`[GET_MY_SUMMARY_DEBUG] Found ${allExamAttempts.length} TimedExamAttempt records.`);

        const summary = {
            generalPracticeStats: { totalAttempted: 0, totalCorrect: 0, accuracy: 0, totalPoints: 0 },
            progressByTrack: {},
            examHistory: {
                totalExamsTaken: 0,
                averageScoreOutOf20: null,
                exams: []
            },
            lastActivity: null
        };

        if (allUserProgressRecords.length > 0) {
            summary.lastActivity = allUserProgressRecords[0].attemptedAt;

            allUserProgressRecords.forEach(record => {
                // ***** DEBUGGING POINT *****
                // console.log(`[GET_MY_SUMMARY_DEBUG_RECORD] Processing UserProgress record: track=${record.track}, subject=${record.subject}, academicLevel=${record.academicLevel}`);
                // if (!record.track || !record.track.name) {
                //     console.warn(`[GET_MY_SUMMARY_WARN_MISSING_TRACK_NAME] UserProgress record ID ${record._id} has missing track or track.name.`);
                // }
                // if (!record.subject || !record.subject.name) {
                //      console.warn(`[GET_MY_SUMMARY_WARN_MISSING_SUBJECT_NAME] UserProgress record ID ${record._id} has missing subject or subject.name.`);
                // }
                // ***** END DEBUGGING POINT *****


                summary.generalPracticeStats.totalAttempted++;
                summary.generalPracticeStats.totalPoints += (record.pointsAwarded || (record.isCorrect ? 1 : 0));
                if (record.isCorrect) summary.generalPracticeStats.totalCorrect++;

                // استخدام record.track (الذي هو ObjectId) كمرجع، ولكن اسم الشعبة (record.track.name) كـ مفتاح
                const trackName = record.track?.name || 'شعبة غير محددة';
                const subjectName = record.subject?.name || 'مادة غير معروفة';
                const difficultyLevel = record.difficultyLevel || 'صعوبة غير معروفة';

                if (!summary.progressByTrack[trackName]) {
                    summary.progressByTrack[trackName] = {
                        totalAttempted: 0,
                        totalCorrect: 0,
                        accuracy: 0,
                        totalPoints: 0,
                        subjects: {}
                    };
                }
                const trackSummary = summary.progressByTrack[trackName];
                trackSummary.totalAttempted++;
                trackSummary.totalPoints += (record.pointsAwarded || (record.isCorrect ? 1 : 0));
                if (record.isCorrect) trackSummary.totalCorrect++;

                if (!trackSummary.subjects[subjectName]) {
                    trackSummary.subjects[subjectName] = {
                        attempted: 0,
                        correct: 0,
                        accuracy: 0,
                        totalPoints: 0,
                        byLevel: {}
                    };
                }
                const subjectSummary = trackSummary.subjects[subjectName];
                subjectSummary.attempted++;
                subjectSummary.totalPoints += (record.pointsAwarded || (record.isCorrect ? 1 : 0));
                if (record.isCorrect) subjectSummary.correct++;

                if (!subjectSummary.byLevel[difficultyLevel]) {
                    subjectSummary.byLevel[difficultyLevel] = {
                        attempted: 0,
                        correct: 0,
                        accuracy: 0,
                        totalPoints: 0,
                    };
                }
                const levelSummary = subjectSummary.byLevel[difficultyLevel];
                levelSummary.attempted++;
                levelSummary.totalPoints += (record.pointsAwarded || (record.isCorrect ? 1 : 0));
                if (record.isCorrect) levelSummary.correct++;
            });

            summary.generalPracticeStats.accuracy = summary.generalPracticeStats.totalAttempted > 0 ? Math.round((summary.generalPracticeStats.totalCorrect / summary.generalPracticeStats.totalAttempted) * 100) : 0;
            for (const trackKey in summary.progressByTrack) {
                const trackData = summary.progressByTrack[trackKey];
                trackData.accuracy = trackData.totalAttempted > 0 ? Math.round((trackData.totalCorrect / trackData.totalAttempted) * 100) : 0;
                for (const subjectKey in trackData.subjects) {
                    const subjectData = trackData.subjects[subjectKey];
                    subjectData.accuracy = subjectData.attempted > 0 ? Math.round((subjectData.correct / subjectData.attempted) * 100) : 0;
                    for (const levelKey in subjectData.byLevel) {
                        const levelData = subjectData.byLevel[levelKey];
                        levelData.accuracy = levelData.attempted > 0 ? Math.round((levelData.correct / levelData.attempted) * 100) : 0;
                    }
                }
            }
        }

        if (allExamAttempts.length > 0) {
            summary.examHistory.totalExamsTaken = allExamAttempts.length;
            let sumOfScoresOutOf20 = 0;
            let validExamsForAverage = 0;

            allExamAttempts.forEach(exam => {
                summary.examHistory.exams.push({
                    examId: exam._id.toString(),
                    subjectName: exam.subject?.name || 'مادة غير محددة',
                    overallScore: exam.overallRawScore,
                    totalPossibleScore: exam.overallTotalPossibleRawScore,
                    scoreOutOf20: exam.overallScoreOutOf20,
                    status: exam.status,
                    startTime: exam.startTime.toISOString(),
                    endTime: exam.endTime ? exam.endTime.toISOString() : undefined,
                });
                if (typeof exam.overallScoreOutOf20 === 'number') {
                    sumOfScoresOutOf20 += exam.overallScoreOutOf20;
                    validExamsForAverage++;
                }
                if (!summary.lastActivity || new Date(exam.startTime) > new Date(summary.lastActivity)) {
                    summary.lastActivity = exam.startTime.toISOString();
                }
            });

            if (validExamsForAverage > 0) {
                summary.examHistory.averageScoreOutOf20 = Math.round((sumOfScoresOutOf20 / validExamsForAverage) * 100) / 100;
            }
        }
        
        if (allUserProgressRecords.length === 0 && allExamAttempts.length === 0) {
             console.log(`[GET_MY_SUMMARY_NO_RECORDS_FINAL] No progress or exam records for user ${userId}.`);
             return res.json({
                message: "No progress or exam records found yet.",
                generalPracticeStats: { totalAttempted: 0, totalCorrect: 0, accuracy: 0, totalPoints: 0 },
                progressByTrack: {},
                examHistory: { totalExamsTaken: 0, averageScoreOutOf20: null, exams: [] },
                lastActivity: null
            });
        }

        console.log(`[GET_MY_SUMMARY_SUCCESS] Combined summary generated for user ${userId}.`);
        res.json(summary);
    } catch (error) {
        console.error("[GET_MY_SUMMARY_ERROR] Error fetching combined progress summary:", error.message, error.stack);
        // التحقق من نوع الخطأ هنا
        if (error.name === 'CastError' && error.path === '_id' && error.model && error.model.modelName) {
             console.error(`[GET_MY_SUMMARY_CAST_ERROR_DETAIL] CastError for model '${error.model.modelName}', path '${error.path}', value '${error.value}'`);
        }
        res.status(500).json({ message: "Server error fetching combined progress summary.", error: error.message });
    }
};

const getUserProgressBySubject = async (req, res) => {
    const { subjectName } = req.params;
    if (!req.user || !req.user._id) {
        return res.status(401).json({ message: "User not authenticated." });
    }
    const userId = req.user._id;
    console.log(`[GET_USER_PROGRESS_BY_SUBJECT] User: ${userId}, SubjectName: ${subjectName}`);

    try {
        const subjectDoc = await Subject.findOne({ name: subjectName }).lean();
        if (!subjectDoc) {
            console.warn(`[GET_USER_PROGRESS_BY_SUBJECT] Subject with name "${subjectName}" not found.`);
            return res.status(404).json({ message: 'Subject not found' });
        }

        const progressRecords = await UserProgress.find({
            user: new mongoose.Types.ObjectId(userId), // تأكد من استخدام ObjectId
            subject: subjectDoc._id
        })
        .populate({
            path: 'question',
            select: 'text level type lesson'
        })
        .populate('academicLevel', 'name')
        .populate('track', 'name')
        .sort({ attemptedAt: -1 })
        .lean();

        const enhancedProgressRecords = progressRecords.map(p => {
            let questionDetails = {};
            const difficultyDbValue = p.isAiQuestion ? p.difficultyLevel : p.question?.level;

            if (p.isAiQuestion) {
                questionDetails = {
                    text: p.aiQuestionText,
                    type: p.aiQuestionType,
                    lesson: p.aiQuestionLesson,
                    level: mapLevelToApiValue(difficultyDbValue),
                    options: p.aiQuestionOptions,
                    correctAnswer: p.aiQuestionCorrectAnswer
                };
            } else if (p.question) {
                questionDetails = {
                    text: p.question.text,
                    type: p.question.type,
                    lesson: p.question.lesson,
                    level: mapLevelToApiValue(difficultyDbValue),
                };
            }
            return { ...p, questionDetails, difficultyLevelApi: mapLevelToApiValue(difficultyDbValue) };
        });

        const totalQuestionsInDbForThisSubject = await Question.countDocuments({ subject: subjectDoc._id, type: { $ne: 'problem_set'} });
        const answeredCount = progressRecords.length;
        const correctCount = progressRecords.filter(p => p.isCorrect).length;

        console.log(`[GET_USER_PROGRESS_BY_SUBJECT_SUCCESS] Progress for subject "${subjectName}" (ID: ${subjectDoc._id}): Answered: ${answeredCount}, Correct: ${correctCount}`);
        res.json({
            subjectName: subjectDoc.name,
            subjectId: subjectDoc._id,
            totalQuestionsInDbForSubject,
            questionsAnsweredByMe: answeredCount,
            myCorrectAnswers: correctCount,
            myIncorrectAnswers: answeredCount - correctCount,
            progressDetails: enhancedProgressRecords,
        });
    } catch (error) {
        console.error(`[GET_USER_PROGRESS_BY_SUBJECT_ERROR] Error for subject "${subjectName}":`, error.message, error.stack);
        res.status(500).json({ message: 'Server error fetching progress for subject.', error: error.message });
    }
};
module.exports = {
    saveMcqProgress,
    getUserProgressBySubject,
    getMyProgressSummary
};