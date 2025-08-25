import React, { useState, useEffect } from 'react';
import { Footer } from './components/Footer';
import { Step1InputForm } from './components/Step1InputForm';
import { EstimationReport } from './components/EstimationReport';
import { Loader } from './components/Loader';
import { getRehabEstimate, getInvestmentAnalysis } from './services/geminiService';
import { InvestmentAnalysisReport } from './components/InvestmentAnalysisReport';
import type { UploadedFile, Estimation, MockupLevel, InvestmentAnalysis } from './types';
import { parseEstimationMarkdown } from './utils/parsing';

type AppView = 'input' | 'report' | 'investment_analysis';

const App: React.FC = () => {
    console.log('App component rendering...');
    
    useEffect(() => {
        console.log('App component mounted');
        console.log('Current environment variables:', {
            NODE_ENV: import.meta.env.MODE,
            VITE_API_KEY: import.meta.env.VITE_API_KEY ? 'Set' : 'Not set'
        });
    }, []);

    // Check for required environment variables
    const apiKey = import.meta.env.VITE_API_KEY;
    console.log('API Key check:', apiKey ? 'Present' : 'Missing');
    
    if (!apiKey) {
        console.log('Rendering API key error message');
        return (
            <div className="min-h-screen font-sans flex flex-col items-center justify-center p-8 bg-slate-50 text-slate-800">
                <div className="max-w-md text-center">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">Configuration Error</h1>
                    <p className="text-slate-600 mb-4">
                        The VITE_API_KEY environment variable is not set. This app requires a Google AI API key to function.
                    </p>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
                        <p className="font-semibold mb-2">To fix this:</p>
                        <ol className="text-left list-decimal list-inside space-y-1">
                            <li>Go to your Vercel project dashboard</li>
                            <li>Navigate to Settings → Environment Variables</li>
                            <li>Add VITE_API_KEY with your Google AI API key</li>
                            <li>Redeploy the application</li>
                        </ol>
                    </div>
                </div>
            </div>
        );
    }

    console.log('API key present, rendering main app');

    // Data states (caches)
    const [estimation, setEstimation] = useState<Estimation | null>(null);
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
    const [analyzedAddress, setAnalyzedAddress] = useState<string>('');
    const [purchasePrice, setPurchasePrice] = useState<string>('');
    const [investmentAnalysis, setInvestmentAnalysis] = useState<InvestmentAnalysis | null>(null);
    
    // UI/Flow states
    const [currentView, setCurrentView] = useState<AppView>('input');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isAnalyzingInvestment, setIsAnalyzingInvestment] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleAnalyze = async (address: string, files: UploadedFile[], finishLevel: MockupLevel, price: string) => {
        if (!address || !price || files.length === 0) {
            setError('Please provide a property address, purchase price, and at least one photo.');
            return;
        }
        handleReset(); // Clear old data for a new analysis
        setIsLoading(true);
        setError(null);
        setUploadedFiles(files);
        setAnalyzedAddress(address);
        setPurchasePrice(price);

        try {
            const { markdown, sources } = await getRehabEstimate(address, files, finishLevel);
            const parsedEstimation = parseEstimationMarkdown(markdown);
            parsedEstimation.summary.groundingSources = sources;
            setEstimation(parsedEstimation);
            setCurrentView('report');
        } catch (e) {
            console.error(e);
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
            setError(`Failed to generate the rehab estimate. ${errorMessage}`);
            setCurrentView('input');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleReset = () => {
        setEstimation(null);
        setIsLoading(false);
        setError(null);
        setUploadedFiles([]);
        setAnalyzedAddress('');
        setPurchasePrice('');
        setInvestmentAnalysis(null);
        setIsAnalyzingInvestment(false);
        setCurrentView('input');
    };

    const handleAnalyzeInvestment = async () => {
        // If data is already cached, just switch the view
        if (investmentAnalysis) {
            setCurrentView('investment_analysis');
            return;
        }

        if (!estimation || !analyzedAddress) return;
        
        setIsAnalyzingInvestment(true);
        setError(null);
        try {
            const analysis = await getInvestmentAnalysis(analyzedAddress, estimation, purchasePrice);
            setInvestmentAnalysis(analysis);
            setCurrentView('investment_analysis');
        } catch (e) {
            console.error(e);
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
            setError(`Failed to generate investment analysis. ${errorMessage}`);
        } finally {
            setIsAnalyzingInvestment(false);
        }
    };
    
    const handleBackToReport = () => {
        setCurrentView('report');
        setError(null);
    };

    const renderContent = () => {
        if (isLoading) return <Loader message="Analyzing property and generating rehab estimate..." />;
        if (isAnalyzingInvestment) return <Loader message="Performing investment analysis..." />;
        
        switch(currentView) {
            case 'investment_analysis':
                return investmentAnalysis ? (
                    <div className="space-y-6">
                        <button onClick={handleBackToReport} className="text-sm font-semibold text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300">
                            &larr; Back to Rehab Estimate
                        </button>
                        <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Investment Analysis: <span className="text-sky-600 dark:text-sky-400 break-words">{analyzedAddress}</span></h2>
                        <InvestmentAnalysisReport analysis={investmentAnalysis} />
                    </div>
                ) : null;
            
            case 'report':
                return estimation ? (
                    <EstimationReport 
                        estimation={estimation} 
                        address={analyzedAddress} 
                        onAnalyzeInvestment={handleAnalyzeInvestment}
                        investmentAnalysis={investmentAnalysis}
                    />
                ) : null;

            case 'input':
            default:
                return <Step1InputForm onAnalyze={handleAnalyze} isLoading={isLoading} />;
        }
    };

    const showStartNewButton = !isLoading && !isAnalyzingInvestment && (currentView === 'report' || currentView === 'investment_analysis');

    return (
        <div className="min-h-screen font-sans flex flex-col">
            <main className="container mx-auto p-4 md:p-8 flex-grow">
                {showStartNewButton && (
                     <button
                        onClick={handleReset}
                        className="mb-6 bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 transition-colors duration-300"
                    >
                        Start New Analysis
                    </button>
                )}

                {error && <div className="my-6 p-4 bg-red-100 text-red-700 border border-red-300 rounded-lg dark:bg-red-900/20 dark:text-red-300 dark:border-red-500/30">{error}</div>}

                {renderContent()}
            </main>
            <Footer />
        </div>
    );
};

export default App;
