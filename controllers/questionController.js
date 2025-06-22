// back-end/controllers/questionController.js
const mongoose = require('mongoose');
const Question = require('../models/Question');
const Subject = require('../models/Subject');
const Track = require('../models/Track');
const AcademicLevel = require('../models/AcademicLevel');
const UserProgress = require('../models/UserProgress'); // تأكد من استيراد النموذج المحدث
const { v4: uuidv4 } = require('uuid');

const {
    generateAIQuestion,
    validateFreeTextAnswerWithAI,
    generateHintWithAI,
    generateDetailedAnswerWithAI
} = require('../utils/aiGeneralQuestionGenerator.js');

// Helper functions (يجب أن تكون متطابقة مع تلك الموجودة في progressController)
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
    console.log(`\n--- [GET_PRACTICE_QUESTION_START_NO_SAVE] ---`);
    console.log(`User ID: ${userId}`);
    console.log(`[RAW_QUERY_OBJECT] req.query:`, req.query);

    const { levelId: qLevelId, trackId: qTrackId, subjectId: qSubjectId, difficulty: qDifficulty } = req.query;

    if (!qLevelId || qLevelId.trim() === '' || !qTrackId || qTrackId.trim() === '' || !qSubjectId || qSubjectId.trim() === '' || !qDifficulty || qDifficulty.trim() === '') {
        return res.status(400).json({ message: "Academic level, track, subject, and difficulty are required." });
    }
    const academicLevelId = qLevelId;
    const trackId = qTrackId;
    const subjectId = qSubjectId;
    const difficultyApiValue = qDifficulty; // API value: 'Facile', 'Moyen', 'Difficile'
    const levelForDbLookup = mapLevelToArabic(difficultyApiValue);

    try {
        const solvedProgressEntries = await UserProgress.find({ user: new mongoose.Types.ObjectId(userId), question: { $ne: null } }).select('question -_id').lean();
        const solvedQuestionIds = solvedProgressEntries.map(entry => entry.question);

        let matchStage;
        try {
            matchStage = {
                academicLevel: new mongoose.Types.ObjectId(academicLevelId),
                track: new mongoose.Types.ObjectId(trackId),
                subject: new mongoose.Types.ObjectId(subjectId),
                level: levelForDbLookup,
                _id: { $nin: solvedQuestionIds },
                type: { $ne: 'problem_set' }
            };
        } catch (idError) {
             return res.status(400).json({ message: `Invalid ID format for query params. ${idError.message}` });
        }

        const randomDbQuestions = await Question.aggregate([ { $match: matchStage }, { $sample: { size: 1 } } ]);
        const availableDbQuestionDoc = randomDbQuestions.length > 0 ? randomDbQuestions[0] : null;

        const probabilityToUseAi = (difficultyApiValue === "Difficile") ? 0.75 : 0.5;
        const shouldUseAi = Math.random() < probabilityToUseAi;

        if (!shouldUseAi && availableDbQuestionDoc) {
            console.log(`[DECISION_RESULT_DB_PRACTICE] Chose DB question. ID: ${availableDbQuestionDoc._id}`);
            const populatedQuestion = await Question.findById(availableDbQuestionDoc._id)
                .populate('subject', 'name')
                .lean();
            if (!populatedQuestion) {
                 throw new Error("Failed to retrieve details for the selected DB question.");
            }
            return res.json({
                _id: populatedQuestion._id.toString(),
                question: populatedQuestion.text,
                type: populatedQuestion.type,
                options: populatedQuestion.options,
                subject: populatedQuestion.subject.name,
                level: mapLevelToApiValue(populatedQuestion.level), // إرجاع قيمة API
                generatedBy: populatedQuestion.generatedBy || 'db',
                lesson: populatedQuestion.lesson,
                // الإجابة الصحيحة لا ترسل للعميل هنا لسؤال DB
            });
        } else {
            console.log(`[DECISION_RESULT_AI_PRACTICE_NO_SAVE] ${shouldUseAi ? 'Randomly chose AI' : 'No DB question available or AI preferred'}.`);

            const [levelDoc, trackDoc, subjectDoc] = await Promise.all([
                AcademicLevel.findById(academicLevelId).select('name _id').lean(), // نحتاج ID للتخزين في الجلسة
                Track.findById(trackId).select('name _id').lean(),
                Subject.findById(subjectId).select('name _id').lean(),
            ]);

            if (!levelDoc || !trackDoc || !subjectDoc) {
                return res.status(404).json({ message: 'Academic entities not found for AI generation.' });
            }

            const aiGeneratedData = await generateAIQuestion(levelDoc.name, trackDoc.name, subjectDoc.name, difficultyApiValue);

            if (!aiGeneratedData || typeof aiGeneratedData.question !== 'string' || aiGeneratedData.question.trim() === '') {
                throw new Error("AI generation returned invalid data (practice question).");
            }

            const tempAiQuestionId = `ai_practice_${uuidv4()}`;
            console.log(`[AI_PRACTICE_GENERATED_NO_SAVE] Temp ID: ${tempAiQuestionId}`);

            const responseToFrontend = {
                _id: tempAiQuestionId, // المعرف المؤقت
                question: aiGeneratedData.question,
                type: aiGeneratedData.type,
                options: aiGeneratedData.options,
                subject: subjectDoc.name, // اسم المادة للعرض
                level: difficultyApiValue, // مستوى الصعوبة كقيمة API
                generatedBy: 'ai',
                lesson: aiGeneratedData.lesson,
                // correctAnswer لا يرسل للعميل هنا. يتم تخزينه في الجلسة.
                // إضافة السياق الكامل للواجهة الأمامية إذا احتاجت لإرساله مرة أخرى
                academicLevelId: levelDoc._id.toString(),
                trackId: trackDoc._id.toString(),
                subjectId: subjectDoc._id.toString()
            };

            if (req.session) {
                if (!req.session.tempAiPracticeQuestions) req.session.tempAiPracticeQuestions = {};
                req.session.tempAiPracticeQuestions[tempAiQuestionId] = {
                    ...aiGeneratedData, // .question, .type, .options, .correctAnswer, .lesson
                    // تخزين الأسماء و الـ IDs والسياق الكامل في الجلسة
                    academicLevelName: levelDoc.name,
                    trackName: trackDoc.name,
                    subjectName: subjectDoc.name,
                    academicLevelId: levelDoc._id.toString(),
                    trackId: trackDoc._id.toString(),
                    subjectId: subjectDoc._id.toString(),
                    apiDifficulty: difficultyApiValue, // قيمة API الأصلية للصعوبة
                    dbDifficulty: levelForDbLookup, // قيمة DB للصعوبة
                };
                // التأكد من حفظ الجلسة إذا تم تعديلها
                req.session.save(err => {
                    if (err) {
                        console.error("[AI_PRACTICE_SESSION_SAVE_ERROR] Error saving session:", err);
                        // لا يزال بإمكاننا إرجاع السؤال، لكن التخزين في الجلسة قد يكون فشل
                    } else {
                        console.log(`[AI_PRACTICE_SESSION_STORE_SUCCESS] Stored AI Q ${tempAiQuestionId} in session.`);
                    }
                });
            } else {
                console.warn("[AI_PRACTICE_SESSION_STORE_FAIL] req.session not available. Cannot store AI question details.");
                // هنا قد تحتاج الواجهة الأمامية إلى إرسال كل بيانات السؤال مرة أخرى لطلبات التلميح/الإجابة
            }
            return res.json(responseToFrontend);
        }
    } catch (error) {
        console.error('[GET_PRACTICE_QUESTION_FATAL_ERROR_NO_SAVE] Error:', error.message, error.stack);
        if (error.message.includes("AI Service Error") || error.message.includes("AI Generation Failed")) {
             return res.status(503).json({ message: `AI Service Error: ${error.message}`});
        }
        return res.status(500).json({ message: 'Internal Server Error while fetching question.', error: error.message });
    }
};

const getQuestionHint = async (req, res) => {
    const { questionId } = req.params;
    // مع GET، لا يوجد req.body بنفس السهولة. سنعتمد على الجلسة لسؤال AI.
    console.log(`[GET_HINT_REQUEST] QID: ${questionId}`);

    try {
        let questionTextForHint, subjectNameForHint;

        if (questionId && questionId.startsWith('ai_practice_')) {
            const tempQ = req.session?.tempAiPracticeQuestions?.[questionId];
            if (tempQ && tempQ.question && tempQ.subjectName) {
                questionTextForHint = tempQ.question;
                subjectNameForHint = tempQ.subjectName;
                console.log(`[GET_HINT_AI_SESSION] Found AI question ${questionId} in session.`);
            } else {
                console.error(`[GET_HINT_AI_NOT_FOUND_IN_SESSION] Data for AI question ${questionId} not found in session.`);
                // يمكنك اختيار إرجاع رسالة خطأ أكثر تحديدًا أو محاولة حل مختلف إذا كان ضروريًا للغاية
                // ولكن مع عمل الجلسات، يجب أن يكون هذا كافيًا.
                return res.status(404).json({ message: "AI Question data for hint not found in session. Please refresh or try a new question." });
            }
        } else if (mongoose.Types.ObjectId.isValid(questionId)) {
            const dbQ = await Question.findById(questionId).populate('subject', 'name').lean();
            if (!dbQ || !dbQ.text || !dbQ.subject?.name) {
                console.error(`[GET_HINT_DB_NOT_FOUND] DB Question ${questionId} or its subject not found.`);
                return res.status(404).json({ message: "DB Question or its subject not found." });
            }
            questionTextForHint = dbQ.text;
            subjectNameForHint = dbQ.subject.name;
            console.log(`[GET_HINT_DB_FOUND] Found DB question ${questionId}.`);
        } else {
            console.error(`[GET_HINT_INVALID_ID] Invalid question identifier: ${questionId}.`);
            return res.status(400).json({ message: "Invalid question identifier." });
        }

        const hint = await generateHintWithAI(questionTextForHint, subjectNameForHint, "ar");
        if (!hint || hint.trim() === "") {
            console.error(`[GET_HINT_GENERATION_FAIL] Failed to generate hint for QID ${questionId}.`);
            return res.status(503).json({ message: "Failed to generate hint from AI service." });
        }
        console.log(`[GET_HINT_SUCCESS] Hint generated for QID ${questionId}.`);
        res.json({ hint });
    } catch (error) {
        console.error(`[GET_HINT_ERROR] QID ${questionId}:`, error.message, error.stack);
        res.status(500).json({ message: 'Error generating hint.', error: error.message });
    }
};

const getDetailedAnswer = async (req, res) => {
    const { questionId } = req.params;
    // مع GET، لا يوجد req.body بنفس الطريقة.
    // أي معلومات إضافية من العميل (مثل userAnswerText) يجب أن تأتي كـ query params إذا لزم الأمر.
    // مثال: /:questionId/detailed-answer?userAnswerText=someAnswer
    const { userAnswerText } = req.query; // استلامه من query params إذا أرسل

    console.log(`[GET_DETAILED_ANSWER_REQUEST] QID: ${questionId}, Query:`, req.query);

    try {
        let qDetails, subjectName, academicLevelName, trackName, displayLevel, correctAnswerFromSource;

        if (questionId && questionId.startsWith('ai_practice_')) {
            const tempQ = req.session?.tempAiPracticeQuestions?.[questionId];
            if (tempQ && tempQ.question && tempQ.type && tempQ.subjectName && tempQ.apiDifficulty && tempQ.correctAnswer !== undefined) {
                qDetails = { question: tempQ.question, type: tempQ.type, options: tempQ.options, correctAnswer: tempQ.correctAnswer, lesson: tempQ.lesson };
                subjectName = tempQ.subjectName;
                academicLevelName = tempQ.academicLevelName || "N/A";
                trackName = tempQ.trackName || "N/A";
                displayLevel = tempQ.apiDifficulty;
                correctAnswerFromSource = tempQ.correctAnswer;
                console.log(`[GET_DETAILED_ANSWER_AI_SESSION] Found AI question ${questionId} in session.`);
            } else {
                console.error(`[GET_DETAILED_ANSWER_AI_NOT_FOUND_IN_SESSION] Data for AI question ${questionId} not found in session.`);
                return res.status(404).json({ message: "AI Question data for detailed answer not found in session. Please refresh or try a new question." });
            }
        } else if (mongoose.Types.ObjectId.isValid(questionId)) {
            const dbQ = await Question.findById(questionId).populate('academicLevel track subject', 'name').lean();
            if (!dbQ || !dbQ.text || !dbQ.type || !dbQ.subject?.name || dbQ.level === undefined) {
                console.error(`[GET_DETAILED_ANSWER_DB_NOT_FOUND] DB Question ${questionId} or its related data not found/incomplete.`);
                return res.status(404).json({ message: "DB Question or its related data not found or incomplete." });
            }
            qDetails = { question: dbQ.text, type: dbQ.type, options: dbQ.options, correctAnswer: dbQ.correctAnswer, lesson: dbQ.lesson };
            subjectName = dbQ.subject.name;
            academicLevelName = dbQ.academicLevel?.name || "N/A";
            trackName = dbQ.track?.name || "N/A";
            displayLevel = mapLevelToApiValue(dbQ.level);
            correctAnswerFromSource = dbQ.correctAnswer;
            console.log(`[GET_DETAILED_ANSWER_DB_FOUND] Found DB question ${questionId}.`);
        } else {
            console.error(`[GET_DETAILED_ANSWER_INVALID_ID] Invalid question identifier: ${questionId}.`);
            return res.status(400).json({ message: "Invalid question identifier." });
        }

        const detailedExplanation = await generateDetailedAnswerWithAI(
            qDetails.question, qDetails.type, subjectName, "ar",
            correctAnswerFromSource !== "AI_VALIDATION_REQUIRED" ? correctAnswerFromSource : null,
            userAnswerText // إجابة المستخدم إذا كانت مرسلة كـ query param
        );
        if (!detailedExplanation || detailedExplanation.trim() === "") {
            console.error(`[GET_DETAILED_ANSWER_GENERATION_FAIL] Failed to generate detailed answer for QID ${questionId}.`);
            return res.status(503).json({ message: "Failed to generate detailed answer from AI service." });
        }

        console.log(`[GET_DETAILED_ANSWER_SUCCESS] Detailed answer generated for QID ${questionId}.`);
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
    const { questionId, userAnswerText, questionData: bodyQuestionData } = req.body; // questionData is fallback
    const userId = req.user.id || req.user._id;

    console.log(`[VALIDATE_FREETEXT_REQUEST] User: ${userId}, QID: ${questionId}, Body:`, req.body);

    if ((!questionId && !bodyQuestionData) || userAnswerText === undefined || userAnswerText === null) {
        return res.status(400).json({ message: "Question ID/Data and user answer are required." });
    }

    try {
        let questionText, subjectNameForAI, correctAnswerForRef, questionType;
        let academicLevelIdForProgress, trackIdForProgress, subjectIdForProgress, difficultyForProgressDb;
        let aiQuestionDetailsToSave = {}; // لتخزين تفاصيل سؤال AI إذا كان سيُحفظ في UserProgress

        const actualQuestionId = questionId || bodyQuestionData?._id; // استخدم ID من body إذا لم يكن questionId موجودًا

        if (actualQuestionId && actualQuestionId.startsWith('ai_practice_')) {
            const tempQ = req.session?.tempAiPracticeQuestions?.[actualQuestionId];
            let source = "session";

            if (tempQ && tempQ.question && tempQ.subjectName && tempQ.type === 'free_text') {
                // استخدام بيانات الجلسة
            } else if (bodyQuestionData && bodyQuestionData.text && bodyQuestionData.subjectName && bodyQuestionData.type === 'free_text') {
                // استخدام بيانات الجسم كحل بديل
                source = "body";
            } else {
                console.error(`[VALIDATE_FREETEXT_AI_NOT_FOUND] AI Question data for ${actualQuestionId} not in session or valid in body.`);
                return res.status(404).json({ message: "AI Question data for validation not found in session or request body." });
            }
            
            const qSource = (source === "session") ? tempQ : bodyQuestionData;
            questionText = qSource.question;
            subjectNameForAI = qSource.subjectName;
            correctAnswerForRef = qSource.correctAnswer; // هذا هو إجابة النموذج من AI
            questionType = qSource.type;

            academicLevelIdForProgress = qSource.academicLevelId || (await AcademicLevel.findOne({name: qSource.academicLevelName}).select('_id').lean())?._id;
            trackIdForProgress = qSource.trackId || (await Track.findOne({name: qSource.trackName}).select('_id').lean())?._id;
            subjectIdForProgress = qSource.subjectId || (await Subject.findOne({name: qSource.subjectName}).select('_id').lean())?._id;
            difficultyForProgressDb = qSource.dbDifficulty || mapLevelToArabic(qSource.apiDifficulty);
            
            aiQuestionDetailsToSave = {
                aiQuestionText: qSource.question,
                aiQuestionType: qSource.type,
                aiQuestionOptions: qSource.options || [], // سيكون فارغًا لـ free_text
                aiQuestionCorrectAnswer: qSource.correctAnswer,
                aiQuestionLesson: qSource.lesson,
            };

            console.log(`[VALIDATE_FREETEXT_AI_PROCESSING] AI Q ${actualQuestionId} (from ${source}).`);

        } else if (mongoose.Types.ObjectId.isValid(actualQuestionId)) {
            const dbQ = await Question.findById(actualQuestionId).populate('academicLevel track subject', 'name _id').lean();
            if (!dbQ || dbQ.type !== 'free_text' || !dbQ.subject?.name) {
                console.error(`[VALIDATE_FREETEXT_DB_NOT_FOUND] DB free_text Question ${actualQuestionId} or its subject not found.`);
                return res.status(404).json({ message: "DB free_text Question or subject not found." });
            }
            questionText = dbQ.text;
            subjectNameForAI = dbQ.subject.name;
            correctAnswerForRef = dbQ.correctAnswer;
            questionType = dbQ.type;

            academicLevelIdForProgress = dbQ.academicLevel._id;
            trackIdForProgress = dbQ.track._id;
            subjectIdForProgress = dbQ.subject._id;
            difficultyForProgressDb = dbQ.level; // قيمة DB (عربي)
            console.log(`[VALIDATE_FREETEXT_DB_PROCESSING] DB Q ${actualQuestionId}.`);
        } else {
            console.error(`[VALIDATE_FREETEXT_INVALID_ID] Invalid question identifier for validation: ${actualQuestionId}.`);
            return res.status(400).json({ message: "Invalid question identifier for validation." });
        }

        const aiValidationResult = await validateFreeTextAnswerWithAI(questionText, userAnswerText, subjectNameForAI, "ar"); // نفترض اللغة العربية

        // حفظ التقدم لكل من أسئلة AI و DB إذا توفر السياق الأكاديمي
        if (academicLevelIdForProgress && trackIdForProgress && subjectIdForProgress && difficultyForProgressDb) {
            const progressEntry = {
                user: userId,
                userAnswer: userAnswerText,
                isCorrect: aiValidationResult.isValid,
                academicLevel: academicLevelIdForProgress,
                track: trackIdForProgress,
                subject: subjectIdForProgress,
                difficultyLevel: difficultyForProgressDb,
                attemptedAt: new Date(),
                isAiQuestion: actualQuestionId.startsWith('ai_practice_'),
                ...(actualQuestionId.startsWith('ai_practice_') ? aiQuestionDetailsToSave : { question: actualQuestionId })
            };

            // Upsert لمنع التكرار (يعتمد على الفهارس في UserProgress)
            // لأسئلة DB، الفهرس {user:1, question:1} يمنع التكرار
            // لأسئلة AI، لا يوجد فهرس افتراضي لمنع التكرار بنفس الطريقة، لذا قد يتم إنشاء سجلات متعددة لنفس نص سؤال AI
            // إذا أردت منع هذا، يجب تعديل استعلام Upsert أو إضافة فهرس خاص بأسئلة AI في UserProgress.js
            await UserProgress.findOneAndUpdate(
                actualQuestionId.startsWith('ai_practice_')
                    ? { user: userId, isAiQuestion: true, aiQuestionText: progressEntry.aiQuestionText, subject: subjectIdForProgress } // محاولة تعريف فريد لسؤال AI
                    : { user: userId, question: actualQuestionId },
                progressEntry,
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
            console.log(`[VALIDATE_FREETEXT_PROGRESS_SAVED] User progress for QID ${actualQuestionId}. Correct: ${aiValidationResult.isValid}`);
        } else {
             console.warn(`[VALIDATE_FREETEXT_NO_PROGRESS_SAVE] Context missing for QID ${actualQuestionId}. No UserProgress save.`);
        }

        res.json({
            isCorrect: aiValidationResult.isValid,
            feedback: aiValidationResult.feedback, // هذا هو تقييم AI/التصحيح
            questionId: actualQuestionId, // أرجع الـ ID المستخدم
        });
    } catch (error) {
        console.error(`[VALIDATE_FREETEXT_ERROR] QID ${actualQuestionId || 'unknown'}:`, error.message, error.stack);
        res.status(500).json({ message: 'Error validating answer.', error: error.message });
    }
};


// --- Admin Routes --- (الكود كما هو)
const createQuestion = async (req, res) => {
    const { academicLevel, track, subject, level, type, text, options, correctAnswer, lesson, problemTitle, subQuestions, totalPoints } = req.body;
    console.log("[ADMIN_CREATE_QUESTION] Received data:", req.body);
    if (!academicLevel || !track || !subject || !level || !type || !text) {
        return res.status(400).json({ message: 'Required fields are missing for creating question.' });
    }
    if (type === 'problem_set' && (!Array.isArray(subQuestions) || subQuestions.length === 0 || typeof totalPoints !== 'number')) {
        return res.status(400).json({ message: 'For problem_set, subQuestions array and totalPoints are required.' });
    }

    try {
        const questionData = {
            academicLevel, track, subject, level, type, text, lesson,
            options: (type === 'mcq') ? options : [],
            correctAnswer: (type === 'mcq' || type === 'free_text') ? correctAnswer : undefined,
            generatedBy: 'db',
            problemTitle: (type === 'problem_set') ? problemTitle : undefined,
            subQuestions: (type === 'problem_set') ? subQuestions : undefined,
            totalPoints: (type === 'problem_set') ? totalPoints : undefined,
        };
        const newQuestion = new Question(questionData);
        const createdQuestion = await newQuestion.save();
        const populatedQuestion = await Question.findById(createdQuestion._id)
            .populate('academicLevel track subject', 'name')
            .lean();
        console.log("[ADMIN_CREATE_QUESTION_SUCCESS] Question created:", populatedQuestion._id);
        res.status(201).json(populatedQuestion);
    } catch (error) {
        console.error('[ADMIN_CREATE_QUESTION_ERROR] Error:', error.message, error.stack);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: `Validation Error: ${error.message}` });
        }
        res.status(500).json({ message: 'Error creating question', error: error.message });
    }
};

const updateQuestion = async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    console.log(`[ADMIN_UPDATE_QUESTION] ID: ${id}, Data:`, updateData);
     if (updateData.level && !['سهل', 'متوسط', 'صعب'].includes(updateData.level)) {
        return res.status(400).json({ message: 'Invalid difficulty level.' });
    }
    if (updateData.type === 'problem_set' && (updateData.subQuestions !== undefined && !Array.isArray(updateData.subQuestions)) || (updateData.totalPoints !== undefined && typeof updateData.totalPoints !== 'number')) {
        return res.status(400).json({ message: 'Problem_set updates require subQuestions array and totalPoints number if provided.' });
    }
    try {
        if (updateData.generatedBy && updateData.generatedBy !== 'db') {
            const existingQuestion = await Question.findById(id).select('generatedBy').lean();
            if (existingQuestion && existingQuestion.generatedBy === 'db') {
                console.warn(`[ADMIN_UPDATE_QUESTION_WARN] Admin attempting to change generatedBy for DB question ${id}. Keeping 'db'.`);
                updateData.generatedBy = 'db';
            }
        }

        const question = await Question.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
        if (!question) {
            return res.status(404).json({ message: 'Question not found.' });
        }
        const populatedQuestion = await Question.findById(question._id)
            .populate('academicLevel track subject', 'name')
            .lean();
        console.log("[ADMIN_UPDATE_QUESTION_SUCCESS] Question updated:", populatedQuestion._id);
        res.json(populatedQuestion);
    } catch (error) {
         console.error('[ADMIN_UPDATE_QUESTION_ERROR] Error:', error.message, error.stack);
         if (error.name === 'ValidationError') {
            return res.status(400).json({ message: `Validation Error: ${error.message}` });
        }
         res.status(500).json({ message: 'Error updating question', error: error.message });
    }
};

const deleteQuestion = async (req, res) => {
    const { id } = req.params;
    console.log(`[ADMIN_DELETE_QUESTION] Attempting to delete question with ID: ${id}`);
    try {
        const question = await Question.findByIdAndDelete(id);
        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }
        const progressDeletionResult = await UserProgress.deleteMany({ question: new mongoose.Types.ObjectId(id) });
        console.log(`[ADMIN_DELETE_QUESTION_SUCCESS] Question ID ${id} removed. Associated progress entries deleted: ${progressDeletionResult.deletedCount}`);
        res.json({ message: 'Question removed successfully' });
    } catch(err) {
        console.error("[ADMIN_DELETE_QUESTION_ERROR] Error:", err.message, err.stack);
        res.status(500).json({message: "Server error while deleting question", error: err.message});
    }
};

const getAllQuestionsForAdmin = async (req, res) => {
    console.log("[ADMIN_GET_ALL_QUESTIONS] Received query:", req.query);
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
            queryFilter.$or = [
                { text: { $regex: searchTerm, $options: 'i' } },
                { lesson: { $regex: searchTerm, $options: 'i' } },
                { problemTitle: { $regex: searchTerm, $options: 'i' } }
            ];
        }
        console.log("[ADMIN_GET_ALL_QUESTIONS] Constructed filter:", JSON.stringify(queryFilter));

        const questions = await Question.find(queryFilter)
            .populate('academicLevel track subject', 'name')
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit))
            .sort({ createdAt: -1 })
            .lean()
            .exec();

        const totalQuestions = await Question.countDocuments(queryFilter);
        console.log(`[ADMIN_GET_ALL_QUESTIONS_SUCCESS] Found ${questions.length} questions. Total: ${totalQuestions}.`);

        res.json({
            questions,
            totalPages: Math.ceil(totalQuestions / Number(limit)),
            currentPage: Number(page),
            totalQuestions: totalQuestions
        });
    } catch (err) {
        console.error("[ADMIN_GET_ALL_QUESTIONS_ERROR] Error:", err.message, err.stack);
        res.status(500).json({ message: "Server error while fetching admin questions.", error: err.message });
    }
};

const deleteQuestionsByCriteria = async (req, res) => {
    const { academicLevelId, trackId, subjectId } = req.body;
    console.log(`[ADMIN_DELETE_BY_CRITERIA] Attempting to delete questions. Criteria: Lvl=${academicLevelId}, Trk=${trackId}, Sub=${subjectId}`);

    if (!academicLevelId || !trackId || !subjectId) {
        return res.status(400).json({ message: "Academic Level ID, Track ID, and Subject ID are required to delete questions by criteria." });
    }

    try {
        const filter = {
            academicLevel: new mongoose.Types.ObjectId(academicLevelId),
            track: new mongoose.Types.ObjectId(trackId),
            subject: new mongoose.Types.ObjectId(subjectId),
        };
        console.log("[ADMIN_DELETE_BY_CRITERIA] Deletion filter:", filter);

        const questionsToDelete = await Question.find(filter).select('_id').lean();
        const questionIdsToDelete = questionsToDelete.map(q => q._id);

        if (questionIdsToDelete.length === 0) {
            console.log("[ADMIN_DELETE_BY_CRITERIA] No questions found matching criteria. Nothing deleted.");
            return res.status(200).json({ message: "No questions found matching the criteria. Nothing was deleted.", deletedCount: 0, progressDeletedCount: 0 });
        }

        console.log(`[ADMIN_DELETE_BY_CRITERIA] Found ${questionIdsToDelete.length} questions to delete.`);

        const progressDeletionResult = await UserProgress.deleteMany({ question: { $in: questionIdsToDelete } });
        console.log(`[ADMIN_DELETE_BY_CRITERIA] Deleted ${progressDeletionResult.deletedCount} associated UserProgress entries.`);

        const questionDeletionResult = await Question.deleteMany(filter);
        console.log(`[ADMIN_DELETE_BY_CRITERIA_SUCCESS] Successfully deleted ${questionDeletionResult.deletedCount} questions matching criteria.`);

        res.status(200).json({
            message: `Successfully deleted ${questionDeletionResult.deletedCount} questions and ${progressDeletionResult.deletedCount} associated progress entries.`,
            deletedCount: questionDeletionResult.deletedCount,
            progressDeletedCount: progressDeletionResult.deletedCount
        });

    } catch (error) {
        console.error('[ADMIN_DELETE_BY_CRITERIA_ERROR] Error:', error.message, error.stack);
        if (error.name === 'CastError') {
            return res.status(400).json({ message: `Invalid ID format provided in criteria. ${error.message}`});
        }
        res.status(500).json({ message: "Server error while deleting questions by criteria.", error: error.message });
    }
};


module.exports = {
    getPracticeQuestion,
    validateFreeTextAnswer, // تأكد من أن هذه الدالة موجودة ومصدرة
    getAllQuestionsForAdmin,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    getQuestionHint,
    getDetailedAnswer,
    deleteQuestionsByCriteria,
};