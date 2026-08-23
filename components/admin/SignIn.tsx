'use client';

import { useState } from 'react';
import { supabaseClient } from '@/lib/supabase';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const { error: signInError } = await supabaseClient.auth.signInWithPassword(
      {
        email: email.trim(),
        password,
      }
    );

    setSubmitting(false);
    if (signInError) {
      setError(
        signInError.message === 'Invalid login credentials'
          ? '이메일이나 비밀번호가 맞지 않아요.'
          : signInError.message
      );
    }
    // 성공하면 onAuthStateChange가 알아서 화면을 바꿔줘요.
  }

  return (
    <div className="mx-auto max-w-sm py-20">
      <h1 className="mb-2 text-xl font-bold">관리자 로그인</h1>
      <p className="mb-6 text-sm text-ink-muted">
        Supabase에 등록한 계정으로 로그인해주세요.
      </p>
      <form onSubmit={handleSignIn} className="flex flex-col gap-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="이메일"
          autoComplete="username"
          className="rounded-md border border-line px-3 py-2 text-sm focus:border-ink-muted focus:outline-none"
          autoFocus
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="비밀번호"
          autoComplete="current-password"
          className="rounded-md border border-line px-3 py-2 text-sm focus:border-ink-muted focus:outline-none"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-ink py-2 text-sm font-medium text-paper disabled:opacity-50"
        >
          {submitting ? '로그인 중...' : '로그인'}
        </button>
      </form>
    </div>
  );
}
