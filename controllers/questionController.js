// backend/controllers/questionController.js
const Question = require('../models/Question');
const Subject = require('../models/Subject');
const UserProgress = require('../models/UserProgress');
const {
    generateAIQuestion,
    validateFreeTextAnswerWithAI,
    generateHintWithAI, // <-- إضافة جديدة
    generateDetailedAnswerWithAI // <-- إضافة جديدة
} = require('../utils/aiQuestionGenerator');
const curriculumBacMarocFrancais = require('../curriculumData.js'); // افترض أن هذا الملف موجود ويستخدم

// دالة مساعدة لتحويل المستوى من الصيغة الفرنسية/الإنجليزية إلى العربية
const mapLevelToArabic = (levelApiValue) => {
    const mapping = {
        'Facile': 'سهل',
        'Moyen': 'متوسط',
        'Difficile': 'صعب',
        'سهل': 'سهل', // In case it's already Arabic
        'متوسط': 'متوسط',
        'صعب': 'صعب'
    };
    const mapped = mapping[levelApiValue];
    if (!mapped) {
        console.warn(`[mapLevelToArabic] No mapping found for levelApiValue: '${levelApiValue}'. Returning original value.`);
        return levelApiValue;
    }
    return mapped;
};

// دالة مساعدة لتحويل المستوى من العربية (DB) إلى API Value (الفرونت)
const mapLevelToApiValue = (levelDbValue) => {
    const mapping = {
        'سهل': 'Facile',
        'متوسط': 'Moyen',
        'صعب': 'Difficile'
    };
    return mapping[levelDbValue] || levelDbValue;
};

// @desc    Get a question (from DB if available and unsolved, else generate via AI)
// @route   GET /api/questions/:subjectNameArabic/:levelApiValue
// @access  Private
const getQuestion = async (req, res) => {
    const { subjectNameArabic, levelApiValue } = req.params;
    const userId = req.user.id || req.user._id;
    const userTrack = req.user.track;

    console.log(`\n--- [GET_QUESTION_START_AGGREGATE_LOGIC] ---`);
    console.log(`User ID: ${userId}, User Track: ${userTrack}`);
    console.log(`Request Params: Subject (Arabic): '${subjectNameArabic}', Level (API): '${levelApiValue}'`);

    if (!subjectNameArabic || !levelApiValue || !userTrack || !userId) {
        console.error(`[GET_QUESTION_ERROR] Missing critical parameters.`);
        return res.status(400).json({ message: "Subject, level, user track, or user ID missing from request." });
    }

    const levelForDb = mapLevelToArabic(levelApiValue);
    console.log(`Mapped Level for DB: '${levelForDb}'`);
    if (!['سهل', 'متوسط', 'صعب'].includes(levelForDb)) {
        console.error(`[GET_QUESTION_ERROR] Invalid level value after mapping for DB: '${levelForDb}'.`);
        return res.status(400).json({ message: `Invalid level value '${levelForDb}' for database.` });
    }

    try {
        const subjectDoc = await Subject.findOne({ name: subjectNameArabic }).lean();
        if (!subjectDoc) {
            console.warn(`[GET_QUESTION_WARN] Subject document NOT FOUND in DB for name: '${subjectNameArabic}'. Proceeding to AI generation.`);
            return generateAndSendAiQuestion(req, res, subjectNameArabic, levelApiValue, userTrack, userId, null);
        }
        console.log(`[GET_QUESTION_INFO] Subject FOUND in DB. ID: ${subjectDoc._id}, Name: ${subjectDoc.name}`);

        const solvedProgressEntries = await UserProgress.find({ user: userId }).select('question -_id').lean();
        const solvedQuestionIds = solvedProgressEntries.map(entry => entry.question);
        console.log(`User ${userId} has solved ${solvedQuestionIds.length} questions.`);

        let availableDbQuestion = null;
        const preferredTypeForDifficultNonConcours = (levelForDb === 'صعب' && userTrack !== 'CONCOURS') ? 'free_text' : 'mcq';

        const matchStage = {
            subject: subjectDoc._id,
            level: levelForDb,
            track: userTrack,
            _id: { $nin: solvedQuestionIds },
        };
        console.log('[GET_QUESTION_INFO] Aggregation match stage for unsolved DB question:', JSON.stringify(matchStage));

        let randomDbQuestions = await Question.aggregate([
            { $match: { ...matchStage, type: preferredTypeForDifficultNonConcours } },
            { $sample: { size: 1 } }
        ]);

        if (!randomDbQuestions || randomDbQuestions.length === 0) {
            const fallbackType = preferredTypeForDifficultNonConcours === 'mcq' ? 'free_text' : 'mcq';
            console.log(`[GET_QUESTION_INFO] No preferred type '${preferredTypeForDifficultNonConcours}' found. Trying fallback type '${fallbackType}'.`);
            randomDbQuestions = await Question.aggregate([
                { $match: { ...matchStage, type: fallbackType } },
                { $sample: { size: 1 } }
            ]);
        }
        
        if (randomDbQuestions && randomDbQuestions.length > 0) {
            const questionData = randomDbQuestions[0];
            availableDbQuestion = {
                ...questionData,
                subject: { _id: subjectDoc._id, name: subjectDoc.name } 
            };
            console.log(`[GET_QUESTION_INFO] Found 1 random unsolved question from DB (type: ${availableDbQuestion.type}). ID: ${availableDbQuestion._id}`);
        } else {
            console.log(`[GET_QUESTION_INFO] No unsolved questions found in DB matching criteria after all attempts.`);
        }
        
        const forceAiGeneration = (levelApiValue === "Difficile" && userTrack !== "CONCOURS" && (!availableDbQuestion || availableDbQuestion.type !== "free_text"));
        const probabilityToUseAi = (levelApiValue === "Difficile" || userTrack === "CONCOURS") ? 0.65 : 0.4;
        const shouldUseAi = Math.random() < probabilityToUseAi;
        
        console.log(`[GET_QUESTION_DECISION_INFO] shouldUseAi (random): ${shouldUseAi}, forceAiForFreeTextScenario: ${forceAiGeneration}, availableDbQuestion is ${availableDbQuestion ? `truthy (type: ${availableDbQuestion.type})` : 'falsy'}`);

        if (!forceAiGeneration && !shouldUseAi && availableDbQuestion) {
            console.log(`[GET_QUESTION_DECISION] Chose DB question. ID: ${availableDbQuestion._id}, Type: ${availableDbQuestion.type}`);
            const responseToFrontend = {
                _id: availableDbQuestion._id.toString(),
                question: availableDbQuestion.text,
                type: availableDbQuestion.type,
                options: availableDbQuestion.options,
                subject: availableDbQuestion.subject.name,
                level: mapLevelToApiValue(availableDbQuestion.level),
                generatedBy: availableDbQuestion.generatedBy || 'db',
                lesson: availableDbQuestion.lesson,
                track: availableDbQuestion.track,
            };
            console.log("--- [GET_QUESTION_END_DB_SUCCESS_AGGREGATE] ---");
            return res.json(responseToFrontend);
        } else {
            if (forceAiGeneration) {
                console.log(`[GET_QUESTION_DECISION] Forcing AI generation for 'Difficile' non-'CONCOURS' to get a 'free_text' question.`);
            } else if (shouldUseAi) {
                console.log(`[GET_QUESTION_DECISION] Randomly chose to try AI ${availableDbQuestion ? `(even though a DB question (type: ${availableDbQuestion.type}) was available)` : '(DB question not available/found)'}.`);
            } else {
                 console.log(`[GET_QUESTION_DECISION] No suitable DB question available/found or AI not chosen randomly, proceeding to AI.`);
            }
            return generateAndSendAiQuestion(req, res, subjectNameArabic, levelApiValue, userTrack, userId, subjectDoc);
        }

    } catch (error) {
        console.error('[GET_QUESTION_FATAL_ERROR] Unexpected error in getQuestion controller:', error);
        if (error.message && (error.message.startsWith("AI Service configuration error") || error.message.includes("Gemini API") || error.message.startsWith("AI prompt blocked"))) {
            return res.status(503).json({ message: `Service Unavailable: ${error.message}`});
        }
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: `Validation Error: ${error.message}` });
        }
        console.log("--- [GET_QUESTION_END_FATAL_ERROR] ---");
        res.status(500).json({ message: 'Internal Server Error while fetching question.', error: error.message });
    }
};

async function generateAndSendAiQuestion(req, res, subjectNameArabic, levelApiValue, userTrack, userId, subjectDocFromCaller) {
    console.log(`[AI_HANDLER_INFO] Generating AI question. Subject: '${subjectNameArabic}', LevelAPI: '${levelApiValue}', Track: '${userTrack}'`);
    try {
        const aiGeneratedData = await generateAIQuestion(
            subjectNameArabic,
            levelApiValue,
            userTrack
        );

        if (aiGeneratedData) {
            console.log("[AI_HANDLER_INFO] AI question data received:", JSON.stringify(aiGeneratedData, null, 2));

            let subjectForAiSave = subjectDocFromCaller;
            if (!subjectForAiSave && aiGeneratedData.subject) {
                 subjectForAiSave = await Subject.findOne({ name: aiGeneratedData.subject }).lean();
                 if (!subjectForAiSave) {
                    console.error(`[AI_HANDLER_ERROR_SAVE] Subject (from AI response: '${aiGeneratedData.subject}') NOT FOUND in DB.`);
                    return res.status(500).json({ message: `Error saving AI question: Subject '${aiGeneratedData.subject}' not found.` });
                 }
            } else if (!subjectForAiSave && !aiGeneratedData.subject) {
                subjectForAiSave = await Subject.findOne({ name: subjectNameArabic }).lean();
                 if (!subjectForAiSave) {
                    console.error(`[AI_HANDLER_ERROR_SAVE] AI did not return a subject name, and subject from original request ('${subjectNameArabic}') also not found.`);
                    return res.status(500).json({ message: `Error saving AI question: Subject from original request or AI response not found.` });
                 }
            } else if (!subjectForAiSave && subjectDocFromCaller) { // Should be covered by first condition, but as a fallback
                 subjectForAiSave = subjectDocFromCaller;
            }

            if (!subjectForAiSave || !subjectForAiSave._id) {
                 console.error(`[AI_HANDLER_ERROR_SAVE] Critical error: Could not determine a valid subject document for saving AI question.`);
                return res.status(500).json({ message: `Error saving AI question: Could not identify subject.` });
            }

            console.log(`[AI_HANDLER_INFO_SAVE] Subject for AI question. ID: ${subjectForAiSave._id}, Name: ${subjectForAiSave.name}`);
            
            const aiLevelForDb = mapLevelToArabic(aiGeneratedData.level);
            if (!['سهل', 'متوسط', 'صعب'].includes(aiLevelForDb)) {
                console.error(`[AI_HANDLER_ERROR_SAVE] Invalid level value from AI after mapping: '${aiLevelForDb}'. Original: '${aiGeneratedData.level}'`);
                return res.status(500).json({ message: `Invalid level value '${aiLevelForDb}' from AI for database.` });
            }

            const questionToSaveData = {
                text: aiGeneratedData.question,
                type: aiGeneratedData.type,
                subject: subjectForAiSave._id,
                level: aiLevelForDb,
                track: aiGeneratedData.track,
                lesson: aiGeneratedData.lesson,
                generatedBy: 'ai'
            };

            if (aiGeneratedData.type === 'mcq') {
                questionToSaveData.options = aiGeneratedData.options;
                questionToSaveData.correctAnswer = aiGeneratedData.correctAnswer;
            } else if (aiGeneratedData.type === 'free_text') {
                questionToSaveData.options = aiGeneratedData.options || [];
                questionToSaveData.correctAnswer = aiGeneratedData.correctAnswer || "AI_VALIDATION_REQUIRED";
            }

            const newQuestionToSave = new Question(questionToSaveData);
            const savedQuestion = await newQuestionToSave.save();
            console.log("[AI_HANDLER_SUCCESS_SAVE] AI question saved to DB. ID:", savedQuestion._id.toString(), "Type:", savedQuestion.type);

            const populatedQuestion = await Question.findById(savedQuestion._id)
                .populate('subject', 'name')
                .lean();

            if (!populatedQuestion) {
                console.error(`[AI_HANDLER_ERROR_POPULATE] Failed to populate saved AI question. ID: ${savedQuestion._id}`);
                return res.status(500).json({ message: "Error retrieving saved AI question after populating." });
            }

            const responseToFrontend = {
                _id: populatedQuestion._id.toString(),
                question: populatedQuestion.text,
                type: populatedQuestion.type,
                options: populatedQuestion.options,
                subject: populatedQuestion.subject.name,
                level: mapLevelToApiValue(populatedQuestion.level),
                generatedBy: populatedQuestion.generatedBy,
                lesson: populatedQuestion.lesson,
                track: populatedQuestion.track,
            };
            console.log("--- [AI_HANDLER_END_SUCCESS] ---");
            return res.json(responseToFrontend);

        } else {
            console.error(`[AI_HANDLER_ERROR_GENERATION] AI generation returned null. Subject: '${subjectNameArabic}', LevelAPI: '${levelApiValue}', Track: '${userTrack}'.`);
            return res.status(500).json({ message: "فشل توليد السؤال من AI. الرجاء المحاولة مرة أخرى." });
        }
    } catch (dbSaveOrAiError) {
        console.error('[AI_HANDLER_FATAL_ERROR] Error in AI generation/saving process:', dbSaveOrAiError);
        if (dbSaveOrAiError.name === 'ValidationError') {
            return res.status(400).json({ message: `Validation Error during AI question save: ${dbSaveOrAiError.message}` });
        }
        if (dbSaveOrAiError.message && (dbSaveOrAiError.message.startsWith("AI Service configuration error") || dbSaveOrAiError.message.includes("Gemini API") || dbSaveOrAiError.message.startsWith("AI prompt blocked"))) {
            return res.status(503).json({ message: `AI Service Unavailable: ${dbSaveOrAiError.message}`});
        }
        return res.status(500).json({ message: 'Internal Server Error during AI question processing.', error: dbSaveOrAiError.message });
    }
}

const validateFreeTextAnswer = async (req, res) => {
    const { questionId, userAnswerText } = req.body;
    const userId = req.user.id || req.user._id;
    const userTrack = req.user.track;

    console.log(`[VALIDATE_ANSWER_CTRL] User: ${userId}, QuestionID: ${questionId}, Track: ${userTrack}`);

    if (!questionId || userAnswerText === undefined) {
        return res.status(400).json({ message: "Question ID and user answer text are required." });
    }
     // لا تقم بالتحقق من أن النص فارغ هنا، اتركه للـ AI ليقرر أو إذا كان الفرونت يمنع الإرسال الفارغ
    // if (typeof userAnswerText !== 'string' || userAnswerText.trim() === '') {
    //     return res.status(400).json({ message: "User answer text must be a non-empty string." });
    // }

    try {
        const questionToValidate = await Question.findById(questionId).populate('subject', 'name nomMatiere language');
        if (!questionToValidate) {
            return res.status(404).json({ message: "Original question not found." });
        }
        if (questionToValidate.type !== 'free_text') {
            return res.status(400).json({ message: "This endpoint is only for 'free_text' questions." });
        }

        let questionLanguage = "fr"; // Default
        let subjectNameForPrompt = "the subject"; // Default
        if (questionToValidate.subject) {
            subjectNameForPrompt = questionToValidate.subject.nomMatiere || questionToValidate.subject.name; // Use French/English name for AI
            if (questionToValidate.subject.language) { // Check for explicit language field in Subject model
                questionLanguage = questionToValidate.subject.language;
            } else if (subjectNameForPrompt === "English") { // Fallback if no language field
                questionLanguage = "en";
            }
        }
        
        console.log(`[VALIDATE_ANSWER_CTRL] Validating for subject: ${subjectNameForPrompt}, Lang: ${questionLanguage}`);

        const aiValidationResult = await validateFreeTextAnswerWithAI(
            questionToValidate.text,
            userAnswerText, // send userAnswerText as is
            subjectNameForPrompt,
            questionLanguage
        );

        const progressData = {
            user: userId,
            question: questionId,
            answer: userAnswerText,
            isCorrect: aiValidationResult.isValid,
            answeredAt: new Date(),
            track: userTrack,
        };

        const progressEntry = await UserProgress.findOneAndUpdate(
            { user: userId, question: questionId },
            progressData,
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        console.log(`[VALIDATE_ANSWER_CTRL] UserProgress updated/created. ID: ${progressEntry._id}. Correct: ${aiValidationResult.isValid}`);

        res.json({
            isCorrect: aiValidationResult.isValid,
            correctAnswer: aiValidationResult.feedback,
            questionId: questionId,
        });

    } catch (error) {
        console.error('[VALIDATE_ANSWER_CTRL_ERROR] Error validating free text answer:', error);
        if (error.message && (error.message.startsWith("AI Service configuration error") || error.message.includes("Gemini API"))) {
             return res.status(503).json({ message: `AI Service Unavailable: ${error.message}`});
        }
        res.status(500).json({ message: 'Internal Server Error while validating answer.', error: error.message });
    }
};

const getAllQuestionsForAdmin = async (req, res) => {
    try {
        const { page = 1, limit = 10, subjectId, level, track, searchTerm, generatedBy, type } = req.query;
        const queryFilter = {};

        if (subjectId) queryFilter.subject = subjectId;
        if (level) queryFilter.level = level;
        if (track) queryFilter.track = track;
        if (generatedBy) queryFilter.generatedBy = generatedBy;
        if (type) queryFilter.type = type; 
        if (searchTerm) {
            queryFilter.$or = [
                { text: { $regex: searchTerm, $options: 'i' } },
                { lesson: { $regex: searchTerm, $options: 'i' } }
            ];
        }

        const questions = await Question.find(queryFilter)
            .populate('subject', 'name _id')
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit))
            .sort({ createdAt: -1 })
            .lean()
            .exec();

        const totalQuestions = await Question.countDocuments(queryFilter);

        const questionsWithSubjectName = questions.map(q => ({
            ...q,
            subjectName: q.subject ? q.subject.name : 'مادة محذوفة/غير مرتبطة'
        }));

        res.json({
            questions: questionsWithSubjectName,
            totalPages: Math.ceil(totalQuestions / Number(limit)),
            currentPage: Number(page),
            totalQuestions: totalQuestions
        });
    } catch (err) {
        console.error("Error in getAllQuestionsForAdmin:", err);
        res.status(500).json({ message: "Server error while fetching admin questions.", error: err.message });
    }
};

const createQuestion = async (req, res) => {
    const { subjectName, level, track, type, text, options, correctAnswer, lesson, generatedBy } = req.body;

    if (!subjectName || !level || !track || !type || !text ) {
        return res.status(400).json({ message: 'Required fields are missing: subjectName, level, track, type, text.' });
    }
    if (!['سهل', 'متوسط', 'صعب'].includes(level)) {
      return res.status(400).json({ message: `Invalid level: ${level}. Allowed: سهل, متوسط, صعب.` });
    }
    if (!['mcq', 'free_text'].includes(type)) {
      return res.status(400).json({ message: `Invalid question type: ${type}. Allowed: mcq, free_text.` });
    }

    try {
        const subject = await Subject.findOne({ name: subjectName });
        if (!subject) return res.status(404).json({ message: `Subject '${subjectName}' not found.` });
        if (subject.tracks && !subject.tracks.includes(track)) {
             return res.status(400).json({ message: `Track '${track}' is not valid for subject '${subjectName}'. Valid tracks: ${subject.tracks.join(', ')}` });
        }

        const questionData = {
            subject: subject._id,
            level,
            track,
            type,
            text: String(text).trim(),
            lesson: lesson ? String(lesson).trim() : undefined,
            generatedBy: generatedBy || 'db',
        };

        if (type === 'mcq') {
            if (!options || !Array.isArray(options) || options.length < 2) {
                return res.status(400).json({ message: 'MCQ questions require at least two options.' });
            }
            if (!correctAnswer || String(correctAnswer).trim() === '') {
                return res.status(400).json({ message: 'MCQ questions require a correctAnswer.' });
            }
            questionData.options = options.map(opt => String(opt).trim()).filter(opt => opt);
            if (questionData.options.length < 2) {
                 return res.status(400).json({ message: 'MCQ questions require at least two non-empty options.' });
            }
            questionData.correctAnswer = String(correctAnswer).trim();
        } else { 
            questionData.options = []; 
            questionData.correctAnswer = correctAnswer ? String(correctAnswer).trim() : "AI_VALIDATION_REQUIRED";
        }

        const newQuestion = new Question(questionData);
        const createdQuestion = await newQuestion.save();
        const populatedQuestion = await Question.findById(createdQuestion._id).populate('subject', 'name _id');
        res.status(201).json(populatedQuestion);
    } catch (error) {
        console.error('Error in createQuestion:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: `Validation Error: ${error.message}` });
        }
        res.status(500).json({ message: 'Error creating question.', error: error.message });
    }
};

const updateQuestion = async (req, res) => {
    const { id } = req.params;
    const { subjectName, level, track, type, text, options, correctAnswer, lesson } = req.body;

    try {
        const question = await Question.findById(id);
        if (!question) return res.status(404).json({ message: 'Question not found.' });

        if (subjectName) {
            const subject = await Subject.findOne({ name: subjectName });
            if (!subject) return res.status(404).json({ message: `Subject '${subjectName}' not found.` });
            question.subject = subject._id;
            if (track && subject.tracks && !subject.tracks.includes(track)) {
                return res.status(400).json({ message: `New track '${track}' is not valid for new subject '${subjectName}'.` });
            } else if (!track && subject.tracks && !subject.tracks.includes(question.track)) {
                return res.status(400).json({ message: `Current track '${question.track}' is not valid for new subject '${subjectName}'. Please specify a valid track.` });
            }
        }
        
        if (track) {
            const subjectToValidateTrack = await Subject.findById(question.subject);
            if (subjectToValidateTrack && subjectToValidateTrack.tracks && !subjectToValidateTrack.tracks.includes(track)) {
                return res.status(400).json({ message: `Track '${track}' is not valid for subject '${subjectToValidateTrack.name}'.` });
            }
            question.track = track;
        }

        if (level) {
            if (!['سهل', 'متوسط', 'صعب'].includes(level)) {
                return res.status(400).json({ message: `Invalid level: ${level}.` });
            }
            question.level = level;
        }
        if (text) question.text = String(text).trim();
        if (lesson !== undefined) {
             question.lesson = lesson === null || String(lesson).trim() === '' ? undefined : String(lesson).trim();
        }

        const newType = type || question.type;
        if (type) question.type = type;

        if (newType === 'mcq') {
            question.type = 'mcq';
            if (options !== undefined) {
                const newOptions = Array.isArray(options) ? options.map(opt => String(opt).trim()).filter(opt => opt) : [];
                if (newOptions.length < 2) {
                    return res.status(400).json({ message: 'MCQ must have at least two non-empty options.' });
                }
                question.options = newOptions;
            }
            if (correctAnswer !== undefined) {
                 question.correctAnswer = String(correctAnswer).trim();
                 if (question.correctAnswer === '') return res.status(400).json({ message: "Correct answer for MCQ cannot be empty."});
            } else if (question.type === 'mcq' && (!question.correctAnswer || String(question.correctAnswer).trim() === '' || question.correctAnswer === "AI_VALIDATION_REQUIRED")) {
                return res.status(400).json({ message: "Correct answer is required for MCQ questions."});
            }
        } else if (newType === 'free_text') {
            question.type = 'free_text';
            question.options = []; 
            if (correctAnswer !== undefined) {
                 question.correctAnswer = correctAnswer === null || String(correctAnswer).trim() === '' ? "AI_VALIDATION_REQUIRED" : String(correctAnswer).trim();
            } else if (question.type === 'free_text' && (!question.correctAnswer || String(question.correctAnswer).trim() === '')) {
                 question.correctAnswer = "AI_VALIDATION_REQUIRED";
            }
        }
        
        const updatedQuestion = await question.save();
        const populatedQuestion = await Question.findById(updatedQuestion._id).populate('subject', 'name _id');
        res.json(populatedQuestion);
    } catch (error) {
        console.error('Error in updateQuestion:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: `Validation Error: ${error.message}` });
        }
        res.status(500).json({ message: 'Error updating question.', error: error.message });
    }
};

const deleteQuestion = async (req, res) => {
    try {
        const question = await Question.findByIdAndDelete(req.params.id);
        if (!question) return res.status(404).json({ message: 'Question not found' });
        await UserProgress.deleteMany({ question: req.params.id });
        res.json({ message: 'Question removed successfully' });
    } catch(err) {
        console.error("Error deleting question:", err);
        res.status(500).json({message: "Server error", error: err.message});
    }
};

// --- NEW CONTROLLER for getting a question hint ---
// @desc    Get an AI-generated hint for a question
// @route   GET /api/questions/:questionId/hint
// @access  Private
const getQuestionHint = async (req, res) => {
    const { questionId } = req.params;
    console.log(`[HINT_CTRL] User: ${req.user.id}, Requesting hint for QuestionID: ${questionId}`);

    if (!questionId) {
        return res.status(400).json({ message: "Question ID is required." });
    }

    try {
        const question = await Question.findById(questionId).populate('subject', 'name nomMatiere language');
        if (!question) {
            console.warn(`[HINT_CTRL] Question not found in DB: ${questionId}`);
            return res.status(404).json({ message: "Question not found." });
        }

        let questionLanguageForAI = "ar"; // لغة التلميح المطلوبة
        let subjectNameForAI = "المادة"; // اسم المادة الذي سيفهمه الـ AI
        
        if (question.subject) {
            subjectNameForAI = question.subject.nomMatiere || question.subject.name; // Use French/English name for AI context
            // إذا كنت تريد تحديد لغة التلميح بناءً على لغة المادة (مثلاً إذا كانت المادة "English" يكون التلميح بالإنجليزية)
            // if (question.subject.language === "en" || question.subject.nomMatiere === "English") {
            //     questionLanguageForAI = "en";
            // } else if (question.subject.language === "fr") {
            //     questionLanguageForAI = "fr";
            // }
        }
        
        console.log(`[HINT_CTRL] Generating hint for Q: "${question.text.substring(0,30)}...", SubjectForAI: ${subjectNameForAI}, TargetLang: ${questionLanguageForAI}`);

        const hint = await generateHintWithAI(
            question.text,
            subjectNameForAI, // اسم المادة للـ AI
            questionLanguageForAI // لغة التلميح المطلوبة
        );

        if (!hint) {
            console.error(`[HINT_CTRL_ERROR] AI hint generation returned null or empty for QID: ${questionId}`);
            return res.status(500).json({ message: "فشل في توليد التلميح من خدمة الذكاء الاصطناعي." });
        }

        res.json({ hint });

    } catch (error) {
        console.error('[HINT_CTRL_ERROR] Error getting question hint:', error);
        if (error.message && (error.message.startsWith("AI Service configuration error") || error.message.includes("Gemini API"))) {
            return res.status(503).json({ message: `AI Service Unavailable: ${error.message}` });
        }
        res.status(500).json({ message: 'Internal Server Error while generating hint.', error: error.message });
    }
};

// --- NEW CONTROLLER for getting a detailed answer ---
// @desc    Get an AI-generated detailed answer for a question
// @route   GET /api/questions/:questionId/detailed-answer
// @access  Private
const getDetailedAnswer = async (req, res) => {
    const { questionId } = req.params;
    const userId = req.user.id || req.user._id;

    console.log(`[DETAILED_ANSWER_CTRL] User: ${userId}, Requesting detailed answer for QuestionID: ${questionId}`);

    if (!questionId) {
        return res.status(400).json({ message: "Question ID is required." });
    }

    try {
        const question = await Question.findById(questionId).populate('subject', 'name nomMatiere language');
        if (!question) {
            console.warn(`[DETAILED_ANSWER_CTRL] Question not found in DB: ${questionId}`);
            return res.status(404).json({ message: "Question not found." });
        }
        
        const userProgress = await UserProgress.findOne({ user: userId, question: questionId }).lean();
        const userAnswerText = userProgress ? userProgress.answer : null;

        let questionLanguageForAI = "ar"; // لغة الشرح المطلوبة
        let subjectNameForAI = "المادة";
        if (question.subject) {
            subjectNameForAI = question.subject.nomMatiere || question.subject.name;
            // if (question.subject.language === "en" || question.subject.nomMatiere === "English") {
            //     questionLanguageForAI = "en";
            // } // ... etc for other languages
        }

        console.log(`[DETAILED_ANSWER_CTRL] Generating detailed answer for Q: "${question.text.substring(0,30)}...", SubjectForAI: ${subjectNameForAI}, TargetLang: ${questionLanguageForAI}, Type: ${question.type}`);

        const detailedExplanation = await generateDetailedAnswerWithAI(
            question.text,
            question.type,
            subjectNameForAI,
            questionLanguageForAI,
            (question.type === 'mcq' || (question.type === 'free_text' && question.correctAnswer !== "AI_VALIDATION_REQUIRED")) ? question.correctAnswer : null,
            userAnswerText
        );
        
        if (!detailedExplanation) {
            console.error(`[DETAILED_ANSWER_CTRL_ERROR] AI detailed answer generation returned null or empty for QID: ${questionId}`);
            return res.status(500).json({ message: "فشل في توليد الشرح المفصل من خدمة الذكاء الاصطناعي." });
        }
        
        const responsePayload = {
            _id: question._id.toString(),
            question: question.text,
            type: question.type,
            options: question.options, // سيكون فارغًا إذا كان free_text
            subject: question.subject ? question.subject.name : "غير معروف", // الاسم العربي للمادة
            level: mapLevelToApiValue(question.level), // إرجاع القيمة التي يفهمها الفرونت (Facile, Moyen, Difficile)
            lesson: question.lesson,
            track: question.track,
            correctAnswerFromDB: (question.type === 'mcq' || (question.type === 'free_text' && question.correctAnswer !== "AI_VALIDATION_REQUIRED")) ? question.correctAnswer : undefined,
            detailedExplanation: detailedExplanation,
            userProvidedAnswer: userAnswerText // إرسال إجابة المستخدم إذا وجدت لعرضها في صفحة الشرح
        };

        res.json(responsePayload);

    } catch (error) {
        console.error('[DETAILED_ANSWER_CTRL_ERROR] Error getting detailed answer:', error);
        if (error.message && (error.message.startsWith("AI Service configuration error") || error.message.includes("Gemini API"))) {
            return res.status(503).json({ message: `AI Service Unavailable: ${error.message}` });
        }
        res.status(500).json({ message: 'Internal Server Error while generating detailed answer.', error: error.message });
    }
};


module.exports = {
    getQuestion,
    validateFreeTextAnswer,
    getAllQuestionsForAdmin,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    getQuestionHint,         // <-- إضافة جديدة
    getDetailedAnswer        // <-- إضافة جديدة
};