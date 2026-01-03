'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Status = 'processing' | 'completed' | 'error';
type SearchParams = Record<string, string | string[] | undefined>;

export default async function PortOneSuccessPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const [status, setStatus] = useState<Status>('processing');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = await searchParams;
    const paymentIdRaw = params?.paymentId;
    const intentTokenRaw = params?.intentToken;
    const paymentId = Array.isArray(paymentIdRaw) ? paymentIdRaw[0] : paymentIdRaw;
    const intentToken = Array.isArray(intentTokenRaw) ? intentTokenRaw[0] : intentTokenRaw;

    if (!paymentId || !intentToken) {
      setStatus('error');
      setError('필수 결제 정보가 누락되었어요.');
      return;
    }

    const confirmPayment = async () => {
      try {
        const res = await fetch('/api/payments/portone/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentId, intentToken }),
        });
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json?.error || '결제 승인에 실패했습니다.');
        }
        setStatus('completed');
      } catch (err) {
        setError((err as Error).message);
        setStatus('error');
      }
    };

    confirmPayment();
  }, [searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-lg ring-1 ring-[var(--border)]">
        {status === 'processing' && (
          <div className="space-y-3 text-center">
            <p className="text-sm font-semibold text-slate-800">결제 승인 중입니다</p>
            <p className="text-sm text-slate-500">잠시만 기다려주세요...</p>
          </div>
        )}

        {status === 'completed' && (
          <div className="space-y-4 text-center">
            <p className="text-lg font-bold text-emerald-700">후원이 완료되었어요! 🎉</p>
            <p className="text-sm text-slate-600">방금 후원이 아티스트에게 전달되도록 처리했어요.</p>
            <Link
              href="/"
              className="inline-flex w-full items-center justify-center rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white shadow hover:bg-emerald-400"
            >
              피드로 돌아가기
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4 text-center">
            <p className="text-lg font-bold text-red-600">결제 승인에 실패했어요</p>
            <p className="text-sm text-slate-600">{error || '잠시 후 다시 시도해주세요.'}</p>
            <Link
              href="/"
              className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow hover:bg-slate-800"
            >
              홈으로 이동
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
