'use client';

import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import EventEditor from '@/components/EventEditor';
import PostEditor from '@/components/admin/PostEditor';
import SignIn from '@/components/admin/SignIn';
import { supabaseClient } from '@/lib/supabase';

type AdminTab = 'posts' | 'events';

export default function AdminPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [tab, setTab] = useState<AdminTab>('posts');

  useEffect(() => {
    supabaseClient.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setCheckingSession(false);
    });

    const { data } = supabaseClient.auth.onAuthStateChange((_event, next) => {
      setSession(next);
    });

    return () => data.subscription.unsubscribe();
  }, []);

  if (checkingSession) {
    return (
      <p className="py-20 text-center text-sm text-ink-muted">확인 중...</p>
    );
  }

  if (!session) {
    return <SignIn />;
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {(
            [
              ['posts', '글'],
              ['events', '일정'],
            ] as [AdminTab, string][]
          ).map(([value, label]) => (
            <button
              key={value}
              onClick={() => setTab(value)}
              className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                tab === value
                  ? 'border-ink bg-ink text-paper'
                  : 'border-line text-ink-soft hover:border-ink-muted'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 text-xs text-ink-muted">
          <span className="truncate">{session.user.email}</span>
          <button
            onClick={() => supabaseClient.auth.signOut()}
            className="underline hover:text-ink-soft"
          >
            로그아웃
          </button>
        </div>
      </div>

      {tab === 'posts' ? <PostEditor /> : <EventEditor />}
    </div>
  );
}
