// back-end/utils/aiGeneralQuestionGeneratorShared.js
require('dotenv').config();
const path = require('path');
const fs = require('fs');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
let geminiApiUrl; // سيتم تعيينها بناءً على نوع النموذج المطلوب (Flash أو Pro)

if (!GEMINI_API_KEY) {
    console.error("[AI_CORE_FATAL] GEMINI_API_KEY is missing! AI functionalities will not work.");
}

// دالة لتعيين URL بناءً على نوع النموذج المطلوب
const setGeminiApiUrl = (modelType = 'flash') => { // افتراضيًا flash
    if (GEMINI_API_KEY) {
        if (modelType === 'pro') {
            geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;
        } else { // flash or default
            geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;
        }
    }
    return geminiApiUrl;
};
setGeminiApiUrl();


function getRandomFromArray(arr) {
    if (!arr || arr.length === 0) return null;
    return arr[Math.floor(Math.random() * arr.length)];
}

function normalizeForPath(name) {
    if (!name) return '';
    return name.toString().toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/ال_/g, '')
        .replace(/[àáâãäåā]/g, 'a')
        .replace(/[éèêëēęė]/g, 'e')
        .replace(/[îïīįı]/g, 'i')
        .replace(/[ôöòóōǫő]/g, 'o')
        .replace(/[ùûüūųů]/g, 'u')
        .replace(/[çćč]/g, 'c')
        .replace(/[ñń]/g, 'n')
        .replace(/æ/g, 'ae')
        .replace(/œ/g, 'oe')
        .replace(/[^a-z0-9_.\-]/gi, '');
}


const loadCurriculumData = (academicLevelNameDB, trackNameDB, subjectNameFromDB) => {
    // console.log(`[Curriculum Load Attempt] Original DB inputs: Level='${academicLevelNameDB}', Track='${trackNameDB}', Subject='${subjectNameFromDB}'`);
    const basePath = path.join(__dirname, '..', 'curriculum-data');
    let curriculumFilePath = null;
    let curriculumData = null;

    const normLevelDB = normalizeForPath(academicLevelNameDB); // e.g., "1bac"
    const normTrackDB = normalizeForPath(trackNameDB);     // e.g., "sx-sm"
    // subjectNameFromDB is expected to be like "1BAC_SX-SM_frensh" or "1BAC_SX-SM_history_geo"
    // normFullSubjectFromDB would be "1bac_sx-sm_frensh" or "1bac_sx-sm_history_geo"
    const normFullSubjectFromDB = normalizeForPath(subjectNameFromDB);

    // The following actualNormSubjectPart calculation might be used by 2BAC or Concours,
    // but for 1BAC, we will construct the path more directly.
    let actualNormSubjectPart = normFullSubjectFromDB;
    if (normLevelDB.startsWith("2bac") && normTrackDB && normFullSubjectFromDB.startsWith(`2bac_${normTrackDB}_`)) {
        actualNormSubjectPart = normFullSubjectFromDB.substring(`2bac_${normTrackDB}_`.length);
    } else if (normLevelDB.startsWith("1bac") && normFullSubjectFromDB.startsWith("1bac_")) {
        actualNormSubjectPart = normFullSubjectFromDB.substring("1bac_".length);
    } else if (normLevelDB.includes("concours") && normTrackDB && normFullSubjectFromDB.startsWith(`${normTrackDB}_`)) {
        actualNormSubjectPart = normFullSubjectFromDB.substring(normTrackDB.length + 1);
    } else if (normLevelDB.startsWith("1bac") && normTrackDB === "sx-sm") {
        // This mapping is for a different type of input for subjectNameFromDB (e.g. Arabic names)
        // and might not be hit if subjectNameFromDB is already "1BAC_SX-SM_arabic".
        const mapping1BacSxSm = {
            "attarikh_w_aljghrafia": "geo_history",
            "attarbia_al'islamia": "islamic_edu",
            "allugha_alearabia": "arabic",
            "allugha_alfransia": "frensh" // Corrected typo from "fresh"
        };
        if (mapping1BacSxSm[actualNormSubjectPart]) {
            actualNormSubjectPart = mapping1BacSxSm[actualNormSubjectPart];
        }
    }
    // console.log(`[Curriculum Load DEBUG] normLevelDB: '${normLevelDB}', normTrackDB: '${normTrackDB}', subjectNameFromDB: '${subjectNameFromDB}', actualNormSubjectPart: '${actualNormSubjectPart}'`);


    // Path construction logic
    if (normLevelDB.includes("concours") && normTrackDB) {
        const schoolFolderForPath = normTrackDB.toUpperCase();
        const concoursSubjectFile = `${schoolFolderForPath}_${actualNormSubjectPart}.js`;
        curriculumFilePath = path.join(basePath, 'CONCOURS', schoolFolderForPath, concoursSubjectFile);
    } 
    // ---- START MODIFIED BLOCK FOR 1BAC ----
    else if (normLevelDB === '1bac' && trackNameDB) { // Specific handling for 1BAC
        const levelFolderFromFileSystem = "1BAC"; // Folder name as in file system ("1BAC")
        const trackFolderFromFileSystem = trackNameDB.toUpperCase(); // e.g., "SX-SM" (ensure uppercase)
        
        let filenameStem = subjectNameFromDB; // Default uses the exact subjectNameFromDB from parameters

        // Apply specific transformations to filenameStem if subjectNameFromDB indicates a known mapping
        // This is crucial for cases like "history_geo" in DB vs "geo_history" in filename.
        if (subjectNameFromDB === "1BAC_SX-SM_history_geo") {
            filenameStem = "1BAC_SX-SM_geo_history";
        }
        // Add other similar mappings here if the subjectNameFromDB (database key)
        // differs from the filename stem for other 1BAC subjects/tracks.
        // Example:
        // else if (subjectNameFromDB === "1BAC_PC_Physique") {
        //     filenameStem = "1BAC_PC_physic"; // If filename was different
        // }

        const subjectFile = `${filenameStem}.js`;
        curriculumFilePath = path.join(basePath, levelFolderFromFileSystem, trackFolderFromFileSystem, subjectFile);
        // console.log(`[Curriculum Load 1BAC Specific] Attempting path: ${curriculumFilePath}`);
    // ---- END MODIFIED BLOCK FOR 1BAC ----
    } else if (normLevelDB.startsWith('2bac')) {
        // This is the existing 2BAC logic, ensure it's not unintentionally broken.
        const trackFolderForPath = `2bac_${normTrackDB}`;
        // For common subjects in 2BAC (English, Philosophy)
        if (['english', 'anglais', 'philosophy', 'philosophie'].includes(actualNormSubjectPart)) {
            let commonSubjectFile = `2bac_${actualNormSubjectPart}.js`;
            if (actualNormSubjectPart === "anglais") commonSubjectFile = "2bac_english.js";
            if (actualNormSubjectPart === "philosophie") commonSubjectFile = "2bac_philosophy.js";

            let commonSubjectPath = path.join(basePath, '2BAC', commonSubjectFile);
            
            if (fs.existsSync(commonSubjectPath)) {
                curriculumFilePath = commonSubjectPath;
            } else {
                 const trackSpecificFile = `${trackFolderForPath}_${actualNormSubjectPart}.js`;
                 curriculumFilePath = path.join(basePath, '2BAC', trackFolderForPath, trackSpecificFile);
            }
        } else if (normTrackDB) { // For other track-specific 2BAC subjects
            const subjectFile = `${trackFolderForPath}_${actualNormSubjectPart}.js`;
            curriculumFilePath = path.join(basePath, '2BAC', trackFolderForPath, subjectFile);
        }
    }
    // Fallback or other levels if not covered above (though the request was specific to 1BAC)
    // The original generic `else if (normLevelDB.startsWith('1bac'))` block is now replaced by the more specific one.

    if (curriculumFilePath) {
        // console.log(`[Curriculum Load Attempt] FINAL Trying path: ${curriculumFilePath}`);
        if (fs.existsSync(curriculumFilePath)) {
            try {
                delete require.cache[require.resolve(curriculumFilePath)];
                curriculumData = require(curriculumFilePath);
                // console.log(`[Curriculum Load Success] Loaded curriculum from: ${curriculumFilePath}. Data type: ${typeof curriculumData}, IsArray: ${Array.isArray(curriculumData)}, Length: ${Array.isArray(curriculumData) ? curriculumData.length : 'N/A'}`);
                
                // For 1BAC, we expect the curriculumData to be the direct content of the file.
                // It might not always be an array (e.g., if a file exports a string or object).
                // The check `!Array.isArray(curriculumData) || curriculumData.length === 0`
                // is more relevant for other levels where an array of lessons is expected.
                // For 1BAC, as per previous file, the raw `curriculumData` is used.
                if (normLevelDB !== '1bac' && (!Array.isArray(curriculumData) || curriculumData.length === 0)) {
                     console.warn(`[Curriculum Load Warn] For non-1BAC level, curriculum data from ${curriculumFilePath} is not a non-empty array.`);
                } else if (normLevelDB === '1bac' && curriculumData === null) { // Or undefined
                     console.warn(`[Curriculum Load Warn] For 1BAC, curriculum data from ${curriculumFilePath} is null or undefined.`);
                }

            } catch (e) {
                console.error(`[Curriculum Load Error] Failed to require file: ${curriculumFilePath}`, e.message, e.stack);
                curriculumData = null;
            }
        } else {
            // console.warn(`[Curriculum Load Warn] File not found: ${curriculumFilePath}`);
        }
    } else {
        // console.warn(`[Curriculum Load Warn] Could not determine curriculum file path for Level='${academicLevelNameDB}', Track='${trackNameDB}', Subject='${subjectNameFromDB}'`);
    }
    return curriculumData;
};


/**
 * Extracts and cleans a JSON string from AI response,
 * handling potential markdown blocks or direct JSON.
 * @param {string} rawText - The raw text from AI response.
 * @returns {string} The cleaned JSON string.
 * @throws {Error} If no valid JSON content can be extracted.
 */
function extractCleanJsonString(rawText) {
    if (!rawText || typeof rawText !== 'string' || rawText.trim() === '') {
        throw new Error("Raw text from AI is empty or not a string.");
    }
    const text = rawText.trim();
    
    const markdownMatch = text.match(/```json\s*([\s\S]*?)\s*```/s);
    if (markdownMatch && markdownMatch[1]) {
        return markdownMatch[1].trim();
    }

    if (text.startsWith("{") && text.endsWith("}")) {
        try {
            JSON.parse(text); 
            return text;
        } catch (e) {
            console.error(`[extractCleanJsonString] Raw text starts/ends with braces but is not valid JSON: ${e.message}. Text (start): ${text.substring(0,100)}`);
            throw new Error(`Raw text looks like JSON but is invalid: ${e.message}. Text (start): ${text.substring(0,100)}`);
        }
    }
    
    console.error(`[extractCleanJsonString] Could not extract a clean JSON string. No markdown block and not a direct JSON object. Raw text (start): ${text.substring(0,200)}`);
    throw new Error(`Could not extract a clean JSON string from AI response. Raw text (start): ${text.substring(0,200)}`);
}


module.exports = {
    GEMINI_API_KEY,
    geminiApiUrl,
    setGeminiApiUrl,
    getRandomFromArray,
    normalizeForPath,
    loadCurriculumData,
    extractCleanJsonString,
};