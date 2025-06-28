// back-end/controllers/examController.js

const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const TimedExamAttempt = require('../models/TimedExamAttempt');
const AcademicLevel = require('../models/AcademicLevel');
const Track = require('../models/Track');
const Subject = require('../models/Subject');
const Devoir = require('../models/Devoir');
const { gradeExamAttemptByAI } = require('../services/aiGradingService');
const { generateFullExamSetData } = require('../utils/aiTimedExamGenerator');
const { loadPromptModule } = require('../utils/aiGeneralQuestionGeneratorShared');

const mapApiDifficultyToDb = (apiValue) => {
    const mapping = { 'Facile': 'سهل', 'Moyen': 'متوسط', 'Difficile': 'صعب' };
    return Object.values(mapping).includes(apiValue) ? apiValue : (mapping[apiValue] || 'متوسط');
};
// back-end/controllers/examController.js

// back-end/controllers/examController.js

const startExam = asyncHandler(async (req, res) => {
    const { academicLevelId, trackId, subjectId, difficulty: difficultyApiValue } = req.body;
    const userId = req.user._id;

    if (!academicLevelId || !trackId || !subjectId || !difficultyApiValue) {
        res.status(400); throw new Error('Please provide all required fields.');
    }

    const difficultyDbValue = mapApiDifficultyToDb(difficultyApiValue);
    
    // --- منطق العشوائية واختيار المصدر ---
    let devoirFromDb = null;
    const PROBABILITY_TO_USE_DB = 0.7; // 70% for DB

    const potentialDevoirsCount = await Devoir.countDocuments({
        academicLevel: new mongoose.Types.ObjectId(academicLevelId),
        track: new mongoose.Types.ObjectId(trackId),
        subject: new mongoose.Types.ObjectId(subjectId),
        difficulty: difficultyDbValue,
    });

    console.log(`[EXAM_CTRL_START] Found ${potentialDevoirsCount} potential DB devoirs matching criteria.`);

    if (potentialDevoirsCount > 0 && Math.random() < PROBABILITY_TO_USE_DB) {
        console.log(`[EXAM_CTRL_START] Random check passed. Attempting to select a DB devoir.`);
        const completedDevoirIds = (await TimedExamAttempt.find({ user: userId, sourceDevoirId: { $ne: null } }).select('sourceDevoirId -_id').lean()).map(entry => entry.sourceDevoirId);
        
        const matchStage = { 
            academicLevel: new mongoose.Types.ObjectId(academicLevelId), 
            track: new mongoose.Types.ObjectId(trackId), 
            subject: new mongoose.Types.ObjectId(subjectId), 
            difficulty: difficultyDbValue, 
            _id: { $nin: completedDevoirIds } 
        };
        const randomDevoirDoc = (await Devoir.aggregate([{ $match: matchStage }, { $sample: { size: 1 } }]))[0];
        
        if (randomDevoirDoc) {
            devoirFromDb = await Devoir.findById(randomDevoirDoc._id).lean();
        } else {
             console.log(`[EXAM_CTRL_START] No UNSOLVED DB devoir found for this user. Will fall back to AI.`);
        }
    }

    if (devoirFromDb) {
        // --- المسار الأول: استخدام فرض من قاعدة البيانات (لا يتغير) ---
        console.log(`[EXAM_CTRL_DECISION] Final Decision: Using DB Devoir. ID: ${devoirFromDb._id}`);
        if (!devoirFromDb.problems?.length) {
            res.status(500); throw new Error('DB Devoir found but it has no problems.');
        }

        const examAttempt = new TimedExamAttempt({
            user: userId, academicLevel: academicLevelId, track: trackId, subject: subjectId, difficulty: difficultyDbValue,
            problems: devoirFromDb.problems.map((problem, index) => {
                let uniqueOrderCounter = 1;
                return {
                    problemTitle: problem.title,
                    problemText: problem.context,
                    orderInExam: index + 1,
                    subQuestionsData: (problem.instructions || []).flatMap(instruction =>
                        (instruction.subQuestions || []).map(sq => ({
                            text: `${instruction.title}\n${sq.text}`,
                            points: sq.points,
                            difficultyOrder: uniqueOrderCounter++,
                            type: sq.questionType,
                            options: sq.options || [],
                            correctAnswer: sq.correctAnswer,
                            imageUrl: instruction.imageUrl || null,
                        }))
                    ),
                    problemTotalPossibleRawScore: (problem.instructions || []).reduce((sum, i) => sum + (i.subQuestions || []).reduce((subSum, sq) => subSum + (sq.points || 0), 0), 0),
                    problemId: new mongoose.Types.ObjectId().toString(),
                };
            }),
            overallTotalPossibleRawScore: devoirFromDb.totalPoints, timeLimitMinutes: devoirFromDb.timeLimitMinutes,
            status: 'in-progress', source: 'db_devoir', sourceDevoirId: devoirFromDb._id,
            config: { difficultyApiValue, sourceTitle: devoirFromDb.title },
        });

        const createdAttempt = await examAttempt.save();
        console.log(`[EXAM_CTRL_SUCCESS] DB Devoir attempt ${createdAttempt._id} created for user ${userId}.`);
        
        const problemsForDisplay = createdAttempt.problems.map(p => ({
            problemId: p.problemId, problemOrderInExam: p.orderInExam, problemTitle: p.problemTitle, problemText: p.problemText,
            problemTotalPossibleScore: p.problemTotalPossibleRawScore,
            subQuestions: p.subQuestionsData.map(sq => ({
                text: sq.text, points: sq.points, orderInProblem: sq.difficultyOrder,
                type: sq.type,
                options: sq.options,
                imageUrl: sq.imageUrl,
            }))
        }));

        return res.status(201).json({ examAttemptId: createdAttempt._id, problems: problemsForDisplay, timeLimitMinutes: createdAttempt.timeLimitMinutes, startTime: createdAttempt.startTime.toISOString() });

    } else {
        // --- المسار الثاني: إنشاء اختبار مؤقت بالذكاء الاصطناعي (هنا التعديل) ---
        console.log(`[EXAM_CTRL_DECISION] Final Decision: Using AI Generation.`);
        
        const generatedProblemsPayload = await generateFullExamSetData(academicLevelId, trackId, subjectId, difficultyApiValue);
        if (!generatedProblemsPayload?.length) {
            res.status(500); throw new Error('AI generation resulted in no problems.');
        }

        let timeLimitFromSource = 120;
        try {
            const [levelDoc, trackDoc, subjectDoc] = await Promise.all([
                AcademicLevel.findById(academicLevelId).select('name').lean(),
                Track.findById(trackId).select('name').lean(),
                Subject.findById(subjectId).select('name').lean()
            ]);
            if (levelDoc && trackDoc && subjectDoc) {
                const examConfigModule = loadPromptModule(levelDoc.name, trackDoc.name, subjectDoc.name, 'exam');
                if (examConfigModule?.examConfig?.timeLimitMinutes) timeLimitFromSource = examConfigModule.examConfig.timeLimitMinutes;
            }
        } catch (configError) { console.warn(`Error loading exam config: ${configError.message}`); }

        // حساب تاريخ انتهاء الصلاحية (300 دقيقة من الآن)
        const expirationDate = new Date();
        expirationDate.setMinutes(expirationDate.getMinutes() + 300); 
        console.log(`[EXAM_CTRL_AI] This AI-generated exam is temporary and will expire at: ${expirationDate.toISOString()}`);

        const examAttempt = new TimedExamAttempt({
            user: userId, academicLevel: academicLevelId, track: trackId, subject: subjectId, difficulty: difficultyDbValue,
            problems: generatedProblemsPayload.map((p, index) => ({
                problemTitle: p.problemTitle || `Problem ${index + 1}`,
                problemText: p.text,
                orderInExam: p.orderInExam || (index + 1),
                subQuestionsData: p.subQuestions.map(sq => ({
                    text: sq.text, points: sq.points, difficultyOrder: sq.difficultyOrder,
                    type: sq.type || 'free_text',
                    options: sq.options || [],
                    imageUrl: sq.imageUrl || null,
                })),
                problemTotalPossibleRawScore: p.totalPoints,
                problemId: p.problemId || new mongoose.Types.ObjectId().toString()
            })),
            overallTotalPossibleRawScore: generatedProblemsPayload.reduce((sum, p) => sum + (p.totalPoints || 0), 0),
            timeLimitMinutes: timeLimitFromSource,
            status: 'in-progress', 
            source: 'ai_generated', 
            sourceDevoirId: null,
            config: { numberOfProblems: generatedProblemsPayload.length, difficultyApiValue },
            // إضافة حقل انتهاء الصلاحية فقط للاختبارات المنشأة من AI
            expiresAt: expirationDate,
        });

        const createdAttempt = await examAttempt.save();
        console.log(`[EXAM_CTRL_SUCCESS] AI-Generated temporary attempt ${createdAttempt._id} created for user ${userId}.`);

        const problemsForDisplay = createdAttempt.problems.map(p => ({
            problemId: p.problemId, problemOrderInExam: p.orderInExam, problemTitle: p.problemTitle, problemText: p.problemText,
            problemTotalPossibleScore: p.problemTotalPossibleRawScore,
            subQuestions: p.subQuestionsData.map(sq => ({
                text: sq.text, points: sq.points, orderInProblem: sq.difficultyOrder,
                type: sq.type,
                options: sq.options,
                imageUrl: sq.imageUrl,
            }))
        }));

        return res.status(201).json({ examAttemptId: createdAttempt._id, problems: problemsForDisplay, timeLimitMinutes: createdAttempt.timeLimitMinutes, startTime: createdAttempt.startTime.toISOString() });
    }
});


// ... (بقية دوال المتحكم: submitExam, getExamAttemptResults, etc. تبقى كما هي)


// @desc    Submit answers for a timed exam
// @route   POST /api/exams/:attemptId/submit
// @access  Private
const submitExam = asyncHandler(async (req, res) => {
    const { attemptId } = req.params;
    const { problemAnswers } = req.body;
    const userId = req.user._id.toString();

    if (!mongoose.Types.ObjectId.isValid(attemptId)) {
        res.status(400); throw new Error('Invalid exam attempt ID format.');
    }
    const examAttempt = await TimedExamAttempt.findById(attemptId);
    if (!examAttempt) {
        res.status(404); throw new Error('Exam attempt not found.');
    }
    if (examAttempt.user.toString() !== userId) {
        res.status(403); throw new Error('Not authorized.');
    }
    if (examAttempt.status !== 'in-progress') {
        res.status(400); throw new Error(`Exam already submitted.`);
    }

    examAttempt.endTime = new Date();

    if (problemAnswers && Array.isArray(problemAnswers)) {
        for (const submittedProblem of problemAnswers) {
            const problemDB = examAttempt.problems.find(p => p.problemId === submittedProblem.problemId);
            if (!problemDB) continue;

            problemDB.subQuestionAnswers = [];

            if (submittedProblem.subQuestionAnswers && Array.isArray(submittedProblem.subQuestionAnswers)) {
                for (const sqAnsInput of submittedProblem.subQuestionAnswers) {
                    const originalSubQuestion = problemDB.subQuestionsData.find(osq => osq.difficultyOrder === sqAnsInput.orderInProblem);
                    if (!originalSubQuestion) continue;

                    problemDB.subQuestionAnswers.push({
                        subQuestionText: originalSubQuestion.text,
                        subQuestionOrderInProblem: sqAnsInput.orderInProblem,
                        subQuestionPoints: originalSubQuestion.points,
                        userAnswer: sqAnsInput.userAnswer || null,
                        awardedPoints: 0,
                        aiFeedback: "Pending grading.",
                    });
                }
            }
        }
    }

    await examAttempt.save();
    console.log(`[EXAM_SUBMIT] Attempt ${attemptId} saved with user answers. Invoking AI grading service.`);

    try {
        const gradedAttempt = await gradeExamAttemptByAI(attemptId);
        console.log(`[EXAM_SUBMIT_SUCCESS] Attempt ${attemptId} submitted and graded. Score: ${gradedAttempt.overallRawScore}/${gradedAttempt.overallTotalPossibleRawScore}. Status: ${gradedAttempt.status}`);
        res.status(200).json({
            message: 'Exam submitted successfully and has been graded.',
            examAttemptId: gradedAttempt._id,
            status: gradedAttempt.status
        });
    } catch (gradingError) {
        console.error(`[EXAM_SUBMIT_CATCH] AI grading process failed for attempt ${attemptId}: ${gradingError.message}`);
        examAttempt.status = 'grading-failed';
        await examAttempt.save();
        res.status(500).json({
            message: 'Exam submitted, but a critical error occurred during the automated grading process.',
            examAttemptId: attemptId,
            status: 'grading-failed'
        });
    }
});


// @desc    Get results for a timed exam attempt
// @route   GET /api/exams/:attemptId/results
// @access  Private
const getExamAttemptResults = asyncHandler(async (req, res) => {
    const { attemptId } = req.params;
    const userId = req.user._id.toString();

    if (!mongoose.Types.ObjectId.isValid(attemptId)) {
        res.status(400); throw new Error('Invalid exam attempt ID format.');
    }

    const examAttempt = await TimedExamAttempt.findById(attemptId)
        .populate('academicLevel', 'name')
        .populate('track', 'name')
        .populate('subject', 'name')
        .lean();

    if (!examAttempt) {
        res.status(404); throw new Error('Exam attempt not found.');
    }

    if (examAttempt.user.toString() !== userId && req.user.role !== 'admin') {
        res.status(403); throw new Error('Not authorized to view these exam results.');
    }

    const resultsToSend = {
        _id: examAttempt._id,
        academicLevel: examAttempt.academicLevel ? { _id: examAttempt.academicLevel._id.toString(), name: examAttempt.academicLevel.name } : { name: 'N/A', _id: '' },
        track: examAttempt.track ? { _id: examAttempt.track._id.toString(), name: examAttempt.track.name } : { name: 'N/A', _id: '' },
        subject: examAttempt.subject ? { _id: examAttempt.subject._id.toString(), name: examAttempt.subject.name } : { name: 'N/A', _id: '' },
        difficulty: examAttempt.difficulty,
        config: examAttempt.config,
        overallRawScore: examAttempt.overallRawScore,
        overallTotalPossibleRawScore: examAttempt.overallTotalPossibleRawScore,
        overallScoreOutOf20: examAttempt.overallScoreOutOf20,
        timeLimitMinutes: examAttempt.timeLimitMinutes,
        startTime: examAttempt.startTime.toISOString(),
        endTime: examAttempt.endTime ? examAttempt.endTime.toISOString() : null,
        status: examAttempt.status,
        source: examAttempt.source, // إرسال المصدر للواجهة
        sourceTitle: examAttempt.config?.sourceTitle, // إرسال عنوان الفرض إذا كان المصدر من DB
        problems: examAttempt.problems.map(problem => ({
            problemId: problem.problemId,
            problemOrderInExam: problem.orderInExam,
            problemText: problem.problemText,
            problemLesson: problem.problemLesson,
            problemTotalPossibleRawScore: problem.problemTotalPossibleRawScore,
            problemRawScore: problem.problemRawScore,
            subQuestionAttempts: problem.subQuestionAnswers.map(sqAns => ({
                text: sqAns.subQuestionText,
                orderInProblem: sqAns.subQuestionOrderInProblem,
                pointsPossible: sqAns.subQuestionPoints,
                userAnswer: sqAns.userAnswer,
                aiFeedback: sqAns.aiFeedback,
                awardedPoints: sqAns.awardedPoints,
            }))
        }))
    };
    res.status(200).json(resultsToSend);
});

// @desc    Get user's exam history
// @route   GET /api/exams/history
// @access  Private
const getExamHistoryForUser = asyncHandler(async (req, res) => {
    const attempts = await TimedExamAttempt.find({ user: req.user._id })
        .populate('subject', 'name')
        .populate('academicLevel', 'name')
        .populate('track', 'name')
        .sort({ createdAt: -1 }) 
        .limit(20) 
        .lean();

    res.status(200).json(attempts.map(attempt => ({
        _id: attempt._id,
        subjectName: attempt.subject ? attempt.subject.name : 'N/A',
        academicLevelName: attempt.academicLevel ? attempt.academicLevel.name : 'N/A',
        trackName: attempt.track ? attempt.track.name : 'N/A',
        difficulty: attempt.difficulty,
        overallScoreOutOf20: attempt.overallScoreOutOf20,
        overallTotalPossibleRawScore: attempt.overallTotalPossibleRawScore,
        status: attempt.status,
        date: attempt.startTime,
        source: attempt.source,
    })));
});

// @desc    Delete an exam attempt
// @route   DELETE /api/exams/:attemptId
// @access  Private (User can delete their own, admin can delete any)
const deleteExamAttempt = asyncHandler(async (req, res) => {
    const { attemptId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(attemptId)) {
        res.status(400); throw new Error('Invalid exam attempt ID.');
    }

    const examAttempt = await TimedExamAttempt.findById(attemptId);

    if (!examAttempt) {
        res.status(404); throw new Error('Exam attempt not found.');
    }

    if (examAttempt.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        res.status(403); throw new Error('Not authorized to delete this attempt.');
    }

    await TimedExamAttempt.deleteOne({ _id: attemptId }); 
    console.log(`[EXAM_CTRL_DELETE] Exam attempt ${attemptId} deleted by user ${req.user._id}.`);
    res.status(200).json({ message: 'Exam attempt deleted successfully.' });
});


module.exports = {
    startExam,
    submitExam,
    getExamAttemptResults,
    getExamHistoryForUser,    
    deleteExamAttempt,       
};