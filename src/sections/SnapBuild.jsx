import React, { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MacbookScroll } from '@/components/ui/macbook-scroll';
import SectionIntro from '@/sections/SectionIntro';
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

export default function SnapBuild() {
  const track = useRef(null);
  const rail = useRef(null);

  useLayoutEffect(() => {
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
          scrub: 0.6,
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
  }, []);

  return (
    <section id="build" data-snap="build" className="relative z-10 w-full bg-paper text-ink">
      <SectionIntro
        headline="A website built to sell."
        body="We design landing pages around what the visitor needs to see, understand and do next. Not web development — conversion architecture."
      />

      {/* The component slides its lid down by up to 1500px (and scales it to
          1.5) on the way out — stock behaviour, meant for a laptop that exits
          the viewport with nothing behind it. At full progress the lid ends
          473px past its own 200vh block, so the rail below needs to start
          after that, or the laptop lands on top of "Clear message". The
          padding gives the slide room to finish; overflow-clip is only a
          backstop. Below md the component's own scale-[0.35]/scale-50 keeps
          the lid well inside the block, so no extra room is needed there. */}
      <div className="relative w-full overflow-clip md:pb-[500px]">
        <MacbookScroll
          src="/assets/northbeam-mockup.png"
          showGradient={false}
          title={
            <span className="block text-[clamp(1.4rem,2.6vw,2.4rem)] font-medium leading-tight tracking-[-0.03em] text-ink">
              Every decision on the page is a commercial one.
              <span className="mt-3 block text-[0.95rem] font-normal text-ink-soft">
                Keep scrolling to see the page open up.
              </span>
            </span>
          }
        />
      </div>

      {/* Pinned horizontal travel through the four principles. */}
      <div ref={track} className="relative h-screen w-full overflow-hidden">
        <div ref={rail} className="flex h-full items-center will-change-transform">
          {PRINCIPLES.map((p) => (
            <article
              key={p.n}
              data-panel
              className="flex h-full w-[86vw] shrink-0 items-center px-8 md:w-[52vw] md:px-16"
            >
              <div data-panel-inner className="max-w-xl">
                <h3 className="mb-6 text-[clamp(2.1rem,3.8vw,3.6rem)] font-semibold leading-[1.03] tracking-[-0.04em]">
                  {p.title}
                </h3>
                <p className="mb-8 text-[1rem] leading-relaxed text-ink-soft">{p.body}</p>
                <span className="inline-flex items-center gap-2 border-t border-line pt-4 text-[0.8rem] font-medium tracking-tight text-ink-soft">
                  {p.note}
                  <ArrowUpRight className="h-3 w-3" />
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
