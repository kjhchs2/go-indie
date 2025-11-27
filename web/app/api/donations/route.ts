import { NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/supabaseClient';
import { DonationInsert } from '@/types';
import { mockDonations } from '@/lib/mockData';

export async function POST(request: Request) {
  const supabase = getSupabaseServiceClient();
  const body = (await request.json()) as DonationInsert;

  if (!body.receiver_id || !body.amount || !body.track_id) {
    return NextResponse.json({ error: 'receiver_id, track_id, and amount are required.' }, { status: 400 });
  }

  if (body.amount <= 0) {
    return NextResponse.json({ error: 'Amount must be greater than zero.' }, { status: 400 });
  }

  if (!supabase) {
    // Mock persistence for local demo
    const mockEntry = {
      id: `mock-${Date.now()}`,
      created_at: new Date().toISOString(),
      ...body,
    };
    mockDonations.push(mockEntry);
    return NextResponse.json({ ok: true, source: 'mock', data: mockEntry });
  }

  const { error } = await supabase.from('donations').insert(body);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Update funding_raised_amount when track_id is provided
  const { data: trackData } = await supabase
    .from('tracks')
    .select('funding_raised_amount')
    .eq('id', body.track_id)
    .single();
  const current = trackData?.funding_raised_amount ?? 0;
  await supabase
    .from('tracks')
    .update({ funding_raised_amount: current + body.amount })
    .eq('id', body.track_id);

  return NextResponse.json({ ok: true, source: 'supabase' });
}
