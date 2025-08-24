/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: { extend: {} },
  plugins: [],
};
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
@tailwind base;
@tailwind components;
@tailwind utilities;

// types.ts
export interface InvestmentAnalysis {
  purchasePrice?: string;            // ✅ ensure this exists
  suggestedARV: string;
  estimatedRepairCost: string;
  suggestedMAO: string;
  investorFit: {
    fitsCriteria: boolean;
    analysis: string;
  };
  // ... any other fields you already have
}

