'use client';

import Link from 'next/link';
import { businessPolicies, businessInfo } from '@/lib/businessInfo';

export default function PoliciesPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] px-4 py-10 text-[var(--foreground)]">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <div>
          <p className="text-xs font-semibold uppercase text-[var(--accent)]">정책 안내</p>
          <h1 className="mt-2 text-2xl font-bold text-[var(--foreground)]">서비스 제공 및 환불/취소 정책</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            결제 및 서비스 이용과 관련한 필수 정책을 안내드립니다. 실제 사업자 정보를 반드시 최신으로 유지해주세요.
          </p>
        </div>

        <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">서비스 제공기간(배송기간)</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">{businessPolicies.servicePeriod}</p>
        </section>

        <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">교환/환불 정책</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">{businessPolicies.exchangeRefund}</p>
        </section>

        <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">취소 규정</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">{businessPolicies.cancelPolicy}</p>
        </section>

        <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">문의</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            결제/환불 관련 문의는 {businessPolicies.contactEmail} 로 연락해주세요.
          </p>
        </section>

        <Link
          href="/"
          className="inline-flex w-full items-center justify-center rounded-2xl bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-white shadow hover:bg-[var(--accent-strong)]"
        >
          메인으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
