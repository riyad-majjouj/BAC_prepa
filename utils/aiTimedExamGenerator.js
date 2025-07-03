// --- back-end/utils/aiTimedExamGenerator.js ---

const mongoose = require('mongoose');
const AcademicLevel = require('../models/AcademicLevel');
const Track = require('../models/Track');
const Subject = require('../models/Subject');

const { 
    loadPromptModule, 
    loadCurriculumData, 
    processStepOutput,
    getCoreSubjectName 
} = require('./aiGeneralQuestionGeneratorShared');

const { fetchGeminiWithConfig } = require('./promptHelpers');

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function generateSingleAIProblemSetDataForLesson(
    index,
    academicLevelName,
    trackName,
    subjectNameFromDB,
    difficultyLevelApi,
    lessonObject
) {
    console.log(`[AI_SINGLE_PROBLEM_DATA_EXAM_GEN_START] Index ${index}, Subject: '${subjectNameFromDB}', Lesson: '${lessonObject.titreLecon || 'General Context'}'`);
    
    const customPromptModule = loadPromptModule(academicLevelName, trackName, subjectNameFromDB, 'exam');

    if (!customPromptModule) {
        throw new Error(`Exam prompt module not found for Subject: "${subjectNameFromDB}"`);
    }

    const promptOverallContext = {
        academicLevelName,
        trackName,
        subjectName: subjectNameFromDB,
        lesson: lessonObject,
        difficulty: difficultyLevelApi,
    };

    const accumulatedStepOutputs = {};
    for (const step of customPromptModule.steps) {
        let stepSuccess = false;
        let stepRetries = 0;
        const maxRetries = step.retries || 1;

        while (!stepSuccess && stepRetries <= maxRetries) {
            try {
                if (stepRetries > 0) {
                    console.log(`[AI_SINGLE_PROBLEM_DATA_EXAM_GEN_RETRY] Retrying step "${step.name}"...`);
                    await delay(1500 * stepRetries);
                }

                if (typeof step.processor === 'function') {
                    console.log(`[AI_SINGLE_PROBLEM_DATA_EXAM_STEP] Executing local processor step "${step.name}".`);
                    accumulatedStepOutputs[step.name] = await Promise.resolve(step.processor(promptOverallContext, accumulatedStepOutputs));
                } else if (typeof step.promptGenerator === 'function') {
                    const stepPromptText = step.promptGenerator(promptOverallContext, accumulatedStepOutputs);
                    const genConfig = step.generationConfig || customPromptModule.defaultGenerationConfig || {};
                    const modelType = customPromptModule.defaultModelType || 'gemini-1.5-flash-latest';
                    
                    console.log(`[AI_SINGLE_PROBLEM_DATA_EXAM_STEP] Executing AI step "${step.name}" with model "${modelType}".`);
                    const rawResponse = await fetchGeminiWithConfig(stepPromptText, genConfig, modelType);
                    accumulatedStepOutputs[step.name] = await processStepOutput(rawResponse, step.outputProcessor, promptOverallContext);
                } else {
                    throw new Error(`Step "${step.name}" is invalid: must have a 'processor' or 'promptGenerator'.`);
                }
                
                stepSuccess = true;
            } catch (error) {
                stepRetries++;
                console.error(`[AI_SINGLE_PROBLEM_DATA_EXAM_ERROR] Error in step "${step.name}": ${error.message}`);
                if (stepRetries > maxRetries) throw error;
            }
        }
    }

    if (typeof customPromptModule.finalAggregator !== 'function') {
        throw new Error(`finalAggregator function is missing for "${subjectNameFromDB}".`);
    }
    let generatedProblemData = await customPromptModule.finalAggregator(promptOverallContext, accumulatedStepOutputs);
    const mainText = generatedProblemData.problemText || generatedProblemData.text;

    if (!generatedProblemData || typeof mainText !== 'string' || !Array.isArray(generatedProblemData.subQuestions)) {
        throw new Error(`AI aggregator for "${subjectNameFromDB}" did not return a valid problem data object.`);
    }
    if (generatedProblemData.problemText) {
        generatedProblemData.text = generatedProblemData.problemText;
        delete generatedProblemData.problemText;
    }

    return {
        ...generatedProblemData,
        problemId: new mongoose.Types.ObjectId().toString(),
        orderInExam: index + 1,
        subQuestions: generatedProblemData.subQuestions.map(sq => ({ ...sq, type: sq.question_format || 'free_text' }))
    };
}

const generateFullExamSetData = async (academicLevelId, trackId, subjectId, examDifficultyApiValue) => {
    const [levelDoc, trackDoc, subjectDoc] = await Promise.all([
        AcademicLevel.findById(academicLevelId).select('name').lean(),
        Track.findById(trackId).select('name').lean(),
        Subject.findById(subjectId).select('name').lean()
    ]);

    if (!levelDoc || !trackDoc || !subjectDoc) {
        throw new Error('Academic entities not found.');
    }
    
    const academicLevelName = levelDoc.name;
    const trackName = trackDoc.name;
    const subjectFileNameFromDB = subjectDoc.name;

    console.log(`[FULL_EXAM_SET_DATA_INIT] Level: ${academicLevelName}, Track: ${trackName}, Subject (DB Name): ${subjectFileNameFromDB}, Difficulty: ${examDifficultyApiValue}`);

    const customPromptModule = loadPromptModule(academicLevelName, trackName, subjectFileNameFromDB, 'exam');
    if (!customPromptModule) {
        throw new Error(`Exam prompt module for "${subjectFileNameFromDB}" not found.`);
    }

    const curriculumData = loadCurriculumData(academicLevelName, trackName, subjectFileNameFromDB, true);
    if (!curriculumData || curriculumData.length === 0) {
        throw new Error(`Curriculum data not found or is empty for "${subjectFileNameFromDB}".`);
    }

    const numberOfProblemsToGenerate = typeof customPromptModule.examConfig?.numberOfProblems === 'function' 
        ? customPromptModule.examConfig.numberOfProblems() 
        : customPromptModule.examConfig?.numberOfProblems || 1;
        
    console.log(`[FULL_EXAM_SET_DATA_START] Using config for "${subjectFileNameFromDB}". Generating ${numberOfProblemsToGenerate} problems.`);

    const lessonsToGenerate = Array.isArray(curriculumData) 
        ? [...curriculumData].sort(() => 0.5 - Math.random()).slice(0, numberOfProblemsToGenerate)
        : Array(numberOfProblemsToGenerate).fill(curriculumData);
    
    console.log(`[FULL_EXAM_SET_DATA] Selected ${lessonsToGenerate.length} lessons for generation.`);
    
    const generatedProblemsDataArray = [];
    for (let i = 0; i < lessonsToGenerate.length; i++) {
        try {
            console.log(`[FULL_EXAM_SET_DATA_ITERATION] Generating problem ${i + 1} for lesson: "${lessonsToGenerate[i].titreLecon || 'General Context'}"...`);
            const problemData = await generateSingleAIProblemSetDataForLesson(
                i, academicLevelName, trackName, subjectFileNameFromDB, examDifficultyApiValue, lessonsToGenerate[i]
            );
            generatedProblemsDataArray.push(problemData);
        } catch (error) {
            console.error(`[FULL_EXAM_SET_DATA_ITERATION_ERROR] Failed to generate problem ${i + 1}. Error: ${error.message}. Skipping.`);
        }
    }

    if (generatedProblemsDataArray.length === 0) {
        throw new Error(`Failed to generate ANY valid problems for the exam.`);
    }
    
    console.log(`[FULL_EXAM_SET_DATA_END] Successfully generated data for ${generatedProblemsDataArray.length} problems.`);
    return generatedProblemsDataArray;
};

module.exports = {
    generateFullExamSetData,
};