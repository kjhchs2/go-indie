'use client';

import { useState } from 'react';
import { LogOut } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { supabaseBrowserClient } from '@/lib/supabaseClient';

export function AuthStatus() {
  const { user } = useSupabaseAuth();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    if (!supabaseBrowserClient) return;
    setLoading(true);
    await supabaseBrowserClient.auth.signOut();
    setLoading(false);
  };

  if (!user) {
    return (
      <Link
        href="/auth"
        className="rounded-full bg-[var(--card)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] ring-1 ring-[var(--border)] transition hover:bg-[color-mix(in_srgb,var(--card)_70%,var(--accent)_30%)]"
      >
        로그인
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {user.user_metadata?.avatar_url && (
        <Image
          src={user.user_metadata.avatar_url}
          alt="avatar"
          width={32}
          height={32}
          className="h-8 w-8 rounded-full object-cover"
        />
      )}
      <div className="text-sm text-[var(--foreground)]">{user.user_metadata?.nickname || user.email}</div>
      <button
        onClick={handleSignOut}
        disabled={loading}
        className="flex items-center gap-1 rounded-full bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] px-3 py-1.5 text-xs font-semibold text-[var(--foreground)] transition hover:bg-[color-mix(in_srgb,var(--accent)_20%,transparent)]"
      >
        <LogOut size={14} />
        {loading ? '...' : '로그아웃'}
      </button>
    </div>
  );
}
