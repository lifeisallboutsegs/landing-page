import React, { useLayoutEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Prism from '@/components/Prism';
import LightRays from '@/components/LightRays';
import SplitText from '@/components/SplitText';
import BlurText from '@/components/BlurText';
import AnimatedContent from '@/components/AnimatedContent';
import FadeContent from '@/components/FadeContent';
import Magnet from '@/components/Magnet';
import ShinyText from '@/components/ShinyText';
import PillNav from '@/components/PillNav';
import SectionCursor from '@/components/SectionCursor';
import { useSiteContent } from '@/lib/use-site-content';
import { QUALITY, dprCapFor, useQuality } from '@/hooks/use-quality';
import { ArrowRight, ArrowDown } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const NAV_ITEMS = [
  { label: 'Work', href: '/work' },
  { label: 'Services', href: '/services' },
  { label: 'About', href: '/about' },
  { label: "Let's talk", href: '/contact', cta: true },
];

// The hero asset: the customer journey a stranger actually travels, from the
// first search to a closed sale — the standard awareness → consideration →
// decision funnel, with the lever we pull at each stage. Steps and headings are
// CMS-editable (page:home); on mobile it is a plain in-flow list under the copy.
function FlowRail({ steps = [], kicker = 'Search → sale' }) {
  return (
    <div className="relative">
      <span className="mb-6 block text-[0.78rem] font-semibold uppercase tracking-[0.14em] text-cobalt">
        {kicker}
      </span>

      <ul className="relative flex flex-col gap-4">
        {/* Positioned against the list itself, so the spine lands on the node
            centres regardless of how the CMS copy wraps. */}
        <span aria-hidden="true" className="absolute left-[20px] top-4 bottom-4 w-px bg-line" />

        {steps.map((step, i) => {
          const terminal = i === steps.length - 1;
          return (
            <li key={i} className="flex items-center gap-4">
              <span
                className={`relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full border bg-paper text-[0.92rem] font-semibold tabular-nums ${
                  terminal ? 'border-coral/60 text-coral' : 'border-line text-cobalt'
                }`}
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="text-[1.05rem] font-semibold leading-tight tracking-tight text-ink">
                  {step.label}
                </span>
                {step.note && (
                  <span className="mt-1 text-[0.9rem] leading-snug text-ink-soft">{step.note}</span>
                )}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function Hero() {
  const root = useRef(null);
  const visual = useRef(null);
  const copy = useRef(null);
  const processGraphic = useRef(null);
  const { home } = useSiteContent();
  const steps = Array.isArray(home.flow) && home.flow.length ? home.flow : [];
  const tier = useQuality();
  // The gradients underneath are the hero's actual composition; the two shaders
  // are the top layer of it. Where they cannot be afforded the gradients simply
  // stand alone, which is why nothing here needs a separate mobile artwork.
  const shaders = tier >= QUALITY.LOW;
  const dpr = dprCapFor(tier);

  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      // The hero doesn't fade out — it keeps travelling. The visual pushes
      // forward and the copy lifts away, so the next snap feels like the same
      // camera continuing rather than a new screen.
      gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: 'bottom top',
          // Lenis already smooths the scroll position this reads from. A long
          // scrub on top of that is not extra polish, it is extra latency.
          scrub: 0.25,
        },
      })
        .to(visual.current, { scale: 1.22, yPercent: -14, ease: 'none' }, 0)
        .to(copy.current, { yPercent: -38, opacity: 0, ease: 'none' }, 0)
        .to(processGraphic.current, { yPercent: -8, rotate: 0.6, opacity: 0.42, ease: 'none' }, 0);

      gsap.fromTo(
        processGraphic.current,
        { opacity: 0, x: 44, scale: 0.94 },
        { opacity: 1, x: 0, scale: 1, duration: 1.15, ease: 'power3.out', delay: 0.38 },
      );
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      id="hero"
      data-snap="hero"
      className="relative w-full min-h-[112svh] sm:min-h-[125vh] lg:h-[130vh] lg:min-h-0"
    >
      {/* `svh` rather than `vh`: on a phone `100vh` is the viewport with the
          address bar hidden, so a full-height hero sits a bar's worth taller
          than the screen and the scroll cue starts life below the fold.
          Below `lg` the pane is not sticky — it sits in normal flow and the
          flow rail follows it down the page, so nothing overlaps a pinned
          layer on a short screen. */}
      <div className="relative h-[100svh] w-full overflow-hidden bg-paper lg:sticky lg:top-0">
        {/* The flowing structure. Full-bleed, then veiled on the left so the
            type sits on paper rather than on top of the artwork. */}
        <div ref={visual} className="absolute inset-0 overflow-hidden will-change-transform">
          {/* Warm light at the destination, upper right. */}
          {shaders && (
            <div className="absolute inset-0 opacity-70">
              <LightRays
                raysOrigin="right"
                raysColor="#ff9e72"
                raysSpeed={0.45}
                lightSpread={1.6}
                rayLength={2.6}
                fadeDistance={1.4}
                saturation={0.9}
                followMouse
                mouseInfluence={0.05}
                noiseAmount={0.02}
                dprCap={dpr}
              />
            </div>
          )}

          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(circle 560px at 76% 30%, rgba(255,163,120,0.5) 0%, rgba(255,190,150,0.2) 42%, rgba(255,255,255,0) 74%), radial-gradient(ellipse 55% 60% at 88% 62%, rgba(27,75,224,0.14) 0%, rgba(255,255,255,0) 70%)',
            }}
          />

          {/* The single hero object. Prism renders bright-on-black, which is
              invisible on paper — the invert/hue-rotate pair flips it to
              dark-on-white and multiply drops the white it sits on. */}
          {shaders && (
          <div
            className="absolute inset-y-0 right-0 w-[66%] opacity-95"
            style={{ filter: 'hue-rotate(42deg) saturate(1.45) contrast(1.08)' }}
          >
            <Prism
              animationType="3drotate"
              timeScale={0.3}
              height={3.4}
              baseWidth={5.2}
              scale={3.6}
              glow={1}
              bloom={1}
              noise={0.14}
              colorFrequency={0.32}
              offset={{ x: 90, y: -10 }}
              transparent
              suspendWhenOffscreen
            />
          </div>
          )}
        </div>

        {/* Veils sit outside the parallax layer so they always clip the
            artwork to the viewport instead of travelling with it. */}
        <div
          className="pointer-events-none absolute inset-0 z-10"
          style={{
            background:
              'linear-gradient(90deg, #ffffff 0%, #ffffff 32%, rgba(255,255,255,0.9) 46%, rgba(255,255,255,0.55) 62%, rgba(255,255,255,0.14) 80%, rgba(255,255,255,0) 95%)',
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 z-10"
          style={{
            background:
              'radial-gradient(ellipse 60% 48% at 18% 74%, rgba(124,58,237,0.10) 0%, rgba(255,255,255,0) 68%), radial-gradient(ellipse 52% 40% at 92% 88%, rgba(27,75,224,0.12) 0%, rgba(255,255,255,0) 70%)',
          }}
        />
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-10 h-36"
          style={{ background: 'linear-gradient(to bottom, #ffffff 14%, rgba(255,255,255,0))' }}
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-52"
          style={{ background: 'linear-gradient(to top, #ffffff 16%, rgba(255,255,255,0))' }}
        />

        {/* Navigation — wordmark left, links right. The arbitrary selectors
            neutralise PillNav's own absolute positioning so it can span the
            same grid as the rest of the page. */}
        <div className="absolute inset-x-0 top-0 z-30 pt-5">
          <div className="mx-auto w-full max-w-[1600px] px-6 sm:px-8 md:px-16 [&>div]:!static [&>div]:!top-auto [&>div]:!w-full [&_nav]:!w-full [&_nav]:!max-w-none [&_nav]:!justify-between">
            <PillNav
              logo="/assets/dwa-mark.jpg"
              logoAlt="Digital Web Assurances"
              items={NAV_ITEMS}
              activeHref="#hero"
              baseColor="#0b0b12"
              pillColor="#ffffff"
              hoveredPillTextColor="#ffffff"
              pillTextColor="#0b0b12"
              initialLoadAnimation
            />
          </div>
        </div>

        {/* Copy */}
        <div className="relative z-20 mx-auto flex h-full w-full max-w-[1600px] items-center px-6 sm:px-8 md:px-16">
          <div ref={copy} className="w-full max-w-xl pt-12 will-change-transform sm:pt-16 md:min-w-[34rem] md:max-w-[46%] md:pt-0">
            <FadeContent blur duration={700} delay={120}>
              <span className="mb-7 block text-[0.8rem] font-medium tracking-tight text-ink-soft">
                {home.heroKicker}
              </span>
            </FadeContent>

            <h1 className="mb-7 text-[clamp(2.6rem,5.2vw,5rem)] font-medium leading-[1.02] tracking-[-0.042em] text-ink">
              <SplitText
                key={home.heroHeadline}
                text={home.heroHeadline}
                splitType="lines"
                ease="expo.out"
                delay={140}
                duration={1.25}
                textAlign="left"
                tag="span"
              />
            </h1>

            <BlurText
              key={home.heroSubcopy}
              text={home.heroSubcopy}
              delay={22}
              stepDuration={0.19}
              animateBy="words"
              direction="top"
              className="mb-8 max-w-xl text-[1rem] leading-relaxed text-ink-soft sm:mb-11 sm:text-[1.06rem]"
            />

            <AnimatedContent
              distance={26}
              direction="vertical"
              delay={0.85}
              duration={0.9}
              ease="power3.out"
              className="flex flex-wrap items-center gap-7"
            >
              <Magnet padding={60} magnetStrength={6}>
                <a
                  href="#start"
                  className="group inline-flex items-center gap-3 rounded-full bg-ink px-8 py-4 text-sm font-medium text-white transition-transform duration-200 active:scale-[0.98]"
                >
                  <span>{home.heroCtaPrimary}</span>
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </a>
              </Magnet>

              <a
                href="#build"
                className="group inline-flex items-center gap-2.5 border-b border-ink/25 pb-1 text-sm font-medium text-ink transition-colors hover:border-ink"
              >
                <span>{home.heroCtaSecondary}</span>
                <ArrowDown className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-y-0.5" />
              </a>
            </AnimatedContent>
          </div>
        </div>

        {/* A generated, transparent search-to-sale graphic replaces the old
            process card. The wrapper handles scroll parallax while the image
            has its own slow compositor-only float. */}
        <div
          ref={processGraphic}
          className="pointer-events-none absolute right-[2%] top-[9%] z-20 hidden h-[80svh] w-[43vw] origin-top will-change-transform lg:block xl:right-[5%] xl:max-w-[39rem]"
        >
          <Image
            src="/assets/search-to-sale-journey.png"
            alt="Six steps from first search to a tracked sale: compare options, click, landing page, qualified enquiry, and sale with its source"
            width={1122}
            height={1402}
            sizes="(min-width: 1280px) 39rem, (min-width: 1024px) 43vw, 1px"
            preload
            className="hero-process-art block h-full w-full object-contain"
          />
        </div>

        {/* Scroll cue */}
        <FadeContent
          blur={false}
          duration={700}
          delay={1500}
          className="absolute inset-x-0 bottom-7 z-20 px-6 sm:bottom-9 sm:px-8 md:px-16"
        >
          <div className="mx-auto flex w-full max-w-[1600px] items-end justify-between">
            <div className="flex items-center gap-4">
              <span className="text-[0.8rem] font-medium tracking-tight text-ink-soft">
                Scroll to explore
              </span>
              <span className="relative block h-9 w-px overflow-hidden bg-line">
                <span className="absolute inset-x-0 top-0 h-3 animate-[scrollcue_2s_ease-in-out_infinite] bg-ink" />
              </span>
            </div>
            <span className="hidden text-[0.8rem] font-medium tracking-tight text-ink-soft sm:block">
              <ShinyText text={home.scrollCue} speed={6} color="#9aa0b4" shineColor="#1b4be0" />
            </span>
          </div>
        </FadeContent>
      </div>

      {/* Below lg the hero graphic is hidden; the flow rides here instead, in
          normal flow under the pinned hero so it can never be clipped by the
          sticky pane on a short screen. */}
      <div className="relative z-20 mx-auto w-full max-w-xl px-6 pb-20 pt-4 sm:px-8 sm:pb-24 lg:hidden">
        <FlowRail steps={steps} kicker={home.flowKicker} />
      </div>

      <SectionCursor sectionId="hero" variant="crosshair" color="rgba(27,75,224,0.28)" />
    </section>
  );
}
