// services/geminiService.ts
// Direct call to Gemini REST endpoint (no SDK). Works in the browser.
// Uses ?key= API key in the query string to avoid header/key issues.

import type {
  UploadedFile,
  MockupLevel,
  GroundingSource,
  Estimation,
  InvestmentAnalysis,
} from "../types";

// ✅ Put the working Studio key here (the one ending in Em50)
const GEMINI_API_KEY = "AIzaSyA_OrDWIJ8n_gr5I1OsWzvp4-YIPOKEm50";

// Utilities
const API_BASE = "https://generativelanguage.googleapis.com/v1beta";
const MODEL_ID = "models/gemini-2.0-flash";

function fileToGenerativePart(file: UploadedFile) {
  return {
    inline_data: {
      mime_type: file.type,
      data: file.base64, // assume this is pure base64 (no data URL prefix)
    },
  };
}

async function postGenerateContent(body: any) {
  const res = await fetch(
    `${API_BASE}/${MODEL_ID}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Gemini HTTP ${res.status}: ${text}`);
  }

  return res.json();
}

// ---------- REHAB ESTIMATE ----------
export async function getRehabEstimate(
  address: string,
  files: UploadedFile[],
  finishLevel: MockupLevel,
  purchasePrice: string   // ✅ added
): Promise<{ markdown: string; sources: GroundingSource[] }> {
  const prompt = `
You are an expert real-estate rehab estimator. Provide a detailed, area-by-area rehabilitation cost estimate for the property at "${address}".

Purchase Price: $${purchasePrice}
All cost estimates should be tailored to a "${finishLevel}" finish level and be as precise as possible, aiming for a tight range of +/- 5%.

Return your answer in **Markdown** using this structure:

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

  const parts = [{ text: prompt }, ...files.map(fileToGenerativePart)];
  const body = { contents: [{ parts }] };

  const data = await postGenerateContent(body);

  // Pull the first candidate's text
  const text =
    data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join("") ?? "";

  // We’re not using grounding here; return empty for now
  const sources: GroundingSource[] = [];

  if (!text) {
    throw new Error("No text returned from Gemini.");
  }

  return { markdown: text, sources };
}

// ---------- INVESTMENT ANALYSIS ----------
export async function getInvestmentAnalysis(
  address: string,
  estimation: Estimation
): Promise<InvestmentAnalysis> {
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

  const body = { contents: [{ parts: [{ text: prompt }] }] };
  const data = await postGenerateContent(body);
  const text =
    data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join("") ?? "";

  const m = text.match(/```json\s*([\s\S]*?)\s*```/);
  if (!m || !m[1]) {
    throw new Error("Could not find JSON in the model's response for investment analysis.");
  }
  return JSON.parse(m[1]) as InvestmentAnalysis;
}
