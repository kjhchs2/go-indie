import { NextResponse } from 'next/server';
import { createIntentToken, resolveOrigin } from '@/lib/paymentIntent';

interface PrepareRequestBody {
  trackId: string;
  receiverId: string;
  senderId?: string | null;
  amount: number;
  message?: string;
  trackTitle?: string;
}

export async function POST(request: Request) {
  const body = (await request.json()) as PrepareRequestBody;
  if (!body.trackId || !body.receiverId || !body.amount) {
    return NextResponse.json({ error: 'trackId, receiverId, amount are required.' }, { status: 400 });
  }

  const roundedAmount = Math.round(body.amount);
  const paymentId = `goindie-${Date.now()}`;
  const intentToken = createIntentToken({
    paymentId,
    trackId: body.trackId,
    receiverId: body.receiverId,
    senderId: body.senderId ?? null,
    amount: roundedAmount,
    message: body.message?.slice(0, 200),
    trackTitle: body.trackTitle,
  });

  const origin = resolveOrigin(request);
  const successUrl = `${origin}/donations/portone/success?intentToken=${encodeURIComponent(intentToken)}&paymentId=${paymentId}`;
  const failUrl = `${origin}/donations/portone/fail?intentToken=${encodeURIComponent(intentToken)}&paymentId=${paymentId}`;

  const channelKey = (process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY || '').trim() || null;
  // 포트원은 channelKey가 있으면 pgProvider 없이도 라우팅됨. channelKey 우선 사용.
  const pgProvider = channelKey ? null : (process.env.NEXT_PUBLIC_PORTONE_PG_PROVIDER || '').trim() || null;

  return NextResponse.json({
    paymentId,
    currency: 'KRW',
    amount: roundedAmount,
    orderName: body.trackTitle ? `${body.trackTitle} 밀어주기` : 'GoIndie 밀어주기',
    successUrl,
    failUrl,
    intentToken,
    storeId: process.env.NEXT_PUBLIC_PORTONE_STORE_ID || null,
    channelKey,
    pgProvider,
  });
}
