'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Loader2, User } from 'lucide-react';

interface Supporter {
  id: string;
  sender_id: string | null;
  amount: number;
  message?: string;
  created_at?: string;
  sender?: {
    id: string;
    nickname?: string;
    profile_image?: string;
    email?: string;
  } | null;
}

export function SupportersModal({
  trackId,
  open,
  onClose,
}: {
  trackId: string;
  open: boolean;
  onClose: () => void;
}) {
  const [supporters, setSupporters] = useState<Supporter[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const fetchSupporters = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/supporters/${trackId}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'failed');
        setSupporters(json.data || []);
      } catch (err) {
        console.error(err);
        setError('후원자 정보를 불러오지 못했어요.');
      } finally {
        setLoading(false);
      }
    };
    fetchSupporters();
  }, [open, trackId]);

  if (!open) return null;

  const content = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
    >
      <div
        className="w-full max-w-md rounded-3xl bg-[var(--card)] p-5 text-[var(--foreground)] shadow-xl ring-1 ring-[var(--border)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold">밀어주신 분들</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-[var(--muted)] transition hover:text-[var(--accent)]"
          >
            닫기
          </button>
        </div>
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
            <Loader2 className="h-4 w-4 animate-spin" /> 불러오는 중...
          </div>
        ) : error ? (
          <div className="text-sm text-red-500">{error}</div>
        ) : supporters.length === 0 ? (
          <div className="text-sm text-[var(--muted)]">아직 밀어주신 분이 없습니다.</div>
        ) : (
          <div className="max-h-[320px] space-y-3 overflow-auto">
            {supporters.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between rounded-2xl bg-[color-mix(in_srgb,var(--card)_80%,var(--background)_20%)] px-3 py-2 ring-1 ring-[var(--border)]"
              >
                <div className="flex items-center gap-2">
                  {s.sender?.profile_image ? (
                    <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full ring-1 ring-[var(--border)]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={s.sender.profile_image}
                        alt="avatar"
                        className="h-8 w-8 object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--accent)_15%,transparent)] text-[var(--accent)]">
                      <User size={14} />
                    </div>
                  )}
                  <div className="text-sm">
                    <div className="font-semibold">
                      {s.sender?.nickname || s.sender?.email || '익명'}
                    </div>
                    {s.message && <div className="text-xs text-[var(--muted)]">{s.message}</div>}
                  </div>
                </div>
                <div className="text-sm font-semibold text-[var(--accent)]">
                  {s.amount.toLocaleString()}원
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  if (typeof window === 'undefined') return null;
  return createPortal(content, document.body);
}
