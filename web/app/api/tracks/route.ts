import { NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/supabaseClient';
import { mockTracks } from '@/lib/mockData';
import { TrackInsert } from '@/types';

export async function GET() {
  const supabase = getSupabaseServiceClient();
  if (!supabase) {
    return NextResponse.json({ data: mockTracks, source: 'mock' });
  }

  const { data, error } = await supabase
    .from('tracks')
    .select(
      `
        *,
        artist:artist_id (
          id,
          email,
          nickname,
          profile_image,
          role,
          bio
        )
      `,
    )
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data, source: 'supabase' });
}

export async function POST(request: Request) {
  const supabase = getSupabaseServiceClient();
  if (!supabase) {
    return NextResponse.json(
      { error: 'Supabase is not configured on the server.' },
      { status: 503 },
    );
  }

  const body = (await request.json()) as TrackInsert;
  if (!body.title || !body.audio_url || !body.artist_id) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
  }

  const { error } = await supabase.from('tracks').insert(body);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
