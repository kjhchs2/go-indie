'use client';

import Link from 'next/link';

type SearchParams = { code?: string; message?: string };

export default function PortOneFailPage({ searchParams }: { searchParams?: SearchParams }) {
  const code = searchParams?.code;
  const message = searchParams?.message;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-lg ring-1 ring-[var(--border)]">
        <div className="space-y-3 text-center">
          <p className="text-lg font-bold text-red-600">결제가 취소되었어요</p>
          <p className="text-sm text-slate-600">{message || '다시 시도해주세요.'}</p>
          {code && <p className="text-xs text-slate-500">에러 코드: {code}</p>}
          <Link
            href="/"
            className="mt-3 inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow hover:bg-slate-800"
          >
            홈으로 이동
          </Link>
        </div>
      </div>
    </div>
  );
}
