'use server';

import Image from 'next/image';
import Link from 'next/link';
import { getSupabaseServiceClient } from '@/lib/supabaseClient';

export default async function ArtistPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = getSupabaseServiceClient();

  if (!supabase) {
    return (
      <div className="mx-auto max-w-4xl px-5 py-10 text-[var(--foreground)]">
        <p>Supabase가 설정되어 있지 않아 아티스트 정보를 불러올 수 없습니다.</p>
      </div>
    );
  }

  const [{ data: profile }, { data: tracks }] = await Promise.all([
    supabase.from('profiles').select('id, email, nickname, profile_image, bio, links').eq('id', id).maybeSingle(),
    supabase
      .from('tracks')
      .select('id, title, cover_image, highlight_start, highlight_duration, play_count, funding_raised_amount')
      .eq('artist_id', id)
      .order('created_at', { ascending: false }),
  ]);

  if (!profile) {
    return (
      <div className="mx-auto max-w-4xl px-5 py-10 text-[var(--foreground)]">
        <p>아티스트 정보를 찾을 수 없습니다.</p>
      </div>
    );
  }

  const links =
    profile.links
      ?.split('\n')
      .map((l) => l.trim())
      .filter(Boolean) ?? [];

  return (
    <div className="mx-auto max-w-4xl px-5 py-10 text-[var(--foreground)]">
      <div className="flex flex-col gap-6 rounded-3xl bg-[var(--card)] p-6 ring-1 ring-[var(--border)]">
        <div className="flex items-start gap-4">
          <div className="relative h-24 w-24 overflow-hidden rounded-2xl bg-[var(--muted)]">
            {profile.profile_image ? (
              <Image src={profile.profile_image} alt={profile.nickname} fill className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm text-[var(--muted)]">No Image</div>
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{profile.nickname}</h1>
            {profile.bio && <p className="mt-2 whitespace-pre-line text-sm text-[var(--muted)]">{profile.bio}</p>}
            {links.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {links.map((link) => {
                  const href = link.startsWith('http://') || link.startsWith('https://') ? link : `https://${link}`;
                  return (
                    <a
                      key={link}
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] px-3 py-1 text-xs font-semibold text-[var(--accent)] ring-1 ring-[var(--accent)]/30 transition hover:bg-[color-mix(in_srgb,var(--accent)_20%,transparent)]"
                    >
                      {link}
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">업로드한 트랙</h2>
            <Link href="/" className="text-sm text-[var(--accent)] hover:underline">
              메인으로
            </Link>
          </div>
          {tracks && tracks.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {tracks.map((t) => (
                <div
                  key={t.id}
                  className="flex gap-3 rounded-2xl bg-[color-mix(in_srgb,var(--card)_90%,var(--accent)_5%)] p-3 ring-1 ring-[var(--border)]"
                >
                  <div className="relative h-20 w-20 overflow-hidden rounded-xl bg-[var(--muted)]">
                    {t.cover_image ? (
                      <Image src={t.cover_image} alt={t.title} fill className="object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-[var(--muted)]">
                        No cover
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-[var(--muted)]">재생 {t.play_count ?? 0}회</p>
                    <p className="text-base font-semibold">{t.title}</p>
                    <p className="text-xs text-[var(--muted)]">
                      하이라이트 {t.highlight_start ?? 0}s / {t.highlight_duration ?? 0}s
                    </p>
                    {typeof t.funding_raised_amount === 'number' && (
                      <p className="text-xs text-[var(--accent)]">누적 후원 {t.funding_raised_amount}원</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl bg-[color-mix(in_srgb,var(--card)_90%,var(--accent)_5%)] p-4 text-sm text-[var(--muted)] ring-1 ring-[var(--border)]">
              아직 업로드한 트랙이 없습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
