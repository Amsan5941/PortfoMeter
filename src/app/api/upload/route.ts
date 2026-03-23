import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createServerClient } from '@/lib/supabase';
import { generateFileName, validateImageFile } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Generate unique filename
    const fileName = generateFileName(file.name);
    const filePath = `uploads/${userId}/${fileName}`;

    // Convert file to buffer
    const fileBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(fileBuffer);

    // Create server client for storage operations
    const serverClient = createServerClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = serverClient as any;

    // Upload to Supabase Storage
    const { error: uploadError } = await serverClient.storage
      .from('portfolio-uploads')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json({ error: 'Upload failed: ' + uploadError.message }, { status: 500 });
    }

    // Get public URL
    const { data: urlData } = serverClient.storage
      .from('portfolio-uploads')
      .getPublicUrl(filePath);

    // Create upload record in database
    const { data: existingUser, error: userError } = await db
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single();

    let userData = existingUser;

    if (userError || !userData) {
      // Create user if doesn't exist
      const { data: newUser, error: createUserError } = await db
        .from('users')
        .insert({ clerk_id: userId })
        .select('id')
        .single();

      if (createUserError) {
        console.error('User creation error:', createUserError);
        return NextResponse.json({ error: 'User creation failed: ' + createUserError.message }, { status: 500 });
      }

      userData = newUser;
    }

    const { data: uploadRecord, error: dbError } = await db
      .from('uploads')
      .insert({
        user_id: (userData as { id: string }).id,
        file_name: file.name,
        file_path: filePath,
        file_size: file.size,
        mime_type: file.type,
        ocr_status: 'pending',
      })
      .select('id')
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json({ error: 'Database operation failed: ' + dbError.message }, { status: 500 });
    }

    // Trigger OCR processing (async)
    // TODO: Implement actual OCR processing
    // For now, we'll simulate it
    setTimeout(async () => {
      try {
        // Simulate OCR processing
        const mockOcrResults = {
          text: 'Sample OCR text extraction',
          confidence: 0.85,
          holdings: [
            {
              symbol: 'AAPL',
              quantity: 100,
              price: 175.43,
              costBasis: 150.00,
              confidence: 0.9,
            },
            {
              symbol: 'TSLA',
              quantity: 50,
              price: 248.87,
              costBasis: 200.00,
              confidence: 0.8,
            },
          ],
        };

        await db
          .from('uploads')
          .update({
            ocr_status: 'completed',
            ocr_results: mockOcrResults,
          })
          .eq('id', uploadRecord.id);

        // Insert holdings
        if (mockOcrResults.holdings.length > 0) {
          const holdingsData = mockOcrResults.holdings.map((holding: { symbol: string; quantity: number; price: number; costBasis: number; confidence: number }) => ({
            upload_id: uploadRecord.id,
            symbol: holding.symbol,
            quantity: holding.quantity,
            price: holding.price,
            cost_basis: holding.costBasis,
            market_value: holding.quantity * holding.price,
            confidence_score: holding.confidence,
          }));

          await db
            .from('holdings')
            .insert(holdingsData);
        }
      } catch (error) {
        console.error('OCR processing error:', error);
        await db
          .from('uploads')
          .update({
            ocr_status: 'failed',
          })
          .eq('id', uploadRecord.id);
      }
    }, 2000);

    return NextResponse.json({
      success: true,
      uploadId: uploadRecord.id,
      filePath: filePath,
      publicUrl: urlData.publicUrl,
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
