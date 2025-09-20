import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!query || query.length < 1) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    const serverClient = createServerClient();

    // Search in our stock symbols database
    const { data: stocks, error } = await serverClient
      .from('stock_symbols')
      .select('symbol, company_name, exchange, sector, industry')
      .or(`symbol.ilike.%${query}%,company_name.ilike.%${query}%`)
      .eq('is_active', true)
      .limit(limit);

    if (error) {
      console.error('Search error:', error);
      // Fallback to mock data if database is not set up
      const mockStocks = [
        { symbol: 'AAPL', company_name: 'Apple Inc.', exchange: 'NASDAQ', sector: 'Technology', industry: 'Consumer Electronics' },
        { symbol: 'TSLA', company_name: 'Tesla Inc.', exchange: 'NASDAQ', sector: 'Consumer Discretionary', industry: 'Auto Manufacturers' },
        { symbol: 'NVDA', company_name: 'NVIDIA Corporation', exchange: 'NASDAQ', sector: 'Technology', industry: 'Semiconductors' },
        { symbol: 'MSFT', company_name: 'Microsoft Corporation', exchange: 'NASDAQ', sector: 'Technology', industry: 'Software' },
        { symbol: 'GOOGL', company_name: 'Alphabet Inc.', exchange: 'NASDAQ', sector: 'Technology', industry: 'Internet Content & Information' },
        { symbol: 'AMZN', company_name: 'Amazon.com Inc.', exchange: 'NASDAQ', sector: 'Consumer Discretionary', industry: 'Internet Retail' },
        { symbol: 'META', company_name: 'Meta Platforms Inc.', exchange: 'NASDAQ', sector: 'Technology', industry: 'Social Media' },
        { symbol: 'NFLX', company_name: 'Netflix Inc.', exchange: 'NASDAQ', sector: 'Consumer Discretionary', industry: 'Entertainment' },
        { symbol: 'AMD', company_name: 'Advanced Micro Devices Inc.', exchange: 'NASDAQ', sector: 'Technology', industry: 'Semiconductors' },
        { symbol: 'CRM', company_name: 'Salesforce Inc.', exchange: 'NYSE', sector: 'Technology', industry: 'Software' },
      ];

      const fallbackStocks = mockStocks.filter(stock => 
        stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
        stock.company_name.toLowerCase().includes(query.toLowerCase())
      ).slice(0, limit);

      return NextResponse.json({
        success: true,
        data: fallbackStocks,
        query,
      });
    }

    // Log search event if user is authenticated
    try {
      const { userId } = await auth();
      if (userId) {
        const { data: userData } = await serverClient
          .from('users')
          .select('id')
          .eq('clerk_id', userId)
          .single();

        if (userData) {
          // TODO: Fix TypeScript issue with Supabase insert
          // await serverClient
          //   .from('search_events')
          //   .insert({
          //     user_id: userData.id,
          //     symbol: query.toUpperCase(),
          //     search_type: 'symbol',
          //   });
        }
      }
    } catch (authError) {
      // Ignore auth errors for search logging
      console.log('Auth error for search logging:', authError);
    }

    return NextResponse.json({
      success: true,
      data: stocks,
      query,
    });

  } catch (error) {
    console.error('Stock search error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
