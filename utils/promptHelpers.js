require('dotenv').config();
const { GEMINI_API_KEYS, buildGeminiApiUrl } = require('./aiGeneralQuestionGeneratorShared');
const { jsonrepair } = require('jsonrepair');

/**
 * دالة تتصل بـ Gemini API مع نظام إعادة المحاولة باستخدام مفاتيح متعددة.
 * هذه الدالة مكتوبة بشكل صحيح وتقوم بعملها كما هو متوقع.
 * @param {string} promptText - نص البرومبت.
 * @param {object} generationConfig - إعدادات التوليد (مثل temperature و maxOutputTokens).
 * @param {string} modelType - نوع النموذج.
 * @returns {Promise<string>} - نص الاستجابة الخام من الـ API عند النجاح.
 * @throws {Error} - يرمي خطأ بعد فشل جميع المفاتيح.
 */
async function fetchGeminiWithConfig(promptText, generationConfig, modelType = 'gemini-1.5-flash-latest') {
    if (!GEMINI_API_KEYS || GEMINI_API_KEYS.length === 0) {
        throw new Error("AI Service configuration error: No API keys loaded from .env file.");
    }

    let lastError = null;

    for (const [index, apiKey] of GEMINI_API_KEYS.entries()) {
        const currentGeminiApiUrl = buildGeminiApiUrl(apiKey, modelType);
        console.log(`[FETCH_GEMINI] Attempting API call with key index: ${index}`);

        const fetchOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: promptText }] }],
                // يتم دمج الإعدادات الافتراضية مع الإعدادات المخصصة التي تم تمريرها.
                // هذا يسمح للمستدعي (مثل generateAIQuestion) بتحديد maxOutputTokens.
                generationConfig: {
                    temperature: 0.7, // قيمة افتراضية
                    maxOutputTokens: 8192, // قيمة افتراضية عليا وآمنة
                    responseMimeType: "application/json",
                    ...generationConfig, // الإعدادات الممررة من الخارج ستقوم بتجاوز القيم الافتراضية
                },
                safetySettings: [
                    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                    { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                    { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                    { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                ],
            }),
        };

        try {
            const response = await fetch(currentGeminiApiUrl, fetchOptions);
            const rawResponseBodyText = await response.text();

            if (response.ok) {
                console.log(`[FETCH_GEMINI] Success with key index: ${index}`);
                return rawResponseBodyText;
            }
            
            lastError = new Error(`Gemini API request failed with key index ${index} (Status: ${response.status}). Body: ${rawResponseBodyText.substring(0, 500)}`);
            console.warn(lastError.message);

        } catch (error) {
            lastError = new Error(`Network error during fetch with key index ${index}: ${error.message}`);
            console.warn(lastError.message);
        }
    }

    console.error("[FETCH_GEMINI_FATAL] All Gemini API keys failed.");
    throw lastError || new Error("All available Gemini API keys failed to get a successful response.");
}


/**
 * دالة قوية لمعالجة وتحليل JSON من استجابات الذكاء الاصطناعي باستخدام مكتبة الإصلاح.
 * هذه الدالة غير مستخدمة مباشرة من قبل `generateAIQuestion` (الذي يستخدم robustJsonExtractor)
 * ولكنها ممتازة ومتاحة للاستخدام في وظائف أخرى. لا تحتاج لتعديل.
 */
async function processStepOutput(rawAiResponseText, outputProcessor = null, context = {}) {
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
            extractedText = markdownMatch[1];
        } else {
            extractedText = extractedText.trim();
        }

        if (!extractedText) {
            console.error("[PROCESS_STEP_OUTPUT_ERROR] Extracted text is empty. Raw Response:", rawAiResponseText);
            throw new Error("Cannot process empty AI response for JSON output.");
        }

        const repairedJsonString = jsonrepair(extractedText);
        const stepOutputJson = JSON.parse(repairedJsonString);

        if (outputProcessor && typeof outputProcessor === 'function') {
            return await outputProcessor(stepOutputJson, context);
        }
        return stepOutputJson;

    } catch (error) {
        console.error(`[PROCESS_STEP_OUTPUT_ERROR] Final JSON parsing failed after repair. Error: ${error.message}`);
        console.error("====================== RAW AI RESPONSE (CAUSING ERROR) ======================");
        console.error(rawAiResponseText);
        console.error("====================== EXTRACTED TEXT (BEFORE REPAIR) ======================");
        console.error(extractedText); 
        console.error("=========================================================================");
        throw new Error(`Failed to process AI response even after repair: ${error.message}`);
    }
}


module.exports = {
    fetchGeminiWithConfig,
    processStepOutput,
};