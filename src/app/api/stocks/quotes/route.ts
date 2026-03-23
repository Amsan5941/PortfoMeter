import { NextResponse } from 'next/server';

// Minimal POST handler: accepts { symbols: string[] } and returns { success:true, quotes: { "AAPL": 174.23 }, notFound: [...] }
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const symbols = Array.isArray(body?.symbols) ? body.symbols.map((s: unknown) => String(s).toUpperCase()) : [];

    if (symbols.length === 0) {
      return NextResponse.json({ success: false, error: 'No symbols provided' }, { status: 400 });
    }

    const apiKey = process.env.FINNHUB_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ success: false, error: 'FINNHUB_API_KEY not set on server' }, { status: 500 });
    }

    // Fetch quotes in parallel (rate limits apply). We map Finnhub "c" (current price) -> price
    const responses = await Promise.all(
      symbols.map(async (symbol: string) => {
        try {
          const res = await fetch(`https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${apiKey}`);
          if (!res.ok) return [symbol, null] as const;
          const json = await res.json();
          const price = typeof json?.c === 'number' && json.c > 0 ? json.c : null;
          return [symbol, price] as const;
        } catch {
          return [symbol, null] as const;
        }
      })
    );

    const quotes: Record<string, number | null> = {};
    const notFound: string[] = [];
    for (const [symbol, price] of responses) {
      quotes[symbol] = price;
      if (price == null) notFound.push(symbol);
    }

    return NextResponse.json({ success: true, quotes, notFound });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 });
  }
}
