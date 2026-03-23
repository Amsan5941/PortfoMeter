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

    const { data: userData, error: userError } = await serverClient
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userDbId = (userData as { id: string }).id;

    // Simulated OCR results (what real OCR would extract from a screenshot)
    const mockOcrResults = {
      extractedText: 'AAPL 10 175.43 165.00, MSFT 5 385.67 350.00, TSLA 2 248.87 200.00',
      holdings: [
        { symbol: 'AAPL', quantity: 10, price: 175.43, costBasis: 165.00, confidence: 0.95 },
        { symbol: 'MSFT', quantity: 5,  price: 385.67, costBasis: 350.00, confidence: 0.90 },
        { symbol: 'TSLA', quantity: 2,  price: 248.87, costBasis: 200.00, confidence: 0.85 },
      ],
    };

    // Persist OCR results (use untyped client to bypass strict generated DB types)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = serverClient as any;
    await db.from('uploads')
      .update({ ocr_status: 'completed', ocr_results: mockOcrResults })
      .eq('id', uploadId)
      .eq('user_id', userDbId);

    // Insert holdings (ignore duplicate errors on reanalysis)
    if (mockOcrResults.holdings.length > 0) {
      await db.from('holdings').insert(
        mockOcrResults.holdings.map((h: typeof mockOcrResults.holdings[number]) => ({
          upload_id: uploadId,
          symbol: h.symbol,
          quantity: h.quantity,
          price: h.price,
          cost_basis: h.costBasis,
          market_value: h.quantity * h.price,
          confidence_score: h.confidence,
        }))
      );
    }

    // Calculate portfolio metrics
    const totalValue = mockOcrResults.holdings.reduce(
      (sum, h) => sum + h.quantity * h.price,
      0
    );
    const totalCostBasis = mockOcrResults.holdings.reduce(
      (sum, h) => sum + h.quantity * h.costBasis,
      0
    );
    const totalGainLoss = totalValue - totalCostBasis;
    const totalGainLossPercent = (totalGainLoss / totalCostBasis) * 100;

    // Default AI review used as fallback
    let aiReview = {
      summary: `Your portfolio has a total market value of $${totalValue.toFixed(2)} with a ${
        totalGainLossPercent >= 0 ? 'gain' : 'loss'
      } of ${Math.abs(totalGainLossPercent).toFixed(2)}%. All three holdings — AAPL, MSFT, and TSLA — are currently profitable against their cost bases. This is for educational purposes only.`,
      strengths: [
        `Strong overall return of ${totalGainLossPercent.toFixed(2)}% across all positions.`,
        `Mix of established mega-cap tech (AAPL, MSFT) alongside high-growth TSLA offers some balance.`,
        `AAPL, the largest holding, is among the most liquid securities globally with strong cash flows.`,
      ],
      risks: [
        `100% technology sector concentration — no exposure to healthcare, financials, or defensives.`,
        `TSLA carries high volatility (~60% annualised) which can cause significant drawdown in risk-off markets.`,
        `Portfolio relies on continued outperformance of mega-cap tech, currently trading at elevated multiples.`,
      ],
      suggestions: [
        'Consider adding exposure to a different sector (e.g., healthcare or consumer staples) to reduce correlation.',
        'Review position sizing — even a small allocation to bonds or dividend stocks can dampen overall volatility.',
        'Set a rebalancing schedule (e.g., quarterly) to lock in gains and maintain target allocations.',
        'Use tax-loss harvesting opportunities if any positions move into the red.',
      ],
      disclaimer:
        'This analysis is for educational purposes only and does not constitute financial advice. Please consult with a qualified financial advisor before making investment decisions.',
      overallScore: Math.min(100, Math.max(0, 75 + totalGainLossPercent / 2)),
      riskLevel: 'Medium',
    };

    // Attempt real AI analysis via OpenAI GPT-4o-mini
    const openaiKey = process.env.OPENAI_API_KEY;
    if (openaiKey) {
      try {
        const holdingsSummary = mockOcrResults.holdings
          .map(
            (h) =>
              `${h.symbol}: ${h.quantity} shares, current price $${h.price.toFixed(2)}, cost basis $${h.costBasis.toFixed(2)}`
          )
          .join('; ');

        const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${openaiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content:
                  'You are a helpful financial education assistant. Analyze stock portfolios for educational purposes only — never give actual financial advice. Keep responses concise and actionable.',
              },
              {
                role: 'user',
                content: `Analyze this portfolio educationally:
Holdings: ${holdingsSummary}
Total value: $${totalValue.toFixed(2)}, Total gain/loss: ${totalGainLossPercent.toFixed(2)}%

Return a JSON object with exactly these keys:
- summary: string (2-3 sentences covering overall performance and context; end with "This is for educational purposes only.")
- strengths: array of exactly 3 strings (one sentence each, specific to these holdings)
- risks: array of exactly 3 strings (one sentence each, specific to these holdings)
- suggestions: array of exactly 4 strings (one sentence each, actionable educational suggestions)`,
              },
            ],
            response_format: { type: 'json_object' },
            max_tokens: 700,
            temperature: 0.7,
          }),
        });

        if (openaiRes.ok) {
          const openaiData = await openaiRes.json();
          const content = JSON.parse(openaiData.choices[0].message.content);
          if (
            content.summary &&
            Array.isArray(content.strengths) &&
            Array.isArray(content.risks) &&
            Array.isArray(content.suggestions)
          ) {
            aiReview = {
              ...aiReview,
              summary: content.summary,
              strengths: content.strengths.slice(0, 3),
              risks: content.risks.slice(0, 3),
              suggestions: content.suggestions.slice(0, 4),
            };
          }
        }
      } catch (aiError) {
        // OpenAI unavailable — fall back to default review silently
        console.log('OpenAI unavailable, using default review:', aiError);
      }
    }

    // Persist AI review
    await db.from('uploads')
      .update({ ai_review: aiReview })
      .eq('id', uploadId)
      .eq('user_id', userDbId);

    return NextResponse.json({
      success: true,
      data: {
        uploadId,
        ocrResults: mockOcrResults,
        aiReview,
        metrics: { totalValue, totalCostBasis, totalGainLoss, totalGainLossPercent },
      },
    });
  } catch (error) {
    console.error('Mock analysis error:', error);
    return NextResponse.json({ error: 'Failed to analyze portfolio' }, { status: 500 });
  }
}
