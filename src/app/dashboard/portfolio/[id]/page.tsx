'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  ChartBarIcon, 
  TrendingUpIcon, 
  TrendingDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface PortfolioData {
  uploadId: string;
  ocrResults: {
    extractedText: string;
    holdings: Array<{
      symbol: string;
      quantity: number;
      price: number;
      costBasis: number;
      confidence: number;
    }>;
  };
  aiReview: {
    summary: string;
    strengths: string[];
    risks: string[];
    suggestions: string[];
    disclaimer: string;
    overallScore: number;
    riskLevel: string;
  };
  metrics: {
    totalValue: number;
    totalCostBasis: number;
    totalGainLoss: number;
    totalGainLossPercent: number;
  };
}

export default function PortfolioPage() {
  const params = useParams();
  const uploadId = params.id as string;
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (uploadId) {
      fetchPortfolioData();
    }
  }, [uploadId]);

  const fetchPortfolioData = async () => {
    try {
      const response = await fetch(`/api/portfolio/analyze-mock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uploadId }),
      });

      const result = await response.json();

      if (result.success) {
        setPortfolioData(result.data);
      } else {
        setError(result.error || 'Failed to load portfolio data');
      }
    } catch (err) {
      setError('Failed to load portfolio data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatPercentage = (num: number) => {
    return `${num >= 0 ? '+' : ''}${num.toFixed(2)}%`;
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading portfolio analysis...</p>
        </div>
      </div>
    );
  }

  if (error || !portfolioData) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-400 mr-3" />
            <div>
              <h3 className="text-lg font-medium text-red-800">Error</h3>
              <p className="text-red-600">{error || 'Portfolio data not found'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { metrics, aiReview, ocrResults } = portfolioData;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Portfolio Analysis</h1>
        <p className="text-gray-600">AI-powered analysis of your investment portfolio</p>
      </div>

      {/* Portfolio Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <ChartBarIcon className="h-8 w-8 text-indigo-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Value</p>
              <p className="text-2xl font-semibold text-gray-900">{formatCurrency(metrics.totalValue)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <TrendingUpIcon className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Gain/Loss</p>
              <p className={`text-2xl font-semibold ${metrics.totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(metrics.totalGainLoss)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            {metrics.totalGainLossPercent >= 0 ? (
              <TrendingUpIcon className="h-8 w-8 text-green-600" />
            ) : (
              <TrendingDownIcon className="h-8 w-8 text-red-600" />
            )}
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Return %</p>
              <p className={`text-2xl font-semibold ${metrics.totalGainLossPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatPercentage(metrics.totalGainLossPercent)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <CheckCircleIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Overall Score</p>
              <p className="text-2xl font-semibold text-gray-900">{aiReview.overallScore.toFixed(0)}/100</p>
            </div>
          </div>
        </div>
      </div>

      {/* Holdings */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Your Holdings</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Symbol</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost Basis</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Market Value</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gain/Loss</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {ocrResults.holdings.map((holding, index) => {
                const marketValue = holding.quantity * holding.price;
                const costBasisValue = holding.quantity * holding.costBasis;
                const gainLoss = marketValue - costBasisValue;
                const gainLossPercent = (gainLoss / costBasisValue) * 100;

                return (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{holding.symbol}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{holding.quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(holding.price)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(holding.costBasis)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(marketValue)}</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(gainLoss)} ({formatPercentage(gainLossPercent)})
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Review */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Summary */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">AI Summary</h2>
          <p className="text-gray-600">{aiReview.summary}</p>
        </div>

        {/* Risk Level */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Risk Assessment</h2>
          <div className="flex items-center">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              aiReview.riskLevel === 'Low' ? 'bg-green-100 text-green-800' :
              aiReview.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {aiReview.riskLevel} Risk
            </div>
          </div>
        </div>
      </div>

      {/* Strengths, Risks, and Suggestions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Strengths</h2>
          <ul className="space-y-2">
            {aiReview.strengths.map((strength, index) => (
              <li key={index} className="flex items-start">
                <CheckCircleIcon className="h-5 w-5 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-600">{strength}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Risks</h2>
          <ul className="space-y-2">
            {aiReview.risks.map((risk, index) => (
              <li key={index} className="flex items-start">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-600">{risk}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Suggestions</h2>
          <ul className="space-y-2">
            {aiReview.suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start">
                <TrendingUpIcon className="h-5 w-5 text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-600">{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-start">
          <ExclamationTriangleIcon className="h-6 w-6 text-yellow-400 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-medium text-yellow-800">Important Disclaimer</h3>
            <p className="text-yellow-700 mt-2">{aiReview.disclaimer}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

