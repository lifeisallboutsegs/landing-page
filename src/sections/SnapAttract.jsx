import React, { useLayoutEffect, useRef } from 'react';
import { CloudShader } from '@/components/ui/cloud-shader';
import { CometCard } from '@/components/ui/comet-card';
import { TextGenerateEffect } from '@/components/ui/text-generate-effect';
import GlassSurface from '@/components/GlassSurface';
import SectionIntro from '@/sections/SectionIntro';
import ScrollReveal from '@/components/ScrollReveal';
import AnimatedContent from '@/components/AnimatedContent';
import SectionCursor from '@/components/SectionCursor';
import { useInView } from '@/hooks/use-in-view';
import { useMediaQuery } from '@/hooks/use-media-query';
import { QUALITY, dprCapFor, useQuality } from '@/hooks/use-quality';
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

/* The sky above is a live shader on a machine that can afford one, so the
   frosted chips sitting on it are re-filtering an animated backdrop on every
   frame — the most expensive thing this snap does. Where the sky is a static
   gradient instead, the displacement is spending that cost on a backdrop that
   never moves, so it comes off and the chip keeps only its frost. */
const GLASS = {
  rich: { blur: 11, displace: 6, distortionScale: -160, redOffset: 3, greenOffset: 13, blueOffset: 23 },
  plain: { blur: 8, displace: 0, distortionScale: 0, redOffset: 0, greenOffset: 0, blueOffset: 0 },
};

function Channel({ icon: Icon, label, tone, glass }) {
  return (
    <GlassSurface
      width="100%"
      height={84}
      borderRadius={18}
      theme="light"
      backgroundOpacity={0.06}
      brightness={60}
      opacity={0.9}
      saturation={1.5}
      {...glass}
      className="shadow-[0_10px_40px_rgba(11,11,18,0.08)]"
    >
      <span className="flex items-center gap-3 px-4">
        <Icon className={`h-4 w-4 shrink-0 ${tone}`} strokeWidth={1.7} />
        <span className="text-[0.9rem] font-semibold tracking-tight text-ink">{label}</span>
      </span>
    </GlassSurface>
  );
}

/* One channel, as a comet card. TextGenerateEffect animates on mount rather
   than on scroll, so the title is held back until the card is actually in
   view — otherwise it plays out long before anyone reaches it. Its inner type
   scale is hardcoded (text-2xl), hence the child-selector overrides. */
function ChannelCard({ icon: Icon, kicker, title, body, points, delay, tilt }) {
  // No margin here, unlike the backgrounds. This gates a title that types
  // itself out rather than a WebGL context: there is nothing to warm up early,
  // and mounting ahead of the viewport would just mean the animation has
  // already finished by the time anyone arrives at the card.
  const [cardRef, cardLive] = useInView({ rootMargin: '0px' });

  // `backdrop-blur-xl` over a moving sky forces the compositor to re-blur the
  // whole card on every frame. It earns that where the sky is alive; where it
  // is a flat gradient the card just gets a solid tint instead.
  const card = (
    <div
      ref={cardRef}
      className={`group relative h-full overflow-hidden rounded-2xl border border-white/60 px-6 py-10 sm:px-8 sm:py-12 md:px-12 ${
        tilt ? 'bg-white/40 backdrop-blur-xl' : 'bg-white/80'
      }`}
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
            className="!font-semibold [&>div]:!mt-0 [&>div>div]:!text-[clamp(1.6rem,2.7vw,2.6rem)] [&>div>div]:!leading-[1.06] [&>div>div]:!tracking-[-0.035em]"
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
  );

  return (
    <AnimatedContent
      distance={34}
      direction="vertical"
      delay={delay}
      duration={0.85}
      ease="power3.out"
      className="h-full"
    >
      {/* The tilt is driven by mousemove, so on a touch screen it is a 3D
          transform context and a mix-blend glare layer that nothing can ever
          trigger — cost with no effect. */}
      {tilt ? (
        <CometCard rotateDepth={8} translateDepth={9} className="h-full">
          {card}
        </CometCard>
      ) : (
        card
      )}
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
  const [fieldRef, fieldLive, fieldVisible] = useInView();

  const tier = useQuality();
  const liveSky = tier >= QUALITY.LOW;
  const wide = useMediaQuery('(min-width: 768px)');
  const glass = liveSky ? GLASS.rich : GLASS.plain;

  // Parallax for the cloud field. The shader sits in a sticky pane, so it is
  // motionless on its own — this drift is what makes it read as a sky sitting
  // behind the page rather than a flat fill. Same rAF-on-scroll approach as
  // the stage animation below: measuring the rect each frame cannot go stale,
  // which a cached scroll offset can while the loader holds the body locked.
  useLayoutEffect(() => {
    const el = root.current;
    if (!el || !liveSky) return;

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
  }, [liveSky]);

  // Driven directly off the scroll position rather than through a library.
  // Both GSAP ScrollTrigger and Framer Motion's useScroll cache their target's
  // offsets, and on this page those caches are taken while the loader still
  // has the body locked — leaving this section frozen at its starting values.
  // Measuring the rect on every frame is a few microseconds and cannot go stale.
  useLayoutEffect(() => {
    const el = stage.current;
    if (!el || !wide) return;
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
  }, [wide]);

  const headline = (
    <>
      <span className="mb-4 block text-[0.8rem] font-semibold tracking-tight text-cobalt">
        Demand, pointed somewhere
      </span>
      <h3 className="mx-auto max-w-2xl text-[clamp(1.7rem,3.2vw,3rem)] font-semibold leading-[1.05] tracking-[-0.04em] text-ink">
        We built the destination.
        <br />
        Now we move people toward it.
      </h3>
    </>
  );

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
        <div className="sticky top-0 h-[100svh] w-full overflow-hidden">
          {liveSky ? (
            <div ref={sky} className="absolute inset-x-0 -top-[13%] h-[126%] will-change-transform">
              {fieldLive && (
                <CloudShader
                  className="h-full w-full"
                  speed={0.45}
                  count={6}
                  cloudColor="#ffffff"
                  skyTopColor="#3f83c4"
                  skyBottomColor="#a9d2ef"
                  dprCap={dprCapFor(tier)}
                  paused={!fieldVisible}
                />
              )}
            </div>
          ) : (
            /* The same sky, painted once. Two soft white masses over the
               gradient read as cloud without a raymarch behind them. */
            <div
              className="absolute inset-0"
              style={{
                background:
                  'radial-gradient(ellipse 90% 40% at 25% 30%, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0) 62%), radial-gradient(ellipse 80% 34% at 78% 68%, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0) 60%), linear-gradient(to bottom, #3f83c4 0%, #a9d2ef 100%)',
              }}
            />
          )}
        </div>
      </div>

      <div className="relative z-10">
        <img
          src="/assets/search-intent-lens.png"
          alt=""
          aria-hidden="true"
          className="attract-intent-art pointer-events-none absolute right-[4%] top-[23rem] z-0 hidden w-[min(31vw,31rem)] select-none object-contain opacity-65 lg:block"
        />
        <SectionIntro
          headline="Then we bring the right people to it."
          body="A page that converts is worth nothing without demand pointed at it. We build two streams into the same destination — the search results you earn, and the placements you buy."
        />

        {wide ? (
          /* Two streams converging on one destination. */
          <div ref={stage} className="relative h-[220vh] w-full">
            <div className="sticky top-0 flex h-[100svh] w-full items-center overflow-hidden">
              <div className="relative mx-auto w-full max-w-[1600px] px-8 md:px-16">
                {/* The line the streams travel along. */}
                <div
                  ref={converge}
                  className="absolute inset-x-8 top-1/2 h-px origin-center bg-gradient-to-r from-transparent via-cobalt/30 to-transparent md:inset-x-16"
                />

                <div className="relative flex items-center justify-between gap-8">
                  <div ref={organic} className="w-[232px] shrink-0 will-change-transform">
                    <Channel icon={Search} label="Organic search" tone="text-cobalt" glass={glass} />
                  </div>

                  {/* The destination they are all heading for. */}
                  <div ref={destination} className="min-w-0 flex-1 text-center will-change-transform">
                    {headline}
                  </div>

                  <div ref={paid} className="w-[232px] shrink-0 will-change-transform">
                    <Channel icon={Megaphone} label="Google Ads" tone="text-coral" glass={glass} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* The same idea read downward. Sending the two chips off the sides of
             a 390px screen put both of them past the edge and squeezed the
             headline into a 120px column — the whole stage was invisible. */
          <div className="mx-auto w-full max-w-lg px-6 py-14 sm:px-8">
            <AnimatedContent distance={26} direction="vertical" duration={0.8} ease="power3.out">
              <Channel icon={Search} label="Organic search" tone="text-cobalt" glass={glass} />
            </AnimatedContent>

            <span className="mx-auto my-6 block h-14 w-px bg-gradient-to-b from-cobalt/40 to-cobalt/10" />

            <AnimatedContent distance={26} direction="vertical" delay={0.1} duration={0.8} ease="power3.out">
              <div className="text-center">{headline}</div>
            </AnimatedContent>

            <span className="mx-auto my-6 block h-14 w-px bg-gradient-to-t from-coral/40 to-coral/10" />

            <AnimatedContent distance={26} direction="vertical" delay={0.15} duration={0.8} ease="power3.out">
              <Channel icon={Megaphone} label="Google Ads" tone="text-coral" glass={glass} />
            </AnimatedContent>
          </div>
        )}

        {/* The two channels, side by side — each one a tilting comet card that
            floats over the sky rather than a flat panel cut out of it. */}
        <div className="mx-auto w-full max-w-[1600px] px-6 pb-20 sm:px-8 sm:pb-28 md:px-16">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-10">
            {CHANNELS.map((channel, i) => (
              <ChannelCard key={channel.kicker} {...channel} delay={i * 0.12} tilt={liveSky} />
            ))}
          </div>

          <div className="mx-auto mt-16 max-w-2xl text-center sm:mt-20">
            <ScrollReveal
              containerClassName="mx-auto !overflow-visible py-1"
              textClassName="!text-[clamp(1.15rem,4.4vw,1.35rem)] !leading-[1.55] !font-normal tracking-[-0.02em] text-ink"
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
      <SectionCursor sectionId="attract" variant="orbit" color="#3b82f6" />
    </section>
  );
}
