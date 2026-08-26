import React, { useState } from 'react';
import SectionIntro from '@/sections/SectionIntro';
import RippleGrid from '@/components/RippleGrid';
import { PlaceholdersAndVanishInput } from '@/components/ui/placeholders-and-vanish-input';
import AnimatedContent from '@/components/AnimatedContent';
import ScrollReveal from '@/components/ScrollReveal';
import { useInView } from '@/hooks/use-in-view';
import { useSnapTransition } from '@/hooks/use-snap-transition';

const PLACEHOLDERS = [
  'yourcompany.com',
  'Paste the page you spend the most money on',
  'The landing page your ads point at',
  'yourshop.co.uk/collections/all',
];

/* Vertical fade for the section seams, intersected with a radial hole that
   keeps the grid off the reading area. */
const SCAN_MASK = [
  'linear-gradient(to bottom, transparent 0, #000 12rem, #000 calc(100% - 12rem), transparent 100%)',
  'radial-gradient(ellipse 62% 52% at 50% 44%, transparent 28%, rgba(0,0,0,0.55) 62%, #000 88%)',
].join(', ');

const CHECKS = [
  'Largest Contentful Paint and layout shift on mobile',
  'Render-blocking scripts and unused CSS weight',
  'Title, heading and internal link structure',
  'Indexation, canonicals and redirect chains',
  'Structured data and how you appear in results',
  'Core Web Vitals against your closest competitors',
  'Whether the page states an offer at all',
  'Form length and the friction before an enquiry',
];

export default function SnapDiagnose() {
  const motionRef = useSnapTransition();
  const [submitted, setSubmitted] = useState(false);
  const [bgRef, bgLive] = useInView();

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <section
      id="diagnose"
      data-snap="diagnose"
      className="relative z-10 w-full overflow-clip bg-paper text-ink"
    >
      {/* Mouse-reactive grid — a surface being scanned. */}
      {/* Masked at the seams instead of veiled in white. The grid was dimmed
          to 18% and then covered by a 66%-white sheet, which left it barely
          perceptible — the scan is the whole point of this snap. */}
      <div
        ref={bgRef}
        className="absolute inset-0 z-0"
        style={{
          // Two masks intersected: the vertical one feathers the section
          // seams, the radial one clears the middle where both text columns
          // sit. The grid then reads as a scan happening around the content
          // instead of a mesh drawn over the top of it — and it stays a mask,
          // never a white sheet.
          WebkitMaskImage: SCAN_MASK,
          maskImage: SCAN_MASK,
          WebkitMaskComposite: 'source-in',
          maskComposite: 'intersect',
        }}
      >
        <div className="pointer-events-auto sticky top-0 h-screen w-full opacity-[0.34]">
        {bgLive && <RippleGrid
          gridColor="#1b4be0"
          rippleIntensity={0.05}
          gridSize={12}
          gridThickness={6}
          fadeDistance={1.6}
          vignetteStrength={2.2}
          glowIntensity={0.12}
          opacity={0.7}
          gridRotation={0}
          mouseInteraction
          mouseInteractionRadius={1}
        />}
        </div>
      </div>

      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            'radial-gradient(ellipse 62% 44% at 20% 22%, rgba(27,75,224,0.11) 0%, rgba(255,255,255,0) 66%)',
        }}
      />

      <div ref={motionRef} className="relative z-10 pb-28">
        <SectionIntro
          headline="See what's holding your website back."
          body="Before we talk about working together, run the free technical audit. It checks the same things we would check on day one — and you keep the report either way."
        />

        <div className="mx-auto w-full max-w-[1600px] px-8 md:px-16">
          <div className="grid grid-cols-1 items-start gap-16 lg:grid-cols-2 lg:gap-24">
            {/* The tool */}
            <AnimatedContent distance={32} direction="vertical" delay={0.1} duration={0.9} ease="power3.out">
              <div className="border-t border-line pt-10">
                <span className="mb-8 block text-[0.8rem] font-medium tracking-tight text-ink-soft">
                  Free technical SEO audit
                </span>

                <h3 className="mb-8 max-w-md text-[clamp(1.6rem,2.6vw,2.4rem)] font-semibold leading-[1.06] tracking-[-0.035em]">
                  Enter a URL. We'll tell you what's actually wrong with it.
                </h3>

                <PlaceholdersAndVanishInput
                  placeholders={PLACEHOLDERS}
                  onChange={() => setSubmitted(false)}
                  onSubmit={handleSubmit}
                />

                <p className="mt-6 max-w-md text-[0.9rem] leading-relaxed text-ink-soft">
                  {submitted
                    ? "Queued. The crawl takes a few minutes — we'll email the report when it's ready, with no obligation attached to it."
                    : 'No account, no sales call attached. The report lands in your inbox and it is yours to take to anyone.'}
                </p>

                <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-line pt-6 text-[0.8rem] font-medium tracking-tight text-ink-soft">
                  <span>Crawl-based</span>
                  <span>No login</span>
                  <span>Report is yours</span>
                </div>
              </div>
            </AnimatedContent>

            {/* What it looks at */}
            <AnimatedContent distance={32} direction="vertical" delay={0.24} duration={0.9} ease="power3.out">
              <div className="border-t border-line pt-10">
                <span className="mb-8 block text-[0.8rem] font-medium tracking-tight text-ink-soft">
                  What it checks
                </span>

                <ul className="flex flex-col divide-y divide-line border-y border-line">
                  {CHECKS.map((check) => (
                    <li
                      key={check}
                      className="group flex items-baseline gap-5 py-4 transition-colors duration-300 hover:bg-porcelain"
                    >
                      <span className="h-px w-6 shrink-0 translate-y-[-0.35em] bg-line transition-all duration-300 group-hover:w-10 group-hover:bg-cobalt" />
                      <span className="text-[0.95rem] leading-relaxed text-ink">{check}</span>
                    </li>
                  ))}
                </ul>

                <p className="mt-8 max-w-md text-[0.9rem] leading-relaxed text-ink-soft">
                  Technical problems are the cheap wins. The expensive ones are further up — whether
                  the page makes an argument at all. The audit flags both.
                </p>
              </div>
            </AnimatedContent>
          </div>

          <div className="mx-auto mt-28 max-w-3xl border-t border-line pt-14 text-center">
            <ScrollReveal
              containerClassName="mx-auto !overflow-visible py-1"
              textClassName="!text-[clamp(1.2rem,2.1vw,1.8rem)] !leading-[1.5] !font-normal tracking-[-0.025em] text-ink"
              baseOpacity={0.1}
              baseRotation={2}
              blurStrength={5}
              enableBlur
            >
              We build it, we bring people to it, we make it convert. The audit is simply where that work starts on your site.
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
}
