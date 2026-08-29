import React, { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MacbookScroll } from '@/components/ui/macbook-scroll';
import SectionIntro from '@/sections/SectionIntro';
import { useSiteContent } from '@/lib/use-site-content';
import AnimatedContent from '@/components/AnimatedContent';
import SectionCursor from '@/components/SectionCursor';
import { useMediaQuery } from '@/hooks/use-media-query';
import { ArrowUpRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const PRINCIPLES = [
  {
    n: '01',
    title: 'Clear message',
    body: 'A visitor decides whether to stay in about three seconds. The page opens by saying plainly who this is for and what changes for them — before any feature, any scroll, any clever animation.',
    note: 'Comprehension before persuasion',
  },
  {
    n: '02',
    title: 'Strong offer',
    body: 'Most pages describe a service. A page that sells makes a specific promise with a specific outcome, and removes the risk of saying yes. That is a commercial decision expressed as design.',
    note: 'Specific beats impressive',
  },
  {
    n: '03',
    title: 'Fast experience',
    body: 'Speed is not a technical metric here, it is a conversion one. Every hundred milliseconds of delay costs attention you already paid to acquire — so weight budgets are set before the first component is written.',
    note: 'Performance is revenue',
  },
  {
    n: '04',
    title: 'Action',
    body: 'One primary action, carried through the page, phrased as the thing the visitor actually wants. No competing buttons, no dead ends, no forms that ask for more than the next step requires.',
    note: 'One decision, made easy',
  },
];

function Principle({ n, title, body, note }) {
  return (
    <>
      <span className="mb-4 block text-[1.05rem] font-semibold tracking-tight text-cobalt tabular-nums">
        {n}
      </span>
      <h3 className="mb-5 text-[clamp(1.9rem,3.8vw,3.6rem)] font-semibold leading-[1.03] tracking-[-0.04em] sm:mb-6">
        {title}
      </h3>
      <p className="mb-7 text-[0.98rem] leading-relaxed text-ink-soft sm:mb-8 sm:text-[1rem]">{body}</p>
      <span className="inline-flex items-center gap-2 border-t border-line pt-4 text-[0.8rem] font-medium tracking-tight text-ink-soft">
        {note}
        <ArrowUpRight className="h-3 w-3" />
      </span>
    </>
  );
}

export default function SnapBuild() {
  const { home } = useSiteContent();
  const track = useRef(null);
  const rail = useRef(null);

  // The laptop and the rail are desktop compositions. At 390px the laptop
  // renders at scale-[0.35] — an unreadable thumbnail marooned in 200vh of
  // white — and the rail becomes a pinned horizontal scroll fighting a vertical
  // swipe, with every panel clipped at both edges. Neither is a layout to be
  // shrunk; below the breakpoint the section is built differently instead.
  const wide = useMediaQuery('(min-width: 768px)');

  useLayoutEffect(() => {
    if (!wide) return;

    const ctx = gsap.context(() => {
      const panels = gsap.utils.toArray('[data-panel]', rail.current);
      if (!panels.length) return;

      // Pin the section and translate the rail sideways. The principles are
      // travelled through, not faded between.
      const distance = () => rail.current.scrollWidth - window.innerWidth;

      const travel = gsap.to(rail.current, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: track.current,
          start: 'top top',
          end: () => `+=${distance()}`,
          pin: true,
          // Pinning is a layout change, so it has to happen before the frame it
          // is needed in rather than during it.
          anticipatePin: 1,
          scrub: 0.25,
          invalidateOnRefresh: true,
        },
      });

      // Each panel settles as the horizontal travel carries it into view.
      panels.forEach((panel) => {
        gsap.fromTo(
          panel.querySelector('[data-panel-inner]'),
          { opacity: 0.2, y: 48 },
          {
            opacity: 1,
            y: 0,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: panel,
              containerAnimation: travel,
              start: 'left 78%',
              end: 'left 38%',
              scrub: true,
            },
          },
        );
      });
    }, track);

    return () => ctx.revert();
  }, [wide]);

  return (
    <section id="build" data-snap="build" className="relative z-10 w-full bg-paper text-ink">
      <SectionIntro
        headline={home.buildHeadline}
        body={home.buildBody}
      />

      {/* The laptop stays at every width — it is the one place on the page that
          shows an actual page we built. What changes is its size.

          The component draws itself at a fixed 32rem and its own scale ladder
          stops at `md`, which left it a 179px toy on a phone and a 512px toy on
          a 1440px screen. The arbitrary child selectors re-scale its root the
          way Hero does with PillNav — the alternative is editing a registry
          component every other page would inherit. Tailwind emits base
          utilities before breakpoint ones, so each step overrides the last.

          The height override goes with it: the block's 200vh is the runway the
          lid opens along, and at phone scale that runway was mostly empty room
          below a finished animation.

          Bottom padding gives the exit slide somewhere to go — the component
          translates the lid by up to 1500px on the way out, scaled with
          everything else, and would otherwise land on "Clear message".
          overflow-clip is only a backstop. */}
      <div className="relative w-full overflow-clip pb-16 pt-12 [&>div]:!min-h-[108svh] [&>div]:!scale-[0.62] [&_h2]:!mb-7 sm:pb-24 sm:pt-16 sm:[&>div]:!min-h-[120svh] sm:[&>div]:!scale-[0.8] md:pb-[500px] md:pt-40 md:[&>div]:!min-h-[200vh] md:[&>div]:!scale-100 md:[&_h2]:!mb-20 lg:pb-[640px] lg:[&>div]:!scale-[1.25] xl:pb-[760px] xl:[&>div]:!scale-[1.45]">
        <MacbookScroll
          src="/assets/northbeam-mockup.png"
          showGradient={false}
          title={
            <span className="block text-[clamp(1.3rem,2.6vw,2.4rem)] font-medium leading-tight tracking-[-0.03em] text-ink">
              Every decision on the page is a commercial one.
              <span className="mt-3 block text-[0.95rem] font-normal text-ink-soft">
                Keep scrolling to see the page open up.
              </span>
            </span>
          }
        />
      </div>

      {wide ? (
        /* Pinned horizontal travel through the four principles. */
        <div ref={track} className="relative h-[100svh] w-full overflow-hidden">
          <div ref={rail} className="flex h-full items-center will-change-transform">
            {PRINCIPLES.map((p) => (
              <article
                key={p.n}
                data-panel
                className="flex h-full w-[52vw] shrink-0 items-center px-16"
              >
                <div data-panel-inner className="max-w-xl">
                  <Principle {...p} />
                </div>
              </article>
            ))}
          </div>
        </div>
      ) : (
        /* Read down instead of across. Nothing is pinned, so the swipe stays
           the visitor's own. */
        <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-16 px-6 pb-20 sm:gap-20 sm:px-8">
          {PRINCIPLES.map((p, i) => (
            <AnimatedContent
              key={p.n}
              distance={28}
              direction="vertical"
              delay={i * 0.05}
              duration={0.8}
              ease="power3.out"
            >
              <article className="max-w-xl border-t border-line pt-8">
                <Principle {...p} />
              </article>
            </AnimatedContent>
          ))}
        </div>
      )}
      <SectionCursor sectionId="build" variant="target" color="#1b4be0" targets="#build a, #build [data-panel]" />
    </section>
  );
}
