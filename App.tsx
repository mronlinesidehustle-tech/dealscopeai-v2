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
    const [investmentAnalysis, setInvestmentAnalysis] = useState<InvestmentAnalysis | null>(null);
    
    // UI/Flow states
    const [currentView, setCurrentView] = useState<AppView>('input');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isAnalyzingInvestment, setIsAnalyzingInvestment] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // ✅ Updated handleAnalyze
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
        setIsLoading(true);
