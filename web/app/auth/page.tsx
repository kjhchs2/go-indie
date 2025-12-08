'use client';

import { useState } from 'react';
import { supabaseBrowserClient } from '@/lib/supabaseClient';
import { FcGoogle } from 'react-icons/fc';

export default function AuthPage() {
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGoogle = async () => {
    if (!supabaseBrowserClient) {
      setStatus('Supabase 환경변수가 설정되지 않았습니다.');
      return;
    }
    setLoading(true);
    setStatus(null);
    const redirectTo =
      typeof window !== 'undefined' && window.location?.origin
        ? `${window.location.origin}/`
        : undefined;
    const { error } = await supabaseBrowserClient.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
      },
    });
    if (error) setStatus(error.message);
    setLoading(false);
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center bg-slate-950 px-5 text-white">
      <h1 className="text-2xl font-bold">Google로 로그인</h1>

      <div className="mt-6 space-y-4">
        <button
          onClick={handleGoogle}
          disabled={loading}
          className="flex w-full items-center justify-center gap-3 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-900 shadow-lg transition hover:bg-emerald-50 disabled:opacity-60"
        >
          <FcGoogle className="h-5 w-5" />
          {loading ? '이동 중...' : 'Google로 계속하기'}
        </button>
      </div>

      {status && <p className="mt-4 text-sm text-amber-200">{status}</p>}
    </div>
  );
}
