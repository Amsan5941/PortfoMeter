import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET() {
  try {
    const serverClient = createServerClient();
    
    // Test database connection
    const { data: stocks, error: stocksError } = await serverClient
      .from('stock_symbols')
      .select('symbol, company_name')
      .limit(5);
    
    // Test storage buckets
    const { data: buckets, error: bucketsError } = await serverClient.storage.listBuckets();
    
    return NextResponse.json({
      success: true,
      database: {
        connected: !stocksError,
        error: stocksError?.message,
        stockCount: stocks?.length || 0,
        sampleStocks: stocks || []
      },
      storage: {
        connected: !bucketsError,
        error: bucketsError?.message,
        buckets: buckets?.map(b => ({ name: b.name, public: b.public })) || []
      }
    });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

