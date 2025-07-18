// --- back-end/utils/aiGeneralQuestionGeneratorShared.js ---

require('dotenv').config();
const path = require('path');
const fs = require('fs');
const { jsonrepair } = require('jsonrepair');

// ملاحظة: تم نقل منطق تحميل مفاتيح API إلى promptHelpers.js لتبسيط الأمور

/**
 * دالة مساعدة لإنشاء رابط API باستخدام مفتاح معين.
 * @param {string} apiKey - مفتاح الـ API المراد استخدامه.
 * @param {string} modelName - اسم النموذج (e.g., 'gemini-1.5-flash-latest').
 * @returns {string|null} - رابط الـ API الكامل أو null إذا لم يكن هناك مفتاح.
 */
const buildGeminiApiUrl = (apiKey, modelName = 'gemini-1.5-flash-latest') => {
    if (!apiKey) return null;
    return `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
};

function getRandomFromArray(arr) {
    if (!arr || arr.length === 0) return null;
    return arr[Math.floor(Math.random() * arr.length)];
}

function normalizeForPath(name) {
    if (!name) return '';
    return name.toString().toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/\\/g, '_')
        .replace(/\//g, '_')
        .replace(/[àáâãäåā]/g, 'a').replace(/[éèêëēęė]/g, 'e').replace(/[îïīįı]/g, 'i')
        .replace(/[ôöòóōǫő]/g, 'o').replace(/[ùûüūųůg]/g, 'u').replace(/[çćč]/g, 'c')
        .replace(/[ñń]/g, 'n').replace(/æ/g, 'ae').replace(/œ/g, 'oe')
        .replace(/[^a-z0-9_.\-]/gi, '');
}

function loadDynamicModule(potentialPaths) {
    for (const filePath of potentialPaths) {
        if (fs.existsSync(filePath)) {
            try {
                delete require.cache[require.resolve(filePath)];
                const data = require(filePath);
                return data;
            } catch (e) {
                console.error(`[loadDynamicModule] FAILED TO REQUIRE FILE: ${filePath}. Error: ${e.message}`, e.stack);
                continue;
            }
        }
    }
    return null;
}

function getCoreSubjectName(subjectFileName) {
    if (!subjectFileName) return 'unknown';
    const name = subjectFileName.toLowerCase();
    const parts = name.split('_');
    let potentialCore = parts.length > 0 ? parts[parts.length - 1] : '';

    if (name.includes('physique-chimie') || name.includes('physique_chimie')) return 'pc';
    if (name.includes('sciencesdelavieetdelaterre') || name.includes('sciences_vie_terre')) return 'svt';
    if (name.includes('geo_history') || name.includes('histoire_geographie') || name.includes('histoiregeo')) return 'history_geo';
    if (name.includes('tarbiyaislamia') || name.includes('islamic_edu') || name.includes('edu_islamic')) return 'islamic_edu';
    if (name.includes('philosophie') || name.includes('falsafa')) return 'philosophy';
    if (name.includes('english')) return 'english';
    if (name.includes('frensh') || name.includes('french') || name.includes('francais')) return 'french';
    if (name.includes('arabic') || name.includes('arabe')) return 'arabic';
    if (name.includes('math')) return 'math';

    const knownCores = ['math', 'pc', 'svt', 'english', 'french', 'arabic', 'philosophy', 'history_geo', 'islamic_edu'];
    if (knownCores.includes(potentialCore)) {
        return potentialCore;
    }
    return potentialCore || normalizeForPath(name);
}

const loadCurriculumData = (academicLevelName, trackName, subjectFileName, forExam = false) => {
    const baseDir = forExam ? 'exam-curriculum-data' : 'curriculum-data';
    const basePath = path.join(__dirname, '..', baseDir);
    const coreSubjectFileNameForFile = `${getCoreSubjectName(subjectFileName)}.js`;
    
    // استخدام أسماء المجلدات مباشرة كما هي في النظام
    const finalLevelName = academicLevelName.toUpperCase();
    const finalTrackName = trackName.toUpperCase();

    const potentialPaths = [
        path.join(basePath, finalLevelName, finalTrackName, coreSubjectFileNameForFile),
        path.join(basePath, finalLevelName, coreSubjectFileNameForFile),
    ];
    return loadDynamicModule(potentialPaths);
};

function loadPromptModule(academicLevelName, trackName, subjectFileName, promptType) {
    const basePath = path.join(__dirname, '..', 'prompts');
    const coreSubjectFolder = getCoreSubjectName(subjectFileName); 
    const finalPromptFileName = `${promptType}Prompt.js`;

    const finalLevelName = academicLevelName.toUpperCase();
    const finalTrackName = trackName.toUpperCase();

    const potentialPaths = [
        path.join(basePath, finalLevelName, finalTrackName, coreSubjectFolder, finalPromptFileName),
        path.join(basePath, finalLevelName, coreSubjectFolder, finalPromptFileName),
    ];
    return loadDynamicModule(potentialPaths);
}

async function processStepOutput(rawAiResponseText, outputProcessor = null, context = {}) {
    if (!rawAiResponseText || typeof rawAiResponseText !== 'string' || rawAiResponseText.trim() === '') {
        throw new Error("Cannot process empty or invalid AI response.");
    }
    let jsonString = rawAiResponseText.trim();
    try {
        const markdownMatch = jsonString.match(/```(?:json)?\s*([\s\S]*?)\s*```/s);
        jsonString = markdownMatch ? markdownMatch[1].trim() : jsonString;
        const repairedJsonString = jsonrepair(jsonString);
        const stepOutputJson = JSON.parse(repairedJsonString);
        return outputProcessor ? await outputProcessor(stepOutputJson, context) : stepOutputJson;
    } catch (error) {
        console.error(`[PROCESS_STEP_OUTPUT_ERROR] Final JSON parsing/processing failed. Raw: ${rawAiResponseText}`);
        throw new Error(`Failed to process AI response: ${error.message}.`);
    }
}

function extractCleanJsonString(text) {
    if (!text) return '{}';
    const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/s);
    return match ? match[1].trim() : text.trim();
}

module.exports = {
    buildGeminiApiUrl,
    getRandomFromArray,
    normalizeForPath,
    loadCurriculumData,
    extractCleanJsonString,
    loadPromptModule,
    getCoreSubjectName,
    processStepOutput
};