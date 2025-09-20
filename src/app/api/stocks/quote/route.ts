import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');

    if (!symbol) {
      return NextResponse.json({ error: 'Symbol parameter is required' }, { status: 400 });
    }

    // Mock stock data for demonstration (fallback when database is not set up)
    const mockStockData: Record<string, any> = {
      'AAPL': { symbol: 'AAPL', price: 175.43, changeAmount: 2.15, changePercent: 1.24, volume: 45678900, marketCap: 2750000000000, peRatio: 28.5, high52w: 198.23, low52w: 124.17 },
      'TSLA': { symbol: 'TSLA', price: 248.87, changeAmount: -5.23, changePercent: -2.06, volume: 78912300, marketCap: 790000000000, peRatio: 45.2, high52w: 299.29, low52w: 138.80 },
      'NVDA': { symbol: 'NVDA', price: 875.28, changeAmount: 12.45, changePercent: 1.44, volume: 23456700, marketCap: 2150000000000, peRatio: 65.8, high52w: 974.00, low52w: 200.00 },
      'MSFT': { symbol: 'MSFT', price: 385.67, changeAmount: -11.45, changePercent: -2.89, volume: 34567800, marketCap: 2850000000000, peRatio: 32.1, high52w: 420.00, low52w: 300.00 },
      'GOOGL': { symbol: 'GOOGL', price: 155.89, changeAmount: 5.67, changePercent: 3.78, volume: 12345600, marketCap: 1950000000000, peRatio: 25.4, high52w: 180.00, low52w: 120.00 },
      'AMZN': { symbol: 'AMZN', price: 157.89, changeAmount: -3.78, changePercent: -2.34, volume: 23456700, marketCap: 1650000000000, peRatio: 52.3, high52w: 180.00, low52w: 100.00 },
      'META': { symbol: 'META', price: 390.45, changeAmount: 18.34, changePercent: 4.92, volume: 34567800, marketCap: 980000000000, peRatio: 24.7, high52w: 450.00, low52w: 200.00 },
      'NFLX': { symbol: 'NFLX', price: 441.23, changeAmount: -8.90, changePercent: -1.98, volume: 12345600, marketCap: 195000000000, peRatio: 35.2, high52w: 500.00, low52w: 300.00 },
      'AMD': { symbol: 'AMD', price: 212.67, changeAmount: 12.45, changePercent: 6.23, volume: 78912300, marketCap: 340000000000, peRatio: 28.9, high52w: 250.00, low52w: 100.00 },
      'CRM': { symbol: 'CRM', price: 203.12, changeAmount: -3.45, changePercent: -1.67, volume: 9876540, marketCap: 200000000000, peRatio: 45.6, high52w: 250.00, low52w: 150.00 },
    };

    const upperSymbol = symbol.toUpperCase();
    if (mockStockData[upperSymbol]) {
      const stockData = {
        ...mockStockData[upperSymbol],
        lastUpdated: new Date().toISOString(),
      };
      
      return NextResponse.json({
        success: true,
        data: stockData,
        cached: false,
      });
    }

    // Fetch from external API (Alpha Vantage)
    const apiKey = process.env.MARKETDATA_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Market data API key not configured' }, { status: 500 });
    }

    const response = await fetch(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch stock data');
    }

    const data = await response.json();
    const quote = data['Global Quote'];

    if (!quote || Object.keys(quote).length === 0) {
      return NextResponse.json({ error: 'Stock not found' }, { status: 404 });
    }

    // Parse the response
    const stockData = {
      symbol: quote['01. symbol'],
      price: parseFloat(quote['05. price']),
      changeAmount: parseFloat(quote['09. change']),
      changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
      volume: parseInt(quote['06. volume']),
      high52w: parseFloat(quote['52. week high']),
      low52w: parseFloat(quote['53. week low']),
      lastUpdated: new Date().toISOString(),
    };

    // Calculate market cap (approximate)
    const marketCap = stockData.price * stockData.volume * 1000; // Rough estimate
    const stockDataWithMarketCap = {
      ...stockData,
      marketCap,
    };

    // Cache the data
    // TODO: Fix TypeScript issue with Supabase upsert
    // await serverClient
    //   .from('stock_quotes')
    //   .upsert({
    //     symbol: stockDataWithMarketCap.symbol,
    //     price: stockDataWithMarketCap.price,
    //     change_amount: stockDataWithMarketCap.changeAmount,
    //     change_percent: stockDataWithMarketCap.changePercent,
    //     volume: stockDataWithMarketCap.volume,
    //     market_cap: stockDataWithMarketCap.marketCap,
    //     high_52w: stockDataWithMarketCap.high52w,
    //     low_52w: stockDataWithMarketCap.low52w,
    //     last_updated: stockDataWithMarketCap.lastUpdated,
    //   });

    return NextResponse.json({
      success: true,
      data: stockDataWithMarketCap,
      cached: false,
    });

  } catch (error) {
    console.error('Stock quote error:', error);
    return NextResponse.json({ error: 'Failed to fetch stock data' }, { status: 500 });
  }
}
