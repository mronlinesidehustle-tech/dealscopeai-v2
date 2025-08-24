/* components/InvestmentAnalysisReport.tsx
   --------------------------------------------------
   One-stop, clean copy - paste version              */

import React from 'react';
import type {
  InvestmentAnalysis,
  ComparableProperty,
  ExitStrategy,
} from '../types';
import { REPAIR_LEVEL_INFO } from '../constants';

/* ---------- props ---------- */
interface InvestmentAnalysisReportProps {
  analysis: InvestmentAnalysis;
  // If you ever need to let the user edit the price,
  // add   onUpdatePurchasePrice?: (price: string) => void
}

/* ---------- little helpers ---------- */
const StatCard: React.FC<{
  title: string;
  value: string | undefined;
  className?: string;
}> = ({ title, value, className = '' }) => (
  <div
    className={`bg-white p-4 rounded-lg shadow-md border border-slate-200 dark:bg-slate-800/50 dark:border-slate-700 ${className}`}
  >
    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
      {title}
    </p>
    <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">
      {value ?? 'N/A'}
    </p>
  </div>
);

const InvestorFitCard: React.FC<{
  fit: { fitsCriteria: boolean; analysis: string };
}> = ({ fit }) => {
  const bgColor = fit.fitsCriteria
    ? 'bg-green-100 border-green-300 dark:bg-green-900/30 dark:border-green-700/50'
    : 'bg-red-100 border-red-300 dark:bg-red-900/30 dark:border-red-700/50';
  const textColor = fit.fitsCriteria
    ? 'text-green-800 dark:text-green-200'
    : 'text-red-800 dark:text-red-200';

  const icon = fit.fitsCriteria ? (
    /* check-mark */
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-8 w-8 mr-3"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ) : (
    /* X icon */
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-8 w-8 mr-3"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );

  return (
    <div className={`p-5 rounded-lg border ${bgColor} ${textColor}`}>
      <div className="flex items-center mb-2">
        {icon}
        <h4 className="text-xl font-bold">
          {fit.fitsCriteria
            ? 'This Deal Fits Investor Criteria'
            : 'This Deal May Not Fit Criteria'}
        </h4>
      </div>
      <p className="text-sm">{fit.analysis}</p>
    </div>
  );
};

const CompsTable: React.FC<{ comps: ComparableProperty[] }> = ({ comps }) => (
  <div className="overflow-x-auto">
    <table className="min-w-full bg-white border border-slate-200 text-sm dark:bg-slate-800 dark:border-slate-700">
      <thead className="bg-slate-50 dark:bg-slate-700/50">
        <tr>
          {['Address', 'Sold Date', 'Sold Price', 'SqFt', 'Bed/Bath'].map(
            (header) => (
              <th
                key={header}
                className="px-4 py-2 text-left font-semibold text-slate-600 dark:text-slate-300"
              >
                {header}
              </th>
            )
          )}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
        {comps.map((comp, idx) => (
          <tr
            key={idx}
            className="hover:bg-slate-50 dark:hover:bg-slate-700/50"
          >
            <td className="px-4 py-2 text-slate-700 dark:text-slate-300">
              {comp.address}
            </td>
            <td className="px-4 py-2 text-slate-700 dark:text-slate-300">
              {comp.soldDate}
            </td>
            <td className="px-4 py-2 font-medium text-slate-800 dark:text-slate-200">
              {comp.soldPrice}
            </td>
            <td className="px-4 py-2 text-slate-700 dark:text-slate-300">
              {comp.sqft}
            </td>
            <td className="px-4 py-2 text-slate-700 dark:text-slate-300">
              {comp.bedBath}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

/* ---------- main component ---------- */
export const InvestmentAnalysisReport: React.FC<
  InvestmentAnalysisReportProps
> = ({ analysis /*, onUpdatePurchasePrice */ }) => {
  /* debug */
  console.log('🎯 REPORT – analysis received:', analysis);

  /* badge colour helper */
  const repairInfo =
    REPAIR_LEVEL_INFO[analysis.estimatedRepairLevel] ||
    REPAIR_LEVEL_INFO['Unknown'];
  const darkRepairInfoColor = repairInfo.color
    .replace('bg-green-100', 'dark:bg-green-900/50')
    .replace('text-green-800', 'dark:text-green-300')
    .replace('bg-yellow-100', 'dark:bg-yellow-900/50')
    .replace('text-yellow-800', 'dark:text-yellow-300')
    .replace('bg-orange-100', 'dark:bg-orange-900/50')
    .replace('text-orange-800', 'dark:text-orange-300')
    .replace('bg-red-100', 'dark:bg-red-900/50')
    .replace('text-red-800', 'dark:text-red-300')
    .replace('bg-slate-100', 'dark:bg-slate-700/50')
    .replace('text-slate-800', 'dark:text-slate-300');

  return (
    <section className="space-y-8">
      {/* ---- header stats ---- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Purchase Price" value={analysis.purchasePrice} />
        <StatCard title="Suggested ARV" value={analysis.suggestedARV} />
        <StatCard
          title="Estimated Repair Cost"
          value={analysis.estimatedRepairCost}
        />
        <StatCard
          title="Suggested MAO (70% Rule)"
          value={analysis.suggestedMAO}
        />
      </div>

      {/* ---- deal analysis ---- */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 dark:bg-slate-800/50 dark:border-slate-700 space-y-6">
        <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
          Deal Analysis
        </h3>
        <InvestorFitCard fit={analysis.investorFit} />

        <div>
          <h4 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Property Condition
          </h4>
          <p className="text-slate-600 dark:text-slate-400 mb-3">
            {analysis.propertyCondition}
          </p>
          <div className="flex items-center">
            <span
              className={`px-2 py-1 text-xs font-semibold rounded-full ${repairInfo.color} ${darkRepairInfoColor}`}
            >
              {analysis.estimatedRepairLevel} Rehab
            </span>
            <p className="ml-3 text-sm text-slate-500 dark:text-slate-400">
              {repairInfo.description}
            </p>
          </div>
        </div>
      </div>

      {/* ---- comps ---- */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 dark:bg-slate-800/50 dark:border-slate-700">
        <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">
          Comparable Sales
        </h3>
        <CompsTable comps={analysis.comparables} />
      </div>

      {/* ---- exit strategies ---- */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 dark:bg-slate-800/50 dark:border-slate-700">
        <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">
          Exit Strategies
        </h3>
        <div className="space-y-4">
          {analysis.exitStrategies.map((strat: ExitStrategy, idx) => (
            <div key={idx}>
              <h4 className="font-bold text-sky-700 dark:text-sky-400">
                {strat.strategy}
              </h4>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                {strat.details}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ---- data sources ---- */}
      {analysis.groundingSources && analysis.groundingSources.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 dark:bg-slate-800/50 dark:border-slate-700">
          <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">
            Data Sources
          </h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            {analysis.groundingSources.map((src, idx) => (
              <li key={idx}>
                <a
                  href={src.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-600 hover:underline dark:text-sky-400"
                >
                  {src.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};
