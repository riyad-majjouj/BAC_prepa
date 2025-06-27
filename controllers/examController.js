// back-end/controllers/examController.js
const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const TimedExamAttempt = require('../models/TimedExamAttempt');
const AcademicLevel = require('../models/AcademicLevel');
const Track = require('../models/Track');
const Subject = require('../models/Subject');
const { gradeExamAttemptByAI } = require('../services/aiGradingService');
const { generateFullExamSetData } = require('../utils/aiTimedExamGenerator');

const mapApiDifficultyToDb = (apiValue) => {
    const mapping = {
        'Facile': 'سهل',
        'Moyen': 'متوسط',
        'Difficile': 'صعب'
    };
    if (Object.values(mapping).includes(apiValue)) {
        return apiValue;
    }
    return mapping[apiValue] || 'متوسط';
};

// @desc    Start a new timed exam (AI Generated)
// @route   POST /api/exams/start
// @access  Private
const startExam = asyncHandler(async (req, res) => {
    const { academicLevelId, trackId, subjectId, difficulty } = req.body;

    console.log(`[EXAM_CTRL_START] User ${req.user._id} starting exam. Params: Lvl=${academicLevelId}, Trk=${trackId}, Sub=${subjectId}, DiffUI=${difficulty}.`);

    if (!academicLevelId || !trackId || !subjectId || !difficulty) {
        res.status(400);
        throw new Error('Please provide all required fields for starting an exam (academicLevelId, trackId, subjectId, difficulty).');
    }

    const difficultyApiValue = difficulty;
    let generatedProblemsPayload;

    try {
        generatedProblemsPayload = await generateFullExamSetData(academicLevelId, trackId, subjectId, difficultyApiValue);
    } catch (generationError) {
        console.error(`[EXAM_CTRL_START_CATCH_ERROR] Error generating full exam data: ${generationError.message}`, generationError.stack);
        res.status(500);
        throw new Error(`Failed to generate exam content: ${generationError.message}`);
    }
    

    if (!generatedProblemsPayload || generatedProblemsPayload.length === 0) {
        res.status(500);
        throw new Error('Exam generation resulted in no problems. Please try again or contact support.');
    }
    
    let timeLimitFromSource = 120;
    try {
        const academicLevelDoc = await AcademicLevel.findById(academicLevelId).select('name').lean();
        const trackDoc = await Track.findById(trackId).select('name').lean();
        const subjectDoc = await Subject.findById(subjectId).select('name').lean();

        if (academicLevelDoc && trackDoc && subjectDoc) {
            const examConfigModule = require('../utils/aiGeneralQuestionGeneratorShared').loadPromptModule(
                academicLevelDoc.name,
                trackDoc.name,
                subjectDoc.name,
                'exam'
            );
            if (examConfigModule && examConfigModule.examConfig && examConfigModule.examConfig.timeLimitMinutes) {
                timeLimitFromSource = examConfigModule.examConfig.timeLimitMinutes;
                console.log(`[EXAM_CTRL_START] Loaded timeLimitMinutes: ${timeLimitFromSource} from prompt module for ${subjectDoc.name}.`);
            } else {
                console.warn(`[EXAM_CTRL_START] Could not load timeLimitMinutes from prompt module for ${subjectDoc.name}. Using default ${timeLimitFromSource}min.`);
            }
        } else {
            console.warn("[EXAM_CTRL_START] Could not load academic/track/subject details to fetch exam config. Using default time limit.");
        }
    } catch (configError) {
        console.error(`[EXAM_CTRL_START] Error loading exam config: ${configError.message}. Using default time limit.`);
    }

    const overallTotalPossibleRawScore = generatedProblemsPayload.reduce((sum, problem, index) => {
        if (typeof problem.totalPoints !== 'number') {
            console.error(`[EXAM_CTRL_START] Problem at index ${index} (Title: ${problem.problemTitle || 'N/A'}) is missing 'totalPoints' or it's not a number.`);
            throw new Error(`Problem (Title: ${problem.problemTitle || 'N/A'}) is missing valid 'totalPoints'.`);
        }
        return sum + problem.totalPoints;
    }, 0);

    const difficultyDbValue = mapApiDifficultyToDb(difficulty);
    console.log(`[EXAM_CTRL_START] Mapped difficulty: UI='${difficulty}', API_Used_For_Gen='${difficultyApiValue}', DB_Stored='${difficultyDbValue}'`);

    const examAttempt = new TimedExamAttempt({
        user: req.user._id,
        academicLevel: academicLevelId,
        track: trackId,
        subject: subjectId,
        difficulty: difficultyDbValue,
        problems: generatedProblemsPayload.map((p, index) => {
            if (!p.text || typeof p.text !== 'string') {
                console.error(`[EXAM_CTRL_START] Problem (Title: ${p.problemTitle || `Index ${index}`}) is missing 'text' (problemText). Payload:`, p);
                throw new Error(`Problem (Title: ${p.problemTitle || `Index ${index}`}) is missing its main text content.`);
            }
            const orderInExam = p.orderInExam || (index + 1);

            return {
                problemTitle: p.problemTitle || `Problem ${orderInExam}`,
                problemText: p.text,
                problemLesson: p.lesson,
                subQuestionsData: p.subQuestions.map(sq => ({
                    text: sq.text,
                    points: sq.points,
                    difficultyOrder: sq.difficultyOrder,
                    question_format: sq.question_format, // تأكد من حفظ هذا الحقل
                    correct_answer: sq.correct_answer, // تأكد من حفظ هذا الحقل
                    correct_answer_details: sq.correct_answer_details, // تأكد من حفظ هذا الحقل
                    category: sq.category,
                    type: sq.type
                })),
                orderInExam: orderInExam,
                problemTotalPossibleRawScore: p.totalPoints,
                problemId: p.problemId || new mongoose.Types.ObjectId().toString()
            };
        }),
        overallTotalPossibleRawScore: Math.round(overallTotalPossibleRawScore * 100) / 100,
        timeLimitMinutes: timeLimitFromSource,
        status: 'in-progress',
        config: {
            numberOfProblems: generatedProblemsPayload.length,
            difficultyApiValue: difficultyApiValue,
        },
    });

    const createdAttempt = await examAttempt.save();
    console.log(`[EXAM_CTRL_START_SUCCESS] Exam attempt ${createdAttempt._id} created for user ${req.user._id}.`);

    const problemsForDisplay = createdAttempt.problems.map(p => ({
        problemId: p.problemId,
        problemOrderInExam: p.orderInExam,
        problemTitle: p.problemTitle,
        problemText: p.problemText,
        problemLesson: p.problemLesson,
        problemTotalPossibleScore: p.problemTotalPossibleRawScore,
        subQuestions: p.subQuestionsData.map(sq => ({
            text: sq.text,
            points: sq.points,
            orderInProblem: sq.difficultyOrder,
            question_format: sq.question_format,
            category: sq.category,
            type: sq.type
        }))
    }));

    res.status(201).json({
        examAttemptId: createdAttempt._id,
        problems: problemsForDisplay,
        timeLimitMinutes: createdAttempt.timeLimitMinutes,
        startTime: createdAttempt.startTime.toISOString(),
    });
});

// @desc    Submit answers for a timed exam
// @route   POST /api/exams/:attemptId/submit
// @access  Private
const submitExam = asyncHandler(async (req, res) => {
    const { attemptId } = req.params;
    const { problemAnswers } = req.body;
    const userId = req.user._id.toString();

    // التحقق من صحة الطلب والعثور على المحاولة
    if (!mongoose.Types.ObjectId.isValid(attemptId)) {
        res.status(400);
        throw new Error('Invalid exam attempt ID format.');
    }
    const examAttempt = await TimedExamAttempt.findById(attemptId);
    if (!examAttempt) {
        res.status(404);
        throw new Error('Exam attempt not found.');
    }
    if (examAttempt.user.toString() !== userId) {
        res.status(403);
        throw new Error('Not authorized.');
    }
    if (examAttempt.status !== 'in-progress') {
        res.status(400);
        throw new Error(`Exam already submitted.`);
    }

    // --- START: تعديل منطق تسليم الإجابات والتصحيح ---

    // الخطوة 1: تسجيل وقت نهاية الامتحان وتخزين إجابات المستخدم
    examAttempt.endTime = new Date();

    if (problemAnswers && Array.isArray(problemAnswers)) {
        for (const submittedProblem of problemAnswers) {
            const problemDB = examAttempt.problems.find(p => p.problemId === submittedProblem.problemId);
            if (!problemDB) continue; // تخطي إذا لم يتم العثور على المسألة

            // إفراغ الإجابات القديمة إن وجدت وإضافة الإجابات الجديدة
            problemDB.subQuestionAnswers = [];

            if (submittedProblem.subQuestionAnswers && Array.isArray(submittedProblem.subQuestionAnswers)) {
                for (const sqAnsInput of submittedProblem.subQuestionAnswers) {
                    const originalSubQuestion = problemDB.subQuestionsData.find(osq => osq.difficultyOrder === sqAnsInput.orderInProblem);
                    if (!originalSubQuestion) continue; // تخطي إذا لم يتم العثور على السؤال الأصلي

                    // تخزين إجابة المستخدم فقط. سيتم حساب النقاط لاحقاً.
                    problemDB.subQuestionAnswers.push({
                        subQuestionText: originalSubQuestion.text,
                        subQuestionOrderInProblem: sqAnsInput.orderInProblem,
                        subQuestionPoints: originalSubQuestion.points,
                        userAnswer: sqAnsInput.userAnswer || null,
                        awardedPoints: 0, // القيمة الأولية، سيتم تحديثها بواسطة خدمة التصحيح
                        aiFeedback: "Pending grading.", // الحالة الأولية
                    });
                }
            }
        }
    }

    // الخطوة 2: حفظ المحاولة مع جميع إجابات المستخدم قبل بدء عملية التصحيح
    await examAttempt.save();
    console.log(`[EXAM_SUBMIT] Attempt ${attemptId} saved with user answers. Invoking AI grading service.`);

    // الخطوة 3: استدعاء خدمة التصحيح الآلي مرة واحدة للمحاولة بأكملها
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
        
        // في حالة فشل خدمة التصحيح، يتم تحديث حالة المحاولة لتعكس ذلك
        examAttempt.status = 'grading-failed';
        await examAttempt.save();

        res.status(500).json({
            message: 'Exam submitted, but a critical error occurred during the automated grading process.',
            examAttemptId: attemptId,
            status: 'grading-failed'
        });
    }
    // --- END: نهاية التعديل ---
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