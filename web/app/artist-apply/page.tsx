'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

export default function ArtistApplyPage() {
  const { user } = useSupabaseAuth();
  const router = useRouter();
  const [stageName, setStageName] = useState('');
  const [bio, setBio] = useState('');
  const [links, setLinks] = useState('');
  const [agree, setAgree] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
      // 안내 후 메인으로 이동
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
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1" />
          <span>약관 및 정책에 동의합니다.</span>
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
    </div>
  );
}
