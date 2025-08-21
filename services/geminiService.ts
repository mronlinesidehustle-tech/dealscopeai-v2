import { GoogleGenerativeAI } from "@google/generative-ai";
import type {
  UploadedFile,
  MockupLevel,
  GroundingSource,
  Estimation,
  InvestmentAnalysis,
} from "../types";

// ✅ Reads from Vercel env var VITE_GEMINI_API_KEY
const ai = new GoogleGenerativeAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY || "",
});
export { ai }; // so other files can `import { ai }`

export const fileToGenerativePart = (file: UploadedFile) => {
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
    estimation: Estimation
): Promise<InvestmentAnalysis> => {
    const model = 'gemini-2.5-flash';
    const totalRepairCost = estimation.summary.totalEstimatedCost;

    const prompt = `
        **System Instruction:** You are an expert real estate investment analyst. Your task is to provide a comprehensive investment analysis for the property at "${address}", given the estimated rehabilitation costs.

        **CRUCIAL:** Use Google Search extensively to find recent comparable sales (comps) in the local market to determine an accurate After Repair Value (ARV). All financial calculations must be based on this research.

        **Property Information:**
        *   **Address:** ${address}
        *   **Estimated Rehab Cost:** ${totalRepairCost}
        *   **Property Condition Summary (from previous analysis):** ${estimation.repairs.map(r => `${r.area}: ${r.observations}`).join('. ')}

        **Your Task:**
        Generate a complete investment analysis. Provide your output as a single JSON object inside a markdown code block. Adhere strictly to the schema provided below.

        **Output Format (Strict JSON):**
        \`\`\`json
        {
          "suggestedARV": "...",
          "estimatedRepairCost": "${totalRepairCost}",
          "suggestedMAO": "...",
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
        *   **suggestedARV:** (String) After Repair Value. A dollar amount based on your search for comparable sales.
        *   **suggestedMAO:** (String) Maximum Allowable Offer. Calculate this using the 70% rule: (ARV * 0.70) - Estimated Rehab Cost. Show the calculation.
        *   **investorFit:** (Object)
            *   **fitsCriteria:** (Boolean) Your assessment of whether this is a good deal for a typical fix-and-flip or BRRRR investor.
            *   **analysis:** (String) A brief paragraph explaining your reasoning for the 'fitsCriteria' conclusion.
        *   **propertyCondition:** (String) A 1-2 sentence summary of the property's overall condition based on the provided summary.
        *   **estimatedRepairLevel:** (String) Classify the rehab level. Must be one of: 'Light Cosmetic', 'Medium', 'Heavy', 'Gut'.
        *   **comparables:** (Array of Objects) List 3-5 recent comparable sales you found via Google Search.
        *   **exitStrategies:** (Array of Objects) Propose 2-3 viable exit strategies (e.g., 'Fix and Flip', 'BRRRR Strategy') with a brief explanation for each.
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
