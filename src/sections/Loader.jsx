import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import CountUp from '@/components/CountUp';
import ShinyText from '@/components/ShinyText';

const MIN_DURATION = 1500;

/**
 * Covers the real cost of first load — fonts, the hero's WebGL context, and
 * ScrollTrigger settling its pin measurements — then hands off to the hero with
 * a single continuous move rather than a cut.
 */
export default function Loader({ onDone }) {
  const root = useRef(null);
  const panel = useRef(null);
  const content = useRef(null);
  const bar = useRef(null);
  const [ready, setReady] = useState(false);
  const [gone, setGone] = useState(false);

  // Wait for the things that actually make the first frame janky.
  useEffect(() => {
    let cancelled = false;
    const started = performance.now();

    const settle = () => {
      if (cancelled) return;
      const waited = performance.now() - started;
      const remaining = Math.max(0, MIN_DURATION - waited);
      setTimeout(() => !cancelled && setReady(true), remaining);
    };

    const signals = [
      document.fonts?.ready ?? Promise.resolve(),
      document.readyState === 'complete'
        ? Promise.resolve()
        : new Promise((resolve) => window.addEventListener('load', resolve, { once: true })),
    ];

    Promise.all(signals).then(settle);
    // Never trap the visitor behind a stalled asset.
    const failsafe = setTimeout(settle, 6000);

    return () => {
      cancelled = true;
      clearTimeout(failsafe);
    };
  }, []);

  // Hold the page still while the loader owns the screen.
  useEffect(() => {
    if (gone) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.scrollTo(0, 0);
    return () => {
      document.body.style.overflow = previous;
    };
  }, [gone]);

  // The progress line fills continuously from the first frame, so the bar is
  // never sitting still while the browser works.
  useLayoutEffect(() => {
    if (!bar.current) return;
    const tween = gsap.fromTo(
      bar.current,
      { scaleX: 0 },
      { scaleX: 0.92, duration: 2.6, ease: 'power2.out', transformOrigin: 'left center' },
    );
    return () => tween.kill();
  }, []);

  useLayoutEffect(() => {
    if (!ready || !root.current) return;

    // The visitor must never be trapped behind the loader, so unmounting is not
    // left to the tween's onComplete — if the timeline is reverted or stalls
    // mid-flight (a StrictMode remount will do it), this still fires.
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      setGone(true);
      onDone?.();
    };

    const ctx = gsap.context(() => {
      gsap
        .timeline({ defaults: { ease: 'expo.inOut' }, onComplete: finish })
        // Finish the line, then lift the whole panel away as one piece.
        .to(bar.current, { scaleX: 1, duration: 0.45, ease: 'power2.inOut' })
        .to(content.current, { y: -28, opacity: 0, duration: 0.6 }, '-=0.1')
        .to(panel.current, { yPercent: -100, duration: 1.15 }, '-=0.35');
    }, root);

    const guard = setTimeout(finish, 2600);

    return () => {
      clearTimeout(guard);
      ctx.revert();
    };
  }, [ready, onDone]);

  if (gone) return null;

  return (
    <div ref={root} className="fixed inset-0 z-[100]" aria-hidden="true">
      <div ref={panel} className="absolute inset-0 flex flex-col justify-between bg-paper will-change-transform">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 60% 50% at 78% 24%, rgba(255,163,120,0.22) 0%, rgba(255,255,255,0) 68%), radial-gradient(ellipse 55% 55% at 16% 78%, rgba(27,75,224,0.14) 0%, rgba(255,255,255,0) 70%)',
          }}
        />

        <div
          ref={content}
          className="relative mx-auto flex h-full w-full max-w-[1600px] flex-col justify-between px-8 py-10 md:px-16 md:py-14"
        >
          <span className="text-[0.8rem] font-medium tracking-tight text-ink-soft">
            Digital Web Assurances
          </span>

          <div className="flex flex-col gap-8">
            <span className="text-[clamp(2rem,5vw,4.4rem)] font-semibold leading-[1.03] tracking-[-0.045em] text-ink">
              <ShinyText
                text="Build. Attract. Convert."
                speed={3}
                color="#0b0b12"
                shineColor="#1b4be0"
                spread={90}
              />
            </span>

            <div className="flex items-end justify-between gap-8">
              <div className="h-px w-full max-w-2xl bg-line">
                <div ref={bar} className="h-px w-full origin-left bg-ink" />
              </div>

              <span className="flex items-baseline text-[15px] font-semibold tabular-nums tracking-tight text-ink">
                <CountUp to={100} from={0} duration={2.4} />
                <span className="ml-1 text-ink-faint">%</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
