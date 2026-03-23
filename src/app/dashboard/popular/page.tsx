'use client';

import { useState, useEffect } from 'react';
import {
  ArrowUpIcon,
  ArrowDownIcon,
  ChartBarIcon,
  FireIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline';
import { formatNumber } from '@/lib/utils';

interface MarketMover {
  symbol: string;
  price: number;
  changeAmount: number;
  changePercent: number;
  volume: number;
  moverType: 'gainer' | 'loser';
}

interface TrendingStock {
  symbol: string;
  price: number;
  changePercent: number;
  volume: number;
}

interface MoversData {
  gainers: MarketMover[];
  losers: MarketMover[];
  trending: TrendingStock[];
}

export default function PopularPage() {
  const [activeTab, setActiveTab] = useState<'gainers' | 'losers' | 'trending'>('gainers');
  const [movers, setMovers] = useState<MoversData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dataSource, setDataSource] = useState<'live' | 'mock'>('mock');

  useEffect(() => {
    fetchMovers();
  }, []);

  const fetchMovers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/market-movers');
      const json = await res.json();
      if (json.success) {
        setMovers(json.data);
        setDataSource(json.source === 'live' ? 'live' : 'mock');
      }
    } catch {
      // keep isLoading false below
    } finally {
      setIsLoading(false);
    }
  };

  const currentList =
    !movers
      ? []
      : activeTab === 'gainers'
      ? movers.gainers
      : activeTab === 'losers'
      ? movers.losers
      : movers.trending;

  const tabs = [
    { id: 'gainers' as const, label: 'Top Gainers',  Icon: ArrowTrendingUpIcon,   activeClass: 'border-green-500 text-green-600'  },
    { id: 'losers'  as const, label: 'Top Losers',   Icon: ArrowTrendingDownIcon, activeClass: 'border-red-500 text-red-600'      },
    { id: 'trending'as const, label: 'Most Active',  Icon: FireIcon,              activeClass: 'border-orange-500 text-orange-600'},
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              Market Movers &amp; Trending Stocks
            </h1>
            <p className="text-gray-600">
              Biggest gainers, losers, and most actively traded stocks.
            </p>
          </div>
          {dataSource === 'live' && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Live Data
            </span>
          )}
        </div>
      </div>

      {/* Tabs + list */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.id
                    ? tab.activeClass
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.Icon className="h-5 w-5" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="px-6 py-5">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
              <span className="ml-3 text-gray-600">Loading market data…</span>
            </div>
          ) : (
            <div className="space-y-3">
              {activeTab === 'trending'
                ? (currentList as TrendingStock[]).map((stock, i) => (
                    <div
                      key={stock.symbol}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <span className="w-7 text-center text-sm font-medium text-gray-400">
                          #{i + 1}
                        </span>
                        <div>
                          <p className="text-base font-semibold text-gray-900">{stock.symbol}</p>
                          <p className="text-xs text-gray-500">{formatNumber(stock.volume)} vol</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          ${stock.price.toFixed(2)}
                        </p>
                        <span
                          className={`inline-flex items-center text-sm font-medium ${
                            stock.changePercent >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {stock.changePercent >= 0 ? (
                            <ArrowUpIcon className="h-3 w-3 mr-0.5" />
                          ) : (
                            <ArrowDownIcon className="h-3 w-3 mr-0.5" />
                          )}
                          {Math.abs(stock.changePercent).toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  ))
                : (currentList as MarketMover[]).map((stock, i) => (
                    <div
                      key={stock.symbol}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <span className="w-7 text-center text-sm font-medium text-gray-400">
                          #{i + 1}
                        </span>
                        <div>
                          <p className="text-base font-semibold text-gray-900">{stock.symbol}</p>
                          <p className="text-xs text-gray-500">${stock.price.toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-xs text-gray-400">Volume</p>
                          <p className="text-sm font-medium text-gray-700">
                            {formatNumber(stock.volume)}
                          </p>
                        </div>
                        <span
                          className={`inline-flex items-center text-sm font-semibold ${
                            stock.changePercent >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {stock.changePercent >= 0 ? (
                            <ArrowUpIcon className="h-4 w-4 mr-1" />
                          ) : (
                            <ArrowDownIcon className="h-4 w-4 mr-1" />
                          )}
                          {Math.abs(stock.changeAmount).toFixed(2)} (
                          {Math.abs(stock.changePercent).toFixed(2)}%)
                        </span>
                      </div>
                    </div>
                  ))}
            </div>
          )}
        </div>
      </div>

      {/* Market overview summary cards */}
      {movers && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white shadow rounded-lg p-6 flex items-center gap-4">
            <ArrowTrendingUpIcon className="h-8 w-8 text-green-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-500">Best Performer</p>
              <p className="text-lg font-semibold text-gray-900">
                {movers.gainers[0]?.symbol}{' '}
                <span className="text-green-600">
                  +{movers.gainers[0]?.changePercent.toFixed(2)}%
                </span>
              </p>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6 flex items-center gap-4">
            <ArrowTrendingDownIcon className="h-8 w-8 text-red-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-500">Worst Performer</p>
              <p className="text-lg font-semibold text-gray-900">
                {movers.losers[0]?.symbol}{' '}
                <span className="text-red-600">
                  {movers.losers[0]?.changePercent.toFixed(2)}%
                </span>
              </p>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6 flex items-center gap-4">
            <FireIcon className="h-8 w-8 text-orange-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-500">Most Active</p>
              <p className="text-lg font-semibold text-gray-900">
                {movers.trending[0]?.symbol}{' '}
                <span className="text-gray-500 text-sm">
                  ({formatNumber(movers.trending[0]?.volume ?? 0)})
                </span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
        <ChartBarIcon className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-medium text-yellow-800">Market Data Disclaimer</h3>
          <p className="mt-1 text-sm text-yellow-700">
            Data is provided for informational purposes only and may be delayed. Past performance
            does not guarantee future results. Always consult a qualified financial advisor.
          </p>
        </div>
      </div>
    </div>
  );
}
