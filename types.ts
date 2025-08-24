

export interface UploadedFile {
    id: string;
    name: string;
    type: string;
    base64: string;
    url: string;
}

export interface RepairItem {
    area: string;
    observations: string;
    recommendations: string;
    estimatedCost: string;
    difficulty: number;
}

export interface EstimationSummary {
    totalEstimatedCost: string;
    overallDifficulty: number;
    assumptions: string[];
    keyRisks: string[];
    actionableAdvice: string[];
    groundingSources: GroundingSource[];
}

export interface Estimation {
    summary: EstimationSummary;
    repairs: RepairItem[];
}

export type MockupLevel = 'Basic' | 'Intermediate' | 'Luxury';

export type RepairLevel = 'Light Cosmetic' | 'Medium' | 'Heavy' | 'Gut' | 'Unknown';

export interface GroundingSource {
    uri: string;
    title: string;
}

export interface ComparableProperty {
    address: string;
    soldDate: string;
    soldPrice: string;
    sqft: string;
    bedBath: string;
}

export interface ExitStrategy {
    strategy: string;
    details: string;
}

export interface InvestmentAnalysis {
    purchasePrice: string; //ADDED: Purchase price field
    suggestedARV: string;
    estimatedRepairCost: string;
    suggestedMAO: string;
    investorFit: {
        fitsCriteria: boolean;
        analysis: string;
    };
    propertyCondition: string;
    estimatedRepairLevel: RepairLevel;
    comparables: ComparableProperty[];
    exitStrategies: ExitStrategy[];
    groundingSources: GroundingSource[];
}
