import React, { useLayoutEffect, useRef } from 'react';
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
import { QUALITY, dprCapFor, useQuality } from '@/hooks/use-quality';
import { ArrowRight, ArrowDown } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const NAV_ITEMS = [
  { label: 'Work', href: '/work' },
  { label: 'Services', href: '/services' },
  { label: 'About', href: '/about' },
  { label: "Let's talk", href: '/contact' },
];

export default function Hero() {
  const root = useRef(null);
  const visual = useRef(null);
  const copy = useRef(null);
  const process = useRef(null);
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
        .to(process.current, { yPercent: -18, rotate: 1.5, opacity: 0.32, ease: 'none' }, 0);

      gsap.fromTo(
        process.current,
        { opacity: 0, y: 30, scale: 0.94 },
        { opacity: 1, y: 0, scale: 1, duration: 1.1, ease: 'power3.out', delay: 0.35 },
      );
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} id="hero" data-snap="hero" className="relative h-[112svh] w-full sm:h-[125vh] lg:h-[130vh]">
      {/* `svh` rather than `vh`: on a phone `100vh` is the viewport with the
          address bar hidden, so a full-height hero sits a bar's worth taller
          than the screen and the scroll cue starts life below the fold. */}
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden bg-paper">
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
              logo="/favicon.svg"
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
                Digital Growth
              </span>
            </FadeContent>

            <h1 className="mb-7 text-[clamp(2.6rem,5.2vw,5rem)] font-medium leading-[1.02] tracking-[-0.042em] text-ink">
              <SplitText
                text="We build the system behind your growth."
                splitType="lines"
                ease="expo.out"
                delay={140}
                duration={1.25}
                textAlign="left"
                tag="span"
              />
            </h1>

            <BlurText
              text="We build high-converting websites, bring qualified traffic through SEO and Google Ads, and turn that attention into real opportunities."
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
                  <span>Start a project</span>
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </a>
              </Magnet>

              <a
                href="#build"
                className="group inline-flex items-center gap-2.5 border-b border-ink/25 pb-1 text-sm font-medium text-ink transition-colors hover:border-ink"
              >
                <span>See how it works</span>
                <ArrowDown className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-y-0.5" />
              </a>
            </AnimatedContent>
          </div>
        </div>

        <div
          ref={process}
          aria-label="A flowing digital growth system: positioning, landing page, demand and qualified enquiries"
          className="hero-process pointer-events-none absolute right-[4%] top-[43%] z-20 hidden w-[min(48vw,48rem)] -translate-y-1/2 lg:block"
        >
          <div className="relative">
            <img
              src="/assets/hero-growth-ribbon.png"
              alt="A cobalt ribbon passing through stages of a digital growth system"
              className="hero-process-art block w-full object-contain"
            />
          </div>
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
              <ShinyText text="Build — Attract — Convert — Grow" speed={6} color="#9aa0b4" shineColor="#1b4be0" />
            </span>
          </div>
        </FadeContent>
      </div>
      <SectionCursor sectionId="hero" variant="crosshair" color="rgba(27,75,224,0.28)" />
    </section>
  );
}
