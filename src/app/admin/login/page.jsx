'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);

  const onSubmit = async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setStatus('sending');
    setError(null);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.get('email'),
          password: form.get('password'),
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setStatus('idle');
        setError(data.error ?? 'Could not sign in.');
        return;
      }

      // Full navigation so the gated layout re-runs server-side with the cookie.
      router.replace('/admin');
      router.refresh();
    } catch {
      setStatus('idle');
      setError('Network error. Please try again.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-porcelain px-6">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm rounded-2xl border border-line bg-paper p-8 shadow-[0_12px_50px_rgba(11,11,18,0.08)]"
      >
        <h1 className="mb-2 text-[1.35rem] font-semibold tracking-[-0.03em]">Admin sign in</h1>
        <p className="mb-8 text-[0.9rem] text-ink-soft">Digital Web Assurances</p>

        <label htmlFor="email" className="mb-2 block text-[0.8rem] font-medium text-ink-soft">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="username"
          className="mb-6 h-11 w-full rounded-none border-0 border-b border-line bg-transparent px-0 text-[0.95rem] outline-none focus:border-cobalt"
        />

        <label htmlFor="password" className="mb-2 block text-[0.8rem] font-medium text-ink-soft">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="mb-8 h-11 w-full rounded-none border-0 border-b border-line bg-transparent px-0 text-[0.95rem] outline-none focus:border-cobalt"
        />

        {error && (
          <p role="alert" className="mb-6 text-[0.85rem] text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={status === 'sending'}
          className="w-full rounded-full bg-ink px-6 py-3.5 text-[0.9rem] font-medium text-white transition-transform duration-200 active:scale-[0.99] disabled:opacity-60"
        >
          {status === 'sending' ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
