'use client';

import { useEffect, useState } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import { Track } from '@/types';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

interface DonationModalProps {
  track: Track | null;
  onClose: () => void;
}

const PRESET_AMOUNTS = [1000, 5000, 10000];
const MIN_AMOUNT = 1000;
const MAX_AMOUNT = 100000;

type PortOneSDK = {
  requestPayment: (options: Record<string, unknown>) => Promise<unknown>;
};

declare global {
  interface Window {
    PortOne?: PortOneSDK;
  }
}

const PORTONE_STORE_ID = process.env.NEXT_PUBLIC_PORTONE_STORE_ID;

export function DonationModal({ track, onClose }: DonationModalProps) {
  const [amount, setAmount] = useState<number>(PRESET_AMOUNTS[0]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [portoneReady, setPortoneReady] = useState(false);
  const { user } = useSupabaseAuth();
  const customerEmail = user?.email && user.email.trim() ? user.email.trim() : 'guest@goindie.local';
  const customerName =
    ((user?.email && user.email.split('@')[0]) || process.env.NEXT_PUBLIC_DEFAULT_NAME || '익명 후원자').trim() ||
    '익명 후원자';
  const customerPhone = process.env.NEXT_PUBLIC_DEFAULT_PHONE || '01000000000';

  useEffect(() => {
    if (!track || !PORTONE_STORE_ID) return;

    let cancelled = false;
    const loadSdk = async () => {
      setError(null);
      if (!window.PortOne) {
        const scriptId = 'portone-browser-sdk';
        if (!document.getElementById(scriptId)) {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.id = scriptId;
            // v2 Browser SDK (PortOne OPI)
            script.src = 'https://cdn.portone.io/v2/browser-sdk.js';
            script.async = true;
            script.onload = resolve;
            script.onerror = () => reject(new Error('PortOne SDK 로드에 실패했습니다.'));
            document.body.appendChild(script);
          });
        }
      }

      if (cancelled) return;
      if (!window.PortOne) {
        setError('결제 SDK를 불러올 수 없어요.');
        return;
      }
      setPortoneReady(true);
    };

    loadSdk().catch((err: Error) => setError(err.message));
    return () => {
      cancelled = true;
    };
  }, [track]);

  const handleSend = async () => {
    if (!track) return;
    if (Number.isNaN(amount) || amount < MIN_AMOUNT || amount > MAX_AMOUNT) {
      setError(`금액은 ${MIN_AMOUNT.toLocaleString()}원 이상 ${MAX_AMOUNT.toLocaleString()}원 이하로 입력해주세요.`);
      return;
    }
    setLoading(true);
    setDone(false);
    setError(null);

    const fallbackMock = async () => {
      await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          track_id: track.id,
          receiver_id: track.artist_id,
          sender_id: user?.id ?? null,
          amount,
          message,
        }),
      });
      setDone(true);
      setTimeout(onClose, 1200);
    };

    try {
      // If PortOne store id is missing or SDK not ready, fallback to mock donation insert.
      if (!PORTONE_STORE_ID || !window.PortOne || !portoneReady) {
        await fallbackMock();
        return;
      }

      const prepareRes = await fetch('/api/payments/portone/prepare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trackId: track.id,
          receiverId: track.artist_id,
          trackTitle: track.title,
          senderId: user?.id ?? null,
          amount,
          message,
        }),
      });
      const prepared = await prepareRes.json();
      if (!prepareRes.ok) {
        throw new Error(prepared?.error || '결제를 준비하는 중 오류가 발생했습니다.');
      }

      await window.PortOne.requestPayment({
        storeId: PORTONE_STORE_ID,
        channelKey: prepared.channelKey || undefined,
        paymentId: prepared.paymentId,
        orderName: prepared.orderName,
        totalAmount: amount,
        currency: prepared.currency || 'KRW',
        payMethod: 'CARD',
        // 호환 필드 (결제창/legacy 포함) - Inicis V2 일반결제 구매자 정보 강제 입력
        buyer_name: customerName,
        buyer_email: customerEmail,
        buyer_tel: customerPhone,
        name: customerName,
        customer: {
          fullName: customerName,
          phoneNumber: customerPhone,
          email: customerEmail,
        },
        redirectUrl: prepared.successUrl,
        failUrl: prepared.failUrl,
      });
    } catch (error) {
      console.error(error);
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (!track) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium uppercase text-slate-500">밀어주기</p>
            <h3 className="text-xl font-semibold text-slate-900">{track.artist?.nickname}</h3>
            <p className="text-sm text-slate-600">&ldquo;{track.title}&rdquo;</p>
          </div>
          <button
            className="text-sm font-medium text-slate-500 transition hover:text-slate-800"
            onClick={onClose}
          >
            닫기
          </button>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3">
          {PRESET_AMOUNTS.map((amt) => (
            <button
              key={amt}
              onClick={() => setAmount(amt)}
              className={`rounded-2xl border px-3 py-3 text-center text-sm font-semibold transition ${
                amount === amt
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                  : 'border-slate-200 text-slate-700 hover:border-slate-300'
              }`}
            >
              {amt.toLocaleString()}원
            </button>
          ))}
        </div>

        <div className="mt-4">
          <label className="text-sm font-semibold text-slate-700">직접 입력 (1,000원~100,000원)</label>
          <input
            type="number"
            min={MIN_AMOUNT}
            max={MAX_AMOUNT}
            step={100}
            value={Number.isNaN(amount) ? '' : amount}
            onChange={(e) => {
              const next = Number(e.target.value);
              if (Number.isNaN(next)) {
                setAmount(NaN);
                return;
              }
              const clamped = Math.min(Math.max(next, MIN_AMOUNT), MAX_AMOUNT);
              setAmount(clamped);
            }}
            className="mt-2 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none ring-2 ring-transparent transition focus:border-emerald-400 focus:ring-emerald-50"
            placeholder="원 단위로 입력"
          />
        </div>

        <div className="mt-4">
          <label className="text-sm font-semibold text-slate-700">응원 메시지</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none ring-2 ring-transparent transition focus:border-emerald-400 focus:ring-emerald-50"
            rows={3}
            placeholder="커피 마시고 힘내세요!"
          />
        </div>

        {!PORTONE_STORE_ID && (
          <div className="mt-5 rounded-2xl bg-amber-50 p-3 text-xs text-amber-700">
            PortOne 키가 설정되지 않아 모의 후원으로 처리됩니다.
          </div>
        )}

        {error && (
          <div className="mt-3 rounded-2xl bg-red-50 p-3 text-xs text-red-700 ring-1 ring-red-100">
            {error}
          </div>
        )}

        <button
          onClick={handleSend}
          disabled={loading}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 px-4 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-orange-400 disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {done ? '밀어주기 완료! (모의 결제)' : '밀어주기'}
        </button>
      </div>
    </div>
  );
}
