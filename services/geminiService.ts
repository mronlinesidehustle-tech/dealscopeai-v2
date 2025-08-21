
import { GoogleGenerativeAI } from "@google/generative-ai";
import type {
  UploadedFile,
  MockupLevel,
  GroundingSource,
  Estimation,
  InvestmentAnalysis,
} from "../types";

// ✅ Hardcoded API key for now (works in production)
const ai = new GoogleGenerativeAI({
  apiKey: "AIzaSyA_OrDWIJ8n_gr5I1OsWzvp4-YIPOKEm50",
});

export const fileToGenerativePart = (file: UploadedFile) => {
  return {
    inlineData: {
      data: file.base64,
      mimeType: file.type,
    },
  };
};

// ---------- REHAB ESTIMATE ----------
export const getRehabEstimate = async (
  address: string,
  files: UploadedFile[],
  finishLevel: MockupLevel
): Promise<{ markdown: string; sources: GroundingSource[] }> => {
  const model = ai.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `
You are an expert real-estate rehab estimator. Provide a detailed, area-by-area rehabilitation cost estimate for the property at "${address}".

All cost estimates should be tailored to a "${finishLevel}" finish level and be as precise as possible, aiming for a tight range of +/- 5%.

Follow this structure in **Markdown**:

### Project Summary
**Total Estimated Cost:** [e.g., $55,000 - $60,000]
**Overall Difficulty:** [1-5]
**Assumptions:**
* [Assumption 1]
* [Assumption 2]
**Key Risks:**
* [Risk 1]
* [Risk 2]
**Actionable Advice:**
* [Advice 1]
* [Advice 2]

### Itemized Breakdown
| Area | Observations | Recommendations | Estimated Cost | Difficulty (1-5) |
| :--- | :--- | :--- | :--- | :--- |
| [Kitchen] | [...] | [...] | [$12,500 - $13,800] | [3] |
| [Next Area] | ... | ... | ... | ... |
`.trim();

  const imageParts = files.map(fileToGenerativePart);

  // Multimodal call: prompt text + image parts
  const result = await model.generateContent([
    { text: prompt },
    ...imageParts,
  ]);

  const markdown = result.response.text();

  // If you later add grounding, populate this. For now return empty.
  const sources: GroundingSource[] = [];

  return { markdown, sources };
};

// ---------- INVESTMENT ANALYSIS ----------
export const getInvestmentAnalysis = async (
  address: string,
  estimation: Estimation
): Promise<InvestmentAnalysis> => {
  const model = ai.getGenerativeModel({ model: "gemini-2.0-flash" });

  const totalRepairCost = estimation.summary.totalEstimatedCost;
  const propertySummary =
    estimation.repairs?.map((r) => `${r.area}: ${r.observations}`).join(". ") ||
    "No detailed area observations provided.";

  const prompt = `
You are an expert real estate investment analyst. Provide a complete analysis for the property at "${address}" using the estimated rehab costs below.

Property:
- Estimated Rehab Cost: ${totalRepairCost}
- Condition Summary: ${propertySummary}

Return ONLY a JSON object inside a Markdown code block, matching exactly this schema:

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
    { "address": "...", "soldDate": "...", "soldPrice": "...", "sqft": "...", "bedBath": "..." }
  ],
  "exitStrategies": [
    { "strategy": "...", "details": "..." }
  ]
}
\`\`\`
`.trim();

  const result = await model.generateContent([{ text: prompt }]);
  const text = result.response.text();

  const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
  if (!jsonMatch || !jsonMatch[1]) {
    throw new Error(
      "Could not find JSON in the model's response for investment analysis."
    );
  }

  const parsed = JSON.parse(jsonMatch[1]) as InvestmentAnalysis;

  // If you add grounding later, attach sources here.
  // parsed.groundingSources = [...]

  return parsed;
};
