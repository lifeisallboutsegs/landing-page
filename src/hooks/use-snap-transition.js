import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Scroll-linked entry for a snap's content: it physically rises into place as
 * you approach, so consecutive sections read as one continuous camera move
 * rather than a cut between screens.
 *
 * Deliberately animates `translateY` and nothing else:
 *
 * - No opacity. A scrubbed opacity tween leaves content faded whenever a
 *   trigger's cached positions go stale (pinning and late-loading fonts both
 *   do that), which showed up as sections rendering at 35% or blank. With
 *   position alone, the worst a stale trigger can do is offset a section by a
 *   few pixels — it can never make it unreadable.
 * - No scale. Scaling live text forces subpixel re-rasterisation and makes
 *   headings look soft mid-scroll.
 * - No exit animation, so anything already read stays exactly where it was.
 *
 * The distance is in pixels, not percent. `yPercent` is measured against the
 * element's own height, and these wrappers hold whole sections — 11% of a
 * 4,000px snap is a 440px lurch, and the audit report growing the section
 * mid-scroll changed the distance under the reader's feet. A fixed nudge reads
 * the same everywhere and cannot be inflated by content.
 *
 * translateY is compositor-only, so this runs off the main thread.
 */
export function useSnapTransition({ from = 44 } = {}) {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { y: from },
        {
          y: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            // Both ends are comfortably reachable for every section including
            // the last one, so the move always completes.
            start: 'top 92%',
            end: 'top 55%',
            // Short enough that the content tracks the wheel rather than
            // trailing it. Lenis is already smoothing the scroll position this
            // reads from; a long scrub on top of that is lag, not polish.
            scrub: 0.2,
            invalidateOnRefresh: true,
          },
        },
      );
    }, el);

    return () => ctx.revert();
  }, [from]);

  return ref;
}
