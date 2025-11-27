'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { BadgeCheck, Headphones, Music, Sparkles, Users } from 'lucide-react';
import { Track } from '@/types';
import { SupportersModal } from './SupportersModal';

interface TrackCardProps {
  track: Track;
  isActive: boolean;
  onDonate: (track: Track) => void;
   onSupportersOpen?: () => void;
   onSupportersClose?: () => void;
}

export function TrackCard({ track, isActive, onDonate, onSupportersOpen, onSupportersClose }: TrackCardProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [, setIsPlaying] = useState(false); // used for syncing UI if needed
  const [showSupporters, setShowSupporters] = useState(false);
  const playCountedRef = useRef(false);

  const goal = track.funding_goal_amount || 0;
  const raised = track.funding_raised_amount || 0;
  const fundingPct = goal > 0 ? Math.min(Math.round((raised / goal) * 100)) : raised > 0 ? 100 : 0;
  const fundingLabel =
    goal > 0
      ? `${fundingPct}% · ${raised.toLocaleString()}원 / ${goal.toLocaleString()}원`
      : raised > 0
      ? `목표 금액은 없지만 ${raised.toLocaleString()}원 밀어주심!`
      : '목표 금액 없음';

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isActive) {
      const durationMs = Math.max((track.highlight_duration || 30) * 1000, 5000);
      audio.currentTime = track.highlight_start || 0;
      audio.play().catch(() => {
        // Autoplay might be blocked; ignore here.
      });
      if (!playCountedRef.current) {
        playCountedRef.current = true;
        fetch(`/api/tracks/${track.id}/play`, { method: 'POST' }).catch(() => {});
      }
      const timer = setTimeout(() => {
        audio.pause();
      }, durationMs);

      return () => {
        clearTimeout(timer);
        audio.pause();
      };
    } else {
      audio.pause();
    }
  }, [isActive, track.highlight_start, track.highlight_duration, track.id]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handlePause);
    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handlePause);
    };
  }, []);

  useEffect(() => {
    // Reset play count marker when track changes
    playCountedRef.current = false;
  }, [track.id]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) audio.play().catch(() => {});
    else audio.pause();
  };

  return (
    <div
      className="flex h-full w-[94vw] max-w-[540px] flex-col gap-4 overflow-hidden rounded-3xl bg-[var(--card)] p-5 text-[var(--foreground)] shadow-xl ring-1 ring-[var(--border)] md:max-w-[560px]"
      onClick={togglePlayPause}
    >
      <div className="relative aspect-[1/1.1] overflow-hidden rounded-3xl bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] ring-1 ring-[var(--border)]">
        {track.cover_image ? (
          <Image
            src={track.cover_image}
            alt={track.title}
            fill
            className="object-cover"
            sizes="540px"
            priority
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[var(--accent)]">
            <Music size={56} />
          </div>
        )}
      </div>

      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
            <Headphones size={16} />
            <span>{track.play_count ?? 0} plays</span>
          </div>
          <h2 className="mt-1 text-3xl font-bold leading-tight text-[var(--foreground)]">{track.title}</h2>
          <div className="mt-1 flex items-center gap-2 text-sm text-[var(--muted)]">
            <span className="font-medium">{track.artist?.nickname ?? '익명 아티스트'}</span>
            <BadgeCheck size={16} className="text-[var(--accent)]" />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {track.tags?.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-[color-mix(in_srgb,var(--accent)_15%,transparent)] px-3 py-1 text-xs uppercase tracking-wide text-[var(--accent)]"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        <button
          className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)]"
          onClick={(e) => {
            e.stopPropagation();
            onDonate(track);
          }}
        >
          <span className="inline-flex items-center gap-2">
            <Sparkles size={16} />
            밀어주기
          </span>
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="rounded-2xl bg-[color-mix(in_srgb,var(--card)_70%,var(--background)_30%)] p-4 text-sm leading-relaxed text-[var(--foreground)] ring-1 ring-[var(--border)]">
          <p className="whitespace-pre-line">{track.lyrics ?? '가사가 곧 추가됩니다.'}</p>
        </div>
      </div>
      <audio ref={audioRef} src={track.audio_url} preload="metadata" className="hidden" />

      <div className="rounded-2xl bg-[color-mix(in_srgb,var(--accent)_6%,transparent)] p-4 ring-1 ring-[var(--border)]">
        <div className="flex items-center justify-between text-sm font-semibold text-[var(--foreground)]">
          <span>{track.funding_purpose || ''}</span>  {/*// todo: 목적 없을 때, 뭐라고 채울지 고민*/}
          <span className="text-xs text-[var(--muted)]">{fundingLabel}</span>
        </div>
        <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--muted)_20%,transparent)]">
          <div
            className="h-full rounded-full bg-[var(--accent)] transition-all"
            style={{ width: `${goal > 0 ? fundingPct : raised > 0 ? 100 : 0}%` }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-[var(--muted)]">
          <span>Tap to play/pause · Swipe ↑/↓</span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSupportersOpen?.();
              setShowSupporters(true);
            }}
            className="inline-flex items-center gap-1 rounded-full bg-[var(--card)] px-2 py-1 text-[var(--accent)] ring-1 ring-[var(--border)] transition hover:ring-[var(--accent)]"
          >
            <Users size={12} />
            밀어준 사람들
          </button>
        </div>
      </div>
      <SupportersModal
        trackId={track.id}
        open={showSupporters}
        onClose={() => {
          setShowSupporters(false);
          onSupportersClose?.();
        }}
      />
    </div>
  );
}
