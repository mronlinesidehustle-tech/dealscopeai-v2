// components/InvestmentAnalysisReport.tsx
// ENHANCED VERSION: Combines editable functionality with advanced deal analysis

import React, { useState } from 'react';
import type { InvestmentAnalysis, ComparableProperty, ExitStrategy } from '../types';
import { REPAIR_LEVEL_INFO } from '../constants';

interface InvestmentAnalysisReportProps {
    analysis: InvestmentAnalysis;
    onUpdatePurchasePrice?: (newPrice: string) => void;
}

const StatCard: React.FC<{ title: string; value: string; className?: string }> = ({ title, value, className = '' }) => (
    <div className={`bg-white p-4 rounded-lg shadow-md border border-slate-200 dark:bg-slate-800/50 dark:border-slate-700 ${className}`}>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
        <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">{value || 'N/A'}</p>
    </div>
);

// Enhanced Editable StatCard with better styling
const EditableStatCard: React.FC<{ 
    title: string; 
    value: string; 
    onUpdate: (newValue: string) => void;
    className?: string 
}> = ({ title, value, onUpdate, className = '' }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(value.replace(/[$,]/g, ''));

    const handleSave = () => {
        const numericValue = parseFloat(editValue);
        if (!isNaN(numericValue) && numericValue > 0) {
            onUpdate(numericValue.toString());
            setIsEditing(false);
        }
    };

    const handleCancel = () => {
        setEditValue(value.replace(/[$,]/g, ''));
        setIsEditing(false);
    };

    const formatCurrency = (val: string) => {
        const num = parseFloat(val.replace(/[$,]/g, ''));
        return isNaN(num) ? val : new Intl.NumberFormat('en-US', { 
            style: 'currency', 
            currency: 'USD', 
            maximumFractionDigits: 0 
        }).format(num);
    };

    return (
        <div className={`bg-white p-4 rounded-lg shadow-md border border-slate-200 dark:bg-slate-800/50 dark:border-slate-700 relative group cursor-pointer hover:shadow-lg transition-shadow ${className}`}>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
            {isEditing ? (
                <div className="flex items-center space-x-2 mt-1">
                    <span className="text-2xl font-bold text-slate-800 dark:text-slate-200">$</span>
                    <input
                        type="number"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="flex-1 text-xl font-bold bg-transparent border-b-2 border-sky-500 text-slate-800 dark:text-slate-200 focus:outline-none"
                        autoFocus
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSave();
                            if (e.key === 'Escape') handleCancel();
                        }}
                    />
                    <button
                        onClick={handleSave}
                        className="text-green-600 hover:text-green-700 p-1 text-sm font-bold"
                        title="Save (Enter)"
                    >
                        ✓
                    </button>
                    <button
                        onClick={handleCancel}
                        className="text-red-600 hover:text-red-700 p-1 text-sm"
                        title="Cancel (Esc)"
                    >
                        ✕
                    </button>
                </div>
            ) : (
                <div className="flex items-center justify-between" onClick={() => setIsEditing(true)}>
                    <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">{formatCurrency(value)}</p>
                    <div className="text-sky-600 hover:text-sky-700 p-1 opacity-0 group-hover:opacity-100 transition-opacity text-sm">
                        ✏️ Edit
                    </div>
                </div>
            )}
        </div>
    );
};

// Enhanced InvestorFitCard with deal scoring
const InvestorFitCard: React.FC<{ 
    fit: { fitsCriteria: boolean; analysis: string };
    purchasePrice?: string;
    suggestedMAO?: string;
    suggestedARV?: string;
    estimatedRepairCost?: string;
}> = ({ fit, purchasePrice, suggestedMAO, suggestedARV, estimatedRepairCost }) => {
    
    // Calculate deal metrics if we have the data
    const calculateDealMetrics = () => {
        if (!purchasePrice || !suggestedARV || !estimatedRepairCost) return null;
        
        const purchase = parseFloat(purchasePrice.replace(/[$,]/g, ''));
        const arv = parseFloat(suggestedARV.replace(/[$,]/g, ''));
        const repairs = parseFloat(estimatedRepairCost.replace(/[$,]/g, ''));
        const mao = parseFloat(suggestedMAO?.replace(/[$,]/g, '') || '0');
        
        if (isNaN(purchase) || isNaN(arv) || isNaN(repairs)) return null;
        
        const totalInvestment = purchase + repairs;
        const potentialProfit = arv - totalInvestment;
        const profitMargin = (potentialProfit / arv) * 100;
        const maoExcess = purchase - mao;
        
        return {
            potentialProfit,
            profitMargin,
            maoExcess,
            totalInvestment
        };
    };
    
    const metrics = calculateDealMetrics();
    
    // Determine deal quality
    const getDealQuality = () => {
        if (!metrics) return { color: 'bg-slate-100 border-slate-300', status: 'Unknown', icon: '❓' };
        
        if (metrics.maoExcess <= 0 && metrics.profitMargin >= 15) {
            return { color: 'bg-green-100 border-green-300 dark:bg-green-900/30 dark:border-green-700/50', status: 'Excellent Deal', icon: '🟢' };
        } else if (metrics.maoExcess <= 0 && metrics.profitMargin >= 10) {
            return { color: 'bg-blue-100 border-blue-300 dark:bg-blue-900/30 dark:border-blue-700/50', status: 'Good Deal', icon: '🔵' };
        } else if (Math.abs(metrics.maoExcess) <= (parseFloat(suggestedMAO?.replace(/[$,]/g, '') || '0') * 0.1)) {
            return { color: 'bg-yellow-100 border-yellow-300 dark:bg-yellow-900/30 dark:border-yellow-700/50', status: 'Marginal Deal', icon: '🟡' };
        } else {
            return { color: 'bg-red-100 border-red-300 dark:bg-red-900/30 dark:border-red-700/50', status: 'Poor Deal', icon: '🔴' };
        }
    };
    
    const dealQuality = getDealQuality();
    const textColor = dealQuality.color.includes('green') ? 'text-green-800 dark:text-green-200' :
                     dealQuality.color.includes('blue') ? 'text-blue-800 dark:text-blue-200' :
                     dealQuality.color.includes('yellow') ? 'text-yellow-800 dark:text-yellow-200' :
                     dealQuality.color.includes('red') ? 'text-red-800 dark:text-red-200' :
                     'text-slate-800 dark:text-slate-200';

    return (
        <div className={`p-5 rounded-lg border ${dealQuality.color} ${textColor}`}>
            <div className="flex items-center mb-3">
                <span className="text-2xl mr-3">{dealQuality.icon}</span>
                <h4 className="text-xl font-bold">{dealQuality.status}</h4>
            </div>
            
            {metrics && (
                <div className="mb-4 grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="font-semibold">Potential Profit:</span>
                        <br />
                        <span className={metrics.potentialProfit > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                            ${metrics.potentialProfit.toLocaleString()}
                        </span>
                    </div>
                    <div>
                        <span className="font-semibold">Profit Margin:</span>
                        <br />
                        <span className={metrics.profitMargin > 10 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                            {metrics.profitMargin.toFixed(1)}%
                        </span>
                    </div>
                </div>
            )}
            
            <p className="text-sm whitespace-pre-wrap">{fit.analysis}</p>
        </div>
    );
};

const CompsTable: React.FC<{ comps: ComparableProperty[] }> = ({ comps }) => (
    <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-slate-200 text-sm dark:bg-slate-800 dark:border-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
                <tr>
                    {['Address', 'Sold Date', 'Sold Price', 'SqFt', 'Bed/Bath'].map(header => (
                        <th key={header} className="px-4 py-2 text-left font-semibold text-slate-600 dark:text-slate-300">{header}</th>
                    ))}
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {comps.map((comp, index) => (
                    <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                        <td className="px-4 py-2 text-slate-700 dark:text-slate-300">{comp.address}</td>
                        <td className="px-4 py-2 text-slate-700 dark:text-slate-300">{comp.soldDate}</td>
                        <td className="px-4 py-2 font-medium text-slate-800 dark:text-slate-200">{comp.soldPrice}</td>
                        <td className="px-4 py-2 text-slate-700 dark:text-slate-300">{comp.sqft}</td>
                        <td className="px-4 py-2 text-slate-700 dark:text-slate-300">{comp.bedBath}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

export const InvestmentAnalysisReport: React.FC<InvestmentAnalysisReportProps> = ({ 
    analysis, 
    onUpdatePurchasePrice 
}) => {
    const repairInfo = REPAIR_LEVEL_INFO[analysis.estimatedRepairLevel] || REPAIR_LEVEL_INFO['Unknown'];
    const darkRepairInfoColor = repairInfo.color
        .replace('bg-green-100', 'dark:bg-green-900/50').replace('text-green-800', 'dark:text-green-300')
        .replace('bg-yellow-100', 'dark:bg-yellow-900/50').replace('text-yellow-800', 'dark:text-yellow-300')
        .replace('bg-orange-100', 'dark:bg-orange-900/50').replace('text-orange-800', 'dark:text-orange-300')
        .replace('bg-red-100', 'dark:bg-red-900/50').replace('text-red-800', 'dark:text-red-300')
        .replace('bg-slate-100', 'dark:bg-slate-700/50').replace('text-slate-800', 'dark:text-slate-300');

    const handlePurchasePriceUpdate = (newPrice: string) => {
        if (onUpdatePurchasePrice) {
            onUpdatePurchasePrice(newPrice);
        }
    };

    // Responsive grid: 1 col on mobile, 2 on tablet, 4 on desktop for better mobile experience
    return (
        <section className="space-y-8">
            {/* Stats Grid - Responsive Layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {onUpdatePurchasePrice && analysis.purchasePrice ? (
                    <EditableStatCard 
                        title="Purchase Price" 
                        value={analysis.purchasePrice} 
                        onUpdate={handlePurchasePriceUpdate}
                        className="sm:col-span-1"
                    />
                ) : analysis.purchasePrice ? (
                    <StatCard title="Purchase Price" value={analysis.purchasePrice} className="sm:col-span-1" />
                ) : null}
                
                <StatCard title="Estimated Repair Cost" value={analysis.estimatedRepairCost} className="sm:col-span-1" />
                <StatCard title="Suggested ARV" value={analysis.suggestedARV} className="sm:col-span-1" />
                <StatCard 
                    title="Suggested MAO (70% Rule)" 
                    value={analysis.suggestedMAO} 
                    className="bg-sky-50 border-sky-200 dark:bg-sky-900/30 dark:border-sky-700/50 sm:col-span-1" 
                />
            </div>

            {/* Enhanced Deal Analysis */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 dark:bg-slate-800/50 dark:border-slate-700 space-y-6">
                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Deal Analysis</h3>
                <InvestorFitCard 
                    fit={analysis.investorFit} 
                    purchasePrice={analysis.purchasePrice}
                    suggestedMAO={analysis.suggestedMAO}
                    suggestedARV={analysis.suggestedARV}
                    estimatedRepairCost={analysis.estimatedRepairCost}
                />
                
                <div>
                    <h4 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">Property Condition</h4>
                    <p className="text-slate-600 dark:text-slate-400 mb-3">{analysis.propertyCondition}</p>
                    <div className="flex items-center">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${repairInfo.color} ${darkRepairInfoColor}`}>
                            {analysis.estimatedRepairLevel} Rehab
                        </span>
                        <p className="ml-3 text-sm text-slate-500 dark:text-slate-400">{repairInfo.description}</p>
                    </div>
                </div>
            </div>

            {/* Comparable Sales */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 dark:bg-slate-800/50 dark:border-slate-700">
                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">Comparable Sales</h3>
                <CompsTable comps={analysis.comparables} />
            </div>
            
            {/* Exit Strategies */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 dark:bg-slate-800/50 dark:border-slate-700">
                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">Exit Strategies</h3>
                <div className="space-y-4">
                    {analysis.exitStrategies.map((strat, index) => (
                        <div key={index}>
                            <h4 className="font-bold text-sky-700 dark:text-sky-400">{strat.strategy}</h4>
                            <p className="text-slate-600 dark:text-slate-400 text-sm">{strat.details}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Data Sources */}
            {analysis.groundingSources && analysis.groundingSources.length > 0 && (
                <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 dark:bg-slate-800/50 dark:border-slate-700">
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">Data Sources</h3>
                     <ul className="list-disc list-inside space-y-1 text-sm">
                        {analysis.groundingSources.map((source, index) => (
                           <li key={index}>
                                <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:underline dark:text-sky-400">
                                    {source.title}
                                </a>
                           </li>
                        ))}
                    </ul>
                </div>
            )}
        </section>
    );
};
