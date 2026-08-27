import React, { useLayoutEffect, useRef } from 'react';
import { TracingBeam } from '@/components/ui/tracing-beam';
import AcidSquares from '@/components/AcidSquares';
import SectionIntro from '@/sections/SectionIntro';
import ScrollReveal from '@/components/ScrollReveal';
import SectionCursor from '@/components/SectionCursor';
import { useInView } from '@/hooks/use-in-view';
import { QUALITY, dprCapFor, useQuality } from '@/hooks/use-quality';

const STAGES = [
  {
    title: 'Visit',
    lead: 'They arrive mid-thought.',
    body: 'Nobody lands on a page ready to buy. They arrive carrying a half-formed problem and about three seconds of patience. The first screen either matches the thought they arrived with, or it loses them.',
  },
  {
    title: 'Understand',
    lead: 'They work out what this is.',
    body: 'Comprehension is the real bottleneck. Plain language, one idea per screen, and proof placed exactly where the doubt appears — so understanding happens without effort being spent on it.',
  },
  {
    title: 'Trust',
    lead: 'They decide whether to believe it.',
    body: 'Trust is built from specifics: real work, real names, real constraints, and an honest account of what you do not do. Vague confidence reads as risk. Precision reads as competence.',
  },
  {
    title: 'Contact',
    lead: 'They take the one action that matters.',
    body: 'The final step should cost almost nothing. Short forms, clear expectations, an obvious next move. This is the moment every other decision on the page was quietly serving.',
  },
];

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const ramp = (p, a, b) => clamp01((p - a) / (b - a));

export default function SnapConvert() {
  const root = useRef(null);
  const curtain = useRef(null);
  const lattice = useRef(null);
  const scrim = useRef(null);
  const content = useRef(null);
  const [bgRef, bgLive, bgVisible] = useInView();
  const tier = useQuality();
  // The lattice is a multi-octave fragment shader across the whole viewport and
  // its only interactive half is the mouse. Where there is no mouse and no
  // headroom it is replaced by the gradient it resolves to anyway.
  const lattice3d = tier >= QUALITY.LOW;

  // Driven straight off the scroll position rather than through a motion
  // library. This predates the runtime cleanup (the project used to have both
  // `motion` and `framer-motion` installed, and components here applied no
  // styles and forwarded no refs, which stopped AcidSquares mounting). That
  // split is gone, but rAF-on-scroll is kept: it cannot go stale the way a
  // cached scroll offset can, which matters given the loader locks the body.
  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;

    let frame = 0;

    const apply = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const span = window.innerHeight + rect.height;
      if (span <= 0) return;

      // 0 as the section's top reaches the viewport bottom, 1 as its bottom
      // clears the top — the whole pass through the section.
      const p = clamp01((window.innerHeight - rect.top) / span);

      // The theme change is a move, not a cut: darkness sweeps up as you
      // arrive and drops away as you leave.
      const curtainScale = Math.min(ramp(p, 0.02, 0.14), 1 - ramp(p, 0.9, 1));
      const fade = Math.min(ramp(p, 0.06, 0.16), 1 - ramp(p, 0.88, 0.99));

      if (curtain.current) {
        curtain.current.style.transformOrigin = p < 0.5 ? 'bottom' : 'top';
        curtain.current.style.transform = `scaleY(${curtainScale})`;
      }
      if (lattice.current) lattice.current.style.opacity = String(fade);
      if (scrim.current) scrim.current.style.opacity = String(fade);
      if (content.current) content.current.style.opacity = String(fade);
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(apply);
    };

    apply();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <section
      id="convert"
      data-snap="convert"
      data-tone="dark"
      ref={root}
      className="relative z-10 w-full overflow-clip bg-paper"
    >
      {/* The dark stage, arriving as a sweep. */}
      <div
        ref={curtain}
        className="pointer-events-none absolute inset-0 z-0 bg-[#07070e] will-change-transform"
        style={{ transform: 'scaleY(1)', transformOrigin: 'bottom' }}
      />

      {/* Mouse-reactive lattice, only where a dark backdrop lets it read.
          Masked at the seams: without it the lattice starts at full strength
          on the section's first pixel, which reads as a hard band against the
          white sky fading out above it. */}
      <div
        ref={lattice}
        className="absolute inset-0 z-0"
        style={{
          opacity: 1,
          WebkitMaskImage:
            'linear-gradient(to bottom, transparent 0, #000 16rem, #000 calc(100% - 10rem), transparent 100%)',
          maskImage:
            'linear-gradient(to bottom, transparent 0, #000 16rem, #000 calc(100% - 10rem), transparent 100%)',
        }}
      >
        <div ref={bgRef} className="pointer-events-auto sticky top-0 h-[100svh] w-full">
          {!lattice3d && (
            <div
              className="absolute inset-0"
              style={{
                background:
                  'radial-gradient(ellipse 70% 50% at 30% 25%, rgba(124,58,237,0.55) 0%, rgba(26,16,70,0) 70%), radial-gradient(ellipse 60% 45% at 78% 72%, rgba(205,184,255,0.30) 0%, rgba(26,16,70,0) 68%), linear-gradient(160deg, #1a1046 0%, #07070e 100%)',
              }}
            />
          )}
          {lattice3d && bgLive && (
            <AcidSquares
              color1="#1a1046"
              color2="#7c3aed"
              color3="#cdb8ff"
              detail="medium"
              speed={0.55}
              waveDepth={0.9}
              zoom={1.3}
              density={10}
              glow={1}
              exposure={2400}
              brightness={1.05}
              opacity={1}
              mouseInteraction={bgVisible}
              mouseStrength={0.14}
              mouseRadius={0.34}
              grain
              grainIntensity={0.04}
              dprCap={dprCapFor(tier)}
            />
          )}
        </div>
      </div>

      {/* Scrim so the lattice stays vivid at the edges without washing out
          the text column sitting over it. */}
      <div ref={scrim} className="pointer-events-none absolute inset-0 z-[5]" style={{ opacity: 1 }}>
        <div
          className="sticky top-0 h-[100svh] w-full"
          style={{
            background:
              'radial-gradient(ellipse 38% 58% at 40% 50%, rgba(7,7,14,0.72) 0%, rgba(7,7,14,0.34) 52%, rgba(7,7,14,0) 82%)',
          }}
        />
      </div>

      <img
        src="/assets/conversion-path.png"
        alt=""
        aria-hidden="true"
        className="conversion-path-art pointer-events-none absolute right-[6%] top-[28rem] z-[6] hidden w-[min(21vw,20rem)] select-none object-contain opacity-60 lg:block"
      />

      {/* Pointer events fall through the wrapper so the lattice behind it can
          still see the mouse; the text itself stays selectable. */}
      <div ref={content} className="pointer-events-none relative z-10" style={{ opacity: 1 }}>
        {/* SectionIntro is built for the light half of the page, so its ink
            colours are inverted here rather than forking the component. */}
        <div className="pointer-events-auto [&_h2]:!text-white [&_p]:!text-white/70">
          <SectionIntro
            headline="Traffic is useless if nobody takes action."
            body="This is the part most agencies skip. Between arriving and enquiring there are four things a visitor has to do — and each one is a place you can lose them."
          />
        </div>

        <div className="pointer-events-auto mx-auto w-full max-w-3xl px-6 pt-8 pb-20 sm:px-8 sm:pt-10 sm:pb-28 md:px-16">
          <TracingBeam className="!max-w-3xl">
            <div className="flex flex-col gap-20 pl-6 sm:gap-28 sm:pl-4 md:pl-8">
              {STAGES.map((stage) => (
                <article key={stage.title}>
                  <span className="mb-5 block text-[0.95rem] font-semibold tracking-tight text-[#8fa6ff]">
                    {stage.title}
                  </span>

                  <h3 className="mb-5 max-w-xl text-[clamp(1.8rem,3.2vw,2.9rem)] font-semibold leading-[1.08] tracking-[-0.04em] text-white">
                    {stage.lead}
                  </h3>

                  <p className="max-w-xl text-[1rem] leading-relaxed text-white/65">{stage.body}</p>
                </article>
              ))}
            </div>
          </TracingBeam>

          <div className="mx-auto mt-24 max-w-3xl border-t border-white/15 pt-10 text-center sm:mt-32 sm:pt-14">
            <ScrollReveal
              containerClassName="mx-auto !overflow-visible py-1"
              textClassName="!text-[clamp(1.15rem,4.4vw,1.9rem)] !leading-[1.5] !font-normal tracking-[-0.025em] !text-white"
              baseOpacity={0.1}
              baseRotation={2}
              blurStrength={5}
              enableBlur
            >
              This is why the three pieces belong together. A page without traffic is a secret, traffic without a page is waste, and neither one matters until somebody acts.
            </ScrollReveal>
          </div>
        </div>
      </div>
      <SectionCursor sectionId="convert" variant="crosshair" color="rgba(167,139,250,0.36)" />
    </section>
  );
}
