require('dotenv').config();
const AcademicLevel = require('../models/AcademicLevel');
const Track = require('../models/Track');
const Subject = require('../models/Subject');

const {
    loadCurriculumData,
    loadPromptModule,
    getRandomFromArray,
    getCoreSubjectName
} = require('./aiGeneralQuestionGeneratorShared'); // Shared functions

const { fetchGeminiWithConfig, processStepOutput } = require('./promptHelpers'); // Specific prompt helpers

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function generateSingleAIProblemSetDataForLesson(
    academicLevelName,
    trackName,
    subjectNameFromDB, // This is the full subject name from DB, e.g., "2BAC_svt_english"
    difficultyLevelApi,
    lessonObject, // This is a single lesson/context object
    problemIndex
) {
    console.log(`[AI_SINGLE_PROBLEM_DATA_EXAM_GEN_START] Index ${problemIndex}, Subject: '${subjectNameFromDB}', Lesson: '${lessonObject.titreLecon || 'General Context'}'`);
    
    // Use subjectNameFromDB to load the prompt module, getCoreSubjectName will handle extracting 'svt', 'pc' etc. for path construction
    const customPromptModule = loadPromptModule(academicLevelName, trackName, subjectNameFromDB, 'exam');

    if (!customPromptModule) {
        // subjectNameFromDB is used here because it's the specific subject configuration we're trying to generate for
        throw new Error(`Exam prompt module not found for Subject: "${subjectNameFromDB}" (Academic Level: ${academicLevelName}, Track: ${trackName}). Check prompt file paths and names.`);
    }

    const promptOverallContext = {
        academicLevelName,
        trackName,
        subjectName: subjectNameFromDB, // The full name as known by the system/DB
        coreSubjectName: getCoreSubjectName(subjectNameFromDB), // The simplified name like 'math', 'svt'
        difficultyLevelApi,
        lesson: lessonObject,
        problemIndex: problemIndex,
    };
    
    // Load full curriculum for context if the prompt module requires it
    // Use subjectNameFromDB as it's the identifier for the curriculum content
    const fullCurriculumForContext = loadCurriculumData(academicLevelName, trackName, subjectNameFromDB, true); // true for exam curriculum
    if (Array.isArray(fullCurriculumForContext) || (typeof fullCurriculumForContext === 'object' && fullCurriculumForContext !== null)) {
         promptOverallContext.curriculumData = fullCurriculumForContext;
    } else {
        console.warn(`[AI_SINGLE_PROBLEM_DATA_EXAM_GEN] Full curriculum context for ${subjectNameFromDB} not loaded or invalid, prompt might lack broader context.`);
    }


    let generatedProblemData;

    if (customPromptModule.type === 'multi-step' && Array.isArray(customPromptModule.steps)) {
        const accumulatedStepOutputs = {};
        for (const step of customPromptModule.steps) {
            let stepSuccess = false;
            let stepRetries = 0;
            const maxRetries = step.retries !== undefined ? step.retries : 1; // Allow step-specific retries or default to 1

            while (!stepSuccess && stepRetries <= maxRetries) {
                try {
                    if (stepRetries > 0) {
                        console.log(`[AI_SINGLE_PROBLEM_DATA_EXAM_GEN_RETRY] Retrying step "${step.name}" (Attempt ${stepRetries + 1}/${maxRetries +1})...`);
                        await delay(2000 * stepRetries);
                    }

                    if (typeof step.processor === 'function') {
                        accumulatedStepOutputs[step.name] = await Promise.resolve(step.processor(promptOverallContext, { ...accumulatedStepOutputs }));
                    } else if (typeof step.promptGenerator === 'function') {
                        const stepPromptText = step.promptGenerator(promptOverallContext, { ...accumulatedStepOutputs });
                        const genConfig = step.generationConfig || customPromptModule.defaultGenerationConfig || {};
                        const modelType = step.modelType || customPromptModule.defaultModelType || 'gemini-1.5-flash-latest'; // Default model
                        
                        console.log(`[AI_SINGLE_PROBLEM_DATA_EXAM_GEN_STEP] Executing step "${step.name}" with model "${modelType}". Prompt length: ${stepPromptText.length}`);

                        const rawResponse = await fetchGeminiWithConfig(stepPromptText, genConfig, modelType);
                        // Using processStepOutput from promptHelpers.js as it's specialized
                        accumulatedStepOutputs[step.name] = await processStepOutput(rawResponse, step.outputProcessor, promptOverallContext);
                    } else {
                        throw new Error(`Step "${step.name}" in prompt module for "${subjectNameFromDB}" is invalid (missing processor or promptGenerator).`);
                    }
                    stepSuccess = true;
                } catch (error) {
                    stepRetries++;
                    console.error(`[AI_SINGLE_PROBLEM_DATA_EXAM_GEN_ERROR] Error in step "${step.name}" for subject "${subjectNameFromDB}", lesson "${lessonObject.titreLecon || 'N/A'}", retry ${stepRetries}: ${error.message}`, error.stack ? error.stack.substring(0, 500) : '');
                    if (stepRetries > maxRetries) {
                        // If it's a critical step, you might want to throw the error to stop the whole problem generation
                        // For now, we'll let it be handled by the outer try-catch in generateFullExamSetData
                        throw error; 
                    }
                }
            }
            if (!stepSuccess) {
                 throw new Error(`Failed to execute step "${step.name}" for subject "${subjectNameFromDB}" after ${maxRetries + 1} attempts.`);
            }
        }
        // Final aggregation
        if (typeof customPromptModule.finalAggregator !== 'function') {
            throw new Error(`finalAggregator function is missing or invalid in the prompt module for "${subjectNameFromDB}".`);
        }
        generatedProblemData = customPromptModule.finalAggregator(promptOverallContext, accumulatedStepOutputs);
    } else {
        throw new Error(`Invalid exam prompt module structure for "${subjectNameFromDB}". Expected 'multi-step' type with 'steps' array.`);
    }

    if (!generatedProblemData || typeof generatedProblemData.text !== 'string' || !Array.isArray(generatedProblemData.subQuestions)) {
        console.error("[AI_SINGLE_PROBLEM_DATA_EXAM_GEN_VALIDATION_FAIL] Invalid problem data from aggregator:", generatedProblemData);
        throw new Error(`AI aggregator for "${subjectNameFromDB}" did not return a valid problem data object (missing text or subQuestions).`);
    }

    let calculatedTotalPoints = generatedProblemData.subQuestions.reduce((sum, sq) => sum + (Number(sq.points) || 0), 0);
    calculatedTotalPoints = Math.round(calculatedTotalPoints * 100) / 100; // Round to 2 decimal places
    
    if (generatedProblemData.totalPoints === undefined || Math.abs(calculatedTotalPoints - generatedProblemData.totalPoints) > 0.1) {
        if (generatedProblemData.totalPoints !== undefined) {
            console.warn(`[POINTS_MISMATCH] For problem "${generatedProblemData.problemTitle || 'Untitled'}", AI stated ${generatedProblemData.totalPoints}pts, but calculated ${calculatedTotalPoints}pts. Overriding with calculated value.`);
        } else {
            console.warn(`[POINTS_MISSING] For problem "${generatedProblemData.problemTitle || 'Untitled'}", AI did not state totalPoints. Using calculated value: ${calculatedTotalPoints}pts.`);
        }
        generatedProblemData.totalPoints = calculatedTotalPoints;
    }
    
    console.log(`[AI_SINGLE_PROBLEM_DATA_EXAM_GEN_SUCCESS] Problem: "${generatedProblemData.problemTitle || 'Untitled Problem'}", Total Points: ${generatedProblemData.totalPoints}`);
    
    return { ...generatedProblemData }; // Return a copy
}

const generateFullExamSetData = async (academicLevelId, trackId, subjectId, examDifficultyApiValue) => {
    const [levelDoc, trackDoc, subjectDoc] = await Promise.all([
        AcademicLevel.findById(academicLevelId).select('name').lean(),
        Track.findById(trackId).select('name').lean(),
        Subject.findById(subjectId).select('name isCoreSubject').lean()
    ]);

    if (!levelDoc || !trackDoc || !subjectDoc) {
        throw new Error('Academic entities not found. Cannot proceed with exam generation.');
    }
    
    const academicLevelName = levelDoc.name;
    const trackName = trackDoc.name;
    const subjectFileNameFromDB = subjectDoc.name;

    console.log(`[EXAM_GEN_INIT] Level: ${academicLevelName}, Track: ${trackName}, Subject: ${subjectFileNameFromDB}, Difficulty: ${examDifficultyApiValue}`);

    const customPromptModule = loadPromptModule(academicLevelName, trackName, subjectFileNameFromDB, 'exam');
    if (!customPromptModule) {
        throw new Error(`Exam prompt module for "${subjectFileNameFromDB}" not found.`);
    }

    const examConfig = customPromptModule.examConfig || {};
    
    // --- START: هذا هو الإصلاح الرئيسي ---
    let numberOfProblemsToGenerate;
    if (typeof examConfig.numberOfProblems === 'function') {
        // استدعاء الدالة للحصول على الرقم
        numberOfProblemsToGenerate = examConfig.numberOfProblems(); 
    } else {
        // استخدام القيمة مباشرة إذا كانت رقمًا
        numberOfProblemsToGenerate = examConfig.numberOfProblems || 1;
    }
    
    if (numberOfProblemsToGenerate <= 0) {
        console.warn(`[EXAM_GEN_WARN] Number of problems to generate is ${numberOfProblemsToGenerate}. Setting to 1.`);
        numberOfProblemsToGenerate = 1;
    }
    
    // الآن سيتم طباعة الرقم الصحيح في السجل
    console.log(`[EXAM_GEN_START] Using config for "${subjectFileNameFromDB}". Generating ${numberOfProblemsToGenerate} problems.`);
    // --- END: نهاية الإصلاح الرئيسي ---

    const curriculumData = loadCurriculumData(academicLevelName, trackName, subjectFileNameFromDB, true);
    if (!curriculumData) {
        throw new Error(`Curriculum data not found for subject "${subjectFileNameFromDB}".`);
    }

    let lessonsToGenerate = [];

    // الآن هذا المنطق سيعمل بشكل صحيح لأن numberOfProblemsToGenerate هو رقم
    if (Array.isArray(curriculumData)) {
        if (curriculumData.length === 0) {
            throw new Error(`Curriculum array for "${subjectFileNameFromDB}" is empty.`);
        }
        
        if (curriculumData.length < numberOfProblemsToGenerate) {
             console.warn(`[LESSON_SELECT_WARN] Not enough unique lessons (${curriculumData.length}) for ${subjectFileNameFromDB} to generate ${numberOfProblemsToGenerate} problems. Using all available unique lessons.`);
             lessonsToGenerate = [...curriculumData];
        } else {
            const shuffledLessons = [...curriculumData].sort(() => 0.5 - Math.random());
            lessonsToGenerate = shuffledLessons.slice(0, numberOfProblemsToGenerate);
        }

    } else if (typeof curriculumData === 'object' && curriculumData !== null && Object.keys(curriculumData).length > 0) {
        for (let i = 0; i < numberOfProblemsToGenerate; i++) {
            lessonsToGenerate.push(curriculumData);
        }
    
    } else {
        throw new Error(`Curriculum data for "${subjectFileNameFromDB}" is in an unsupported format or is empty.`);
    }

    if (lessonsToGenerate.length === 0) {
        throw new Error(`Failed to select any lessons/context for exam generation (Subject: ${subjectFileNameFromDB}).`);
    }

    // ... (باقي الدالة يبقى كما هو مع حلقة إعادة المحاولة) ...
    
    const generatedProblemsDataArray = [];
    const MAX_PROBLEM_GENERATION_RETRIES = 2;

    for (let i = 0; i < lessonsToGenerate.length; i++) {
        const lessonOrContext = lessonsToGenerate[i];
        let problemGenerated = false;
        let attempt = 0;

        while (!problemGenerated && attempt <= MAX_PROBLEM_GENERATION_RETRIES) {
            attempt++;
            try {
                if (attempt > 1) {
                    console.log(`[EXAM_GEN_RETRY] Retrying generation for problem ${i + 1} (Attempt ${attempt})...`);
                    await delay(2000);
                }
                
                console.log(`[EXAM_GEN_ITERATION] Generating problem ${i + 1} using context: "${lessonOrContext.titreLecon || 'General Context'}"`);
                
                const problemData = await generateSingleAIProblemSetDataForLesson(
                    academicLevelName, trackName, subjectFileNameFromDB, examDifficultyApiValue, lessonOrContext, i
                );
                
                generatedProblemsDataArray.push(problemData);
                problemGenerated = true;

            } catch (error) {
                console.error(`[EXAM_GEN_ATTEMPT_FAIL] Attempt ${attempt} failed for problem ${i + 1}. Error: ${error.message}`);
                if (attempt > MAX_PROBLEM_GENERATION_RETRIES) {
                    console.error(`[EXAM_GEN_FINAL_FAIL] All attempts failed for problem ${i+1}. Skipping.`);
                }
            }
        }
        if (problemGenerated && i < lessonsToGenerate.length - 1) {
             await delay(1500); 
        }
    }

    if (generatedProblemsDataArray.length === 0) {
        throw new Error(`Failed to generate ANY valid problems for the exam (Subject: ${subjectFileNameFromDB}). Check AI generation steps and prompt configurations.`);
    }
    
    console.log(`[EXAM_GEN_END] Successfully generated data for ${generatedProblemsDataArray.length} problems for subject "${subjectFileNameFromDB}".`);
    return generatedProblemsDataArray;
};

module.exports = {
    generateFullExamSetData,
    // generateSingleAIProblemSetDataForLesson, // Not typically exported unless used elsewhere directly
};