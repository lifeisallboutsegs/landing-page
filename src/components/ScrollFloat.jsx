import { useLayoutEffect, useMemo, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { QUALITY, measureQuality } from '@/hooks/use-quality';

gsap.registerPlugin(ScrollTrigger);

const ScrollFloat = ({
  children,
  scrollContainerRef,
  containerClassName = '',
  textClassName = '',
  animationDuration = 1,
  ease = 'back.inOut(2)',
  scrollStart = 'center bottom+=50%',
  scrollEnd = 'bottom bottom-=40%',
  stagger = 0.03
}) => {
  const containerRef = useRef(null);

  const splitText = useMemo(() => {
    const text = typeof children === 'string' ? children : '';
    return text.split('').map((char, index) => (
      <span className="inline-block word" key={index}>
        {char === ' ' ? ' ' : char}
      </span>
    ));
  }, [children]);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const scroller = scrollContainerRef && scrollContainerRef.current ? scrollContainerRef.current : window;
    const charElements = el.querySelectorAll('.inline-block');
    if (!charElements.length) return;

    // Per-character scaling is what makes this headline read as type being set
    // rather than text fading in — but it also re-rasterises every glyph on
    // every frame. Below the top tier the characters still rise into place,
    // they just do it without the stretch.
    const scaled = measureQuality() >= QUALITY.LOW;

    // Nothing here used to be cleaned up: every headline left its trigger
    // behind on unmount, and a stale trigger on a removed element is a wrong
    // measurement for every trigger after it.
    const ctx = gsap.context(() => {
      gsap.fromTo(
        charElements,
        {
          opacity: 0,
          // A smaller travel retains the feeling of type settling into place
          // without crossing the paragraph that follows it on a short screen.
          yPercent: 42,
          ...(scaled ? { scaleY: 2.3, scaleX: 0.7 } : null),
          transformOrigin: '50% 0%'
        },
        {
          duration: animationDuration,
          ease,
          opacity: 1,
          yPercent: 0,
          ...(scaled ? { scaleY: 1, scaleX: 1 } : null),
          stagger,
          scrollTrigger: { trigger: el, scroller, start: scrollStart, end: scrollEnd, scrub: true }
        }
      );
    }, el);

    return () => ctx.revert();
  }, [scrollContainerRef, animationDuration, ease, scrollStart, scrollEnd, stagger]);

  return (
    <h2
      ref={containerRef}
      className={`my-5 overflow-hidden ${containerClassName}`}>
      <span
        className={`inline-block text-[clamp(1.6rem,4vw,3rem)] leading-[1.5] ${textClassName}`}>{splitText}</span>
    </h2>
  );
};

export default ScrollFloat;
