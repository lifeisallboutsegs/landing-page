'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * A one-shot scroll-in for a block of static markup. Drop it around a heading,
 * a paragraph, a card.
 *
 * Transform only — no opacity. A `from` opacity tween on a ScrollTrigger whose
 * cached position goes stale (a late font or image load will do it) can leave
 * the element stranded half-faded or invisible. Animating `y` alone, the worst
 * a stale trigger can do is skip the slide; the content is always visible and
 * always in the HTML for crawlers.
 */
export default function Reveal({
  children,
  as: Tag = 'div',
  y = 22,
  delay = 0,
  className = '',
  ...rest
}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      gsap.from(el, {
        y,
        duration: 0.7,
        delay,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      });
    }, el);

    return () => ctx.revert();
  }, [y, delay]);

  return (
    <Tag ref={ref} className={className} {...rest}>
      {children}
    </Tag>
  );
}
