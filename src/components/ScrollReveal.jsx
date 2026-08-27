import { useLayoutEffect, useRef, useMemo } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { QUALITY, measureQuality } from '@/hooks/use-quality';

gsap.registerPlugin(ScrollTrigger);

const ScrollReveal = ({
  children,
  scrollContainerRef,
  enableBlur = true,
  baseOpacity = 0.1,
  baseRotation = 3,
  blurStrength = 4,
  containerClassName = '',
  textClassName = '',
  rotationEnd = 'bottom bottom',
  wordAnimationEnd = 'bottom bottom'
}) => {
  const containerRef = useRef(null);

  const splitText = useMemo(() => {
    const text = typeof children === 'string' ? children : '';
    return text.split(/(\s+)/).map((word, index) => {
      if (word.match(/^\s+$/)) return word;
      return (
        <span className="inline-block word" key={index}>
          {word}
        </span>
      );
    });
  }, [children]);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const tier = measureQuality();
    const scroller = scrollContainerRef && scrollContainerRef.current ? scrollContainerRef.current : window;

    // Everything this component creates lives in a context, so cleanup reverts
    // exactly its own tweens and triggers. The previous cleanup called
    // `ScrollTrigger.getAll().kill()` — one instance unmounting took every
    // trigger on the page with it, pinned sections included.
    const ctx = gsap.context(() => {
      // Rotating a paragraph re-rasterises every glyph in it on every frame of
      // the scrub. Worth it on a desktop GPU, never worth it on a phone.
      if (tier >= QUALITY.LOW && baseRotation) {
        gsap.fromTo(
          el,
          { transformOrigin: '0% 50%', rotate: baseRotation },
          {
            ease: 'none',
            rotate: 0,
            scrollTrigger: { trigger: el, scroller, start: 'top bottom', end: rotationEnd, scrub: true }
          }
        );
      }

      const wordElements = el.querySelectorAll('.word');
      if (!wordElements.length) return;

      // Blur is a per-word filter, so it is the expensive half of this effect —
      // and on a device that cannot afford it the reveal still reads fine from
      // the opacity alone. One tween rather than two: identical trigger,
      // identical scrub, half the bookkeeping per frame.
      const blur = enableBlur && tier >= QUALITY.LOW;

      gsap.fromTo(
        wordElements,
        { opacity: baseOpacity, ...(blur ? { filter: `blur(${blurStrength}px)` } : null) },
        {
          ease: 'none',
          opacity: 1,
          ...(blur ? { filter: 'blur(0px)' } : null),
          stagger: 0.05,
          scrollTrigger: {
            trigger: el,
            scroller,
            start: 'top bottom-=20%',
            end: wordAnimationEnd,
            scrub: true
          }
        }
      );
    }, el);

    return () => ctx.revert();
  }, [scrollContainerRef, enableBlur, baseRotation, baseOpacity, rotationEnd, wordAnimationEnd, blurStrength]);

  return (
    <h2 ref={containerRef} className={`my-5 ${containerClassName}`}>
      <p className={`text-[clamp(1.6rem,4vw,3rem)] leading-[1.5] font-semibold ${textClassName}`}>{splitText}</p>
    </h2>
  );
};

export default ScrollReveal;
