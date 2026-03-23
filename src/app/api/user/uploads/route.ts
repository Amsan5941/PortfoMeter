import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createServerClient } from '@/lib/supabase';

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const serverClient = createServerClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = serverClient as any;

    const { data: userData, error: userError } = await db
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single();

    if (userError || !userData) {
      // User hasn't uploaded anything yet
      return NextResponse.json({ success: true, data: [] });
    }

    const { data: uploads, error: uploadsError } = await db
      .from('uploads')
      .select('id, file_name, created_at, ocr_status, file_size')
      .eq('user_id', (userData as { id: string }).id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (uploadsError) {
      console.error('Uploads fetch error:', uploadsError);
      return NextResponse.json({ success: true, data: [] });
    }

    return NextResponse.json({ success: true, data: uploads ?? [] });
  } catch (error) {
    console.error('User uploads error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
