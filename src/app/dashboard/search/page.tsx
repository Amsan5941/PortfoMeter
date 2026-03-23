'use client';

import { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';
import { formatNumber } from '@/lib/utils';
import { Sparkline, generatePriceHistory } from '@/components/Sparkline';

interface StockResult {
  symbol: string;
  company_name?: string;
  exchange?: string;
  sector?: string;
  industry?: string;
}

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
  const [searchResults, setSearchResults] = useState<StockResult[]>([]);
  const [batchPrices, setBatchPrices] = useState<Record<string, number | null>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStock, setSelectedStock] = useState<StockQuote | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setBatchPrices({});
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/stocks/search?q=${encodeURIComponent(query)}&limit=10`
      );
      const result = await res.json();

      if (result.success && result.data.length > 0) {
        setSearchResults(result.data);

        // Batch-fetch prices for all results in one request
        const symbols: string[] = result.data.map((s: StockResult) => s.symbol);
        const batchRes = await fetch('/api/stocks/quotes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ symbols }),
        });
        const batchJson = await batchRes.json();
        if (batchJson.success) setBatchPrices(batchJson.quotes ?? {});
      } else {
        setSearchResults([]);
        setBatchPrices({});
      }
    } catch {
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectStock = async (symbol: string) => {
    setLoadingDetail(true);
    setSelectedStock(null);
    try {
      const res = await fetch(`/api/stocks/quote?symbol=${symbol}`);
      const json = await res.json();
      if (json.success) setSelectedStock(json.data);
    } catch {
      // ignore
    } finally {
      setLoadingDetail(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const id = setTimeout(() => handleSearch(searchQuery), 300);
    return () => clearTimeout(id);
  }, [searchQuery]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg px-4 py-5 sm:p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Stock Search</h1>
        <p className="text-gray-600">
          Search stocks by symbol or company name for quotes and market data.
        </p>
      </div>

      {/* Search input */}
      <div className="bg-white shadow rounded-lg px-4 py-5 sm:p-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by symbol (e.g., AAPL) or company name…"
            className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Search results */}
      {searchQuery && (
        <div className="bg-white shadow rounded-lg px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Results</h3>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
              <span className="ml-3 text-gray-600">Searching…</span>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="space-y-2">
              {searchResults.map((stock) => {
                const price = batchPrices[stock.symbol];
                return (
                  <div
                    key={stock.symbol}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-indigo-50 hover:border-indigo-200 cursor-pointer transition-colors"
                    onClick={() => handleSelectStock(stock.symbol)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-indigo-700">
                          {stock.symbol.slice(0, 2)}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-base font-semibold text-gray-900">
                            {stock.symbol}
                          </span>
                          {stock.sector && (
                            <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                              {stock.sector}
                            </span>
                          )}
                        </div>
                        {stock.company_name && (
                          <p className="text-sm text-gray-500">{stock.company_name}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      {price != null ? (
                        <p className="text-sm font-medium text-gray-900">${price.toFixed(2)}</p>
                      ) : (
                        <p className="text-sm text-gray-400">—</p>
                      )}
                      <p className="text-xs text-gray-400">{stock.exchange ?? ''}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">
              No stocks found matching &quot;{searchQuery}&quot;
            </p>
          )}
        </div>
      )}

      {/* Stock detail panel */}
      {(selectedStock || loadingDetail) && (
        <div className="bg-white shadow rounded-lg px-4 py-5 sm:p-6">
          {loadingDetail ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600" />
              <span className="ml-3 text-gray-500">Loading quote…</span>
            </div>
          ) : (
            selectedStock && (
              <>
                {/* Title row */}
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{selectedStock.symbol}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-2xl font-semibold text-gray-900">
                        ${selectedStock.price.toFixed(2)}
                      </span>
                      <span
                        className={`inline-flex items-center text-base font-medium ${
                          selectedStock.changeAmount >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {selectedStock.changeAmount >= 0 ? (
                          <ArrowUpIcon className="h-4 w-4 mr-0.5" />
                        ) : (
                          <ArrowDownIcon className="h-4 w-4 mr-0.5" />
                        )}
                        {Math.abs(selectedStock.changeAmount).toFixed(2)} (
                        {Math.abs(selectedStock.changePercent).toFixed(2)}%)
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {/* Sparkline chart */}
                    <Sparkline
                      data={generatePriceHistory(
                        selectedStock.symbol,
                        selectedStock.price,
                        selectedStock.changePercent
                      )}
                      width={140}
                      height={48}
                      positive={selectedStock.changePercent >= 0}
                    />
                    <button
                      onClick={() => setSelectedStock(null)}
                      className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                    >
                      ×
                    </button>
                  </div>
                </div>

                {/* Data grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Price info */}
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                      Price Info
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Current</span>
                        <span className="font-medium">${selectedStock.price.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">52W High</span>
                        <span className="font-medium text-green-600">
                          ${selectedStock.high52w.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">52W Low</span>
                        <span className="font-medium text-red-600">
                          ${selectedStock.low52w.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Market data */}
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                      Market Data
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Market Cap</span>
                        <span className="font-medium">${formatNumber(selectedStock.marketCap)}</span>
                      </div>
                      {selectedStock.peRatio != null && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">P/E Ratio</span>
                          <span className="font-medium">{selectedStock.peRatio.toFixed(1)}x</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-500">Volume</span>
                        <span className="font-medium">{formatNumber(selectedStock.volume)}</span>
                      </div>
                    </div>
                  </div>

                  {/* 52-week range bar */}
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                      52-Week Range
                    </h4>
                    <div className="pt-1">
                      <div className="relative h-3 bg-gray-200 rounded-full">
                        {/* Filled portion from low to current */}
                        <div
                          className="absolute h-3 bg-gradient-to-r from-red-400 to-green-500 rounded-full"
                          style={{
                            width: `${
                              ((selectedStock.price - selectedStock.low52w) /
                                (selectedStock.high52w - selectedStock.low52w)) *
                              100
                            }%`,
                          }}
                        />
                        {/* Current price marker */}
                        <div
                          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-indigo-600 rounded-full border-2 border-white shadow"
                          style={{
                            left: `calc(${
                              ((selectedStock.price - selectedStock.low52w) /
                                (selectedStock.high52w - selectedStock.low52w)) *
                              100
                            }% - 6px)`,
                          }}
                        />
                      </div>
                      <div className="flex justify-between mt-2 text-xs text-gray-500">
                        <span>${selectedStock.low52w.toFixed(0)}</span>
                        <span className="text-indigo-600 font-medium">
                          ${selectedStock.price.toFixed(0)} now
                        </span>
                        <span>${selectedStock.high52w.toFixed(0)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )
          )}
        </div>
      )}

      {/* Popular searches */}
      <div className="bg-white shadow rounded-lg px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Popular Searches</h3>
        <div className="flex flex-wrap gap-2">
          {['AAPL', 'TSLA', 'NVDA', 'MSFT', 'GOOGL', 'AMZN', 'META', 'NFLX', 'AMD', 'CRM'].map(
            (symbol) => (
              <button
                key={symbol}
                onClick={() => setSearchQuery(symbol)}
                className="px-3 py-1.5 bg-gray-100 hover:bg-indigo-100 hover:text-indigo-700 text-gray-700 rounded-full text-sm font-medium transition-colors"
              >
                {symbol}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}
