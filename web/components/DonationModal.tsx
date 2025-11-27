'use client';

import { useState } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import { Track } from '@/types';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

interface DonationModalProps {
  track: Track | null;
  onClose: () => void;
}

const AMOUNTS = [1000, 3000, 5000];

export function DonationModal({ track, onClose }: DonationModalProps) {
  const [amount, setAmount] = useState<number>(AMOUNTS[0]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const { user } = useSupabaseAuth();

  const handleSend = async () => {
    if (!track) return;
    setLoading(true);
    setDone(false);
    try {
      await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          track_id: track.id,
          receiver_id: track.artist_id,
          sender_id: user?.id ?? null,
          amount,
          message,
        }),
      });
      setDone(true);
      setTimeout(onClose, 1200);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!track) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium uppercase text-slate-500">밀어주기</p>
            <h3 className="text-xl font-semibold text-slate-900">{track.artist?.nickname}</h3>
            <p className="text-sm text-slate-600">&ldquo;{track.title}&rdquo;</p>
          </div>
          <button
            className="text-sm font-medium text-slate-500 transition hover:text-slate-800"
            onClick={onClose}
          >
            닫기
          </button>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3">
          {AMOUNTS.map((amt) => (
            <button
              key={amt}
              onClick={() => setAmount(amt)}
              className={`rounded-2xl border px-3 py-3 text-center text-sm font-semibold transition ${
                amount === amt
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                  : 'border-slate-200 text-slate-700 hover:border-slate-300'
              }`}
            >
              {amt.toLocaleString()}원
            </button>
          ))}
        </div>

        <div className="mt-4">
          <label className="text-sm font-semibold text-slate-700">응원 메시지</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none ring-2 ring-transparent transition focus:border-emerald-400 focus:ring-emerald-50"
            rows={3}
            placeholder="커피 마시고 힘내세요!"
          />
        </div>

        <button
        onClick={handleSend}
        disabled={loading}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 px-4 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-orange-400 disabled:opacity-60"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        {done ? '밀어주기 완료! (모의 결제)' : '밀어주기'}
      </button>
      </div>
    </div>
  );
}
