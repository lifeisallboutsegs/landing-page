'use client';

import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';

/**
 * An always-reachable conversion point. Sits out of the way at the bottom-right,
 * slides in once the reader is past the first screen (so it never competes with
 * the hero's own CTA), and links straight to the lead form. Hidden on /admin.
 */
export default function FloatingCta() {
  const [show, setShow] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (window.location.pathname.startsWith('/admin')) {
      setHidden(true);
      return;
    }
    const onScroll = () => setShow(window.scrollY > 620);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (hidden) return null;

  return (
    <a
      href="/#start"
      aria-label="Let's talk — start a project"
      className={`floating-cta fixed bottom-5 right-5 z-[60] inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-all duration-500 sm:bottom-7 sm:right-7 ${
        show ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-6 opacity-0'
      }`}
    >
      Let&rsquo;s talk
      <ArrowRight className="h-4 w-4" />
    </a>
  );
}
