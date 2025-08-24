import React, { useState } from 'react';
import { Building2, DollarSign, Calculator, TrendingUp, AlertCircle } from 'lucide-react';

// Mock API functions
const searchProperty = async (address: string) => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  return {
    address: address,
    bedrooms: 3,
    bathrooms: 2,
    squareFootage: 1200,
    yearBuilt: 1985,
    estimatedValue: 275000,
    propertyType: 'Single Family Home',
    neighborhood: 'Downtown District'
  };
};

const getRehabAnalysis = async (params: any) => {
  await new Promise(resolve => setTimeout(resolve, 2000));
  return {
    estimatedRepairCost: '45000-50000',
    majorRepairs: [
      'Kitchen renovation ($15,000-18,000)',
      'Bathroom updates ($8,000-10,000)', 
      'Flooring replacement ($6,000-8,000)',
      'Paint and cosmetic work ($3,000-4,000)'
    ],
    timeline: '6-8 weeks',
    permitRequired: true
  };
};

const getInvestmentAnalysis = async (params: any) => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  return {
    purchasePrice: params.purchasePrice,
    suggestedARV: 275000,
    estimatedRepairCost: 50000,
    suggestedMAO: 142500,
    dealAnalysis: 'This Deal Fits Investor Criteria',
    dealDescription: 'This property presents a solid opportunity for investors seeking a fix-and-flip or fix-and-rent project.'
  };
};

export default function RealEstateAnalyzer() {
  const [address, setAddress] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [propertyData, setPropertyData] = useState<any>(null);
  const [rehabAnalysis, setRehabAnalysis] = useState<any>(null);
  const [investmentAnalysis, setInvestmentAnalysis] = useState<any>(null);

  const handleSearch = async () => {
    if (!address.trim()) {
      setError('Please enter a property address');
      return;
    }

    setIsLoading(true);
    setError('');
    setPropertyData(null);
    setRehabAnalysis(null);
    setInvestmentAnalysis(null);

    console.log('🔍 Starting property search for:', address);
    
    try {
      const data = await searchProperty(address);
      console.log('✅ Property search result:', data);
      setPropertyData(data);
    } catch (err: any) {
      console.error('❌ Property search error:', err);
      setError(`Property search failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeRehab = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // 🚀 HARDCODE PURCHASE PRICE FOR TESTING
      const hardcodedPrice = '185000';
      setPurchasePrice(hardcodedPrice);
      
      console.log('🚀 Setting hardcoded purchase price in rehab analysis:', hardcodedPrice);
      console.log('🏠 Property data for rehab analysis:', propertyData);
      
      const result = await getRehabAnalysis({
        address: propertyData.address || address,
        purchasePrice: hardcodedPrice // Use hardcoded value directly
      });
      
      console.log('✅ Rehab analysis result received:', result);
      setRehabAnalysis(result);
    } catch (err: any) {
      console.error('❌ Rehab analysis error:', err);
      setError(`Rehab analysis failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeInvestment = async () => {
    // Add alert to make sure function is called
    alert('Investment Analysis Button Clicked!');
    console.log('FUNCTION STARTED - handleAnalyzeInvestment');
    
    setIsLoading(true);
    setError('');
    
    try {
      // 🚀 HARDCODE PURCHASE PRICE FOR TESTING
      const hardcodedPrice = '185000';
      console.log('Setting hardcoded price:', hardcodedPrice);
      setPurchasePrice(hardcodedPrice);
      
      // Skip API call for now, just set mock data
      const mockResult = {
        purchasePrice: hardcodedPrice,
        suggestedARV: 275000,
        estimatedRepairCost: 50000,
        suggestedMAO: 142500,
        dealAnalysis: 'This Deal Fits Investor Criteria',
        dealDescription: 'Mock investment analysis with hardcoded purchase price.'
      };
      
      console.log('Setting mock investment analysis:', mockResult);
      setInvestmentAnalysis(mockResult);
      
    } catch (err: any) {
      console.error('Investment analysis error:', err);
      setError(`Investment analysis failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number | string) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(num);
  };

  const resetAnalysis = () => {
    setAddress('');
    setPurchasePrice('');
    setPropertyData(null);
    setRehabAnalysis(null);
    setInvestmentAnalysis(null);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-3 mb-4">
            <Building2 className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Real Estate Investment Analyzer</h1>
          </div>
          <p className="text-gray-600">Analyze properties for investment potential and rehab estimates</p>
        </div>

        {/* New Analysis Button */}
        {(propertyData || rehabAnalysis || investmentAnalysis) && (
          <div className="mb-6">
            <button
              onClick={resetAnalysis}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Start New Analysis
            </button>
          </div>
        )}

        {/* Error Display */}
{error && (
  <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-lg">
    <div className="flex items-center">
      <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
      <p className="text-red-700">{error}</p>
    </div>
  </div>
)}

{/* 🚨 TEMPORARY DEBUG TEST BUTTON - ADD THIS */}
<div className="mb-6 p-4 bg-yellow-100 border border-yellow-400 rounded-lg">
  <h3 className="font-bold text-yellow-800 mb-2">🧪 DEBUG TEST</h3>
  <button
    onClick={() => {
      alert('Direct test button clicked!');
      console.log('Direct test button works!');
      handleAnalyzeInvestment();
    }}
    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
  >
    🚨 DIRECT TEST - Click Me
  </button>
  <p className="text-sm text-yellow-700 mt-2">This button tests if the function works directly</p>
</div>

        {/* Search Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Property Search
          </h2>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Enter property address..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
              onClick={handleSearch}
              disabled={isLoading}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isLoading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>

        {/* Property Data */}
        {propertyData && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Property Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Address</p>
                <p className="font-semibold">{propertyData.address}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Bedrooms/Bathrooms</p>
                <p className="font-semibold">{propertyData.bedrooms}bd / {propertyData.bathrooms}ba</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Square Footage</p>
                <p className="font-semibold">{propertyData.squareFootage.toLocaleString()} sq ft</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Year Built</p>
                <p className="font-semibold">{propertyData.yearBuilt}</p>
              </div>
            </div>
            
            <div className="mt-6 flex gap-4">
              <button
                onClick={handleAnalyzeRehab}
                disabled={isLoading}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                <Calculator className="w-5 h-5" />
                {isLoading ? 'Analyzing...' : 'Analyze Rehab'}
              </button>
              
              {rehabAnalysis && (
                <button
                  onClick={handleAnalyzeInvestment}
                  disabled={isLoading}
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  <TrendingUp className="w-5 h-5" />
                  {isLoading ? 'Analyzing...' : 'Analyze Investment'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Rehab Analysis */}
        {rehabAnalysis && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Rehab Analysis
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">Estimated Repair Cost</h3>
                <p className="text-2xl font-bold text-green-600">${rehabAnalysis.estimatedRepairCost}</p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-3">Timeline</h3>
                <p className="text-lg">{rehabAnalysis.timeline}</p>
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="font-semibold mb-3">Major Repairs Needed</h3>
              <ul className="space-y-2">
                {rehabAnalysis.majorRepairs.map((repair: string, index: number) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span>{repair}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Investment Analysis */}
        {investmentAnalysis && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Investment Analysis
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Purchase Price</p>
                <p className="text-xl font-bold text-blue-600">
                  {investmentAnalysis.purchasePrice ? formatCurrency(investmentAnalysis.purchasePrice) : 'N/A'}
                </p>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Suggested ARV</p>
                <p className="text-xl font-bold text-green-600">{formatCurrency(investmentAnalysis.suggestedARV)}</p>
              </div>
              
              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-gray-600">Estimated Repair Cost</p>
                <p className="text-xl font-bold text-orange-600">{formatCurrency(investmentAnalysis.estimatedRepairCost)}</p>
              </div>
              
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600">Suggested MAO (70% Rule)</p>
                <p className="text-xl font-bold text-purple-600">{formatCurrency(investmentAnalysis.suggestedMAO)}</p>
              </div>
            </div>
            
            <div className="p-4 bg-green-50 border-l-4 border-green-400 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">✓ {investmentAnalysis.dealAnalysis}</h3>
              <p className="text-green-700">{investmentAnalysis.dealDescription}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
