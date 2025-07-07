// --- back-end/utils/aiTimedExamGenerator.js ---

const mongoose = require('mongoose');
const AcademicLevel = require('../models/AcademicLevel');
const Track = require('../models/Track');
const Subject = require('../models/Subject');

const { 
    loadPromptModule, 
    loadCurriculumData, 
    processStepOutput,
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
    console.log(`[AI_PROBLEM_GEN] Starting generation for problem #${index + 1}, Lesson: '${lessonObject.titreLecon || 'General'}'`);
    
    const customPromptModule = loadPromptModule(academicLevelName, trackName, subjectNameFromDB, 'exam');
    if (!customPromptModule) throw new Error(`Exam prompt module not found for Subject: "${subjectNameFromDB}"`);

    const promptOverallContext = { academicLevelName, trackName, subjectName: subjectNameFromDB, lesson: lessonObject, difficulty: difficultyLevelApi };

    const accumulatedStepOutputs = {};
    for (const step of customPromptModule.steps) {
        let stepSuccess = false;
        let stepRetries = 0;
        const maxRetries = step.retries || 1;
        while (!stepSuccess && stepRetries <= maxRetries) {
            try {
                if (stepRetries > 0) {
                    console.log(`[AI_RETRY] Retrying step "${step.name}"...`);
                    await delay(1500 * stepRetries);
                }

                if (typeof step.processor === 'function') {
                    accumulatedStepOutputs[step.name] = await Promise.resolve(step.processor(promptOverallContext, accumulatedStepOutputs));
                } else if (typeof step.promptGenerator === 'function') {
                    const stepPromptText = step.promptGenerator(promptOverallContext, accumulatedStepOutputs);
                    const genConfig = step.generationConfig || customPromptModule.defaultGenerationConfig || {};
                    const modelType = customPromptModule.defaultModelType || 'gemini-1.5-flash-latest';
                    const rawResponse = await fetchGeminiWithConfig(stepPromptText, genConfig, modelType);
                    accumulatedStepOutputs[step.name] = await processStepOutput(rawResponse, step.outputProcessor, promptOverallContext);
                }
                stepSuccess = true;
            } catch (error) {
                stepRetries++;
                console.error(`[AI_ERROR] Step "${step.name}" failed: ${error.message}`);
                if (stepRetries > maxRetries) throw error;
            }
        }
    }

    if (typeof customPromptModule.finalAggregator !== 'function') {
        throw new Error(`finalAggregator function is missing for "${subjectNameFromDB}".`);
    }
    
    // The aggregator now returns the full problem object
    const generatedProblemData = await customPromptModule.finalAggregator(promptOverallContext, accumulatedStepOutputs);

    // [CORRECTED] Validate the final problem structure
    if (!generatedProblemData || !Array.isArray(generatedProblemData.problemItems)) {
        throw new Error(`AI aggregator for "${subjectNameFromDB}" did not return a valid problem object with 'problemItems'.`);
    }

    return {
        problemId: new mongoose.Types.ObjectId().toString(),
        orderInExam: index + 1,
        problemTitle: generatedProblemData.problemTitle,
        problemItems: generatedProblemData.problemItems,
        problemTotalPossibleRawScore: generatedProblemData.problemTotalPossibleRawScore,
    };
}

const generateFullExamSetData = async (academicLevelId, trackId, subjectId, examDifficultyApiValue) => {
    const [levelDoc, trackDoc, subjectDoc] = await Promise.all([
        AcademicLevel.findById(academicLevelId).select('name').lean(),
        Track.findById(trackId).select('name').lean(),
        Subject.findById(subjectId).select('name').lean()
    ]);

    if (!levelDoc || !trackDoc || !subjectDoc) throw new Error('Academic entities not found.');
    
    const { name: academicLevelName } = levelDoc;
    const { name: trackName } = trackDoc;
    const { name: subjectFileNameFromDB } = subjectDoc;

    console.log(`[FULL_EXAM_INIT] For: ${academicLevelName}, ${trackName}, ${subjectFileNameFromDB}`);

    const customPromptModule = loadPromptModule(academicLevelName, trackName, subjectFileNameFromDB, 'exam');
    if (!customPromptModule) throw new Error(`Exam prompt module for "${subjectFileNameFromDB}" not found.`);

    const curriculumData = loadCurriculumData(academicLevelName, trackName, subjectFileNameFromDB, true);
    if (!curriculumData || curriculumData.length === 0) throw new Error(`Curriculum data is empty for "${subjectFileNameFromDB}".`);

    const numberOfProblems = typeof customPromptModule.examConfig?.numberOfProblems === 'function' 
        ? customPromptModule.examConfig.numberOfProblems() 
        : customPromptModule.examConfig?.numberOfProblems || 1;
        
    const lessonsToGenerate = Array.isArray(curriculumData) 
        ? [...curriculumData].sort(() => 0.5 - Math.random()).slice(0, numberOfProblems)
        : Array(numberOfProblems).fill(curriculumData);
    
    console.log(`[FULL_EXAM_START] Generating ${lessonsToGenerate.length} problems.`);
    
    const generatedProblemsDataArray = [];
    for (let i = 0; i < lessonsToGenerate.length; i++) {
        try {
            const problemData = await generateSingleAIProblemSetDataForLesson(
                i, academicLevelName, trackName, subjectFileNameFromDB, examDifficultyApiValue, lessonsToGenerate[i]
            );
            generatedProblemsDataArray.push(problemData);
        } catch (error) {
            console.error(`[FULL_EXAM_ERROR] Failed to generate problem ${i + 1}. Skipping. Error: ${error.message}`);
        }
    }

    if (generatedProblemsDataArray.length === 0) {
        throw new Error(`Failed to generate any valid problems for the exam.`);
    }
    
    console.log(`[FULL_EXAM_SUCCESS] Successfully generated data for ${generatedProblemsDataArray.length} problems.`);
    return generatedProblemsDataArray;
};

module.exports = {
    generateFullExamSetData,
};