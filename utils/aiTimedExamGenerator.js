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
        Subject.findById(subjectId).select('name isCoreSubject').lean() // Assuming 'isCoreSubject' or similar flag exists
    ]);

    if (!levelDoc || !trackDoc || !subjectDoc) {
        console.error(`[FULL_EXAM_SET_DATA_ERROR] Academic entities not found. LevelId: ${academicLevelId}, TrackId: ${trackId}, SubjectId: ${subjectId}`);
        throw new Error('Academic entities not found. Cannot proceed with exam generation.');
    }
    
    const academicLevelName = levelDoc.name; // e.g., "2BAC"
    const trackName = trackDoc.name;         // e.g., "SPC", "SVT"
    const subjectFileNameFromDB = subjectDoc.name; // e.g., "2BAC_spc_pc", "2BAC_svt_svt", "2BAC_sm_math", "1BAC_sx-sm_frensh"
                                              // This is the name used for loading prompts and curriculum mapping

    console.log(`[FULL_EXAM_SET_DATA_INIT] Level: ${academicLevelName}, Track: ${trackName}, Subject (DB Name): ${subjectFileNameFromDB}, Difficulty: ${examDifficultyApiValue}`);

    // Load prompt module using the subjectFileNameFromDB, as it's the key for specific configurations
    const customPromptModule = loadPromptModule(academicLevelName, trackName, subjectFileNameFromDB, 'exam');

    if (!customPromptModule) {
        // Log more details to help diagnose
        console.error(`[FULL_EXAM_SET_DATA_ERROR] Exam generation failed: Prompt module for Subject "${subjectFileNameFromDB}" (Level: ${academicLevelName}, Track: ${trackName}) not found.`);
        console.error(`Attempted to load with core subject: ${getCoreSubjectName(subjectFileNameFromDB)}`);
        throw new Error(`Exam generation failed: Prompt module for "${subjectFileNameFromDB}" not found.`);
    }

    const examConfig = customPromptModule.examConfig || {};
    let numberOfProblemsToGenerate;
    if (typeof examConfig.numberOfProblems === 'function') {
        numberOfProblemsToGenerate = examConfig.numberOfProblems({ academicLevelName, trackName, subjectName: subjectFileNameFromDB, difficulty: examDifficultyApiValue });
    } else {
        numberOfProblemsToGenerate = examConfig.numberOfProblems || 1; // Default to 1 if not specified
    }
    
    if (numberOfProblemsToGenerate <= 0) {
        console.warn(`[FULL_EXAM_SET_DATA_WARN] Number of problems to generate is ${numberOfProblemsToGenerate} for ${subjectFileNameFromDB}. Setting to 1.`);
        numberOfProblemsToGenerate = 1;
    }


    console.log(`[FULL_EXAM_SET_DATA_START] Using config for "${subjectFileNameFromDB}". Generating ${numberOfProblemsToGenerate} problems.`);

    // Load curriculum data using subjectFileNameFromDB
    const curriculumData = loadCurriculumData(academicLevelName, trackName, subjectFileNameFromDB, true); // true for exam curriculum
    let lessonsToGenerate = [];

    if (!curriculumData) {
        throw new Error(`Curriculum data not found for subject "${subjectFileNameFromDB}" (Level: ${academicLevelName}, Track: ${trackName}). Check file path and name.`);
    }

    const coreSubjectNameForLogic = getCoreSubjectName(subjectFileNameFromDB); // 'svt', 'pc', 'math' etc.

    if (Array.isArray(curriculumData)) {
        if (curriculumData.length === 0) {
            throw new Error(`Curriculum array for "${subjectFileNameFromDB}" is empty.`);
        }
        
        // --- *** بداية التعديل لمنطق SVT و PC *** ---
        if (coreSubjectNameForLogic === 'svt' && (trackName.toUpperCase() === 'SVT' || trackName.toUpperCase() === 'SM')) {
            console.log(`[SVT_EXAM_LOGIC] Applying special lesson selection for SVT (${trackName}).`);
            // Implement your specific SVT lesson selection logic here.
            // This is an example: select a subset of lessons randomly.
            // You might have chapters, units, or specific themes to pick from based on 'exam-curriculum-data/LEVEL/TRACK/svt.js'
            if (curriculumData.length < numberOfProblemsToGenerate) {
                console.warn(`[SVT_EXAM_LOGIC] Not enough unique lessons (${curriculumData.length}) in SVT curriculum for ${subjectFileNameFromDB} to generate ${numberOfProblemsToGenerate} problems. Using all available lessons and may repeat if necessary or generate fewer.`);
                lessonsToGenerate = [...curriculumData]; // Take all if fewer than needed
                // If you need exactly numberOfProblemsToGenerate and repetition is okay:
                // while (lessonsToGenerate.length < numberOfProblemsToGenerate && curriculumData.length > 0) {
                //    lessonsToGenerate.push(getRandomFromArray(curriculumData));
                // }
            } else {
                const shuffledLessons = [...curriculumData].sort(() => 0.5 - Math.random());
                lessonsToGenerate = shuffledLessons.slice(0, numberOfProblemsToGenerate);
            }
            if (lessonsToGenerate.length === 0 && curriculumData.length > 0) { // Fallback if custom logic failed but data exists
                 console.warn('[SVT_EXAM_LOGIC] SVT custom logic resulted in zero lessons, falling back to random selection from available data.');
                 const shuffledLessons = [...curriculumData].sort(() => 0.5 - Math.random());
                 lessonsToGenerate = shuffledLessons.slice(0, Math.min(numberOfProblemsToGenerate, curriculumData.length));
            }

        } else if (coreSubjectNameForLogic === 'pc' && (trackName.toUpperCase() === 'SM' || trackName.toUpperCase() === 'SPC' || trackName.toUpperCase() === 'SVT')) { // Added SVT as PC is common
            console.log(`[PC_EXAM_LOGIC] Applying special lesson selection for PC (${trackName}).`);
            // Implement your specific PC lesson selection logic here.
            // Example:
            if (curriculumData.length < numberOfProblemsToGenerate) {
                console.warn(`[PC_EXAM_LOGIC] Not enough unique lessons (${curriculumData.length}) in PC curriculum for ${subjectFileNameFromDB} to generate ${numberOfProblemsToGenerate} problems. Using all available lessons.`);
                lessonsToGenerate = [...curriculumData];
            } else {
                const shuffledLessons = [...curriculumData].sort(() => 0.5 - Math.random());
                lessonsToGenerate = shuffledLessons.slice(0, numberOfProblemsToGenerate);
            }
             if (lessonsToGenerate.length === 0 && curriculumData.length > 0) {
                 console.warn('[PC_EXAM_LOGIC] PC custom logic resulted in zero lessons, falling back to random selection.');
                 const shuffledLessons = [...curriculumData].sort(() => 0.5 - Math.random());
                 lessonsToGenerate = shuffledLessons.slice(0, Math.min(numberOfProblemsToGenerate, curriculumData.length));
            }
        // --- *** نهاية التعديل لمنطق SVT و PC *** ---
        } else {
            console.log(`[DEFAULT_ARRAY_LOGIC] Applying random lesson selection for subject: ${coreSubjectNameForLogic} (${subjectFileNameFromDB}).`);
            if (curriculumData.length < numberOfProblemsToGenerate) {
                 console.warn(`[DEFAULT_ARRAY_LOGIC] Not enough unique lessons (${curriculumData.length}) for ${subjectFileNameFromDB} to generate ${numberOfProblemsToGenerate} problems without repetition. Using all available unique lessons.`);
                 lessonsToGenerate = [...curriculumData]; // Use all unique lessons
                 // If repetition is allowed and strictly numberOfProblemsToGenerate is needed:
                 // while (lessonsToGenerate.length < numberOfProblemsToGenerate && curriculumData.length > 0) {
                 //    lessonsToGenerate.push(getRandomFromArray(curriculumData));
                 // }
            } else {
                const shuffledLessons = [...curriculumData].sort(() => 0.5 - Math.random());
                lessonsToGenerate = shuffledLessons.slice(0, numberOfProblemsToGenerate);
            }
        }

    } else if (typeof curriculumData === 'object' && curriculumData !== null && Object.keys(curriculumData).length > 0) {
        // This typically means the curriculum file itself is a single context/object rather than an array of lessons
        console.log(`[OBJECT_CURRICULUM_LOGIC] Treating curriculum as a single context for subject: ${coreSubjectNameForLogic} (${subjectFileNameFromDB}). Generating ${numberOfProblemsToGenerate} problems from this single context.`);
        // For each problem to generate, use the same curriculumData object as the "lesson" context
        for (let i = 0; i < numberOfProblemsToGenerate; i++) {
            lessonsToGenerate.push(curriculumData); // Push the same object multiple times
        }
    
    } else {
        throw new Error(`Curriculum data for "${subjectFileNameFromDB}" is in an unsupported format or is empty after loading. Type: ${typeof curriculumData}`);
    }

    if (lessonsToGenerate.length === 0) {
        console.error(`[FULL_EXAM_SET_DATA_ERROR] Failed to select ANY lessons/contexts for exam generation (Subject: ${subjectFileNameFromDB}, Core: ${coreSubjectNameForLogic}).`);
        console.error(`Curriculum data that was processed:`, curriculumData);
        console.error(`Number of problems that were intended: ${numberOfProblemsToGenerate}`);
        throw new Error(`Failed to select any lessons/context for exam generation (Subject: ${subjectFileNameFromDB}). Check curriculum data content, structure, and selection logic for ${coreSubjectNameForLogic}.`);
    }
    
    if (lessonsToGenerate.length < numberOfProblemsToGenerate) {
        console.warn(`[FULL_EXAM_SET_DATA_WARN] Selected ${lessonsToGenerate.length} lessons/contexts, but ${numberOfProblemsToGenerate} problems were requested for ${subjectFileNameFromDB}. The exam will have fewer problems.`);
    }


    console.log(`[FULL_EXAM_SET_DATA] Final list of ${lessonsToGenerate.length} lessons/contexts for generation (Targeting ${numberOfProblemsToGenerate} problems):`, 
        lessonsToGenerate.map((l, idx) =>  `${idx + 1}: ${l.titreLecon || `Context for ${coreSubjectNameForLogic}`}`)
    );
    
    const generatedProblemsDataArray = [];
    let problemIndex = 0; // This is the index for the problems in the exam
    // Iterate over the selected lessons/contexts to generate problems
    for (const lessonOrContext of lessonsToGenerate) {
        if (generatedProblemsDataArray.length >= numberOfProblemsToGenerate) break; // Stop if we've reached the target number

        try {
            console.log(`[FULL_EXAM_SET_DATA_ITERATION] Generating problem ${problemIndex + 1} using lesson/context: "${lessonOrContext.titreLecon || 'General Context'}"`);
            const problemData = await generateSingleAIProblemSetDataForLesson(
                academicLevelName, 
                trackName, 
                subjectFileNameFromDB, // Pass the full DB subject name
                examDifficultyApiValue, 
                lessonOrContext, // This is the specific lesson/context for this problem
                problemIndex
            );
            generatedProblemsDataArray.push(problemData);
            problemIndex++;
            if (problemIndex < lessonsToGenerate.length) { // Add delay only if there are more problems to generate
                 await delay(1500); 
            }
        } catch (error) {
            console.error(`[FULL_EXAM_SET_DATA_ITERATION_ERROR] Failed to generate problem for lesson/context "${lessonOrContext.titreLecon || 'General Context'}". Error: ${error.message}. Skipping this problem.`, error.stack ? error.stack.substring(0,500) : '');
            // Optionally, you could implement a retry here for the whole problem generation if desired
        }
    }

    if (generatedProblemsDataArray.length === 0) {
        throw new Error(`Failed to generate ANY valid problems for the exam (Subject: ${subjectFileNameFromDB}). Check AI generation steps and prompt configurations.`);
    }
    
    console.log(`[FULL_EXAM_SET_DATA_END] Successfully generated data for ${generatedProblemsDataArray.length} problems for subject "${subjectFileNameFromDB}".`);
    return generatedProblemsDataArray;
};

module.exports = {
    generateFullExamSetData,
    // generateSingleAIProblemSetDataForLesson, // Not typically exported unless used elsewhere directly
};