// back-end/utils/promptHelpers.js

require('dotenv').config();
const { GEMINI_API_KEY, setGeminiApiUrl } = require('./aiGeneralQuestionGeneratorShared');
const { jsonrepair } = require('jsonrepair'); // <-- *** الخطوة 1: استيراد المكتبة ***

async function fetchGeminiWithConfig(promptText, generationConfig, modelType = 'gemini-1.5-flash-latest') {
    // ... (هذه الدالة تبقى كما هي، لا حاجة للتعديل)
    const currentGeminiApiUrl = setGeminiApiUrl(modelType);
    if (!GEMINI_API_KEY || !currentGeminiApiUrl) {
        throw new Error("AI Service configuration error.");
    }
    const fetchOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: promptText }] }],
            generationConfig: {
                temperature: 1.7,
                maxOutputTokens: 4096,
                responseMimeType: "application/json",
                ...generationConfig,
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
        if (!response.ok) {
            console.error(`[FETCH_GEMINI_HELPER_ERROR] Status: ${response.status}. Body: ${rawResponseBodyText.substring(0, 500)}`);
            throw new Error(`Gemini API request failed (Status: ${response.status}).`);
        }
        return rawResponseBodyText;
    } catch (error) {
         console.error(`[FETCH_GEMINI_HELPER_NETWORK_ERROR] Network error during fetch: ${error.message}`);
         throw new Error(`Network error while communicating with Gemini API: ${error.message}`);
    }
}


/**
 * دالة قوية لمعالجة وتحليل JSON من استجابات الذكاء الاصطناعي باستخدام مكتبة الإصلاح.
 */
async function processStepOutput(rawAiResponseText, outputProcessor = null, context = {}) {
    let extractedText = '';
    
    try {
        // 1. استخراج النص الأساسي من استجابة Gemini
        try {
            const parsedResponse = JSON.parse(rawAiResponseText);
            if (parsedResponse.candidates && parsedResponse.candidates[0]?.content?.parts?.[0]?.text) {
                extractedText = parsedResponse.candidates[0].content.parts[0].text;
            } else {
                extractedText = rawAiResponseText; // Fallback to raw text
            }
        } catch (e) {
            extractedText = rawAiResponseText; // If parsing fails, assume it's raw text
        }

        // 2. تنظيف بسيط لإزالة علامات markdown إذا كانت موجودة
        const markdownMatch = extractedText.match(/```(?:json)?\s*([\s\S]*?)\s*```/s);
        if (markdownMatch && markdownMatch[1]) {
            extractedText = markdownMatch[1];
        }

        // --- *** بداية التعديل الجذري *** ---
        // 3. استخدام مكتبة jsonrepair لإصلاح السلسلة النصية
        const repairedJsonString = jsonrepair(extractedText);
        // --- *** نهاية التعديل الجذري *** ---

        // 4. التحليل النهائي
        const stepOutputJson = JSON.parse(repairedJsonString);

        // 5. المعالجة الاختيارية الإضافية
        if (outputProcessor && typeof outputProcessor === 'function') {
            return await outputProcessor(stepOutputJson, context);
        }
        return stepOutputJson;

    } catch (error) {
        console.error(`[PROCESS_STEP_OUTPUT_ERROR] Final JSON parsing failed after repair. Error: ${error.message}`);
        console.error("====================== RAW AI RESPONSE (START) ======================");
        console.error(rawAiResponseText);
        console.error("======================= RAW AI RESPONSE (END) =======================");
        console.error("====================== EXTRACTED TEXT (BEFORE REPAIR) ======================");
        console.error(extractedText); 
        console.error("======================= END OF DEBUG =======================");
        throw new Error(`Failed to process AI response even after repair: ${error.message}`);
    }
}


module.exports = {
    fetchGeminiWithConfig,
    processStepOutput,
};