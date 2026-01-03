import { NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/supabaseClient';
import { parseIntentToken } from '@/lib/paymentIntent';
import { mockDonations } from '@/lib/mockData';
import { DonationInsert } from '@/types';

const fetchPaymentStatus = async (paymentId: string) => {
  const secretKey = process.env.PORTONE_SECRET_KEY;
  if (!secretKey) {
    throw new Error('PortOne secret key not configured');
  }

  const response = await fetch(`https://api.portone.io/payments/${paymentId}`, {
    method: 'GET',
    headers: {
      Authorization: `PortOne ${secretKey}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.message || 'Failed to fetch payment from PortOne');
  }
  return data;
};

export async function POST(request: Request) {
  const body = (await request.json()) as {
    paymentId?: string;
    intentToken?: string;
  };

  if (!body.paymentId || !body.intentToken) {
    return NextResponse.json({ error: 'paymentId and intentToken are required.' }, { status: 400 });
  }

  let intent;
  try {
    intent = parseIntentToken(body.intentToken);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }

  if (intent.paymentId !== body.paymentId) {
    return NextResponse.json({ error: 'Payment mismatch' }, { status: 400 });
  }

  const supabase = getSupabaseServiceClient();
  const shouldMockPayment = !process.env.PORTONE_SECRET_KEY;
  let paymentResult: unknown = { status: 'mock', approvedAt: new Date().toISOString() };

  if (!shouldMockPayment) {
    try {
      paymentResult = await fetchPaymentStatus(body.paymentId);
      const amountValue =
        paymentResult &&
        typeof paymentResult === 'object' &&
        'amount' in paymentResult &&
        (paymentResult as { amount?: { total?: number; value?: number } }).amount;
      const total = (amountValue as { total?: number; value?: number } | undefined)?.total;
      const value = (amountValue as { total?: number; value?: number } | undefined)?.value;
      const paidAmount = typeof total === 'number' ? total : typeof value === 'number' ? value : null;
      if (paidAmount !== null && paidAmount !== intent.amount) {
        return NextResponse.json({ error: 'Amount mismatch from PortOne' }, { status: 400 });
      }
    } catch (error) {
      return NextResponse.json({ error: (error as Error).message }, { status: 502 });
    }
  }

  const donationPayload: DonationInsert = {
    track_id: intent.trackId,
    receiver_id: intent.receiverId,
    sender_id: intent.senderId ?? null,
    amount: intent.amount,
    message: intent.message,
  };

  if (!supabase) {
    mockDonations.push({
      id: `mock-${Date.now()}`,
      created_at: new Date().toISOString(),
      ...donationPayload,
    });
    return NextResponse.json({ ok: true, source: 'mock', payment: paymentResult });
  }

  const { error } = await supabase.from('donations').insert(donationPayload);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: trackData } = await supabase
    .from('tracks')
    .select('funding_raised_amount')
    .eq('id', donationPayload.track_id)
    .single();
  const current = trackData?.funding_raised_amount ?? 0;
  await supabase
    .from('tracks')
    .update({ funding_raised_amount: current + donationPayload.amount })
    .eq('id', donationPayload.track_id);

  return NextResponse.json({ ok: true, source: 'supabase', payment: paymentResult });
}
