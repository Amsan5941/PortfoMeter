'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/solid';

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
      found?: boolean;
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

/** Animated circular score gauge */
function ScoreRing({ score }: { score: number }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, score));
  const strokeDashoffset = circumference - (clamped / 100) * circumference;
  const color = clamped >= 70 ? '#16a34a' : clamped >= 50 ? '#d97706' : '#dc2626';

  return (
    <div className="flex flex-col items-center">
      <svg width="90" height="90" viewBox="0 0 90 90">
        <circle cx="45" cy="45" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="9" />
        <circle
          cx="45"
          cy="45"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="9"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform="rotate(-90 45 45)"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
        <text
          x="45"
          y="45"
          textAnchor="middle"
          dominantBaseline="middle"
          fill={color}
          fontSize="18"
          fontWeight="bold"
        >
          {clamped.toFixed(0)}
        </text>
      </svg>
      <p className="text-xs text-gray-500 mt-1">Portfolio Score</p>
    </div>
  );
}

export default function PortfolioPage() {
  const params = useParams();
  const uploadId = params.id as string;
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unknownSymbols, setUnknownSymbols] = useState<string[]>([]);

  useEffect(() => {
    if (uploadId) fetchPortfolioData();
  }, [uploadId]);

  const fetchPortfolioData = async () => {
    try {
      const response = await fetch('/api/portfolio/analyze-mock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uploadId }),
      });

      const result = await response.json();

      if (result.success) {
        const { enriched, unknownSymbols } = await enrichWithMarketPrices(result.data);
        setPortfolioData(enriched);
        setUnknownSymbols(unknownSymbols);
      } else {
        setError(result.error || 'Failed to load portfolio data');
      }
    } catch {
      setError('Failed to load portfolio data');
    } finally {
      setLoading(false);
    }
  };

  const enrichWithMarketPrices = async (
    data: PortfolioData
  ): Promise<{ enriched: PortfolioData; unknownSymbols: string[] }> => {
    try {
      const symbols = Array.from(
        new Set(data.ocrResults.holdings.map((h) => h.symbol.toUpperCase()))
      );
      if (symbols.length === 0) return { enriched: data, unknownSymbols: [] };

      const resp = await fetch('/api/stocks/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbols }),
      });
      const json = await resp.json();
      const quotes: Record<string, number | null | undefined> = json.success
        ? (json.quotes as Record<string, number | null | undefined>) || {}
        : {};

      const unknownSymbols = symbols.filter((s) => quotes[s] == null);

      const updatedHoldings = data.ocrResults.holdings.map((h) => {
        const key = h.symbol.toUpperCase();
        const latest = quotes[key];
        return {
          ...h,
          price: typeof latest === 'number' ? latest : h.price,
          found: typeof latest === 'number',
        };
      });

      const totalValue = updatedHoldings.reduce(
        (sum, h) => sum + h.quantity * h.price,
        0
      );
      const totalCostBasis = updatedHoldings.reduce(
        (sum, h) => sum + h.quantity * h.costBasis,
        0
      );
      const totalGainLoss = totalValue - totalCostBasis;
      const totalGainLossPercent = totalCostBasis
        ? (totalGainLoss / totalCostBasis) * 100
        : 0;

      const enriched: PortfolioData = {
        ...data,
        ocrResults: { ...data.ocrResults, holdings: updatedHoldings },
        metrics: {
          ...data.metrics,
          totalValue,
          totalCostBasis,
          totalGainLoss,
          totalGainLossPercent,
        },
      };
      return { enriched, unknownSymbols };
    } catch {
      return { enriched: data, unknownSymbols: [] };
    }
  };

  const fmt$ = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

  const fmtPct = (n: number) => `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`;

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto" />
          <p className="mt-4 text-gray-600 font-medium">Generating AI analysis…</p>
          <p className="text-sm text-gray-400 mt-1">This may take a few seconds</p>
        </div>
      </div>
    );
  }

  if (error || !portfolioData) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-center gap-3">
          <ExclamationTriangleIcon className="h-6 w-6 text-red-400 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-medium text-red-800">Error loading portfolio</h3>
            <p className="text-red-600 text-sm mt-1">{error || 'Portfolio data not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  const { metrics, aiReview, ocrResults } = portfolioData;
  const gainers = ocrResults.holdings.filter((h) => h.price > h.costBasis).length;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Unknown symbols warning */}
      {unknownSymbols.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-3">
          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 flex-shrink-0" />
          <p className="text-sm text-yellow-800">
            Could not fetch live prices for: <strong>{unknownSymbols.join(', ')}</strong>.
            Falling back to OCR-extracted prices.
          </p>
        </div>
      )}

      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Portfolio Analysis</h1>
        <p className="text-gray-500 text-sm">
          AI-powered educational insights for your investment portfolio
        </p>
      </div>

      {/* Metrics cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center gap-4">
            <ChartBarIcon className="h-8 w-8 text-indigo-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-500">Total Value</p>
              <p className="text-2xl font-semibold text-gray-900">
                {fmt$(metrics.totalValue)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center gap-4">
            {metrics.totalGainLoss >= 0 ? (
              <ArrowTrendingUpIcon className="h-8 w-8 text-green-600 flex-shrink-0" />
            ) : (
              <ArrowTrendingDownIcon className="h-8 w-8 text-red-600 flex-shrink-0" />
            )}
            <div>
              <p className="text-sm font-medium text-gray-500">Total Gain / Loss</p>
              <p
                className={`text-2xl font-semibold ${
                  metrics.totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {fmt$(metrics.totalGainLoss)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center gap-4">
            {metrics.totalGainLossPercent >= 0 ? (
              <ArrowTrendingUpIcon className="h-8 w-8 text-green-600 flex-shrink-0" />
            ) : (
              <ArrowTrendingDownIcon className="h-8 w-8 text-red-600 flex-shrink-0" />
            )}
            <div>
              <p className="text-sm font-medium text-gray-500">Return %</p>
              <p
                className={`text-2xl font-semibold ${
                  metrics.totalGainLossPercent >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {fmtPct(metrics.totalGainLossPercent)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6 flex items-center justify-center">
          <ScoreRing score={aiReview.overallScore} />
        </div>
      </div>

      {/* Holdings table */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">Holdings</h2>
          <span className="text-sm text-gray-500">
            {gainers}/{ocrResults.holdings.length} positions profitable
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {[
                  'Symbol',
                  'Qty',
                  'Current Price',
                  'Cost Basis',
                  'Market Value',
                  'Gain / Loss',
                  'Weight',
                ].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {ocrResults.holdings.map((holding, index) => {
                const marketValue = holding.quantity * holding.price;
                const costBasisValue = holding.quantity * holding.costBasis;
                const gainLoss = marketValue - costBasisValue;
                const gainLossPct = costBasisValue
                  ? (gainLoss / costBasisValue) * 100
                  : 0;
                const weight = metrics.totalValue
                  ? (marketValue / metrics.totalValue) * 100
                  : 0;

                return (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <div className="flex items-center gap-2">
                        {holding.symbol}
                        {!holding.found && (
                          <ExclamationTriangleIcon
                            className="h-4 w-4 text-yellow-500"
                            title="Symbol not validated via live API"
                          />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {holding.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {fmt$(holding.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {fmt$(holding.costBasis)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {fmt$(marketValue)}
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                        gainLoss >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {fmt$(gainLoss)} ({fmtPct(gainLossPct)})
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, weight)}%` }}
                          />
                        </div>
                        <span className="text-xs">{weight.toFixed(1)}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Review — Summary + Risk Assessment */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">AI Summary</h2>
          <p className="text-gray-600 leading-relaxed">{aiReview.summary}</p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Risk Assessment</h2>
          <div className="flex items-center gap-3 mb-3">
            <span
              className={`px-4 py-2 rounded-full text-sm font-semibold ${
                aiReview.riskLevel === 'Low'
                  ? 'bg-green-100 text-green-800'
                  : aiReview.riskLevel === 'Medium'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {aiReview.riskLevel} Risk
            </span>
          </div>
          <p className="text-sm text-gray-500">
            Based on portfolio concentration, diversification score, and sector exposure.
          </p>
        </div>
      </div>

      {/* Strengths / Risks / Suggestions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Strengths</h2>
          <ul className="space-y-3">
            {aiReview.strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-600">{s}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Risks</h2>
          <ul className="space-y-3">
            {aiReview.risks.map((r, i) => (
              <li key={i} className="flex items-start gap-2">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-600">{r}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Suggestions</h2>
          <ul className="space-y-3">
            {aiReview.suggestions.map((s, i) => (
              <li key={i} className="flex items-start gap-2">
                <ArrowTrendingUpIcon className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-600">{s}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-lg font-medium text-yellow-800">Important Disclaimer</h3>
            <p className="text-yellow-700 mt-2">{aiReview.disclaimer}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
