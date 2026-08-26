import { redirect } from 'next/navigation';

import { currentUser } from '@/server/current-user.js';

// Never cache an authenticated shell.
export const dynamic = 'force-dynamic';
export const metadata = { robots: { index: false, follow: false } };

export default async function AdminLayout({ children }) {
  const user = await currentUser();

  // The login page renders its own shell, so it opts out via its own segment.
  if (!user) redirect('/admin/login');

  return (
    <div className="min-h-screen bg-porcelain text-ink">
      <header className="border-b border-line bg-paper">
        <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between px-6 py-4">
          <div className="flex items-baseline gap-3">
            <span className="text-[0.95rem] font-semibold tracking-tight">Digital Web Assurances</span>
            <span className="text-[0.8rem] text-ink-faint">Admin</span>
          </div>
          <form action="/api/admin/logout" method="post">
            <button
              type="submit"
              className="rounded-full border border-line px-4 py-2 text-[0.8rem] font-medium text-ink-soft transition-colors hover:border-ink/40 hover:text-ink"
            >
              Sign out {user.email}
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto w-full max-w-[1400px] px-6 py-10">{children}</main>
    </div>
  );
}
