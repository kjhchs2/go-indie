'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabaseBrowserClient } from '@/lib/supabaseClient';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

export default function ArtistEditPage() {
  const { user } = useSupabaseAuth();
  const router = useRouter();
  const [nickname, setNickname] = useState('');
  const [bio, setBio] = useState('');
  const [links, setLinks] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user || !supabaseBrowserClient) return;
      const { data } = await supabaseBrowserClient
        .from('profiles')
        .select('nickname, bio, links, profile_image, role')
        .eq('id', user.id)
        .maybeSingle();
      if (data) {
        setNickname(data.nickname || '');
        setBio(data.bio || '');
        setLinks(data.links || '');
        setProfileImageUrl(data.profile_image || '');
        if (data.role !== 'artist') {
          setStatus('아티스트만 수정할 수 있습니다.');
        }
      }
    };
    loadProfile();
  }, [user]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
      setStatus('로그인 후 수정할 수 있습니다.');
      return;
    }
    setLoading(true);
    setStatus(null);
    try {
      let uploadedUrl = profileImageUrl;
      if (profileImageFile && supabaseBrowserClient) {
        const path = `${user.id}/${Date.now()}-${profileImageFile.name}`;
        const { error: uploadError } = await supabaseBrowserClient.storage.from('avatars').upload(path, profileImageFile, {
          upsert: true,
          cacheControl: '3600',
        });
        if (uploadError) throw new Error(uploadError.message);
        const { data } = supabaseBrowserClient.storage.from('avatars').getPublicUrl(path);
        uploadedUrl = data.publicUrl;
      }

      const res = await fetch('/api/artist-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          nickname,
          bio,
          links,
          profile_image: uploadedUrl,
        }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || '수정에 실패했습니다.');
      }
      setStatus('저장되었습니다.');
      setProfileImageUrl(uploadedUrl);
      setTimeout(() => router.push(`/artist/${user.id}`), 800);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : '수정에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto min-h-screen w-full max-w-2xl bg-[var(--background)] px-5 py-10 text-[var(--foreground)]">
      <Link href="/" className="text-sm text-[var(--accent)] hover:underline">
        ← 메인으로
      </Link>
      <h1 className="mt-3 text-2xl font-bold">아티스트 소개 수정</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">활동명, 소개, 링크를 업데이트하세요.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-semibold">활동명</label>
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="w-full rounded-2xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm outline-none ring-2 ring-transparent transition focus:border-[var(--accent)] focus:ring-[color-mix(in_srgb,var(--accent)_20%,transparent)]"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold">소개</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            className="w-full rounded-2xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm outline-none ring-2 ring-transparent transition focus:border-[var(--accent)] focus:ring-[color-mix(in_srgb,var(--accent)_20%,transparent)]"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold">링크 (줄바꿈으로 여러 개 입력)</label>
          <textarea
            value={links}
            onChange={(e) => setLinks(e.target.value)}
            rows={3}
            placeholder="https://soundcloud...\nhttps://instagram..."
            className="w-full rounded-2xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm outline-none ring-2 ring-transparent transition focus:border-[var(--accent)] focus:ring-[color-mix(in_srgb,var(--accent)_20%,transparent)]"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold">프로필 이미지 (파일 업로드)</label>
          <div className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 ring-2 ring-transparent transition focus-within:border-[var(--accent)] focus-within:ring-[color-mix(in_srgb,var(--accent)_20%,transparent)]">
            <label className="flex cursor-pointer items-center gap-2 rounded-xl bg-[color-mix(in_srgb,var(--accent)_15%,transparent)] px-3 py-2 text-xs font-semibold text-[var(--accent)] transition hover:bg-[color-mix(in_srgb,var(--accent)_25%,transparent)]">
              파일 선택
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setProfileImageFile(file);
                }}
              />
            </label>
            <div className="flex-1 text-sm text-[var(--muted)]">
              {profileImageFile?.name || (profileImageUrl ? '기존 이미지 유지' : '선택된 파일 없음')}
            </div>
          </div>
          <p className="text-xs text-[var(--muted)]">
            권장: 정사각형 이미지, JPG/PNG · 새 파일을 선택하면 기존 이미지를 대체합니다.
          </p>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-[var(--accent)] px-4 py-3 text-center text-sm font-bold text-white shadow-lg transition hover:bg-[var(--accent-strong)] disabled:opacity-60"
        >
          {loading ? '저장 중...' : '저장하기'}
        </button>
      </form>

      {status && <p className="mt-4 text-sm text-[var(--accent)]">{status}</p>}
    </div>
  );
}
