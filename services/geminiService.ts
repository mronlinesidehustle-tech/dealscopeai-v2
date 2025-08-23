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
All cost estimates should be tailored to a "${finishLevel}" finish level and be as precise as possible, aiming for a tight range of +/- 2%.

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
  purchasePrice: string // ✅ ADDED: Accept purchase price parameter
): Promise<InvestmentAnalysis> {
  const totalRepairCost = estimation.summary.totalEstimatedCost;
  const propertySummary =
    estimation.repairs?.map((r) => `${r.area}: ${r.observations}`).join(". ") ||
    "No detailed area observations provided.";

  const prompt = `
You are an expert real estate investment analyst. Provide a complete analysis for the property at "${address}" using the estimated rehab costs below.

Property:
- Purchase Price: $${purchasePrice}
- Estimated Rehab Cost: ${totalRepairCost}
- Condition Summary: ${propertySummary}

Use Google Search to find recent comparable sales in the local market to determine an accurate After Repair Value (ARV).

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

IMPORTANT: For suggestedMAO, calculate using the 70% rule: (ARV * 0.70) - Repair Costs
`.trim();

  const body = { contents: [{ parts: [{ text: prompt }] }] };
  const data = await postGenerateContent(body);
  const text =
    data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join("") ?? "";

  const m = text.match(/```json\s*([\s\S]*?)\s*```/);
  if (!m || !m[1]) {
    throw new Error("Could not find JSON in the model's response for investment analysis.");
  }

  try {
    const parsedJson = JSON.parse(m[1]);

    // ✅ ADDED: Enhanced business logic with accurate MAO calculation
    const parseCurrency = (value: string | number): number => {
      if (typeof value === 'number') return value;
      if (typeof value !== 'string') return 0;
      const match = value.match(/[\d,.]+/);
      if (!match) return 0;
      return parseFloat(match[0].replace(/,/g, '')) || 0;
    };

    const getMaxFromRange = (range: string): number => {
      if (typeof range !== 'string') return 0;
      const matches = range.match(/[\d,.]+/g);
      if (!matches) return 0;
      const numbers = matches.map(m => parseFloat(m.replace(/,/g, ''))).filter(n => !isNaN(n));
      return numbers.length > 0 ? Math.max(...numbers) : 0;
    };

    // Parse values
    const numericPurchasePrice = parseFloat(purchasePrice) || 0;
    const numericARV = parseCurrency(parsedJson.suggestedARV);
    const numericMaxRehab = getMaxFromRange(estimation.summary.totalEstimatedCost);

    // Calculate proper MAO using 70% rule
    const numericMAO = (numericARV * 0.70) - numericMaxRehab;
    
    // Format for display
    const formatCurrency = (num: number) => new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD', 
      maximumFractionDigits: 0 
    }).format(num);

    // Add calculated values to response
    parsedJson.purchasePrice = formatCurrency(numericPurchasePrice);
    parsedJson.suggestedMAO = formatCurrency(numericMAO);

    // Determine if deal fits criteria
    const fitsCriteria = numericPurchasePrice > 0 && numericMAO > 0 && numericPurchasePrice <= numericMAO;
    const profitPotential = numericARV - numericPurchasePrice - numericMaxRehab;
    const marginPercentage = numericARV > 0 ? (profitPotential / numericARV) * 100 : 0;

    // Enhanced deal analysis
    let dealVerdict: string;
    if (fitsCriteria && profitPotential > (numericARV * 0.15)) {
      dealVerdict = `🟢 EXCELLENT DEAL: Purchase price is ${formatCurrency(numericMAO - numericPurchasePrice)} below the Maximum Allowable Offer (MAO) with strong profit potential of ${formatCurrency(profitPotential)} (${marginPercentage.toFixed(1)}% margin).`;
    } else if (fitsCriteria && profitPotential > (numericARV * 0.10)) {
      dealVerdict = `🔵 GOOD DEAL: Purchase price meets the 70% rule with acceptable profit potential of ${formatCurrency(profitPotential)} (${marginPercentage.toFixed(1)}% margin).`;
    } else if (numericPurchasePrice <= (numericMAO * 1.1)) {
      dealVerdict = `🟡 MARGINAL DEAL: Purchase price is ${formatCurrency(numericPurchasePrice - numericMAO)} above the MAO. Consider negotiating lower or factor in additional risks.`;
    } else {
      dealVerdict = `🔴 POOR DEAL: Purchase price of ${formatCurrency(numericPurchasePrice)} significantly exceeds the MAO of ${formatCurrency(numericMAO)}. This deal does not meet standard investor criteria.`;
    }

    parsedJson.investorFit.fitsCriteria = fitsCriteria;
    parsedJson.investorFit.analysis = `${dealVerdict}\n\n**Detailed Analysis:**\n${parsedJson.investorFit.analysis}`;
  
  return JSON.parse(m[1]) as InvestmentAnalysis;

  } catch (parseError) {
    console.error("Failed to parse investment analysis JSON:", parseError, "Raw response:", text);
    throw new Error("Failed to get a valid investment analysis from the AI.");
  }  
}
