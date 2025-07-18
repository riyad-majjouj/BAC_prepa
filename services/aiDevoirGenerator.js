// back-end/services/aiDevoirGenerator.js

const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const fileToGenerativePart = (buffer, mimeType) => {
    return {
        inlineData: {
            data: buffer.toString("base64"),
            mimeType,
        },
    };
};

/**
 * Builds the final, most robust prompt for exam deconstruction.
 * This version emphasizes complete analysis and correct LaTeX formatting.
 * @returns {string} The instructional prompt text.
 */
const buildPrompt = () => {
    return `
    Your single, critical task is to be an expert document deconstructor. Analyze the provided exam file from START to FINISH and convert it into a structured JSON array. You MUST process the entire document.

    **--- CORE DIRECTIVES ---**
    1.  **COMPLETE ANALYSIS:** You must analyze the document from the first word to the last. Do not stop prematurely. Your output must represent the entire file.
    2.  **LATEX IS MANDATORY:** Every mathematical symbol, variable, and expression MUST be enclosed in single dollar signs ($). This is not optional.
        -   Examples: 'f(x)=2x+1' becomes '$f(x)=2x+1$'. 'u_n' becomes '$u_n$'. 'M(H)=3g.mol-1' becomes '$M(H)=3g.mol^{-1}$'.
        -   This applies to ALL text fields: 'text', 'options', etc.
    3.  **HIERARCHY IS LAW:** You must follow this decision-making algorithm precisely for every segment.

    **--- DECISION-MAKING ALGORITHM ---**

    **STEP 1: Identify Complex Question Types First.**
       - Scan for MCQ, Matching Pairs, or Fill-in-the-Table formats. If found, create a SINGLE 'question' component for the entire structure.

    **STEP 2: Identify Grouped Sub-Questions.**
       - Check for a leading statement (e.g., "II. On considère...") followed by a list of sub-parts labeled 'a)', 'b)', '1-', '2-', etc.
       - If this pattern exists, you MUST split it:
         - 1. Create one \`{"type": "instruction", ...}\` for the leading statement.
         - 2. Create a SEPARATE \`{"type": "question", ...}\` for EACH sub-part (a, b, etc.).
       - **DO NOT confuse** a single multi-line question with this structure. The key is the 'a)', 'b)' labeling.

    **STEP 3: Identify Standalone Questions.**
       - If it's a question but doesn't fit the patterns above, create a SINGLE 'question' component for it.

    **STEP 4: Identify Structural Content.**
       - If it's not a question, classify it as 'exercise_title', 'subheading', 'paragraph', 'image', or 'separator'.

    **--- COMPONENT DEFINITIONS & EXAMPLES ---**

    *   \`{ "type": "exercise_title", "text": "Partie I : Restitution des connaissances ($5$ pts)" }\`
    *   \`{ "type": "instruction", "text": "I. Répondez sur votre feuille de rédaction aux questions suivantes :" }\`
    *   \`{ "type": "paragraph", "text": "L'anémie de Blackfan-Diamont est une maladie héréditaire rare..." }\`
    *   \`{ "type": "image", "url": "", "aiDescription": "Bar chart comparing ribosome sub-units..." }\`
    *   \`{ "type": "separator" }\`
    *   \`{ "type": "question", ... }\`:
        -   \`"points"\`: Number. e.g., (1 pt) -> 1.
        -   \`"questionType"\`: 'mcq', 'matching_pairs', 'fill_table', 'free_text'.
        -   \`"text"\`: The question itself, with LaTeX. E.g., "1 - Définissez : chaîne respiratoire – rendement énergétique."
        -   \`"options"\`: For MCQ. E.g., ["la sphère pédonculée transporte $H^+$ vers l'espace intermembranaire ;", ...]
        -   \`"groupA"\`, \`"groupB"\`, \`"correctMatches"\`: For matching pairs.
        -   \`"tableHeaders"\`, \`"tableRows"\`, \`"tableCorrectAnswers"\`: For tables.

    **--- CRITICAL EXAMPLE: GROUPED SUB-QUESTIONS ---**
    *Original Text:*
    "1. En vous basant sur la figure (a) du document 1, comparez la quantité des petites sous unités... (1pt)
     2. En vous basant sur les documents 2 et 3, donnez les séquences d'ARNm..."
    *Correct JSON Output (Instruction followed by multiple questions):*
    [
      {
        "type": "instruction",
        "text": "Dans le cadre de l'étude de l'expression et de la transmission de l'information génétique, on présente les données suivantes :"
      },
      {
        "type": "question",
        "questionType": "free_text",
        "text": "1. En vous basant sur la figure (a) du document 1, comparez la quantité des petites sous unités à celle des grandes sous-unités des ribosomes chez l'individu sain puis chez l'individu malade. Expliquez à partir de la figure (b), le manque en hémoglobine observé chez l'individu malade.",
        "points": 1
      },
      {
        "type": "question",
        "questionType": "free_text",
        "text": "2. En vous basant sur les documents 2 et 3, donnez les séquences d'ARNm et des acides aminés correspondant aux fragments de l'allèle normal et de l'allèle anormal, puis montrez la relation gène – protéine – caractère.",
        "points": 1.5
      }
    ]

    **FINAL INSTRUCTION:** Your output must be a single, valid JSON array covering the entire document. Do not add comments or any text outside the JSON array.
    `;
};


const generateComponentsFromFile = async (file) => {
    if (!file) {
        throw new Error("No file provided for analysis.");
    }
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    const prompt = buildPrompt();
    const filePart = fileToGenerativePart(file.buffer, file.mimetype);

    console.log(`[AI_SERVICE] Sending file (${file.mimetype}, ${Math.round(file.size / 1024)} KB) to Gemini for analysis with ROBUST HIERARCHICAL & LATEX prompt...`);
    
    const result = await model.generateContent([prompt, filePart]);
    const response = result.response;
    let jsonText = response.text();

    jsonText = jsonText.trim().replace(/^```json\s*|```\s*$/g, '');

    try {
        const components = JSON.parse(jsonText);
        if (!Array.isArray(components)) {
            throw new Error("AI response is not a JSON array.");
        }
        console.log(`[AI_SERVICE] Successfully parsed ${components.length} components from AI response.`);
        return components;
    } catch (error) {
        console.error("[AI_SERVICE] Failed to parse JSON from AI response:", error);
        console.error("[AI_SERVICE] Raw AI Response Text:", jsonText);
        throw new Error("The AI returned a response that could not be understood. Please check file quality or try again.");
    }
};

module.exports = { generateComponentsFromFile };