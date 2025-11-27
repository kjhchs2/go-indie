import { NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/supabaseClient';

export async function GET(_req: Request, context: { params: Promise<{ trackId: string }> }) {
  const { trackId } = await context.params;
  const supabase = getSupabaseServiceClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase service client not configured' }, { status: 503 });
  }

  const { data, error } = await supabase
    .from('donations')
    .select(
      `
        id,
        sender_id,
        amount,
        message,
        created_at,
        sender:sender_id (
          id,
          nickname,
          profile_image,
          email
        )
      `,
    )
    .eq('track_id', trackId)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
