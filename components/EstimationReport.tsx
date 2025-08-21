import React, { useState } from 'react';
import type { Estimation, RepairItem, EstimationSummary, InvestmentAnalysis } from '../types';
import { DIFFICULTY_COLORS, DIFFICULTY_DESCRIPTIONS } from '../constants';
import { generatePdfReport } from '../utils/pdfGenerator';

interface EstimationReportProps {
    estimation: Estimation;
    address: string;
    onAnalyzeInvestment: () => void;
    investmentAnalysis: InvestmentAnalysis | null;
}

const DownloadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

const ChartIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
);

const WarningIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
    </svg>
);

const LightbulbIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.311a12.06 12.06 0 0 0-4.5 0m4.5 0a3.003 3.003 0 0 0 3.75 0m-3.75 0a3.003 3.003 0 0 1-3.75 0m7.5 0a3.003 3.003 0 0 0 3.75 0m-3.75 0a3.003 3.003 0 0 1-3.75 0m-3.75 2.311a12.06 12.06 0 0 0-4.5 0m3.75 2.311a12.06 12.06 0 0 1-4.5 0M3 12a9 9 0 0 1 18 0v2.25a1.5 1.5 0 0 1-1.5 1.5H4.5a1.5 1.5 0 0 1-1.5-1.5V12Z" />
    </svg>
);

const DifficultyBadge: React.FC<{ level: number }> = ({ level }) => (
    <div className="flex items-center">
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${DIFFICULTY_COLORS[level] || 'bg-gray-200'}`}>
            {DIFFICULTY_DESCRIPTIONS[level] || 'Unknown'}
        </span>
    </div>
);

const SummaryCard: React.FC<{ summary: EstimationSummary }> = ({ summary }) => (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 dark:bg-slate-800/50 dark:border-slate-700">
        <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">Project Summary</h3>
        <div className="grid md:grid-cols-2 gap-6">
            <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Estimated Cost</p>
                <p className="text-3xl font-bold text-sky-600 dark:text-sky-400">{summary.totalEstimatedCost}</p>
            </div>
            <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Overall Difficulty</p>
                <div className="flex items-baseline space-x-2 mt-1">
                    <p className="text-3xl font-bold text-slate-800 dark:text-slate-200">{summary.overallDifficulty}/5</p>
                    <DifficultyBadge level={summary.overallDifficulty} />
                </div>
            </div>
        </div>
        <div className="mt-6 space-y-6">
            {summary.keyRisks && summary.keyRisks.length > 0 && (
                <div>
                    <h4 className="flex items-center text-lg font-semibold text-orange-600 dark:text-orange-400 mb-2">
                        <WarningIcon className="h-5 w-5 mr-2" />
                        Key Risks
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400 text-sm pl-1">
                        {summary.keyRisks.map((risk, index) => <li key={index}>{risk}</li>)}
                    </ul>
                </div>
            )}
            {summary.actionableAdvice && summary.actionableAdvice.length > 0 && (
                <div>
                    <h4 className="flex items-center text-lg font-semibold text-sky-600 dark:text-sky-400 mb-2">
                        <LightbulbIcon className="h-5 w-5 mr-2" />
                        Actionable Advice
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400 text-sm pl-1">
                        {summary.actionableAdvice.map((advice, index) => <li key={index}>{advice}</li>)}
                    </ul>
                </div>
            )}
            {summary.assumptions && summary.assumptions.length > 0 && (
                 <div>
                    <h4 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">Assumptions & Notes</h4>
                    <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400 text-sm pl-1">
                        {summary.assumptions.map((note, index) => <li key={index}>{note}</li>)}
                    </ul>
                </div>
            )}
        </div>
    </div>
);


const RepairItemCard: React.FC<{ item: RepairItem; }> = ({ item }) => {
    return (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 transition-shadow hover:shadow-md dark:bg-slate-800/50 dark:border-slate-700 dark:hover:shadow-slate-700/50">
            <div className="flex justify-between items-start mb-3">
                <h4 className="text-xl font-bold text-slate-800 dark:text-slate-100">{item.area}</h4>
                <span className="text-lg font-semibold text-slate-700 dark:text-slate-300">{item.estimatedCost}</span>
            </div>
            <div className="space-y-4">
                <div>
                    <h5 className="font-semibold text-slate-600 dark:text-slate-400 text-sm mb-1">Observations</h5>
                    <p className="text-slate-700 dark:text-slate-300">{item.observations}</p>
                </div>
                <div>
                    <h5 className="font-semibold text-slate-600 dark:text-slate-400 text-sm mb-1">Recommendations</h5>
                    <p className="text-slate-700 dark:text-slate-300">{item.recommendations}</p>
                </div>
                 <div>
                    <h5 className="font-semibold text-slate-600 dark:text-slate-400 text-sm mb-1">Difficulty</h5>
                    <DifficultyBadge level={item.difficulty} />
                </div>
            </div>
        </div>
    );
};

export const EstimationReport: React.FC<EstimationReportProps> = ({ estimation, address, onAnalyzeInvestment, investmentAnalysis }) => {
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownloadPdf = async () => {
        if (!estimation) return;
        setIsDownloading(true);
        try {
            await generatePdfReport(estimation, investmentAnalysis, address);
        } catch (error) {
            console.error("Failed to generate PDF:", error);
            // Optionally, show an error message to the user
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <section>
            <div className="flex flex-col md:flex-row justify-end items-center gap-4 mb-6">
                 <button
                    onClick={onAnalyzeInvestment}
                    className="flex items-center justify-center bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors duration-300 w-full md:w-auto"
                >
                    <ChartIcon />
                    Analyze Investment Potential
                </button>
                <button
                    onClick={handleDownloadPdf}
                    disabled={isDownloading}
                    className="flex items-center justify-center bg-sky-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-sky-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors duration-300 w-full md:w-auto"
                >
                    <DownloadIcon />
                    {isDownloading ? 'Generating...' : 'Download PDF'}
                </button>
            </div>
            
            <div className="space-y-8">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-1">Rehab Estimate</h2>
                    <p className="text-slate-600 dark:text-slate-400 break-words">{address}</p>
                </div>
                
                <SummaryCard summary={estimation.summary} />

                <div>
                     <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">Itemized Breakdown</h3>
                     <div className="space-y-4">
                        {estimation.repairs.map((item, index) => (
                            <RepairItemCard key={index} item={item} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};