'use client';

import { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, ChartBarIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';
import { formatNumber } from '@/lib/utils';

interface StockQuote {
  symbol: string;
  price: number;
  changeAmount: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  peRatio?: number;
  high52w: number;
  low52w: number;
}

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<StockQuote[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStock, setSelectedStock] = useState<StockQuote | null>(null);


  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/stocks/search?q=${encodeURIComponent(query)}&limit=10`);
      const result = await response.json();
      
      if (result.success) {
        // Convert search results to stock quotes format
        const stocks = await Promise.all(
          result.data.map(async (stock: { symbol: string }) => {
            try {
              const quoteResponse = await fetch(`/api/stocks/quote?symbol=${stock.symbol}`);
              const quoteResult = await quoteResponse.json();
              return quoteResult.success ? quoteResult.data : null;
            } catch (error) {
              console.error(`Failed to fetch quote for ${stock.symbol}:`, error);
              return null;
            }
          })
        );
        
        setSearchResults(stocks.filter(Boolean));
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);


  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Stock Search
          </h1>
          <p className="text-gray-600">
            Search for stocks by symbol or company name to get real-time quotes and analysis.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by symbol (e.g., AAPL) or company name..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Search Results */}
      {searchQuery && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Search Results
            </h3>
            
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <span className="ml-2 text-gray-600">Searching...</span>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-3">
                {searchResults.map((stock) => (
                  <div
                    key={stock.symbol}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => setSelectedStock(stock)}
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <span className="text-lg font-semibold text-gray-900">
                          {stock.symbol}
                        </span>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm text-gray-500">
                          ${stock.price.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className={`inline-flex items-center text-sm font-medium ${
                        stock.changeAmount >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stock.changeAmount >= 0 ? (
                          <ArrowUpIcon className="h-4 w-4 mr-1" />
                        ) : (
                          <ArrowDownIcon className="h-4 w-4 mr-1" />
                        )}
                        {Math.abs(stock.changeAmount).toFixed(2)} ({Math.abs(stock.changePercent).toFixed(2)}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No stocks found matching &quot;{searchQuery}&quot;</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stock Details */}
      {selectedStock && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {selectedStock.symbol}
              </h3>
              <button
                onClick={() => setSelectedStock(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Price Information */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900">Price Information</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Current Price:</span>
                    <span className="font-semibold">${selectedStock.price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Change:</span>
                    <span className={`font-semibold ${
                      selectedStock.changeAmount >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {selectedStock.changeAmount >= 0 ? '+' : ''}{selectedStock.changeAmount.toFixed(2)} ({selectedStock.changePercent.toFixed(2)}%)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Volume:</span>
                    <span className="font-semibold">{formatNumber(selectedStock.volume)}</span>
                  </div>
                </div>
              </div>

              {/* Market Data */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900">Market Data</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Market Cap:</span>
                    <span className="font-semibold">${formatNumber(selectedStock.marketCap)}</span>
                  </div>
                  {selectedStock.peRatio && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">P/E Ratio:</span>
                      <span className="font-semibold">{selectedStock.peRatio.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">52W High:</span>
                    <span className="font-semibold">${selectedStock.high52w.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">52W Low:</span>
                    <span className="font-semibold">${selectedStock.low52w.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Chart Placeholder */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900">Price Chart</h4>
                <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Chart coming soon</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Popular Searches */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Popular Searches
          </h3>
          <div className="flex flex-wrap gap-2">
            {['AAPL', 'TSLA', 'NVDA', 'MSFT', 'GOOGL', 'AMZN', 'META', 'NFLX'].map((symbol) => (
              <button
                key={symbol}
                onClick={() => setSearchQuery(symbol)}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm transition-colors"
              >
                {symbol}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
