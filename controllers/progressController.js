// backend/controllers/progressController.js
const UserProgress = require('../models/UserProgress');
const Question = require('../models/Question');
// const Subject = require('../models/Subject'); // لم نعد بحاجة إليه هنا إذا أرسلنا الشعبة مباشرة

// @desc    Save a user's answer to a question
// @route   POST /api/progress
// @access  Private
const saveProgress = async (req, res) => {
    const { questionId, userAnswer, track } = req.body; // ✅ -- استقبال الشعبة --
    const userId = req.user._id;

    if (!questionId || userAnswer === undefined || userAnswer === null || !track) { // التحقق من وجود الشعبة
        return res.status(400).json({ message: 'Question ID, user answer, and track are required.' });
    }

    try {
        const existingProgress = await UserProgress.findOne({ user: userId, question: questionId });
        if (existingProgress) {
            // إذا كان المستخدم قد أجاب بالفعل، يمكنك اختيار إرجاع خطأ أو تحديث المحاولة (غير مفضل عادةً)
            // أو ببساطة إرجاع النتيجة المحفوظة مسبقًا
            return res.status(200).json({ 
                message: 'Question already answered.',
                isCorrect: existingProgress.isCorrect,
                correctAnswer: (await Question.findById(questionId).select('correctAnswer'))?.correctAnswer || 'N/A', // جلب الإجابة الصحيحة
                userAnswer: existingProgress.userAnswer
            });
        }

        const question = await Question.findById(questionId);
        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }
        if (question.track !== track) { // التحقق من أن السؤال يخص الشعبة المرسلة
            return res.status(400).json({ message: `Question does not belong to the submitted track '${track}'. Belongs to '${question.track}'` });
        }

        const isCorrect = question.correctAnswer.trim().toLowerCase() === userAnswer.trim().toLowerCase();

        const progress = new UserProgress({
            user: userId,
            question: questionId,
            userAnswer,
            isCorrect,
            track: track, // ✅ -- حفظ الشعبة --
        });
        await progress.save();
        res.status(201).json({
            isCorrect,
            correctAnswer: question.correctAnswer,
        });
    } catch (error) {
        console.error("Error saving progress:", error);
        res.status(500).json({ message: 'Server error while saving progress', error: error.message });
    }
};

// @desc    Get user's progress for a specific subject (أو summary)
// @route   GET /api/progress/:subjectName  أو GET /api/progress/my-summary
// @access  Private
const getUserProgressBySubject = async (req, res) => {
    // هذه الدالة ستحتاج إلى إعادة تصميم كاملة لتعكس متطلبات صفحة البروفايل (ملخص التقدم)
    // حاليًا، هي مصممة لجلب التقدم لمادة واحدة.
    // سنقوم بتأجيل تعديلها حتى نصل إلى تصميم صفحة البروفايل والـ endpoint المطلوب لها.
    // سأتركها كما هي مؤقتًا ولكن ضع في اعتبارك أنها ستحتاج لتغيير.
    const { subjectName } = req.params;
    const userId = req.user._id;
    try {
        const subjectDoc = await require('../models/Subject').findOne({ name: subjectName }); //  Subject model
        if (!subjectDoc) return res.status(404).json({ message: 'Subject not found' });
        
        const questionsInSubject = await Question.find({ subject: subjectDoc._id }).select('_id');
        const questionIds = questionsInSubject.map(q => q._id);

        const progressRecords = await UserProgress.find({
            user: userId,
            question: { $in: questionIds }
        }).populate({ path: 'question', select: 'text level track' }); // أضفنا track هنا

        const totalQuestionsInDbForSubject = await Question.countDocuments({ subject: subjectDoc._id });
        const answeredCount = progressRecords.length;
        const correctCount = progressRecords.filter(p => p.isCorrect).length;
        res.json({
            totalQuestionsInDbForSubject,
            questionsAnsweredByMe: answeredCount,
            myCorrectAnswers: correctCount,
            myIncorrectAnswers: answeredCount - correctCount,
            progressDetails: progressRecords,
        });
    } catch (error) {
        console.error("Error fetching user progress by subject:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
const getMyProgressSummary = async (req, res) => {
    const userId = req.user._id;
    try {
        const allProgress = await UserProgress.find({ user: userId })
            .populate({
                path: 'question',
                select: 'subject level track lesson', // جلب الحقول المطلوبة من السؤال
                populate: { path: 'subject', select: 'name' } // جلب اسم المادة
            });

        if (!allProgress || allProgress.length === 0) {
            return res.json({
                message: "No progress records found yet.",
                overallStats: { totalAttempted: 0, totalCorrect: 0, accuracy: 0 },
                progressByTrack: {},
                lastActivity: null
            });
        }

        const summary = {
            overallStats: { totalAttempted: 0, totalCorrect: 0 },
            progressByTrack: {}, // مثال: { PC: { totalAttempted: 0, totalCorrect: 0, subjects: { 'Mathématiques': { attempted: 0, correct: 0, byLevel: {'سهل': {...}} } } } }
            lastActivity: allProgress.sort((a,b) => b.attemptedAt.getTime() - a.attemptedAt.getTime())[0].attemptedAt
        };

        allProgress.forEach(record => {
            summary.overallStats.totalAttempted++;
            if (record.isCorrect) summary.overallStats.totalCorrect++;

            const track = record.track || record.question?.track || 'غير محدد'; // استخدام الشعبة من سجل التقدم أو من السؤال
            const subjectName = record.question?.subject?.name || 'مادة غير معروفة';
            const level = record.question?.level || 'مستوى غير معروف';

            if (!summary.progressByTrack[track]) {
                summary.progressByTrack[track] = {
                    totalAttempted: 0,
                    totalCorrect: 0,
                    accuracy: 0,
                    subjects: {}
                };
            }
            summary.progressByTrack[track].totalAttempted++;
            if (record.isCorrect) summary.progressByTrack[track].totalCorrect++;

            if (!summary.progressByTrack[track].subjects[subjectName]) {
                summary.progressByTrack[track].subjects[subjectName] = {
                    attempted: 0,
                    correct: 0,
                    accuracy: 0,
                    byLevel: {}
                };
            }
            summary.progressByTrack[track].subjects[subjectName].attempted++;
            if (record.isCorrect) summary.progressByTrack[track].subjects[subjectName].correct++;
            
            if(!summary.progressByTrack[track].subjects[subjectName].byLevel[level]){
                summary.progressByTrack[track].subjects[subjectName].byLevel[level] = {
                    attempted: 0,
                    correct: 0,
                    accuracy: 0,
                };
            }
            summary.progressByTrack[track].subjects[subjectName].byLevel[level].attempted++;
            if(record.isCorrect) summary.progressByTrack[track].subjects[subjectName].byLevel[level].correct++;
        });
        
        // حساب النسب المئوية
        summary.overallStats.accuracy = summary.overallStats.totalAttempted > 0 ? Math.round((summary.overallStats.totalCorrect / summary.overallStats.totalAttempted) * 100) : 0;
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

        res.json(summary);

    } catch (error) {
        console.error("Error fetching progress summary:", error);
        res.status(500).json({ message: "Server error fetching progress summary.", error: error.message });
    }
};
// أضف getMyProgressSummary إلى exports
module.exports = { saveProgress, getUserProgressBySubject, getMyProgressSummary };
