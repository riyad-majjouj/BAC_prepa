require('dotenv').config();
const path = require('path');
const fs = require('fs');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
let geminiApiUrl;

if (!GEMINI_API_KEY) {
    console.error("[AI_CORE_FATAL] GEMINI_API_KEY is missing! AI functionalities will not work.");
}

const setGeminiApiUrl = (modelName = 'gemini-1.5-flash-latest') => {
    if (GEMINI_API_KEY) {
        geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`;
    }
    return geminiApiUrl;
};
setGeminiApiUrl();

function getRandomFromArray(arr) {
    if (!arr || arr.length === 0) return null;
    return arr[Math.floor(Math.random() * arr.length)];
}
// ... (بداية الملف كما هي) ...

function normalizeForPath(name) {
    if (!name) return '';
    return name.toString().toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/\\/g, '_')
        .replace(/\//g, '_')
        .replace(/[àáâãäåā]/g, 'a').replace(/[éèêëēęė]/g, 'e').replace(/[îïīįı]/g, 'i')
        .replace(/[ôöòóōǫő]/g, 'o').replace(/[ùûüūųů]/g, 'u').replace(/[çćč]/g, 'c')
        .replace(/[ñń]/g, 'n').replace(/æ/g, 'ae').replace(/œ/g, 'oe')
        .replace(/[^a-z0-9_.\-]/gi, '');
}

function loadDynamicModule(potentialPaths) {
    // ... (هذه الدالة تبقى كما هي من التعديل السابق) ...
    console.log('[loadDynamicModule] Attempting to load from potential paths:', potentialPaths);
    for (const filePath of potentialPaths) {
        console.log(`[loadDynamicModule] Checking path: ${filePath}`);
        if (fs.existsSync(filePath)) {
            console.log(`[loadDynamicModule] Path exists: ${filePath}`);
            try {
                delete require.cache[require.resolve(filePath)];
                const data = require(filePath);
                console.log(`[loadDynamicModule] Successfully loaded module from: ${path.relative(path.join(__dirname, '..'), filePath)}`);
                return data;
            } catch (e) {
                console.error(`[loadDynamicModule] FAILED TO REQUIRE FILE: ${filePath}. Error: ${e.message}`, e.stack);
                continue;
            }
        } else {
            console.log(`[loadDynamicModule] Path does not exist: ${filePath}`);
        }
    }
    console.warn('[loadDynamicModule] No module successfully loaded from any of the provided potential paths.');
    return null;
}

// --- *** بداية التعديل الجذري لـ getCoreSubjectName *** ---
function getCoreSubjectName(subjectFileName) {
    if (!subjectFileName) return 'unknown';
    const name = subjectFileName.toLowerCase();

    // 1. محاولة استخلاص اسم المادة الأساسي من نمط مثل "LEVEL_TRACK_CORESUBJECT" أو "LEVEL_CORESUBJECT"
    const parts = name.split('_');
    let potentialCore = '';
    if (parts.length > 0) {
        potentialCore = parts[parts.length - 1]; // الجزء الأخير غالبًا هو اسم المادة الأساسي
    }

    // 2. قائمة بالأسماء الأساسية المعروفة وفحص إذا كان الجزء المستخلص يطابق أحدها
    //    أو إذا كان اسم المادة الكامل يحتوي على كلمة مفتاحية مميزة (مع إعطاء الأولوية للكلمات الأقل شيوعًا أولاً إذا كان هناك تداخل)
    
    // الأولوية للكلمات المفتاحية الواضحة التي لا تتداخل كثيرًا
    if (name.includes('physique-chimie') || name.includes('physique_chimie')) return 'pc';
    if (name.includes('sciencesdelavieetdelaterre') || name.includes('sciences_vie_terre')) return 'svt';
    if (name.includes('histoire_geographie') || name.includes('histoiregeo')) return 'history_geo';
    if (name.includes('tarbiyaislamia') || name.includes('islamic_edu') || name.includes('edu_islamic')) return 'islamic_edu';
    if (name.includes('philosophie') || name.includes('falsafa')) return 'philosophy';
    if (name.includes('english') || (potentialCore === 'english' && parts.length > 1) ) return 'english';
    if (name.includes('frensh') || name.includes('french') || name.includes('francais') || (potentialCore === 'french' && parts.length > 1) || (potentialCore === 'frensh' && parts.length > 1)) return 'french';
    if (name.includes('arabic') || name.includes('arabe') || (potentialCore === 'arabic' && parts.length > 1)) return 'arabic';

    // كلمات مفتاحية قد تكون جزءًا من كلمات أخرى، لذا تأتي لاحقًا أو تحتاج لشروط أدق
    // أو إذا كان potentialCore يطابقها بشكل مباشر
    if (name.includes('math') || potentialCore === 'math') return 'math'; // 'math' is quite distinct
    
    // 'pc' و 'svt' إذا لم يتم العثور عليها بالأسماء الكاملة أعلاه
    // يجب أن يكون هذا الفحص أكثر حذرًا لتجنب الالتقاط الخاطئ من المسار (track)
    // على سبيل المثال، إذا كان المسار 'spc', لا نريد أن نلتقط 'pc' كاسم مادة إذا كانت المادة الفعلية هي 'english'
    
    // إذا كان اسم الملف الكامل هو '2bac_spc_english', potentialCore هو 'english'.
    // إذا كان اسم الملف الكامل هو '2bac_spc_pc', potentialCore هو 'pc'.

    if (potentialCore === 'pc' && (name.includes('_pc') || name.endsWith('pc'))) return 'pc';
    if (potentialCore === 'svt' && (name.includes('_svt') || name.endsWith('svt'))) return 'svt';


    // إذا لم ينجح أي مما سبق، استخدم الجزء المستخلص إذا كان منطقيًا،
    // أو النسخة المعيارية من اسم الملف الكامل كحل أخير.
    const knownCores = ['math', 'pc', 'svt', 'english', 'french', 'arabic', 'philosophy', 'history_geo', 'islamic_edu'];
    if (knownCores.includes(potentialCore) && parts.length > 1) { // parts.length > 1 لتجنب أخذ اسم مستوى/مسار فقط
        return potentialCore;
    }
    
    // كحل أخير جدًا، إذا كان الاسم يحتوي على كلمة مفتاحية ولكن لم يتم التقاطها (لأنها ربما جزء من المسار)
    // هذا الجزء يحتاج إلى حذر شديد
    if (name.includes('pc') && !name.includes('spc_')) return 'pc'; // محاولة لتجنب التقاط 'pc' من 'spc' إذا لم يكن هو المادة
    if (name.includes('svt') && !name.includes('svt_')) return 'svt';// محاولة لتجنب التقاط 'svt' من المسار 'svt' إذا لم يكن هو المادة


    console.warn(`[getCoreSubjectName] Could not determine a clear core subject for "${subjectFileName}". Defaulting to normalized last part or full normalized name: "${potentialCore || normalizeForPath(name)}"`);
    return potentialCore || normalizeForPath(name); // إذا فشل كل شيء، أرجع الجزء الأخير المعياري أو الاسم المعياري بالكامل
}
// --- *** نهاية التعديل الجذري لـ getCoreSubjectName *** ---


const loadCurriculumData = (academicLevelName, trackName, subjectFileName, forExam = false) => {
    // ... (هذه الدالة تبقى كما هي من التعديل السابق) ...
    const baseDir = forExam ? 'exam-curriculum-data' : 'curriculum-data';
    const basePath = path.join(__dirname, '..', baseDir);
    
    const coreSubjectFileNameForFile = `${getCoreSubjectName(subjectFileName)}.js`;
    const normalizedTrackName = normalizeForPath(trackName);
    const normalizedAcademicLevelName = normalizeForPath(academicLevelName);

    const potentialPaths = [
        path.join(basePath, normalizedAcademicLevelName.toUpperCase(), normalizedTrackName.toUpperCase(), coreSubjectFileNameForFile),
        path.join(basePath, normalizedAcademicLevelName.toUpperCase(), coreSubjectFileNameForFile),
    ];
    
    console.log(`[loadCurriculumData] Attempting to load curriculum for [Lvl: ${academicLevelName}, Trk: ${trackName}, SubjFile: ${subjectFileName}, CoreFile: ${coreSubjectFileNameForFile}]. ForExam: ${forExam}`);
    return loadDynamicModule(potentialPaths);
};

// --- *** تعديل loadPromptModule ليكون أكثر تحديدًا *** ---
function loadPromptModule(academicLevelName, trackName, subjectFileName, promptType) {
    const basePath = path.join(__dirname, '..', 'prompts');
    // **نستخدم subjectFileName هنا لتحديد المجلد الأساسي بشكل صحيح بناءً على منطق getCoreSubjectName الجديد**
    const coreSubjectFolder = getCoreSubjectName(subjectFileName); 
    const finalPromptFileName = `${promptType}Prompt.js`;

    const normalizedTrackName = normalizeForPath(trackName);
    const normalizedAcademicLevelName = normalizeForPath(academicLevelName);

    // بناء المسارات من الأكثر تحديدًا إلى الأقل تحديدًا
    const potentialPaths = [
        // 1. المسار الأكثر تحديدًا: المستوى/المسار/مجلد_المادة_الأساسية/ملف_البرومبت.js
        //    مثال: prompts/2BAC/SPC/english/examPrompt.js (إذا كان coreSubjectFolder هو 'english')
        //    مثال: prompts/2BAC/SM/math/examPrompt.js (إذا كان coreSubjectFolder هو 'math')
        path.join(basePath, normalizedAcademicLevelName.toUpperCase(), normalizedTrackName.toUpperCase(), coreSubjectFolder, finalPromptFileName),
        
        // 2. المسار الاحتياطي: المستوى/مجلد_المادة_الأساسية/ملف_البرومبت.js
        //    (للمواد المشتركة ضمن المستوى التي ليس لها مجلد مسار محدد أو إذا فشل المسار الأول)
        //    مثال: prompts/2BAC/english/examPrompt.js
        path.join(basePath, normalizedAcademicLevelName.toUpperCase(), coreSubjectFolder, finalPromptFileName),

        // 3. (اختياري، أقل شيوعًا) المسار الاحتياطي: المسار/مجلد_المادة_الأساسية/ملف_البرومبت.js
        // path.join(basePath, normalizedTrackName.toUpperCase(), coreSubjectFolder, finalPromptFileName),
        
        // 4. (اختياري، أكثر عمومية) المسار الاحتياطي: مجلد_المادة_الأساسية/ملف_البرومبت.js
        // path.join(basePath, coreSubjectFolder, finalPromptFileName),
    ];

    console.log(`[loadPromptModule] Attempting to load prompt module for [Lvl: ${academicLevelName}, Trk: ${trackName}, SubjFile: ${subjectFileName}, CoreFolderResolved: ${coreSubjectFolder}, Type: ${promptType}]`);
    return loadDynamicModule(potentialPaths);
}
// --- *** نهاية تعديل loadPromptModule *** ---

// ... (بقية الملف processStepOutput, exports, etc. تبقى كما هي من التعديل السابق) ...
async function processStepOutput(rawAiResponseText, outputProcessor = null, context = {}) {
    const { jsonrepair } = require('jsonrepair');
    let extractedText = '';
    
    try {
        try {
            const parsedResponse = JSON.parse(rawAiResponseText);
            if (parsedResponse.candidates && parsedResponse.candidates[0]?.content?.parts?.[0]?.text) {
                extractedText = parsedResponse.candidates[0].content.parts[0].text;
            } else {
                extractedText = rawAiResponseText;
            }
        } catch (e) {
            extractedText = rawAiResponseText;
        }

        const markdownMatch = extractedText.match(/```(?:json)?\s*([\s\S]*?)\s*```/s);
        if (markdownMatch && markdownMatch[1]) {
            extractedText = markdownMatch[1].trim();
        } else {
            extractedText = extractedText.trim();
        }
        
        if (!extractedText) {
            console.error("[PROCESS_STEP_OUTPUT_ERROR] Extracted text for JSON repair is empty.");
            console.error("====================== RAW AI RESPONSE (Causing Empty Extracted Text) ======================");
            console.error(rawAiResponseText);
            console.error("======================= END OF RAW AI RESPONSE =======================");
            throw new Error("Cannot process empty AI response for JSON output.");
        }

        const repairedJsonString = jsonrepair(extractedText);
        const stepOutputJson = JSON.parse(repairedJsonString);

        if (outputProcessor && typeof outputProcessor === 'function') {
            return await outputProcessor(stepOutputJson, context);
        }
        return stepOutputJson;

    } catch (error) {
        console.error(`[PROCESS_STEP_OUTPUT_ERROR] Final JSON parsing/processing failed. Error: ${error.message}`);
        console.error("====================== RAW AI RESPONSE (START) ======================");
        console.error(rawAiResponseText);
        console.error("======================= RAW AI RESPONSE (END) =======================");
        console.error("====================== EXTRACTED TEXT (BEFORE/DURING REPAIR ATTEMPT) ======================");
        console.error(extractedText); 
        console.error("======================= END OF DEBUG =======================");
        const detailedError = new Error(`Failed to process AI response: ${error.message}. Review logs for raw AI output.`);
        detailedError.cause = error;
        throw detailedError;
    }
}

module.exports = {
    GEMINI_API_KEY,
    geminiApiUrl,
    setGeminiApiUrl,
    getRandomFromArray,
    normalizeForPath,
    loadCurriculumData,
    extractCleanJsonString: (text) => {
         console.warn("extractCleanJsonString is deprecated. Use processStepOutput. Attempting basic extraction for compatibility.");
         if (!text) return '{}';
         const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/s);
         return match ? match[1].trim() : text.trim();
    },
    loadPromptModule,
    getCoreSubjectName,
    processStepOutput
};