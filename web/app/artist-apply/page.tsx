'use client';

import type { FormEvent, MouseEvent } from 'react';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

const summaryTerms = [
  {
    title: '[저작권 보증]',
    body: '업로드하는 모든 음원과 이미지는 본인의 창작물이며 타인의 저작권을 침해하지 않았음을 보증합니다.',
  },
  {
    title: '[이용 허락]',
    body: '서비스 운영·홍보를 위해 회사가 귀하의 콘텐츠를 저장, 복제, 전송 및 구간 발췌 편집할 권한을 부여합니다.',
  },
  {
    title: '[수익 정산]',
    body: '후원금은 플랫폼 이용료, PG 결제 수수료 및 세금(3.3%) 등을 공제한 금액으로 정산됩니다.',
  },
  {
    title: '[위반 제재]',
    body: '저작권 침해나 부적절한 콘텐츠로 판단되면 사전 통보 없이 삭제되며 해당 수익금은 지급이 거절될 수 있습니다.',
  },
];

export default function ArtistApplyPage() {
  const { user } = useSupabaseAuth();
  const router = useRouter();
  const [stageName, setStageName] = useState('');
  const [bio, setBio] = useState('');
  const [links, setLinks] = useState('');
  const [agree, setAgree] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);

  const handleCheckboxClick = (e: MouseEvent<HTMLInputElement>) => {
    if (!agree) {
      e.preventDefault();
      setTermsOpen(true);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
      setStatus('로그인 후 신청 가능합니다.');
      return;
    }
    if (!agree) {
      setStatus('약관에 동의해야 신청할 수 있습니다.');
      return;
    }
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch('/api/artist-apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          stage_name: stageName,
          bio,
          links,
          agreed_terms: agree,
        }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || '신청에 실패했습니다.');
      }
      setStatus('아티스트 전환이 완료되었습니다.');
      setTimeout(() => router.push('/'), 1200);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : '신청에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto min-h-screen w-full max-w-2xl bg-[var(--background)] px-5 py-10 text-[var(--foreground)]">
      <Link href="/" className="text-sm text-[var(--accent)] hover:underline">
        ← 메인으로
      </Link>
      <h1 className="mt-3 text-2xl font-bold">아티스트 신청</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">
        활동명, 소개, 링크를 입력하고 약관에 동의하면 바로 아티스트로 전환됩니다.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-semibold">활동명</label>
          <input
            value={stageName}
            onChange={(e) => setStageName(e.target.value)}
            placeholder="예: 새벽달"
            className="w-full rounded-2xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm outline-none ring-2 ring-transparent transition focus:border-[var(--accent)] focus:ring-[color-mix(in_srgb,var(--accent)_20%,transparent)]"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold">소개</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            placeholder="간단한 자기 소개를 적어주세요."
            className="w-full rounded-2xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm outline-none ring-2 ring-transparent transition focus:border-[var(--accent)] focus:ring-[color-mix(in_srgb,var(--accent)_20%,transparent)]"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold">링크(포트폴리오, SNS 등)</label>
          <textarea
            value={links}
            onChange={(e) => setLinks(e.target.value)}
            rows={3}
            placeholder="예: https://soundcloud..., https://instagram..."
            className="w-full rounded-2xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm outline-none ring-2 ring-transparent transition focus:border-[var(--accent)] focus:ring-[color-mix(in_srgb,var(--accent)_20%,transparent)]"
          />
        </div>
        <label className="flex flex-wrap items-start gap-2 text-sm">
          <input
            type="checkbox"
            checked={agree}
            onClick={handleCheckboxClick}
            onChange={(e) => setAgree(e.target.checked)}
            className="mt-1"
          />
          <span
            className="cursor-pointer text-[var(--accent)] underline-offset-4 hover:underline"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setTermsOpen(true);
            }}
          >
            약관 및 정책에 동의합니다.
          </span>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-[var(--accent)] px-4 py-3 text-center text-sm font-bold text-white shadow-lg transition hover:bg-[var(--accent-strong)] disabled:opacity-60"
        >
          {loading ? '신청 중...' : '아티스트로 전환'}
        </button>
      </form>

      {status && <p className="mt-4 text-sm text-[var(--accent)]">{status}</p>}

      {termsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-8">
          <div className="w-full max-w-3xl rounded-3xl bg-[var(--card)] p-6 shadow-2xl ring-1 ring-[var(--border)]">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-[var(--foreground)]">약관 및 정책 핵심 요약</h2>
              <button
                type="button"
                className="text-sm font-medium text-[var(--accent)]"
                onClick={() => setTermsOpen(false)}
              >
                닫기
              </button>
            </div>
            <ul className="mt-4 space-y-4 text-sm text-[var(--muted)]">
              {summaryTerms.map((term) => (
                <li key={term.title}>
                  <p className="font-semibold text-[var(--foreground)]">{term.title}</p>
                  <p className="mt-1 leading-relaxed">{term.body}</p>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-col gap-3 text-xs text-[var(--muted)]">
              <p>모달에서 “동의합니다” 버튼을 누르면 체크박스가 자동으로 선택됩니다.</p>
              <button
                type="button"
                onClick={() => {
                  setAgree(true);
                  setTermsOpen(false);
                }}
                className="w-full rounded-2xl bg-[var(--accent)] py-3 text-center text-xs font-semibold uppercase text-white shadow-sm transition hover:bg-[var(--accent-strong)]"
              >
                동의합니다
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
