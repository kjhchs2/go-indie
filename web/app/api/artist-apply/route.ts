import { NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/supabaseClient';

export async function POST(request: Request) {
  const supabase = getSupabaseServiceClient();
  if (!supabase) return NextResponse.json({ error: 'Supabase service not configured' }, { status: 503 });

  const body = await request.json().catch(() => null);
  if (!body?.user_id) return NextResponse.json({ error: 'user_id is required' }, { status: 400 });

  const { user_id, stage_name, bio, links, agreed_terms } = body;

  // Insert application (auto-approved)
  const { error: insertError } = await supabase.from('artist_applications').insert({
    user_id,
    stage_name,
    bio,
    links,
    agreed_terms: Boolean(agreed_terms),
    status: 'approved',
  });
  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  // Upgrade role to artist
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ role: 'artist', bio, nickname: stage_name || undefined })
    .eq('id', user_id);
  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
