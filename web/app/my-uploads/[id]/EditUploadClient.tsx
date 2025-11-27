'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.js';
import type { Region } from 'wavesurfer.js/dist/plugins/regions.js';
import { supabaseBrowserClient } from '@/lib/supabaseClient';
import { TrackInsert } from '@/types';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

const FIXED_HIGHLIGHT_SECONDS = 30;
const DEFAULT_COVER_PLACEHOLDER = '/placeholder-cover.svg';

const sanitizeFileName = (name: string) =>
  name
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();

export default function EditUploadClient({ id }: { id: string }) {
  const { user } = useSupabaseAuth();
  const [form, setForm] = useState<TrackInsert | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState('');
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [waveError, setWaveError] = useState('');
  const [audioDuration, setAudioDuration] = useState<number | null>(null);
  const waveformRef = useRef<HTMLDivElement | null>(null);
  const waveSurferRef = useRef<WaveSurfer | null>(null);
  const [audioObjectUrl, setAudioObjectUrl] = useState<string | null>(null);
  const regionsPluginRef = useRef<ReturnType<typeof RegionsPlugin.create> | null>(null);
  const regionRef = useRef<Region | null>(null);
  const [, setIsPlaying] = useState(false);
  const updateRegionPositionRef = useRef<(time: number) => void>(() => {});
  const [jumpSeconds, setJumpSeconds] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  // Fetch existing track
  useEffect(() => {
    const fetchTrack = async () => {
      if (!user?.id || !supabaseBrowserClient) {
        setFetching(false);
        setFetchError('로그인 정보나 Supabase 클라이언트가 없습니다.');
        return;
      }
      setFetching(true);
      setFetchError(null);
      const { data, error } = await supabaseBrowserClient
        .from('tracks')
        .select('*')
        .eq('id', id)
        .eq('artist_id', user.id)
        .single();
      if (error || !data) {
        setFetchError('트랙을 불러오는 데 실패했어요.');
      } else {
        setForm({
          artist_id: data.artist_id,
          title: data.title,
          audio_url: data.audio_url,
          lyrics: data.lyrics || '',
          cover_image: data.cover_image || DEFAULT_COVER_PLACEHOLDER,
          highlight_start: data.highlight_start || 0,
          highlight_duration: data.highlight_duration || 30,
          tags: data.tags || [],
          funding_goal_amount: data.funding_goal_amount || 0,
          funding_raised_amount: data.funding_raised_amount || 0,
          funding_purpose: data.funding_purpose || '',
        });
        setTagsInput((data.tags || []).join(','));
      }
      setFetching(false);
    };
    fetchTrack();
  }, [user, id]);

  // Wavesurfer setup (same as upload)
  useEffect(() => {
    if (!waveformRef.current) return;
    if (!audioObjectUrl && !(form?.audio_url)) return;
    const url = audioObjectUrl || form?.audio_url;
    if (!url) return;

    setWaveError('');
    if (waveSurferRef.current) {
      waveSurferRef.current.destroy();
      waveSurferRef.current = null;
    }

    const getCssVar = (name: string) =>
      typeof window !== 'undefined'
        ? getComputedStyle(document.documentElement).getPropertyValue(name).trim()
        : '';

    const waveColor = getCssVar('--muted') || '#9CA3AF';
    const accentColor = getCssVar('--accent') || '#f97316';
    const accentSoft = 'color-mix(in srgb,' + (getCssVar('--accent') || '#f97316') + ' 20%, transparent)';

    const ws = WaveSurfer.create({
      container: waveformRef.current,
      waveColor,
      progressColor: waveColor,
      height: 120,
      cursorWidth: 2,
      cursorColor: accentColor || '#f97316',
      normalize: true,
    });

    waveSurferRef.current = ws;
    const regionsPlugin = ws.registerPlugin(
      RegionsPlugin.create({
        dragSelection: {
          slop: 5,
        },
      }),
    );
    regionsPluginRef.current = regionsPlugin;

    const updateRegionPosition = (startTime: number) => {
      const region = regionRef.current;
      if (!region) return;
      const dur = ws.getDuration();
      const desiredLength = Math.min(FIXED_HIGHLIGHT_SECONDS, dur);
      let nextStart = Math.max(0, startTime);
      if (nextStart + desiredLength > dur) {
        nextStart = Math.max(0, dur - desiredLength);
      }
      const nextEnd = Math.min(dur, nextStart + desiredLength);
      region.setOptions({ start: nextStart, end: nextEnd, resize: false });
      ws.setTime(nextStart);
      setForm((f) =>
        f
          ? {
              ...f,
              highlight_start: Math.round(nextStart),
              highlight_duration: Math.max(1, Math.round(nextEnd - nextStart)),
            }
          : f,
      );
    };
    updateRegionPositionRef.current = updateRegionPosition;

    ws.on('ready', () => {
      const duration = ws.getDuration();
      setAudioDuration(duration);
      const start = form?.highlight_start || 0;
      const end = Math.min(FIXED_HIGHLIGHT_SECONDS, duration);
      const region = regionsPlugin.addRegion({
        start,
        end,
        drag: true,
        resize: false,
        color: accentSoft,
        handleStyle: {
          border: `2px solid ${accentColor || '#f97316'}`,
          width: '4px',
        },
        borderColor: accentColor || '#f97316',
        borderWidth: 2,
      });
      regionRef.current = region;
      updateRegionPosition(start);
      region.on('update-end', () => updateRegionPosition(region.start));
    });

    ws.on('interaction', (newTime: number) => updateRegionPosition(newTime));
    ws.on('play', () => setIsPlaying(true));
    ws.on('pause', () => setIsPlaying(false));
    ws.on('finish', () => setIsPlaying(false));
    ws.on('error', (err) => {
      console.error(err);
      setWaveError('오디오 파형을 불러오는 데 실패했습니다.');
    });

    ws.load(url);

    return () => {
      regionsPluginRef.current = null;
      regionRef.current = null;
      setIsPlaying(false);
      ws.destroy();
      waveSurferRef.current = null;
    };
  }, [audioObjectUrl, form?.audio_url, form?.highlight_start, form?.highlight_duration]);

  const handleAudioFileSelect = (file: File | null) => {
    setAudioFile(file);
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setAudioObjectUrl(objectUrl);
    } else {
      setAudioObjectUrl(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !form) {
      setMessage('로그인 후 이용해주세요.');
      return;
    }
    setLoading(true);
    setMessage('');

    let audioUrl = form.audio_url;
    let coverUrl = form.cover_image || DEFAULT_COVER_PLACEHOLDER;

    try {
      if (supabaseBrowserClient && audioFile) {
        const safeName = sanitizeFileName(audioFile.name || 'audio');
        const { data, error } = await supabaseBrowserClient.storage
          .from('audio')
          .upload(`${crypto.randomUUID()}-${safeName}`, audioFile, {
            cacheControl: '3600',
            upsert: false,
          });
        if (error) throw error;
        const { data: signed } = await supabaseBrowserClient.storage
          .from('audio')
          .createSignedUrl(data.path, 60 * 60 * 24 * 7);
        audioUrl = signed?.signedUrl || '';
      } else if (!supabaseBrowserClient && audioFile) {
        audioUrl = audioObjectUrl || form.audio_url;
      }

      if (supabaseBrowserClient && coverFile) {
        const safeCoverName = sanitizeFileName(coverFile.name || 'cover');
        const { data, error } = await supabaseBrowserClient.storage
          .from('covers')
          .upload(`${crypto.randomUUID()}-${safeCoverName}`, coverFile, {
            cacheControl: '3600',
            upsert: false,
          });
        if (error) throw error;
        const { data: signed } = await supabaseBrowserClient.storage
          .from('covers')
          .createSignedUrl(data.path, 60 * 60 * 24 * 7);
        coverUrl = signed?.signedUrl || '';
      } else if (!supabaseBrowserClient && coverFile) {
        coverUrl = URL.createObjectURL(coverFile);
      } else {
        coverUrl = form.cover_image || DEFAULT_COVER_PLACEHOLDER;
      }

      if (!audioUrl) throw new Error('오디오 파일을 업로드해주세요.');

      const payload = {
        ...form,
        artist_id: user.id,
        audio_url: audioUrl,
        cover_image: coverUrl,
        tags: form.tags,
      };

      const res = await fetch(`/api/tracks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('수정 실패');
      setMessage('수정 완료! 메인에서 확인해보세요.');
    } catch (err) {
      console.error(err);
      setMessage('수정에 실패했어요. 값들을 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-3xl items-center justify-center px-5 py-10 text-[var(--foreground)]">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!form) {
    return (
      <div className="mx-auto min-h-screen w-full max-w-3xl bg-[#f7f5f2] px-5 py-10 text-slate-900">
        <Link
          href="/my-uploads"
          className="mb-4 inline-flex items-center text-[var(--muted)] transition hover:text-[var(--accent)]"
          aria-label="뒤로가기"
        >
          <ArrowLeft size={18} strokeWidth={2.5} />
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">업로드 수정</h1>
        <p className="mt-2 text-sm text-slate-600">
          {fetchError || '트랙을 불러오지 못했습니다. 다시 시도하거나 목록으로 돌아가세요.'}
        </p>
        <div className="mt-4">
          <Link
            href="/my-uploads"
            className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)]"
          >
            목록으로
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen w-full max-w-3xl bg-[#f7f5f2] px-5 py-10 text-slate-900">
      <Link
        href="/my-uploads"
        className="mb-2 inline-flex items-center text-[var(--muted)] transition hover:text-[var(--accent)]"
        aria-label="뒤로가기"
      >
        <ArrowLeft size={18} strokeWidth={2.5} />
      </Link>
      <h1 className="text-2xl font-bold text-slate-900">업로드 수정</h1>
      <p className="mt-1 text-sm text-slate-600">기존 업로드 정보를 수정하고 저장하세요.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5" onClick={(e) => e.stopPropagation()}>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-800">곡 제목</label>
          <input
            value={form.title}
            onChange={(e) => setForm((f) => (f ? { ...f, title: e.target.value } : f))}
            required
            className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-2 ring-transparent transition focus:border-orange-400 focus:ring-orange-50"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-800">오디오 파일 (필수)</label>
          <input
            type="file"
            accept="audio/*"
            onChange={(e) => handleAudioFileSelect(e.target.files?.[0] ?? null)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-2 ring-transparent transition file:mr-3 file:rounded-xl file:border-0 file:bg-orange-500 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white focus:border-orange-400 focus:ring-orange-50"
          />
          <p className="text-xs text-slate-500">
            {audioFile ? `선택된 파일: ${audioFile.name}` : '기존 파일을 유지하려면 비워두세요.'}
          </p>
          <p className="text-xs text-slate-500">
            mp3, m4a, wav, ogg 등 표준 오디오 파일만 업로드하세요. 인코딩이 잘못된 파일은 재생/파형 생성에 실패할 수 있습니다.
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-800">커버 이미지 파일 (선택)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-2 ring-transparent transition file:mr-3 file:rounded-xl file:border-0 file:bg-orange-500 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white focus:border-orange-400 focus:ring-orange-50"
          />
          <p className="text-xs text-slate-500">
            {coverFile
              ? `선택된 파일: ${coverFile.name}`
              : '직접 만든 이미지나 사용 허가가 있는 것만 업로드하세요. 업로드하지 않으면 기존 이미지를 유지합니다.'}
          </p>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-semibold">하이라이트 구간 선택</label>
          <div className="rounded-2xl border border-slate-200 bg-white p-3">
            <div ref={waveformRef} className="w-full" />
            {waveError && <p className="mt-2 text-sm text-orange-600">{waveError}</p>}
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-700">
              <button
                type="button"
                onClick={() => {
                  const ws = waveSurferRef.current;
                  if (!ws) return;
                  if (ws.isPlaying()) ws.pause();
                  else ws.play();
                }}
                className="rounded-full bg-orange-500 px-3 py-2 text-xs font-semibold text-white shadow hover:bg-orange-400"
              >
                재생/일시정지
              </button>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  value={jumpSeconds}
                  onChange={(e) => setJumpSeconds(e.target.value)}
                  placeholder="초 입력"
                  className="w-24 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none ring-2 ring-transparent transition focus:border-orange-400 focus:ring-orange-50"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!updateRegionPositionRef.current) return;
                    const value = Number(jumpSeconds);
                    if (Number.isNaN(value) || value < 0) return;
                    updateRegionPositionRef.current(value);
                  }}
                  className="rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-800 hover:border-orange-300"
                >
                  입력 초로 이동
                </button>
              </div>
              <span className="text-slate-600">
                구간: {(() => {
                  const start = form.highlight_start ?? 0;
                  const end = form.highlight_start + form.highlight_duration;
                  const fmt = (s: number) =>
                    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
                  return `${fmt(start)} ~ ${fmt(end)} (${form.highlight_duration}s, 최대 30초)`;
                })()}
              </span>
              {audioDuration != null && (
                <span className="text-slate-500">전체 길이: {Math.floor(audioDuration)}s</span>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-800">태그</label>
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 ring-2 ring-transparent transition focus-within:border-orange-400 focus-within:ring-orange-50">
            <div className="flex flex-wrap gap-2">
              {form.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-2 rounded-full bg-[color-mix(in_srgb,var(--accent)_15%,transparent)] px-3 py-1 text-xs font-semibold text-[var(--accent)]"
                >
                  {tag}
                  <button
                    type="button"
                    className="text-[var(--muted)] hover:text-[var(--accent-strong)]"
                    onClick={() =>
                      setForm((f) => (f ? { ...f, tags: f.tags.filter((t) => t !== tag) } : f))
                    }
                    aria-label={`${tag} 제거`}
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !(e.nativeEvent as KeyboardEvent).isComposing) {
                    e.preventDefault();
                    const nextTag = tagsInput.trim();
                    if (nextTag && !form.tags.includes(nextTag)) {
                      setForm((f) => (f ? { ...f, tags: [...f.tags, nextTag] } : f));
                    }
                    setTagsInput('');
                  }
                }}
                placeholder="엔터로 태그 추가"
                className="flex-1 min-w-[120px] bg-transparent text-sm text-slate-900 outline-none"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-800">가사 (선택)</label>
          <textarea
            value={form.lyrics}
            onChange={(e) => setForm((f) => (f ? { ...f, lyrics: e.target.value } : f))}
            rows={5}
            className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-2 ring-transparent transition focus:border-orange-400 focus:ring-orange-50"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-800">펀딩 목표 금액 (원)</label>
            <input
              type="number"
              min={0}
              value={form.funding_goal_amount ?? 0}
              onChange={(e) =>
                setForm((f) => (f ? { ...f, funding_goal_amount: Number(e.target.value || 0) } : f))
              }
              placeholder="예: 500000"
              className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-2 ring-transparent transition focus:border-orange-400 focus:ring-orange-50"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-800">펀딩 목적</label>
            <input
              value={form.funding_purpose ?? ''}
              onChange={(e) => setForm((f) => (f ? { ...f, funding_purpose: e.target.value } : f))}
              placeholder="예: 믹싱/마스터링 비용"
              className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-2 ring-transparent transition focus:border-orange-400 focus:ring-orange-50"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-orange-500 px-4 py-3 text-center text-sm font-bold text-white shadow-lg transition hover:bg-orange-400 disabled:opacity-60"
        >
          {loading ? '수정 중...' : '수정 저장'}
        </button>
      </form>

      {message && <p className="mt-4 text-sm text-orange-600">{message}</p>}
    </div>
  );
}
