// --- back-end/utils/promptHelpers.js ---

const { GoogleGenerativeAI } = require('@google/generative-ai');

// --- بداية التعديل المطلوب: إدارة المفاتيح والتبديل ---
// 1. تحميل جميع المفاتيح المرقمة من ملف .env
const GEMINI_API_KEYS = Object.keys(process.env)
    .filter(key => key.startsWith('GEMINI_API_KEY_'))
    .sort()
    .map(key => process.env[key]);

if (GEMINI_API_KEYS.length === 0) {
    console.error("[AI_CORE_FATAL] No GEMINI_API_KEY_n keys found in .env file! AI functionalities will not work.");
} else {
    console.log(`[AI_CORE_INFO] Loaded ${GEMINI_API_KEYS.length} Gemini API keys.`);
}


/**
 * يتصل بـ Gemini API مع منطق إعادة المحاولة باستخدام مفاتيح متعددة.
 * @returns {Promise<string>} النص الخام للاستجابة من Gemini.
 * @throws {Error} يطلق خطأ إذا فشلت جميع مفاتيح API.
 */
async function fetchGeminiWithConfig(prompt, generationConfig, modelType, imageUrl = null) {
    if (imageUrl) {
        console.warn(`[PROMPT_HELPER_WARN] An imageUrl was provided, but image processing is currently disabled.`);
    }

    if (GEMINI_API_KEYS.length === 0) {
        throw new Error("No Gemini API keys are configured.");
    }

    let lastError = null;

    // 2. الدوران على كل مفتاح وتجربته
    for (const apiKey of GEMINI_API_KEYS) {
        try {
            console.log(`[AI_ATTEMPT] Trying API key ending in "...${apiKey.slice(-4)}"`);

            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: modelType });
            
            const promptParts = [{ text: prompt }];

            const result = await model.generateContent({
                contents: [{ role: 'user', parts: promptParts }],
                generationConfig,
            });

            const response = await result.response;
            console.log(`[AI_SUCCESS] Successfully received response with key ending in "...${apiKey.slice(-4)}"`);
            
            // 3. عند النجاح، قم بإرجاع النتيجة وإنهاء الدالة فورًا
            return response.text();

        } catch (error) {
            // 4. عند الفشل، سجل الخطأ واستمر للمفتاح التالي
            console.error(`[AI_FAILURE] API key ending in "...${apiKey.slice(-4)}" failed. Error: ${error.message}.`);
            lastError = error; 
        }
    }

    // 5. إذا انتهت الحلقة، فهذا يعني أن كل المفاتيح قد فشلت
    console.error("[AI_FATAL] All available Gemini API keys failed.");
    throw new Error(`All API keys failed. Last recorded error: ${lastError ? lastError.message : 'Unknown error'}`);
}

// --- نهاية التعديل ---

// processStepOutput لم تكن موجودة هنا أصلاً، لذا لن نضيفها.

module.exports = {
    fetchGeminiWithConfig
};