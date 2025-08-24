import { GoogleGenAI, GenerateContentResponse, GroundingChunk } from "@google/genai";
import type { UploadedFile, MockupLevel, GroundingSource, Estimation, InvestmentAnalysis } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const fileToGenerativePart = (file: UploadedFile) => {
    return {
        inlineData: {
            data: file.base64,
            mimeType: file.type,
        },
    };
};

export const getRehabEstimate = async (address: string, files: UploadedFile[], finishLevel: MockupLevel): Promise<{ markdown: string; sources: GroundingSource[] }> => {
    const model = 'gemini-2.5-flash';
    
    const prompt = `
        System Instruction: You are an expert real-estate rehab estimator. Your task is to provide a detailed, area-by-area rehabilitation cost estimate based on photos of a property at "${address}".

        **Crucial Step: Use Google Search to find local contractor pricing and material costs for the region around "${address}" to ensure accuracy.**

        All cost estimates should be tailored to a "${finishLevel}" finish level and be as precise as possible, aiming for a tight range of +/- 5%.

        User Prompt:
        Please analyze the provided photos and generate a detailed rehabilitation estimate. Follow this structure precisely and provide your output in markdown format.

        1.  **Project Summary:**
            *   Provide a total estimated cost range for the entire project. This range must be tight (+/- 5%) and based on your search for local pricing.
            *   Give an overall project difficulty rating on a 1-5 scale (1 = simple cosmetic, 5 = major structural/permit work).
            *   List any key assumptions you're making (e.g., "assuming no hidden water damage behind walls," "cost estimates are for mid-market labor in the region").
            *   **Key Risks:** Identify and list the 2-3 biggest risks based on the visual evidence. Example: "The 20% contingency is non-negotiable due to the high probability of finding extensive subfloor rot in Bathroom 2 and unpermitted wiring in the addition."
            *   **Actionable Advice:** Provide clear, imperative next steps for the investor. Example: "Strongly recommend getting firm bids from a licensed General Contractor, electrician, and plumber *before* closing. This property should not be purchased without these professional on-site assessments."

        2.  **Itemized Breakdown:**
            *   Create a markdown table with the following columns: "Area", "Observations", "Recommendations", "Estimated Cost", "Difficulty (1-5)".
            *   Walk through each key area of the property visible in the photos (e.g., Exterior, Roof, Kitchen, Bathroom 1, Living Room, Foundation, Electrical, Plumbing, etc.).
            *   For each area:
                *   **Observations:** Describe what you see, noting any visible damage, wear, or defects.
                *   **Recommendations:** Suggest specific repairs or replacements needed.
                *   **Estimated Cost:** Give a ballpark cost for the recommended work, grounded in local pricing for a "${finishLevel}" finish level.
                *   **Difficulty (1-5):** Rate the complexity of the work for that specific area.

        **Output Format (Strict Markdown):**

        ### Project Summary
        **Total Estimated Cost:** [e.g., $55,000 - $60,000]
        **Overall Difficulty:** [e.g., 4]
        **Assumptions:**
        *   [Assumption 1]
        *   [Assumption 2]
        **Key Risks:**
        *   [Risk 1]
        *   [Risk 2]
        **Actionable Advice:**
        *   [Advice 1]
        *   [Advice 2]

        ### Itemized Breakdown
        | Area | Observations | Recommendations | Estimated Cost | Difficulty (1-5) |
        | :--- | :--- | :--- | :--- | :--- |
        | [e.g., Kitchen] | [e.g., Dated oak cabinets, laminate countertops are peeling.] | [e.g., Replace all cabinets and countertops. Install new sink and faucet.] | [e.g., $12,500 - $13,800] | [e.g., 3] |
        | [Next Area] | ... | ... | ... | ... |
    `;

    const imageParts = files.map(fileToGenerativePart);
    
    const result: GenerateContentResponse = await ai.models.generateContent({
        model,
        contents: { parts: [{ text: prompt }, ...imageParts] },
        config: { 
            temperature: 0.0,
            tools: [{googleSearch: {}}],
        },
    });
    
    const groundingChunks = result.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
    const sources: GroundingSource[] = groundingChunks
        .filter((chunk: GroundingChunk) => chunk.web?.uri && chunk.web?.title)
        .map((chunk: GroundingChunk) => ({
            uri: chunk.web.uri,
            title: chunk.web.title,
        }));

    return { markdown: result.text, sources };
};

export const getInvestmentAnalysis = async (
    address: string,
    estimation: Estimation,
    purchasePrice: string
): Promise<InvestmentAnalysis> => {
    const model = 'gemini-2.5-flash';
    const totalRepairCost = estimation.summary.totalEstimatedCost;

    const prompt = `
        **System Instruction:** You are an expert real estate investment analyst. Your task is to provide a comprehensive investment analysis for the property at "${address}", given the estimated rehabilitation costs.

        **CRUCIAL:** Use Google Search extensively to find recent comparable sales (comps) in the local market to determine an accurate After Repair Value (ARV).

        **Property Information:**
        *   **Address:** ${address}
        *   **Estimated Rehab Cost:** ${totalRepairCost}
        *   **Property Condition Summary (from previous analysis):** ${estimation.repairs.map(r => `${r.area}: ${r.observations}`).join('. ')}

        **Your Task:**
        Generate a complete investment analysis. Provide your output as a single JSON object inside a markdown code block. Adhere strictly to the schema provided below.

        **GUIDANCE FOR ANALYSIS:**
        *   **investorFit.analysis:** Provide a neutral, data-driven analysis of the property as an investment. Discuss the relationship between the After Repair Value (ARV) and the rehab costs. Mention that investors often use formulas like the 70% rule to calculate a Maximum Allowable Offer (MAO). This rule is a baseline and can be adjusted for market conditions. Do NOT make a final judgment on whether the deal is "good" or "bad"; just present the facts. Set "fitsCriteria" to a placeholder value of \`true\`.
        *   **exitStrategies:** When discussing "Fix and Flip", frame it in the context of acquiring a property at a discount to its ARV to allow for profit after rehab costs. For "Buy and Hold" or "BRRRR" strategies, introduce and briefly explain the importance of follow-up analysis using key buy-and-hold metrics like the **1% Rule** for initial rent screening, **Cash-on-Cash Return** (which accounts for financing), and **DSCR (Debt Service Coverage Ratio)** for loan qualification.

        **Output Format (Strict JSON):**
        \`\`\`json
        {
          "suggestedARV": "...",
          "estimatedRepairCost": "${totalRepairCost}",
          "investorFit": {
            "fitsCriteria": true,
            "analysis": "..."
          },
          "propertyCondition": "...",
          "estimatedRepairLevel": "...",
          "comparables": [
            {
              "address": "...",
              "soldDate": "...",
              "soldPrice": "...",
              "sqft": "...",
              "bedBath": "..."
            }
          ],
          "exitStrategies": [
            {
              "strategy": "...",
              "details": "..."
            }
          ]
        }
        \`\`\`

        **Field Explanations:**
        *   **suggestedARV:** (String or Number) After Repair Value. A dollar amount based on your search for comparable sales.
        *   **investorFit:** (Object) - See "GUIDANCE FOR ANALYSIS" above.
        *   **propertyCondition:** (String) A 1-2 sentence summary of the property's overall condition based on the provided summary.
        *   **estimatedRepairLevel:** (String) Classify the rehab level. Must be one of: 'Light Cosmetic', 'Medium', 'Heavy', 'Gut'.
        *   **comparables:** (Array of Objects) List 3-5 recent comparable sales you found via Google Search.
        *   **exitStrategies:** (Array of Objects) Propose 2-3 viable exit strategies with brief explanations, following the guidance above.
    `;

    const result = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            temperature: 0.1,
            tools: [{ googleSearch: {} }],
        }
    });

    try {
        const jsonMatch = result.text.match(/```json\n([\s\S]*?)\n```/);
        if (jsonMatch && jsonMatch[1]) {
            const parsedJson = JSON.parse(jsonMatch[1]);

            // --- Start of Application-Side Business Logic ---

            // 1. More robust helper functions to parse currency strings.
            const parseCurrency = (value: string | number): number => {
                if (typeof value === 'number') return value;
                if (typeof value !== 'string') return 0;
                // Extracts the first valid number from a string, ignoring surrounding text.
                const match = value.match(/[\d,.]+/);
                if (!match) return 0;
                return parseFloat(match[0].replace(/,/g, '')) || 0;
            };
            
            const getMaxFromRange = (range: string): number => {
                if (typeof range !== 'string') return 0;
                // Finds all numbers in a string (e.g., "$50k - $60k") and returns the largest.
                const matches = range.match(/[\d,.]+/g);
                if (!matches) return 0;
                const numbers = matches.map(m => parseFloat(m.replace(/,/g, ''))).filter(n => !isNaN(n));
                return numbers.length > 0 ? Math.max(...numbers) : 0;
            };

            // 2. Get numeric values.
            const numericPurchasePrice = parseFloat(purchasePrice) || 0;
            const numericARV = parseCurrency(parsedJson.suggestedARV);
            const numericMaxRehab = getMaxFromRange(estimation.summary.totalEstimatedCost);

            // 3. Calculate MAO using the 70% rule.
            const numericMAO = (numericARV * 0.70) - numericMaxRehab;
            
            // 4. Format numbers for display.
            const formattedMAO = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(numericMAO);
            const formattedPurchasePrice = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(numericPurchasePrice);

            // Add calculated MAO and Purchase Price to the response object for display purposes.
            parsedJson.suggestedMAO = formattedMAO;
            parsedJson.purchasePrice = formattedPurchasePrice;


            // 5. Apply the core business rule: is the purchase price at or below the MAO?
            const fitsCriteria = numericPurchasePrice > 0 && numericMAO > 0 && numericPurchasePrice <= numericMAO;
            parsedJson.investorFit.fitsCriteria = fitsCriteria;

            // 6. Create a definitive, human-readable verdict to prepend to the AI's analysis.
            const dealVerdict = fitsCriteria
                ? 'Based on the 70% rule, the purchase price is at or below the Maximum Allowable Offer. This indicates a potentially strong investment opportunity.'
                : `Warning: Based on the 70% rule, the Maximum Allowable Offer (MAO) for this property is ${formattedMAO}. The current purchase price of ${formattedPurchasePrice} is significantly higher than this target. For this deal to be profitable under standard investor criteria, the property would need to be acquired at or below the MAO.`;
            
            // 7. Combine the code-generated verdict with the AI's nuanced analysis.
            parsedJson.investorFit.analysis = `${dealVerdict}\n\n**AI Analysis:**\n${parsedJson.investorFit.analysis}`;

            // --- End of Application-Side Business Logic ---

            // The API will return grounding sources, let's attach them.
            const groundingChunks = result.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
            parsedJson.groundingSources = groundingChunks
                .filter((chunk: GroundingChunk) => chunk.web?.uri && chunk.web?.title)
                .map((chunk: GroundingChunk) => ({
                    uri: chunk.web.uri,
                    title: chunk.web.title,
                }));
                
            return parsedJson as InvestmentAnalysis;
        } else {
            throw new Error("Could not find JSON in the model's response for investment analysis.");
        }
    } catch (e) {
        console.error("Failed to parse investment analysis JSON:", e, "Raw response:", result.text);
        throw new Error("Failed to get a valid investment analysis from the AI.");
    }
};
