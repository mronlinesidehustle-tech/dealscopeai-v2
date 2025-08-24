// App.tsx - PATCH: Add purchase price state management

import React, { useState } from 'react';
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
  // Data states (caches)
  const [estimation, setEstimation] = useState<Estimation | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [analyzedAddress, setAnalyzedAddress] = useState<string>('');
  const [purchasePrice, setPurchasePrice] = useState<string>(''); // ✅ ADDED: Store purchase price
  const [investmentAnalysis, setInvestmentAnalysis] = useState<InvestmentAnalysis | null>(null);

  // UI/Flow states
  const [currentView, setCurrentView] = useState<AppView>('input');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAnalyzingInvestment, setIsAnalyzingInvestment] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Analyze rehab
  const handleAnalyze = async (
    address: string,
    files: UploadedFile[],
    finishLevel: MockupLevel,
    purchasePrice: string
  ) => {
    if (!address || files.length === 0) {
      setError('Please provide a property address and at least one photo.');
      return;
    }

    handleReset(); // Clear old data for a new analysis
    // 🚀 DEBUG: Your hardcoded test
    const hardcodedPrice = '185000';
    console.log('🚀 Setting hardcoded purchase price:', hardcodedPrice);
    setPurchasePrice(hardcodedPrice);
    setIsLoading(true);
    setError(null);
    setUploadedFiles(files);
    setAnalyzedAddress(address);

    try {
      const { markdown, sources } = await getRehabEstimate(
        address,
        files,
        finishLevel,
        hardcodedPrice // ← Use hardcoded value here too

      );
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

  // Reset state
  const handleReset = () => {
    setEstimation(null);
    setIsLoading(false);
    setError(null);
    setUploadedFiles([]);
    setAnalyzedAddress('');
    setPurchasePrice(''); // ✅ ADDED: Reset purchase price
    setInvestmentAnalysis(null);
    setIsAnalyzingInvestment(false);
    setCurrentView('input');
  };

  // Analyze investment
  // Fixed handleAnalyzeInvestment function - COPY THIS ENTIRE FUNCTION

const handleAnalyzeInvestment = async () => {
  console.log('🔍 DEBUG - Current purchasePrice state:', purchasePrice);
  console.log('🔍 DEBUG - analyzedAddress:', analyzedAddress);
    
  if (!estimation || !analyzedAddress) {
    setError('Please generate a rehab estimate first.');
    return;
  }
    
  setIsAnalyzingInvestment(true);
  setError(null);

  try {
    console.log('📊 Calling getInvestmentAnalysis with:', {
      address: analyzedAddress,
      purchasePrice: purchasePrice
    });
    
    const analysisResult = await getInvestmentAnalysis(
      analyzedAddress,
      estimation,
      purchasePrice
    );
      
    console.log('✅ Investment analysis result:', analysisResult);
    setInvestmentAnalysis(analysisResult); // ← Fixed: was "analysis", should be "analysisResult"
  } catch (e) {
    console.error('❌ Investment analysis failed:', e);
    setError(`Failed to generate investment analysis: ${e instanceof Error ? e.message : 'Unknown error'}`);
  } finally {
    setIsAnalyzingInvestment(false);
  }
};

  // ✅ ADDED: Handle purchase price updates
  const handleUpdatePurchasePrice = async (newPrice: string) => {
    if (!estimation || !analyzedAddress) return;
    
    setPurchasePrice(newPrice);
    
    // Re-run the investment analysis with the new price
    setIsAnalyzingInvestment(true);
    setError(null);
    try {
      const analysis = await getInvestmentAnalysis(analyzedAddress, estimation, newPrice);
      setInvestmentAnalysis(analysis);
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Failed to update investment analysis. ${errorMessage}`);
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

    switch (currentView) {
      case 'investment_analysis':
        return investmentAnalysis ? (
          <div className="space-y-6">
            <button
              onClick={handleBackToReport}
              className="text-sm font-semibold text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300"
            >
              &larr; Back to Rehab Estimate
            </button>
            <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
              Investment Analysis:{' '}
              <span className="text-sky-600 dark:text-sky-400 break-words">{analyzedAddress}</span>
            </h2>
            <InvestmentAnalysisReport 
              analysis={investmentAnalysis} 
              onUpdatePurchasePrice={handleUpdatePurchasePrice} // ✅ ADDED: Pass update handler
            />
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

  const showStartNewButton =
    !isLoading && !isAnalyzingInvestment && (currentView === 'report' || currentView === 'investment_analysis');

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

        {error && (
          <div className="my-6 p-4 bg-red-100 text-red-700 border border-red-300 rounded-lg dark:bg-red-900/20 dark:text-red-300 dark:border-red-500/30">
            {error}
          </div>
        )}

        {renderContent()}
      </main>
      <Footer />
    </div>
  );
};

export default App;
