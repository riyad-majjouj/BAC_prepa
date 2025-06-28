// --- back-end/utils/aiGeneralQuestionGeneratorShared.js ---

require('dotenv').config();
const path = require('path');
const fs = require('fs');
const { jsonrepair } = require('jsonrepair');

// --- بداية التعديل: تحميل جميع مفاتيح API ---
const GEMINI_API_KEYS = Object.keys(process.env)
    .filter(key => key.startsWith('GEMINI_API_KEY_'))
    .sort() // للتأكد من الترتيب الصحيح (KEY_1, KEY_2, etc.)
    .map(key => process.env[key]);

if (GEMINI_API_KEYS.length === 0) {
    console.error("[AI_CORE_FATAL] No GEMINI_API_KEY_n keys found in .env file! AI functionalities will not work.");
} else {
    console.log(`[AI_CORE_INFO] Loaded ${GEMINI_API_KEYS.length} Gemini API keys.`);
}
// --- نهاية التعديل ---

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
    // console.log('[loadDynamicModule] Attempting to load from potential paths:', potentialPaths);
    for (const filePath of potentialPaths) {
        // console.log(`[loadDynamicModule] Checking path: ${filePath}`);
        if (fs.existsSync(filePath)) {
            // console.log(`[loadDynamicModule] Path exists: ${filePath}`);
            try {
                delete require.cache[require.resolve(filePath)];
                const data = require(filePath);
                // console.log(`[loadDynamicModule] Successfully loaded module from: ${path.relative(path.join(__dirname, '..'), filePath)}`);
                return data;
            } catch (e) {
                console.error(`[loadDynamicModule] FAILED TO REQUIRE FILE: ${filePath}. Error: ${e.message}`, e.stack);
                continue;
            }
        } else {
            // console.log(`[loadDynamicModule] Path does not exist: ${filePath}`);
        }
    }
    // console.warn('[loadDynamicModule] No module successfully loaded from any of the provided potential paths.');
    return null;
}

function getCoreSubjectName(subjectFileName) {
    if (!subjectFileName) return 'unknown';
    const name = subjectFileName.toLowerCase();
    const parts = name.split('_');
    let potentialCore = parts.length > 0 ? parts[parts.length - 1] : '';
    if (name.includes('physique-chimie') || name.includes('physique_chimie')) return 'pc';
    if (name.includes('sciencesdelavieetdelaterre') || name.includes('sciences_vie_terre')) return 'svt';
    if (name.includes('histoire_geographie') || name.includes('histoiregeo')) return 'history_geo';
    if (name.includes('tarbiyaislamia') || name.includes('islamic_edu') || name.includes('edu_islamic')) return 'islamic_edu';
    if (name.includes('philosophie') || name.includes('falsafa')) return 'philosophy';
    if (name.includes('english') || (potentialCore === 'english' && parts.length > 1) ) return 'english';
    if (name.includes('frensh') || name.includes('french') || name.includes('francais') || (potentialCore === 'french' && parts.length > 1) || (potentialCore === 'frensh' && parts.length > 1)) return 'french';
    if (name.includes('arabic') || name.includes('arabe') || (potentialCore === 'arabic' && parts.length > 1)) return 'arabic';
    if (name.includes('math') || potentialCore === 'math') return 'math';
    if (potentialCore === 'pc' && (name.includes('_pc') || name.endsWith('pc'))) return 'pc';
    if (potentialCore === 'svt' && (name.includes('_svt') || name.endsWith('svt'))) return 'svt';
    const knownCores = ['math', 'pc', 'svt', 'english', 'french', 'arabic', 'philosophy', 'history_geo', 'islamic_edu'];
    if (knownCores.includes(potentialCore) && parts.length > 1) {
        return potentialCore;
    }
    if (name.includes('pc') && !name.includes('spc_')) return 'pc';
    if (name.includes('svt') && !name.includes('svt_')) return 'svt';
    // console.warn(`[getCoreSubjectName] Could not determine a clear core subject for "${subjectFileName}". Defaulting to normalized last part or full normalized name: "${potentialCore || normalizeForPath(name)}"`);
    return potentialCore || normalizeForPath(name);
}

const loadCurriculumData = (academicLevelName, trackName, subjectFileName, forExam = false) => {
    const baseDir = forExam ? 'exam-curriculum-data' : 'curriculum-data';
    const basePath = path.join(__dirname, '..', baseDir);
    const coreSubjectFileNameForFile = `${getCoreSubjectName(subjectFileName)}.js`;
    const normalizedTrackName = normalizeForPath(trackName);
    const normalizedAcademicLevelName = normalizeForPath(academicLevelName);
    const potentialPaths = [
        path.join(basePath, normalizedAcademicLevelName.toUpperCase(), normalizedTrackName.toUpperCase(), coreSubjectFileNameForFile),
        path.join(basePath, normalizedAcademicLevelName.toUpperCase(), coreSubjectFileNameForFile),
    ];
    // console.log(`[loadCurriculumData] Attempting to load curriculum for [Lvl: ${academicLevelName}, Trk: ${trackName}, SubjFile: ${subjectFileName}, CoreFile: ${coreSubjectFileNameForFile}]. ForExam: ${forExam}`);
    return loadDynamicModule(potentialPaths);
};

function loadPromptModule(academicLevelName, trackName, subjectFileName, promptType) {
    const basePath = path.join(__dirname, '..', 'prompts');
    const coreSubjectFolder = getCoreSubjectName(subjectFileName); 
    const finalPromptFileName = `${promptType}Prompt.js`;
    const normalizedTrackName = normalizeForPath(trackName);
    const normalizedAcademicLevelName = normalizeForPath(academicLevelName);
    const potentialPaths = [
        path.join(basePath, normalizedAcademicLevelName.toUpperCase(), normalizedTrackName.toUpperCase(), coreSubjectFolder, finalPromptFileName),
        path.join(basePath, normalizedAcademicLevelName.toUpperCase(), coreSubjectFolder, finalPromptFileName),
    ];
    // console.log(`[loadPromptModule] Attempting to load prompt module for [Lvl: ${academicLevelName}, Trk: ${trackName}, SubjFile: ${subjectFileName}, CoreFolderResolved: ${coreSubjectFolder}, Type: ${promptType}]`);
    return loadDynamicModule(potentialPaths);
}

async function processStepOutput(rawAiResponseText, outputProcessor = null, context = {}) {
    let extractedText = '';
    try {
        try {
            const parsedResponse = JSON.parse(rawAiResponseText);
            extractedText = parsedResponse.candidates?.[0]?.content?.parts?.[0]?.text || rawAiResponseText;
        } catch (e) {
            extractedText = rawAiResponseText;
        }

        const markdownMatch = extractedText.match(/```(?:json)?\s*([\s\S]*?)\s*```/s);
        extractedText = markdownMatch ? markdownMatch[1].trim() : extractedText.trim();
        
        if (!extractedText) {
            console.error("[PROCESS_STEP_OUTPUT_ERROR] Extracted text for JSON repair is empty. Raw Response:", rawAiResponseText);
            throw new Error("Cannot process empty AI response for JSON output.");
        }

        const repairedJsonString = jsonrepair(extractedText);
        const stepOutputJson = JSON.parse(repairedJsonString);

        return outputProcessor ? await outputProcessor(stepOutputJson, context) : stepOutputJson;

    } catch (error) {
        console.error(`[PROCESS_STEP_OUTPUT_ERROR] Final JSON parsing/processing failed. Error: ${error.message}`);
        console.error("====================== RAW AI RESPONSE (CAUSING ERROR) ======================");
        console.error(rawAiResponseText);
        console.error("=========================================================================");
        const detailedError = new Error(`Failed to process AI response: ${error.message}. Review logs for raw AI output.`);
        detailedError.cause = error;
        throw detailedError;
    }
}

function extractCleanJsonString(text) {
    // console.warn("extractCleanJsonString is deprecated. Use processStepOutput. Attempting basic extraction for compatibility.");
    if (!text) return '{}';
    const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/s);
    if (match && match[1]) {
        return match[1].trim();
    }
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
        return text.substring(firstBrace, lastBrace + 1).trim();
    }
    return text.trim();
}

module.exports = {
    GEMINI_API_KEYS,
    buildGeminiApiUrl,
    getRandomFromArray,
    normalizeForPath,
    loadCurriculumData,
    extractCleanJsonString,
    loadPromptModule,
    getCoreSubjectName,
    processStepOutput
};