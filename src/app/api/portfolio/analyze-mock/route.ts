import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createServerClient } from '@/lib/supabase';

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

    // Mock OCR results
    const mockOcrResults = {
      extractedText: 'AAPL 10 175.43 165.00, MSFT 5 385.67 350.00, TSLA 2 248.87 200.00',
      holdings: [
        { symbol: 'AAPL', quantity: 10, price: 175.43, costBasis: 165.00, confidence: 0.95 },
        { symbol: 'MSFT', quantity: 5, price: 385.67, costBasis: 350.00, confidence: 0.90 },
        { symbol: 'TSLA', quantity: 2, price: 248.87, costBasis: 200.00, confidence: 0.85 },
      ],
    };

    // Update upload with OCR results
    await serverClient
      .from('uploads')
      .update({
        ocr_status: 'completed',
        ocr_results: mockOcrResults,
      })
      .eq('id', uploadId)
      .eq('user_id', userData.id);

    // Insert holdings
    if (mockOcrResults.holdings.length > 0) {
      const holdingsData = mockOcrResults.holdings.map(holding => ({
        upload_id: uploadId,
        symbol: holding.symbol,
        quantity: holding.quantity,
        price: holding.price,
        cost_basis: holding.costBasis,
        market_value: holding.quantity * holding.price,
        confidence_score: holding.confidence,
      }));

      await serverClient
        .from('holdings')
        .insert(holdingsData);
    }

    // Generate mock AI review
    const totalValue = mockOcrResults.holdings.reduce((sum, h) => sum + (h.quantity * h.price), 0);
    const totalCostBasis = mockOcrResults.holdings.reduce((sum, h) => sum + (h.quantity * h.costBasis), 0);
    const totalGainLoss = totalValue - totalCostBasis;
    const totalGainLossPercent = (totalGainLoss / totalCostBasis) * 100;

    const aiReview = {
      summary: `Your portfolio has a total market value of $${totalValue.toFixed(2)} with a ${totalGainLossPercent >= 0 ? 'gain' : 'loss'} of ${totalGainLossPercent.toFixed(2)}%.`,
      strengths: [
        `Strong performance with a total gain of ${totalGainLossPercent.toFixed(2)}%.`,
        `Well-diversified across ${mockOcrResults.holdings.length} different stocks.`,
        `Top holding is AAPL representing a significant portion of your portfolio.`,
      ],
      risks: [
        `Potential concentration risk with AAPL being a large holding.`,
        `Technology sector exposure is high (${mockOcrResults.holdings.filter(h => ['AAPL', 'MSFT', 'TSLA'].includes(h.symbol)).length} out of ${mockOcrResults.holdings.length} stocks).`,
        `Consider adding defensive stocks for better risk management.`,
      ],
      suggestions: [
        'Consider rebalancing to reduce concentration in top holdings.',
        'Explore adding assets from different sectors to improve diversification.',
        'Regularly review your portfolio for volatility and drawdown risks.',
        'Consider setting stop-loss orders for high-volatility positions.',
      ],
      disclaimer: 'This analysis is for educational purposes only and does not constitute financial advice. Please consult with a qualified financial advisor before making investment decisions.',
      overallScore: Math.min(100, Math.max(0, 75 + (totalGainLossPercent / 2))),
      riskLevel: 'Medium',
    };

    // Update upload with AI review
    await serverClient
      .from('uploads')
      .update({
        ai_review: aiReview,
      })
      .eq('id', uploadId)
      .eq('user_id', userData.id);

    return NextResponse.json({
      success: true,
      data: {
        uploadId,
        ocrResults: mockOcrResults,
        aiReview,
        metrics: {
          totalValue,
          totalCostBasis,
          totalGainLoss,
          totalGainLossPercent,
        },
      },
    });

  } catch (error) {
    console.error('Mock analysis error:', error);
    return NextResponse.json({ error: 'Failed to analyze portfolio' }, { status: 500 });
  }
}

