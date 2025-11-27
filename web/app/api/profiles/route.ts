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

  const { error } = await supabase.from('profiles').upsert(
    {
      id,
      email,
      nickname,
      profile_image,
      role,
      bio,
    },
    { onConflict: 'id' },
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
