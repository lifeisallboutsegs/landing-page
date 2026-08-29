import React, { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import AnimatedContent from '@/components/AnimatedContent';
import BlurText from '@/components/BlurText';
import SectionCursor from '@/components/SectionCursor';
import { useSnapTransition } from '@/hooks/use-snap-transition';
import { ArrowUpRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

/**
 * A first-person trust beat before the call to action. No invented metrics or
 * client logos — just who is accountable for the work and why the whole-funnel
 * model exists. The portrait and the wordmark plate mirror SnapStart's globe
 * treatment (a brand object cropped by the panel radius) so the two sections
 * read as a pair.
 */
export default function SnapFounder() {
  const motionRef = useSnapTransition();
  const root = useRef(null);
  const portrait = useRef(null);
  const frame = useRef(null);

  // The portrait drifts against the text as the section passes — a slow camera
  // push, scrubbed to scroll rather than played on entry. Driven off the same
  // GSAP/ScrollTrigger the rest of the page uses.
  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      // Scale only on the image itself — it never drops below 1, so object-cover
      // keeps the frame filled at every point of the scrub (a translate here
      // would pull an edge in and expose the panel behind it).
      gsap.fromTo(
        portrait.current,
        { scale: 1.12 },
        {
          scale: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: root.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.3,
          },
        },
      );

      gsap.fromTo(
        frame.current,
        { yPercent: 6 },
        {
          yPercent: -6,
          ease: 'none',
          scrollTrigger: {
            trigger: root.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.4,
          },
        },
      );
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      id="founder"
      data-snap="founder"
      className="relative z-10 w-full overflow-clip bg-paper text-ink"
    >
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            'radial-gradient(ellipse 50% 40% at 82% 14%, rgba(27,75,224,0.10) 0%, rgba(255,255,255,0) 64%), radial-gradient(ellipse 46% 42% at 10% 88%, rgba(124,58,237,0.08) 0%, rgba(255,255,255,0) 66%)',
          WebkitMaskImage:
            'linear-gradient(to bottom, transparent 0, #000 10rem, #000 calc(100% - 10rem), transparent 100%)',
          maskImage:
            'linear-gradient(to bottom, transparent 0, #000 10rem, #000 calc(100% - 10rem), transparent 100%)',
        }}
      />

      <div ref={motionRef} className="relative z-10 mx-auto w-full max-w-[1600px] px-6 py-24 sm:px-8 sm:py-28 md:px-16">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-20">
          {/* Portrait, with the wordmark plate bleeding off the corner. */}
          <div ref={frame} className="relative mx-auto w-full max-w-sm will-change-transform">
            <div className="relative overflow-hidden rounded-[2rem] border border-line bg-porcelain shadow-[0_24px_80px_rgba(11,11,18,0.12)]">
              <img
                ref={portrait}
                src="/assets/siddik-arim.jpg"
                alt="Siddik Arim, founder and CEO of Digital Web Assurances"
                className="block aspect-[4/5] w-full object-cover object-top will-change-transform"
              />
              <span className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
              <span className="absolute bottom-5 left-5 rounded-xl bg-[#0b0b12] p-2 shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
                <img
                  src="/assets/dwa-lockup.jpg"
                  alt="Digital Web Assurances"
                  className="block h-9 w-auto rounded-md object-contain"
                />
              </span>
            </div>
          </div>

          <div>
            <span className="mb-6 block text-[0.8rem] font-semibold tracking-tight text-cobalt">
              Who you will be working with
            </span>

            <h2 className="mb-8 max-w-2xl text-[clamp(2.2rem,4.4vw,4rem)] font-semibold leading-[1.04] tracking-[-0.045em] text-ink">
              <BlurText
                text="One team owns the whole path — and the result."
                delay={40}
                stepDuration={0.22}
                animateBy="words"
                direction="top"
              />
            </h2>

            <AnimatedContent distance={26} direction="vertical" delay={0.15} duration={0.9} ease="power3.out">
              <div className="max-w-2xl space-y-5 text-[1rem] leading-relaxed text-ink-soft sm:text-[1.05rem]">
                <p>
                  Digital Web Assurances started as Develop With Arim — Siddik Arim taking on
                  freelance web development. It grew into a team on the back of one pattern: a
                  business pays for traffic, the traffic arrives, and nothing happens, because the
                  site, the SEO and the ads were three separate contracts with no one accountable.
                </p>
                <p>
                  Now engineers, SEO, paid media, sales and analysts sit under one roof and own the
                  whole path — the keyword research, the MERN build, the Google and Meta campaigns,
                  the server-side tracking, and the page that turns all of it into a sale. When
                  something is not converting, there is no one to point at but us.
                </p>
                <p>
                  Send an enquiry and it reaches the person who would actually run the work. You get
                  a straight answer about whether we are the right fit — including when we are not.
                </p>
              </div>

              <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-line pt-7">
                <span className="block">
                  <span className="block text-[1rem] font-semibold tracking-[-0.02em] text-ink">
                    Siddik Arim
                  </span>
                  <span className="block text-[0.85rem] text-ink-soft">
                    Founder &amp; CEO, Digital Web Assurances
                  </span>
                </span>
                <a
                  href="/about"
                  className="group inline-flex items-center gap-2.5 text-sm font-medium text-ink transition-colors hover:text-cobalt"
                >
                  Meet the team
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              </div>
            </AnimatedContent>
          </div>
        </div>
      </div>

      <SectionCursor sectionId="founder" variant="orbit" color="#7c3aed" />
    </section>
  );
}
