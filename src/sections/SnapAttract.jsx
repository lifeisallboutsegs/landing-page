import React, { useLayoutEffect, useRef } from 'react';
import { CloudShader } from '@/components/ui/cloud-shader';
import { CometCard } from '@/components/ui/comet-card';
import { TextGenerateEffect } from '@/components/ui/text-generate-effect';
import GlassSurface from '@/components/GlassSurface';
import SectionIntro from '@/sections/SectionIntro';
import ScrollReveal from '@/components/ScrollReveal';
import AnimatedContent from '@/components/AnimatedContent';
import { useInView } from '@/hooks/use-in-view';
import { Search, Megaphone } from 'lucide-react';

const CHANNELS = [
  {
    icon: Search,
    kicker: 'Organic search',
    title: 'The people already looking',
    body: 'Someone types the problem you solve into a search bar every day. SEO is the work of being the answer they find — technical foundations, pages built around real intent, and content that earns its position instead of chasing it.',
    points: ['Technical foundations', 'Intent-led pages', 'Content that compounds'],
  },
  {
    icon: Megaphone,
    kicker: 'Google Ads',
    title: 'The people you reach today',
    body: 'Search takes months to compound. Paid buys you the same intent immediately, so you learn what converts while the organic work matures. Tight match types, honest negatives, and budget pointed at terms that actually close.',
    points: ['Intent-matched keywords', 'Disciplined negatives', 'Spend tied to booked work'],
  },
];

/* One channel, as a comet card. TextGenerateEffect animates on mount rather
   than on scroll, so the title is held back until the card is actually in
   view — otherwise it plays out long before anyone reaches it. Its inner type
   scale is hardcoded (text-2xl), hence the child-selector overrides. */
function ChannelCard({ icon: Icon, kicker, title, body, points, delay }) {
  const [cardRef, cardLive] = useInView();

  return (
    <AnimatedContent
      distance={34}
      direction="vertical"
      delay={delay}
      duration={0.85}
      ease="power3.out"
      className="h-full"
    >
      <CometCard rotateDepth={8} translateDepth={9} className="h-full">
        <div
          ref={cardRef}
          className="group relative h-full overflow-hidden rounded-2xl border border-white/60 bg-white/40 px-8 py-12 backdrop-blur-xl md:px-12"
        >
          <div className="mb-8 flex items-center gap-4">
            <Icon className="h-4 w-4 text-cobalt" strokeWidth={1.6} />
            <span className="text-[0.8rem] font-semibold tracking-tight text-ink-soft">{kicker}</span>
          </div>

          <div className="mb-6 min-h-[2.4em]">
            {cardLive && (
              <TextGenerateEffect
                words={title}
                duration={0.7}
                className="!font-semibold [&>div]:!mt-0 [&>div>div]:!text-[clamp(1.7rem,2.7vw,2.6rem)] [&>div>div]:!leading-[1.06] [&>div>div]:!tracking-[-0.035em]"
              />
            )}
          </div>

          <p className="mb-10 max-w-md text-[0.98rem] leading-relaxed text-ink-soft">{body}</p>

          <ul className="flex flex-col gap-3 border-t border-white/60 pt-7">
            {points.map((point) => (
              <li key={point} className="flex items-baseline gap-4 text-[0.85rem] text-ink-soft">
                <span className="h-px w-6 shrink-0 bg-ink/25 transition-all duration-500 group-hover:w-10 group-hover:bg-cobalt" />
                {point}
              </li>
            ))}
          </ul>
        </div>
      </CometCard>
    </AnimatedContent>
  );
}

export default function SnapAttract() {
  const root = useRef(null);
  const sky = useRef(null);
  const stage = useRef(null);
  const organic = useRef(null);
  const paid = useRef(null);
  const destination = useRef(null);
  const converge = useRef(null);
  const [fieldRef, fieldLive] = useInView();

  // Parallax for the cloud field. The shader sits in a sticky pane, so it is
  // motionless on its own — this drift is what makes it read as a sky sitting
  // behind the page rather than a flat fill. Same rAF-on-scroll approach as
  // the stage animation below: measuring the rect each frame cannot go stale,
  // which a cached scroll offset can while the loader holds the body locked.
  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let frame = 0;

    const apply = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const span = window.innerHeight + rect.height;
      if (span <= 0) return;

      // 0 as the section's top reaches the viewport bottom, 1 as its bottom
      // clears the top. The sky is oversized by 26%, so it can travel without
      // ever exposing an edge.
      const p = Math.min(1, Math.max(0, (window.innerHeight - rect.top) / span));
      if (sky.current) sky.current.style.transform = `translate3d(0,${(0.5 - p) * 13}%,0)`;
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

  // Driven directly off the scroll position rather than through a library.
  // Both GSAP ScrollTrigger and Framer Motion's useScroll cache their target's
  // offsets, and on this page those caches are taken while the loader still
  // has the body locked — leaving this section frozen at its starting values.
  // Measuring the rect on every frame is a few microseconds and cannot go stale.
  useLayoutEffect(() => {
    const el = stage.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let frame = 0;

    const apply = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const travel = rect.height - window.innerHeight;
      if (travel <= 0) return;

      const p = Math.min(1, Math.max(0, -rect.top / travel));
      const eased = p * p * (3 - 2 * p);

      if (organic.current) organic.current.style.transform = `translate3d(${-135 * (1 - eased)}%,0,0)`;
      if (paid.current) paid.current.style.transform = `translate3d(${135 * (1 - eased)}%,0,0)`;
      if (destination.current) destination.current.style.transform = `scale(${0.86 + eased * 0.14})`;
      if (converge.current) converge.current.style.transform = `scaleX(${0.05 + eased * 0.95})`;
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
      ref={root}
      id="attract"
      data-snap="attract"
      className="relative z-10 w-full overflow-clip bg-paper text-ink"
    >
      {/* Drifting sky — demand arriving from somewhere, behind the page. */}
      {/* The fade lives on this wrapper, not on the sticky pane inside it, and
          it is a mask rather than a white overlay. A gradient inside the pane
          is viewport-height, so it rides the screen and dims the sky
          everywhere; a white overlay washes the colour out. Masking the
          wrapper — which spans the section — fades only the two seams to
          transparent and leaves the middle fully saturated. */}
      <div
        ref={fieldRef}
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          WebkitMaskImage:
            'linear-gradient(to bottom, transparent 0, #000 13rem, #000 calc(100% - 13rem), transparent 100%)',
          maskImage:
            'linear-gradient(to bottom, transparent 0, #000 13rem, #000 calc(100% - 13rem), transparent 100%)',
        }}
      >
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          <div ref={sky} className="absolute inset-x-0 -top-[13%] h-[126%] will-change-transform">
            {fieldLive && (
              <CloudShader
                className="h-full w-full"
                speed={0.45}
                count={6}
                cloudColor="#ffffff"
                skyTopColor="#3f83c4"
                skyBottomColor="#a9d2ef"
              />
            )}
          </div>
        </div>
      </div>

      <div className="relative z-10">
        <SectionIntro
          headline="Then we bring the right people to it."
          body="A page that converts is worth nothing without demand pointed at it. We build two streams into the same destination — the search results you earn, and the placements you buy."
        />

        {/* Two streams converging on one destination. */}
        <div ref={stage} className="relative h-[220vh] w-full">
          <div className="sticky top-0 flex h-screen w-full items-center overflow-hidden">
            <div className="relative mx-auto w-full max-w-[1600px] px-8 md:px-16">
              {/* The line the streams travel along. */}
              <div
                ref={converge}
                className="absolute inset-x-8 top-1/2 h-px origin-center bg-gradient-to-r from-transparent via-cobalt/30 to-transparent md:inset-x-16"
              />

              <div className="relative flex items-center justify-between gap-8">
                <div ref={organic} className="shrink-0 will-change-transform">
                  <GlassSurface
                    width={232}
                    height={88}
                    borderRadius={18}
                    theme="light"
                    backgroundOpacity={0.06}
                    brightness={60}
                    opacity={0.9}
                    saturation={1.5}
                    blur={11}
                    displace={6}
                    distortionScale={-160}
                    redOffset={3}
                    greenOffset={13}
                    blueOffset={23}
                    className="shadow-[0_10px_40px_rgba(11,11,18,0.08)]"
                  >
                    <span className="flex items-center gap-3 px-4">
                      <Search className="h-4 w-4 shrink-0 text-cobalt" strokeWidth={1.7} />
                      <span className="text-[0.9rem] font-semibold tracking-tight text-ink">
                        Organic search
                      </span>
                    </span>
                  </GlassSurface>
                </div>

                {/* The destination they are all heading for. */}
                <div ref={destination} className="text-center will-change-transform">
                  <span className="mb-4 block text-[0.8rem] font-semibold tracking-tight text-cobalt">
                    Demand, pointed somewhere
                  </span>
                  <h3 className="mx-auto max-w-2xl text-[clamp(1.7rem,3.2vw,3rem)] font-semibold leading-[1.05] tracking-[-0.04em] text-ink">
                    We built the destination.
                    <br />
                    Now we move people toward it.
                  </h3>
                </div>

                <div ref={paid} className="shrink-0 will-change-transform">
                  <GlassSurface
                    width={232}
                    height={88}
                    borderRadius={18}
                    theme="light"
                    backgroundOpacity={0.06}
                    brightness={60}
                    opacity={0.9}
                    saturation={1.5}
                    blur={11}
                    displace={6}
                    distortionScale={-160}
                    redOffset={3}
                    greenOffset={13}
                    blueOffset={23}
                    className="shadow-[0_10px_40px_rgba(11,11,18,0.08)]"
                  >
                    <span className="flex items-center gap-3 px-4">
                      <Megaphone className="h-4 w-4 shrink-0 text-coral" strokeWidth={1.7} />
                      <span className="text-[0.9rem] font-semibold tracking-tight text-ink">
                        Google Ads
                      </span>
                    </span>
                  </GlassSurface>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* The two channels, side by side — each one a tilting comet card that
            floats over the sky rather than a flat panel cut out of it. */}
        <div className="mx-auto w-full max-w-[1600px] px-8 pb-28 md:px-16">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-10">
            {CHANNELS.map((channel, i) => (
              <ChannelCard key={channel.kicker} {...channel} delay={i * 0.12} />
            ))}
          </div>

          <div className="mx-auto mt-20 max-w-2xl text-center">
            <ScrollReveal
              containerClassName="mx-auto !overflow-visible py-1"
              textClassName="!text-[1.35rem] !leading-[1.55] !font-normal tracking-[-0.02em] text-ink"
              baseOpacity={0.1}
              baseRotation={2}
              blurStrength={5}
              enableBlur
            >
              Two channels, one destination. The point was never traffic — it was the right person landing on a page that was ready for them.
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
}
