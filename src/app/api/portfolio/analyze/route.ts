import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createServerClient } from '@/lib/supabase';
import { calculatePortfolioMetrics, calculateDiversificationScore } from '@/lib/utils';

interface UploadWithHoldings {
  id: string;
  ocr_status: string;
  holdings: Array<{
    quantity: number;
    price: number;
    cost_basis: number;
    symbol: string;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { uploadId } = await request.json();

    if (!uploadId) {
      return NextResponse.json({ error: 'Upload ID is required' }, { status: 400 });
    }

    const serverClient = createServerClient();

    // Get user data
    const { data: userData, error: userError } = await serverClient
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userId_db = (userData as { id: string }).id;

    // Get upload and holdings data
    const { data: uploadData, error: uploadError } = await serverClient
      .from('uploads')
      .select(`
        *,
        holdings (*)
      `)
      .eq('id', uploadId)
      .eq('user_id', userId_db)
      .single();

    if (uploadError || !uploadData) {
      return NextResponse.json({ error: 'Upload not found' }, { status: 404 });
    }

    const upload = uploadData as UploadWithHoldings;

    if (upload.ocr_status !== 'completed') {
      return NextResponse.json({ error: 'Portfolio analysis not ready' }, { status: 400 });
    }

    const holdings = upload.holdings || [];

    if (holdings.length === 0) {
      return NextResponse.json({ error: 'No holdings found' }, { status: 400 });
    }

    // Transform holdings to match utility function interface
    const transformedHoldings = holdings.map(holding => ({
      quantity: holding.quantity,
      price: holding.price,
      costBasis: holding.cost_basis,
    }));

    const diversificationHoldings = holdings.map(holding => ({
      symbol: holding.symbol,
      quantity: holding.quantity,
      price: holding.price,
    }));

    // Calculate portfolio metrics
    const metrics = calculatePortfolioMetrics(transformedHoldings);
    const diversificationScore = calculateDiversificationScore(diversificationHoldings);

    // Find top holding
    const topHolding = holdings.reduce((max, holding) => 
      (holding.quantity * holding.price) > (max.quantity * max.price) ? holding : max
    );
    const topHoldingWeight = ((topHolding.quantity * topHolding.price) / metrics.totalValue) * 100;

    // Calculate sector concentration (mock data for now)
    const sectorConcentration = {
      'Technology': 45,
      'Healthcare': 25,
      'Financial': 20,
      'Consumer': 10,
    };

    // Generate AI review (mock for now)
    const aiReview = {
      summary: `Your portfolio shows a ${metrics.totalGainLoss >= 0 ? 'positive' : 'negative'} performance with a total value of $${metrics.totalValue.toLocaleString()}. The portfolio is ${diversificationScore > 70 ? 'well diversified' : diversificationScore > 40 ? 'moderately diversified' : 'concentrated'} with a diversification score of ${diversificationScore.toFixed(1)}%.`,
      strengths: [
        'Strong performance in technology sector',
        'Good mix of large-cap stocks',
        'Reasonable diversification across sectors',
      ],
      risks: [
        'High concentration in technology sector',
        'Limited exposure to international markets',
        'Potential volatility from growth stocks',
      ],
      suggestions: [
        'Consider adding more defensive stocks',
        'Diversify into international markets',
        'Review position sizes for better balance',
      ],
      disclaimer: 'This analysis is for educational purposes only and does not constitute financial advice. Please consult with a qualified financial advisor before making investment decisions.',
      overallScore: Math.min(100, Math.max(0, 75 + (metrics.totalGainLossPercent / 2))),
      riskLevel: diversificationScore > 70 ? 'Low' : diversificationScore > 40 ? 'Medium' : 'High',
    };

    // Update upload with AI review
    // TODO: Fix TypeScript issue with Supabase update
    // await serverClient
    //   .from('uploads')
    //   .update({
    //     ai_review: aiReview,
    //   })
    //   .eq('id', uploadId);

    return NextResponse.json({
      success: true,
      data: {
        metrics: {
          ...metrics,
          topHolding: {
            symbol: topHolding.symbol,
            weight: topHoldingWeight,
          },
          diversificationScore,
          sectorConcentration,
        },
        aiReview,
        holdings: holdings.map(holding => ({
          ...holding,
          weight: ((holding.quantity * holding.price) / metrics.totalValue) * 100,
        })),
      },
    });

  } catch (error) {
    console.error('Portfolio analysis error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
