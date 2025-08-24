// App.tsx
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
  // 🆕  remember the user’s purchase price
  const [purchasePrice, setPurchasePrice] = useState<string>('');   // ← NEW
  const [estimation, setEstimation] = useState<Estimation | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [analyzedAddress, setAnalyzedAddress] = useState<string>('');
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
    
  handleReset();                     // ← resets previous run    
  setPurchasePrice(purchasePrice);   // ✅ keep this here
  setCurrentView('input');
  setIsLoading(true);
  /* …rest of the code… */

try {
      const { markdown, sources } = await getRehabEstimate(
        address,
        files,
        finishLevel,
        purchasePrice
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
    
  // 2️⃣  handleReset – WIPE the old price when you click “Start New Analysis”
  const handleReset = () => {
  setEstimation(null);
  setIsLoading(false);
  setError(null);
  setUploadedFiles([]);
  setAnalyzedAddress('');
  setInvestmentAnalysis(null);
  setIsAnalyzingInvestment(false);
  setPurchasePrice('');              // ✅ add this line
};

  // Reset state
  const handleReset = () => {
    setEstimation(null);
    setIsLoading(false);
    setError(null);
    setUploadedFiles([]);
    setAnalyzedAddress('');
    setInvestmentAnalysis(null);
    setIsAnalyzingInvestment(false);
    setCurrentView('input');
  };

  // Analyze investment
  const handleAnalyzeInvestment = async () => {
  if (!estimation) return;

  setIsAnalyzingInvestment(true);
  try {
    const analysis = await getInvestmentAnalysis(
      analyzedAddress,
      estimation,
      purchasePrice        // <-- use the STATE variable here
    );
    setInvestmentAnalysis(analysis);
    setCurrentView('investment_analysis');
  } catch (err) {
    setError(String(err));
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
