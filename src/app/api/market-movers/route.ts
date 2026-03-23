import { NextResponse } from 'next/server';

interface RawMover {
  ticker: string;
  price: string;
  change_amount: string;
  change_percentage: string;
  volume: string;
}

export async function GET() {
  try {
    const apiKey = process.env.MARKETDATA_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ success: true, data: getMockMovers(), source: 'mock' });
    }

    const res = await fetch(
      `https://www.alphavantage.co/query?function=TOP_GAINERS_LOSERS&apikey=${apiKey}`,
      { next: { revalidate: 300 } } // cache for 5 minutes
    );

    if (!res.ok) {
      return NextResponse.json({ success: true, data: getMockMovers(), source: 'mock' });
    }

    const json = await res.json();

    // Alpha Vantage returns these keys when rate-limited or erroring
    if (json['Note'] || json['Information'] || !json.top_gainers) {
      return NextResponse.json({ success: true, data: getMockMovers(), source: 'mock' });
    }

    const mapMover = (item: RawMover, type: 'gainer' | 'loser') => ({
      symbol: item.ticker,
      price: parseFloat(item.price) || 0,
      changeAmount: parseFloat(item.change_amount) || 0,
      changePercent: parseFloat(item.change_percentage?.replace('%', '')) || 0,
      volume: parseInt(item.volume) || 0,
      moverType: type,
    });

    return NextResponse.json({
      success: true,
      data: {
        gainers: (json.top_gainers as RawMover[]).slice(0, 8).map((m) => mapMover(m, 'gainer')),
        losers: (json.top_losers as RawMover[]).slice(0, 8).map((m) => mapMover(m, 'loser')),
        trending: (json.most_actively_traded as RawMover[]).slice(0, 8).map((m) => ({
          symbol: m.ticker,
          price: parseFloat(m.price) || 0,
          changePercent: parseFloat(m.change_percentage?.replace('%', '')) || 0,
          volume: parseInt(m.volume) || 0,
        })),
      },
      source: 'live',
    });
  } catch (err) {
    console.error('Market movers error:', err);
    return NextResponse.json({ success: true, data: getMockMovers(), source: 'mock' });
  }
}

function getMockMovers() {
  return {
    gainers: [
      { symbol: 'NVDA',  price: 875.28, changeAmount:  68.23, changePercent:  8.45, volume: 45678900, moverType: 'gainer' },
      { symbol: 'AMD',   price: 212.67, changeAmount:  12.45, changePercent:  6.23, volume: 78912300, moverType: 'gainer' },
      { symbol: 'TSLA',  price: 248.87, changeAmount:  14.56, changePercent:  5.87, volume: 23456700, moverType: 'gainer' },
      { symbol: 'META',  price: 390.45, changeAmount:  18.34, changePercent:  4.92, volume: 34567800, moverType: 'gainer' },
      { symbol: 'GOOGL', price: 155.89, changeAmount:   5.67, changePercent:  3.78, volume: 12345600, moverType: 'gainer' },
    ],
    losers: [
      { symbol: 'AAPL', price: 175.43, changeAmount:  -6.23, changePercent: -3.45, volume: 56789000, moverType: 'loser' },
      { symbol: 'MSFT', price: 385.67, changeAmount: -11.45, changePercent: -2.89, volume: 34567800, moverType: 'loser' },
      { symbol: 'AMZN', price: 157.89, changeAmount:  -3.78, changePercent: -2.34, volume: 23456700, moverType: 'loser' },
      { symbol: 'NFLX', price: 441.23, changeAmount:  -8.90, changePercent: -1.98, volume: 12345600, moverType: 'loser' },
      { symbol: 'CRM',  price: 203.12, changeAmount:  -3.45, changePercent: -1.67, volume:  9876540, moverType: 'loser' },
    ],
    trending: [
      { symbol: 'NVDA',  price: 875.28, changePercent:  8.45, volume: 45678900 },
      { symbol: 'TSLA',  price: 248.87, changePercent:  5.87, volume: 23456700 },
      { symbol: 'AAPL',  price: 175.43, changePercent: -3.45, volume: 56789000 },
      { symbol: 'AMD',   price: 212.67, changePercent:  6.23, volume: 78912300 },
      { symbol: 'META',  price: 390.45, changePercent:  4.92, volume: 34567800 },
      { symbol: 'GOOGL', price: 155.89, changePercent:  3.78, volume: 12345600 },
      { symbol: 'MSFT',  price: 385.67, changePercent: -2.89, volume: 34567800 },
      { symbol: 'AMZN',  price: 157.89, changePercent: -2.34, volume: 23456700 },
    ],
  };
}
