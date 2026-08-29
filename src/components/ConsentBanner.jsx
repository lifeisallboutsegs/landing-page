'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { denyConsent, getConsent, grantConsent } from '@/lib/analytics';

/**
 * Consent Mode v2 UI. Only shown when analytics is configured and the visitor
 * has not chosen yet. Bottom-left so it clears the floating CTA on the right.
 */
export default function ConsentBanner({ enabled }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    if (window.location.pathname.startsWith('/admin')) return;
    if (!getConsent()) setShow(true);
  }, [enabled]);

  if (!show) return null;

  const choose = (fn) => () => {
    fn();
    setShow(false);
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[70] sm:right-auto sm:max-w-sm">
      <div className="rounded-2xl border border-line bg-paper/95 p-5 shadow-[0_16px_50px_rgba(11,11,18,0.16)] backdrop-blur-md">
        <p className="text-[0.9rem] leading-relaxed text-ink-soft">
          We use cookies for analytics and to measure our ads. You can accept or decline —
          declining still lets everything on the site work.{' '}
          <Link href="/privacy" className="font-medium text-cobalt underline underline-offset-2">
            Privacy policy
          </Link>
        </p>
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={choose(grantConsent)}
            className="rounded-full bg-ink px-4 py-2 text-[0.82rem] font-medium text-white transition-transform active:scale-[0.98]"
          >
            Accept
          </button>
          <button
            type="button"
            onClick={choose(denyConsent)}
            className="rounded-full border border-line px-4 py-2 text-[0.82rem] font-medium text-ink-soft transition-colors hover:border-ink/40 hover:text-ink"
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
}
