'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  ArrowUpIcon, 
  ArrowDownIcon, 
  ChartBarIcon,
  FireIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';
import { formatNumber } from '@/lib/utils';

interface MarketMover {
  symbol: string;
  changePercent: number;
  changeAmount: number;
  volume: number;
  moverType: 'gainer' | 'loser';
  price: number;
}

interface TrendingStock {
  symbol: string;
  searchCount: number;
  price: number;
  changePercent: number;
}

export default function PopularPage() {
  const [activeTab, setActiveTab] = useState<'gainers' | 'losers' | 'trending'>('gainers');
  const [marketMovers, setMarketMovers] = useState<MarketMover[]>([]);
  const [trendingStocks, setTrendingStocks] = useState<TrendingStock[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data for demonstration
  const mockGainers: MarketMover[] = useMemo(() => [
    { symbol: 'NVDA', changePercent: 8.45, changeAmount: 68.23, volume: 45678900, moverType: 'gainer', price: 875.28 },
    { symbol: 'AMD', changePercent: 6.23, changeAmount: 12.45, volume: 78912300, moverType: 'gainer', price: 212.67 },
    { symbol: 'TSLA', changePercent: 5.87, changeAmount: 14.56, volume: 23456700, moverType: 'gainer', price: 248.87 },
    { symbol: 'META', changePercent: 4.92, changeAmount: 18.34, volume: 34567800, moverType: 'gainer', price: 390.45 },
    { symbol: 'GOOGL', changePercent: 3.78, changeAmount: 5.67, volume: 12345600, moverType: 'gainer', price: 155.89 },
  ], []);

  const mockLosers: MarketMover[] = useMemo(() => [
    { symbol: 'AAPL', changePercent: -3.45, changeAmount: -6.23, volume: 56789000, moverType: 'loser', price: 175.43 },
    { symbol: 'MSFT', changePercent: -2.89, changeAmount: -11.45, volume: 34567800, moverType: 'loser', price: 385.67 },
    { symbol: 'AMZN', changePercent: -2.34, changeAmount: -3.78, volume: 23456700, moverType: 'loser', price: 157.89 },
    { symbol: 'NFLX', changePercent: -1.98, changeAmount: -8.90, volume: 12345600, moverType: 'loser', price: 441.23 },
    { symbol: 'CRM', changePercent: -1.67, changeAmount: -3.45, volume: 9876540, moverType: 'loser', price: 203.12 },
  ], []);

  const mockTrending: TrendingStock[] = useMemo(() => [
    { symbol: 'NVDA', searchCount: 1250, price: 875.28, changePercent: 8.45 },
    { symbol: 'TSLA', searchCount: 980, price: 248.87, changePercent: 5.87 },
    { symbol: 'AAPL', searchCount: 850, price: 175.43, changePercent: -3.45 },
    { symbol: 'AMD', searchCount: 720, price: 212.67, changePercent: 6.23 },
    { symbol: 'META', searchCount: 650, price: 390.45, changePercent: 4.92 },
    { symbol: 'GOOGL', searchCount: 580, price: 155.89, changePercent: 3.78 },
    { symbol: 'MSFT', searchCount: 520, price: 385.67, changePercent: -2.89 },
    { symbol: 'AMZN', searchCount: 480, price: 157.89, changePercent: -2.34 },
  ], []);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setMarketMovers(mockGainers);
      setTrendingStocks(mockTrending);
      setIsLoading(false);
    }, 1000);
  }, [mockGainers, mockTrending]);

  const handleTabChange = (tab: 'gainers' | 'losers' | 'trending') => {
    setActiveTab(tab);
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      if (tab === 'gainers') {
        setMarketMovers(mockGainers);
      } else if (tab === 'losers') {
        setMarketMovers(mockLosers);
      }
      setIsLoading(false);
    }, 500);
  };


  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Market Movers & Trending Stocks
          </h1>
          <p className="text-gray-600">
            Track the biggest gainers, losers, and most searched stocks in real-time.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => handleTabChange('gainers')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'gainers'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <ArrowTrendingUpIcon className="h-5 w-5 mr-2" />
                Top Gainers
              </div>
            </button>
            <button
              onClick={() => handleTabChange('losers')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'losers'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <ArrowTrendingDownIcon className="h-5 w-5 mr-2" />
                Top Losers
              </div>
            </button>
            <button
              onClick={() => handleTabChange('trending')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'trending'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <FireIcon className="h-5 w-5 mr-2" />
                Trending
              </div>
            </button>
          </nav>
        </div>

        <div className="px-6 py-5">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <span className="ml-2 text-gray-600">Loading...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {activeTab === 'trending' ? (
                // Trending Stocks
                trendingStocks.map((stock, index) => (
                  <div
                    key={stock.symbol}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0 w-8 text-center">
                        <span className="text-sm font-medium text-gray-500">
                          #{index + 1}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <span className="text-lg font-semibold text-gray-900">
                            {stock.symbol}
                          </span>
                          <span className="ml-2 text-sm text-gray-500">
                            {formatNumber(stock.searchCount)} searches
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          ${stock.price.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className={`inline-flex items-center text-sm font-medium ${
                        stock.changePercent >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stock.changePercent >= 0 ? (
                          <ArrowUpIcon className="h-4 w-4 mr-1" />
                        ) : (
                          <ArrowDownIcon className="h-4 w-4 mr-1" />
                        )}
                        {Math.abs(stock.changePercent).toFixed(2)}%
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                // Market Movers (Gainers/Losers)
                marketMovers.map((stock, index) => (
                  <div
                    key={stock.symbol}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0 w-8 text-center">
                        <span className="text-sm font-medium text-gray-500">
                          #{index + 1}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <span className="text-lg font-semibold text-gray-900">
                            {stock.symbol}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          ${stock.price.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Volume</p>
                        <p className="text-sm font-medium text-gray-900">
                          {formatNumber(stock.volume)}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center text-sm font-medium ${
                          stock.changePercent >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {stock.changePercent >= 0 ? (
                            <ArrowUpIcon className="h-4 w-4 mr-1" />
                          ) : (
                            <ArrowDownIcon className="h-4 w-4 mr-1" />
                          )}
                          {Math.abs(stock.changeAmount).toFixed(2)} ({Math.abs(stock.changePercent).toFixed(2)}%)
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Market Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ArrowTrendingUpIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Best Performer</p>
              <p className="text-lg font-semibold text-gray-900">
                {mockGainers[0]?.symbol} +{mockGainers[0]?.changePercent.toFixed(2)}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ArrowTrendingDownIcon className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Worst Performer</p>
              <p className="text-lg font-semibold text-gray-900">
                {mockLosers[0]?.symbol} {mockLosers[0]?.changePercent.toFixed(2)}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FireIcon className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Most Searched</p>
              <p className="text-lg font-semibold text-gray-900">
                {mockTrending[0]?.symbol} ({formatNumber(mockTrending[0]?.searchCount)})
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <ChartBarIcon className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Market Data Disclaimer
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                Market data is provided for informational purposes only and may be delayed. 
                Past performance does not guarantee future results. Always do your own research 
                and consult with a financial advisor before making investment decisions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
