import { NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/supabaseClient';

export async function POST(request: Request) {
  const supabase = getSupabaseServiceClient();
  if (!supabase) {
    return NextResponse.json(
      { error: 'Supabase service client is not configured on the server.' },
      { status: 503 },
    );
  }

  const body = await request.json();
  const { id, email, nickname, profile_image, role = 'listener', bio = '' } = body ?? {};

  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  // 기존 role을 보존: 이미 존재하면 덮어쓰지 않음
  let roleToUse = role;
  const { data: existing } = await supabase.from('profiles').select('role').eq('id', id).maybeSingle();
  if (existing?.role) {
    roleToUse = existing.role;
  }

  const { error } = await supabase.from('profiles').upsert(
    {
      id,
      email,
      nickname,
      profile_image,
      role: roleToUse,
      bio,
    },
    { onConflict: 'id' },
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
