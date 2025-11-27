import { NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/supabaseClient';

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_req: Request, context: RouteContext) {
  const { id } = await context.params;
  const supabase = getSupabaseServiceClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase service client not configured' }, { status: 503 });
  }

  // Fetch current play_count then increment
  const { data, error: selectError } = await supabase
    .from('tracks')
    .select('play_count')
    .eq('id', id)
    .single();

  if (selectError) {
    return NextResponse.json({ error: selectError.message }, { status: 500 });
  }

  const current = data?.play_count ?? 0;
  const { error: updateError } = await supabase
    .from('tracks')
    .update({ play_count: current + 1 })
    .eq('id', id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, play_count: current + 1 });
}
