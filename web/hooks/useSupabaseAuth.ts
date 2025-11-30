'use client';

import { useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabaseBrowserClient } from '@/lib/supabaseClient';

export function useSupabaseAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // Keep auth session in sync
  useEffect(() => {
    if (!supabaseBrowserClient) return;
    supabaseBrowserClient.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null);
      setUser(data.session?.user ?? null);
    });

    const { data: listener } = supabaseBrowserClient.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession ?? null);
      setUser(newSession?.user ?? null);
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  // Upsert profile row after login (server-side bypasses RLS via service role)
  useEffect(() => {
    const syncProfile = async () => {
      if (!user) return;
      try {
        await fetch('/api/profiles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: user.id,
            email: user.email,
            nickname: user.user_metadata?.name || user.email?.split('@')[0],
            profile_image: user.user_metadata?.picture || '',
          }),
        });
      } catch (err) {
        console.error('Failed to upsert profile', err);
      }
    };
    syncProfile();
  }, [user]);

  return { session, user };
}
