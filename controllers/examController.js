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

const transformComponentsToProblems = (components) => {
    const problemsForAttempt = [];
    let currentProblem = null;
    let questionCounter = 0;

    // The rest of your transformComponentsToProblems function is correct
    for (const component of components) {
        if (component.type === 'exercise_title') {
            if (currentProblem) {
                problemsForAttempt.push(currentProblem);
            }
            questionCounter = 0;
            currentProblem = {
                problemId: new mongoose.Types.ObjectId().toString(),
                problemTitle: component.text || `تمرين ${problemsForAttempt.length + 1}`,
                problemItems: [],
            };
        } else if (currentProblem) {
            switch (component.type) {
                case 'paragraph':
                case 'subheading':
                case 'instruction':
                case 'separator':
                case 'image':
                    currentProblem.problemItems.push({
                        itemType: 'content',
                        contentType: component.type,
                        text: component.text,
                        url: component.url,
                        aiDescription: component.aiDescription,
                    });
                    break;
                case 'question':
                    questionCounter++;
                    currentProblem.problemItems.push({
                        itemType: 'question',
                        text: component.text,
                        points: component.points,
                        orderInProblem: questionCounter,
                        questionType: component.questionType,
                        options: component.options,
                        correctAnswer: component.correctAnswer,
                        group_a_items: component.groupA,
                        group_b_items: component.groupB,
                        correct_matches: component.correctMatches,
                        table_headers: component.tableHeaders,
                        table_rows: component.tableRows,
                        correct_answers_table: component.tableCorrectAnswers,
                    });
                    break;
            }
        }
    }

    if (currentProblem) {
        problemsForAttempt.push(currentProblem);
    }
    
    return problemsForAttempt.map((p, index) => ({
        ...p,
        orderInExam: index + 1,
        problemTotalPossibleRawScore: p.problemItems.reduce((sum, item) => {
            return item.itemType === 'question' ? sum + (item.points || 0) : sum;
        }, 0)
    }));
};

const startExam = asyncHandler(async (req, res) => {
    const { academicLevelId, trackId, subjectId, difficulty: difficultyApiValue } = req.body;
    const userId = req.user._id;

    if (!academicLevelId || !trackId || !subjectId || !difficultyApiValue) {
        res.status(400);
        throw new Error('Please provide all required fields: academicLevelId, trackId, subjectId, difficulty.');
    }

    const difficultyDbValue = mapApiDifficultyToDb(difficultyApiValue);
    
    let devoirFromDb = null;
    const PROBABILITY_TO_USE_DB = 1;

    const potentialDevoirsCount = await Devoir.countDocuments({
        academicLevel: new mongoose.Types.ObjectId(academicLevelId),
        track: new mongoose.Types.ObjectId(trackId),
        subject: new mongoose.Types.ObjectId(subjectId),
        difficulty: difficultyDbValue,
    });

    if (potentialDevoirsCount > 0 && Math.random() < PROBABILITY_TO_USE_DB) {
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
             console.log(`[EXAM_CTRL_START] No UNSOLVED DB devoir found for this user. Will fall back to AI generation.`);
        }
    }

    // --- [FIX] إضافة تحقق للتأكد من أن المكونات هي مصفوفة قابلة للتكرار ---
    if (devoirFromDb && (!devoirFromDb.components || !Array.isArray(devoirFromDb.components) || devoirFromDb.components.length === 0)) {
        console.warn(`[EXAM_CTRL_WARN] Devoir from DB ${devoirFromDb._id} has missing or non-iterable components. Forcing fallback to AI generation.`);
        // إجبار النظام على استخدام الذكاء الاصطناعي بدلاً من التعطل
        devoirFromDb = null;
    }

    if (devoirFromDb) {
        console.log(`[EXAM_CTRL_DECISION] Using Devoir from DB. ID: ${devoirFromDb._id}`);
        
        const problemsForAttempt = transformComponentsToProblems(devoirFromDb.components);
        
        if (problemsForAttempt.length === 0) {
            res.status(500);
            // تغيير رسالة الخطأ لتكون أكثر وضوحًا
            throw new Error('Failed to transform Devoir components. The source Devoir might be structured incorrectly.');
        }

        const examAttempt = new TimedExamAttempt({
            user: userId,
            academicLevel: academicLevelId,
            track: trackId,
            subject: subjectId,
            difficulty: difficultyDbValue,
            problems: problemsForAttempt,
            overallTotalPossibleRawScore: devoirFromDb.totalPoints,
            timeLimitMinutes: devoirFromDb.timeLimitMinutes,
            status: 'in-progress',
            source: 'db_devoir',
            sourceDevoirId: devoirFromDb._id,
            config: { difficultyApiValue, sourceTitle: devoirFromDb.title },
        });

        const createdAttempt = await examAttempt.save();
        
        return res.status(201).json({
            examAttemptId: createdAttempt._id,
            problems: createdAttempt.problems,
            timeLimitMinutes: createdAttempt.timeLimitMinutes,
            startTime: createdAttempt.startTime.toISOString()
        });

    } else {
        // AI Generation Fallback Logic
        console.log(`[EXAM_CTRL_DECISION] No valid DB Devoir found. Using AI Generation.`);
        
        try {
            const generatedProblems = await generateFullExamSetData(academicLevelId, trackId, subjectId, difficultyApiValue);

            if (!generatedProblems || generatedProblems.length === 0) {
                throw new Error('AI generation resulted in no problems.');
            }

            const expirationDate = new Date();
            expirationDate.setHours(expirationDate.getHours() + 5);
            
            const examAttempt = new TimedExamAttempt({
                user: userId,
                academicLevel: academicLevelId,
                track: trackId,
                subject: subjectId,
                difficulty: difficultyDbValue,
                problems: generatedProblems,
                overallTotalPossibleRawScore: generatedProblems.reduce((sum, p) => sum + (p.problemTotalPossibleRawScore || 0), 0),
                timeLimitMinutes: 120,
                status: 'in-progress',
                source: 'ai_generated',
                expiresAt: expirationDate,
            });

            const createdAttempt = await examAttempt.save();
            
            return res.status(201).json({
                examAttemptId: createdAttempt._id,
                problems: createdAttempt.problems,
                timeLimitMinutes: createdAttempt.timeLimitMinutes,
                startTime: createdAttempt.startTime.toISOString()
            });

        } catch (aiError) {
            console.error(`[EXAM_CTRL_AI_ERROR] AI exam generation failed: ${aiError.message}`);
            res.status(500).json({ message: "حدث خطأ أثناء إنشاء الاختبار بواسطة الذكاء الاصطناعي. يرجى المحاولة مرة أخرى." });
        }
    }
});


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
        res.status(400); throw new Error(`Exam has already been submitted.`);
    }

    examAttempt.endTime = new Date();
    
    if (problemAnswers && Array.isArray(problemAnswers)) {
        examAttempt.problems.forEach(problemDB => {
            const submittedProblem = problemAnswers.find(p => p.problemId === problemDB.problemId);
            if (!submittedProblem || !submittedProblem.subQuestionAnswers) return;
            
            const answersMap = new Map(submittedProblem.subQuestionAnswers.map(ans => [ans.orderInProblem, ans.userAnswer]));
            
            const newSubQuestionAnswers = [];
            
            problemDB.problemItems.forEach(item => {
                if (item.itemType === 'question' && item.orderInProblem) {
                    const userAnswer = answersMap.get(item.orderInProblem) || null;
                    newSubQuestionAnswers.push({
                        subQuestionText: item.text,
                        subQuestionOrderInProblem: item.orderInProblem,
                        userAnswer: userAnswer,
                        awardedPoints: 0,
                        aiFeedback: "Pending grading.",
                    });
                }
            });

            problemDB.subQuestionAnswers = newSubQuestionAnswers;
        });
    }

    await examAttempt.save();

    try {
        const gradedAttempt = await gradeExamAttemptByAI(attemptId);
        res.status(200).json({
            message: 'Exam submitted successfully and has been graded.',
            examAttemptId: gradedAttempt._id,
            status: gradedAttempt.status
        });
    } catch (gradingError) {
        console.error(`[EXAM_SUBMIT_CATCH] AI grading failed for attempt ${attemptId}: ${gradingError.message}`);
        examAttempt.status = 'grading-failed';
        await examAttempt.save();
        res.status(500).json({
            message: 'Exam submitted, but a critical error occurred during automated grading.',
            examAttemptId: attemptId,
            status: 'grading-failed'
        });
    }
});


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

    res.status(200).json(examAttempt);
});


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
    res.status(200).json({ message: 'Exam attempt deleted successfully.' });
});

module.exports = {
    startExam,
    submitExam,
    getExamAttemptResults,
    getExamHistoryForUser,    
    deleteExamAttempt,       
};