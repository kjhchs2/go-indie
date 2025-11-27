'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Trash2, Loader2, AlertCircle, Edit2 } from 'lucide-react';
import { supabaseBrowserClient } from '@/lib/supabaseClient';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { Track } from '@/types';

export default function MyUploadsPage() {
  const { user } = useSupabaseAuth();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchMyTracks = async () => {
      if (!user?.id || !supabaseBrowserClient) return;
      setLoading(true);
      setError(null);
      const { data, error: err } = await supabaseBrowserClient
        .from('tracks')
        .select('*')
        .eq('artist_id', user.id)
        .order('created_at', { ascending: false });
      if (err) setError(err.message);
      else setTracks(data || []);
      setLoading(false);
    };
    fetchMyTracks();
  }, [user]);

  const handleDelete = async (id: string) => {
    if (!user?.id) return;
    setDeletingId(id);
    try {
      await fetch(`/api/tracks/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ artist_id: user.id }),
      });
      setTracks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error(err);
      setError('삭제 중 오류가 발생했습니다.');
    } finally {
      setDeletingId(null);
    }
  };

  if (!user) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-4 px-5 py-10 text-[var(--foreground)]">
        <Link href="/" className="text-sm text-[var(--accent)] hover:underline">
          ← 메인으로
        </Link>
        <h1 className="text-2xl font-bold">내 업로드 리스트</h1>
        <p className="text-[var(--muted)]">로그인 후 확인할 수 있습니다.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-4 px-5 py-10 text-[var(--foreground)]">
      <Link href="/" className="text-sm text-[var(--accent)] hover:underline">
        ← 메인으로
      </Link>
      <h1 className="text-2xl font-bold">내 업로드 리스트</h1>
      {error && (
        <div className="flex items-center gap-2 rounded-2xl bg-red-50 p-3 text-sm text-red-600 ring-1 ring-red-100">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}
      {loading ? (
        <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
          <Loader2 className="h-4 w-4 animate-spin" /> 불러오는 중...
        </div>
      ) : tracks.length === 0 ? (
        <p className="text-[var(--muted)]">아직 업로드한 곡이 없습니다.</p>
      ) : (
        <div className="space-y-3">
          {tracks.map((track) => (
            <div
              key={track.id}
              className="flex items-center justify-between rounded-2xl bg-[var(--card)] p-4 ring-1 ring-[var(--border)]"
            >
              <div>
                <div className="text-sm text-[var(--muted)]">{track.artist_id}</div>
                <div className="text-lg font-semibold">{track.title}</div>
                <div className="text-xs text-[var(--muted)]">
                  Highlight: {track.highlight_start}s · {track.highlight_duration}s
                </div>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/my-uploads/${track.id}`}
                  className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[var(--accent-strong)]"
                >
                  <Edit2 size={14} />
                  수정
                </Link>
                <button
                  onClick={() => handleDelete(track.id)}
                  disabled={deletingId === track.id}
                  className="inline-flex items-center gap-2 rounded-full bg-red-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-400 disabled:opacity-60"
                >
                  <Trash2 size={14} />
                  {deletingId === track.id ? '삭제 중...' : '삭제'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
