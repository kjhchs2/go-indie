import { NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/supabaseClient';

export async function POST(request: Request) {
  const supabase = getSupabaseServiceClient();
  if (!supabase) return NextResponse.json({ error: 'Supabase service not configured' }, { status: 503 });

  const body = await request.json().catch(() => null);
  if (!body?.user_id) return NextResponse.json({ error: 'user_id is required' }, { status: 400 });

  const { user_id, nickname, bio, links, profile_image } = body;

  // 기존 값 불러와 병합 (없으면 새로 생성)
  const { data: existing, error: fetchErr } = await supabase
    .from('profiles')
    .select('nickname, bio, links, profile_image, role, email')
    .eq('id', user_id)
    .maybeSingle();

  if (fetchErr) {
    return NextResponse.json({ error: fetchErr.message }, { status: 500 });
  }

  const payload = {
    id: user_id,
    nickname: nickname ?? existing?.nickname ?? '',
    bio: bio ?? existing?.bio ?? '',
    links: links ?? existing?.links ?? '',
    profile_image: profile_image ?? existing?.profile_image ?? '',
    role: existing?.role ?? 'artist',
    email: existing?.email,
  };

  const { error } = await supabase.from('profiles').upsert(payload, { onConflict: 'id' });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: updated, error: readErr } = await supabase
    .from('profiles')
    .select('id, nickname, bio, links, profile_image, role')
    .eq('id', user_id)
    .maybeSingle();

  if (readErr) return NextResponse.json({ error: readErr.message }, { status: 500 });

  return NextResponse.json({ ok: true, profile: updated });
}
