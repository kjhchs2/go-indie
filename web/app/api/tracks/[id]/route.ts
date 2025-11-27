import { NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/supabaseClient';

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const supabase = getSupabaseServiceClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase service client not configured' }, { status: 503 });
  }

  const body = await request.json();
  const artistId = body?.artist_id as string | undefined;
  if (!artistId) {
    return NextResponse.json({ error: 'artist_id is required' }, { status: 400 });
  }

  const { data: track, error: fetchError } = await supabase
    .from('tracks')
    .select('artist_id')
    .eq('id', id)
    .single();

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }
  if (!track) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  if (track.artist_id !== artistId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const updatePayload: Record<string, unknown> = { ...body };
  delete (updatePayload as Record<string, unknown>).artist_id;

  const { error } = await supabase.from('tracks').update(updatePayload).eq('id', id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const supabase = getSupabaseServiceClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase service client not configured' }, { status: 503 });
  }

  const body = await request.json().catch(() => ({}));
  const artistId = body?.artist_id as string | undefined;
  if (!artistId) {
    return NextResponse.json({ error: 'artist_id is required' }, { status: 400 });
  }

  const { data: track, error: fetchError } = await supabase
    .from('tracks')
    .select('artist_id')
    .eq('id', id)
    .single();

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }
  if (!track) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  if (track.artist_id !== artistId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { error } = await supabase.from('tracks').delete().eq('id', id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
