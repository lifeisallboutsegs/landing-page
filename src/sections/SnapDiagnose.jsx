import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
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

/**
 * Animated score dial. The number alone read as arbitrary; a ring that fills to
 * the score, coloured by band and captioned with a verdict, tells the visitor
 * what it means without them having to work it out.
 */
function ScoreRing({ score }) {
  const R = 52;
  const C = 2 * Math.PI * R;
  const tone =
    score >= 80 ? '#059669' : score >= 55 ? '#d97706' : '#dc2626';
  const verdict =
    score >= 80 ? 'Good shape' : score >= 55 ? 'Needs work' : 'Losing traffic';

  return (
    <div className="flex items-center gap-5">
      <div className="relative h-[128px] w-[128px] shrink-0">
        <svg viewBox="0 0 128 128" className="h-full w-full -rotate-90">
          <circle cx="64" cy="64" r={R} fill="none" stroke="currentColor" strokeWidth="10" className="text-line" />
          <motion.circle
            cx="64" cy="64" r={R} fill="none" stroke={tone} strokeWidth="10" strokeLinecap="round"
            strokeDasharray={C}
            initial={{ strokeDashoffset: C }}
            animate={{ strokeDashoffset: C - (C * score) / 100 }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-[2.4rem] font-semibold leading-none tracking-[-0.04em]"
            style={{ color: tone }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25, type: 'spring', stiffness: 200, damping: 16 }}
          >
            {score}
          </motion.span>
          <span className="mt-0.5 text-[0.7rem] uppercase tracking-[0.14em] text-ink-faint">/ 100</span>
        </div>
      </div>
      <div>
        <span className="block text-[1.05rem] font-semibold tracking-[-0.02em]" style={{ color: tone }}>
          {verdict}
        </span>
        <span className="mt-1 block max-w-[13rem] text-[0.85rem] leading-relaxed text-ink-soft">
          On-page technical and commercial checks.
        </span>
      </div>
    </div>
  );
}

/**
 * Crawling takes a few seconds of dead air. Stepping through the real check
 * list makes the wait legible and shows what is being looked at, instead of a
 * spinner that could mean anything.
 */
function AuditProgress() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setStep((n) => Math.min(n + 1, CHECKS.length - 1)), 420);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="mt-20 rounded-2xl border border-line bg-paper/85 p-8 backdrop-blur-xl md:p-12"
    >
      <div className="mb-8 flex items-center gap-4 border-b border-line pb-8">
        <span className="relative flex h-3 w-3 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cobalt opacity-70" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-cobalt" />
        </span>
        <span className="text-[1.05rem] font-semibold tracking-[-0.02em]">Crawling the page…</span>
      </div>

      <ul className="flex flex-col gap-3">
        {CHECKS.map((check, i) => {
          const done = i < step;
          const active = i === step;
          return (
            <li key={check} className="flex items-center gap-4 text-[0.9rem]">
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors duration-300 ${
                  done
                    ? 'border-emerald-500 bg-emerald-500 text-white'
                    : active
                      ? 'border-cobalt'
                      : 'border-line'
                }`}
              >
                {done && (
                  <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                {active && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cobalt" />}
              </span>
              <span className={done || active ? 'text-ink' : 'text-ink-faint'}>{check}</span>
            </li>
          );
        })}
      </ul>
    </motion.div>
  );
}

const SEVERITY_TONE = {
  critical: 'bg-red-100 text-red-700',
  high: 'bg-orange-100 text-orange-700',
  medium: 'bg-amber-100 text-amber-800',
  low: 'bg-zinc-100 text-zinc-600',
};

function Fact({ label, value, bad }) {
  return (
    <div>
      <span className="mb-1 block text-[0.72rem] uppercase tracking-[0.12em] text-ink-faint">
        {label}
      </span>
      <span className={`block font-medium ${bad ? 'text-red-600' : 'text-ink'}`}>{value}</span>
    </div>
  );
}

export default function SnapDiagnose() {
  const motionRef = useSnapTransition();
  const [bgRef, bgLive] = useInView();

  const [url, setUrl] = useState('');
  const [status, setStatus] = useState('idle');
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);
  const resultsRef = useRef(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!url.trim()) return;

    setStatus('running');
    setError(null);
    setReport(null);

    try {
      const response = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setStatus('error');
        setError(data.error ?? 'That page could not be audited.');
        return;
      }

      setReport(data.result);
      setStatus('done');
      // The report renders below the fold of this section, so take the reader
      // to it rather than leaving them looking at an unchanged input.
      requestAnimationFrame(() =>
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
      );
    } catch {
      setStatus('error');
      setError('Could not reach the audit service. Please try again.');
    }
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
                  onChange={(event) => setUrl(event.target.value)}
                  onSubmit={handleSubmit}
                />

                <p
                  className={`mt-6 max-w-md text-[0.9rem] leading-relaxed ${
                    status === 'error' ? 'text-red-600' : 'text-ink-soft'
                  }`}
                  role={status === 'error' ? 'alert' : undefined}
                  aria-live="polite"
                >
                  {status === 'running' && 'Crawling the page now — this takes a few seconds.'}
                  {status === 'error' && error}
                  {status === 'done' && 'Done. Your report is below — no email required.'}
                  {status === 'idle' &&
                    'No account, no sales call attached. The report is yours to take to anyone.'}
                </p>

                <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-line pt-6 text-[0.8rem] font-medium tracking-tight text-ink-soft">
                  <span>Crawl-based</span>
                  <span>No login</span>
                  <span>Report is yours</span>
                </div>

                <a
                  href="/tools/keyword-research"
                  className="group mt-6 inline-flex w-fit items-center gap-2.5 text-[0.85rem] font-medium text-ink-soft transition-colors hover:text-ink"
                >
                  Also free: the keyword research tool
                  <span className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
                </a>
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

          {/* Live audit report */}
          <AnimatePresence mode="wait">
            {status === 'running' && <AuditProgress key="progress" />}
          </AnimatePresence>

          <AnimatePresence>
            {report && (
              <motion.div
                ref={resultsRef}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="mt-20 scroll-mt-24 rounded-2xl border border-line bg-paper/85 p-8 backdrop-blur-xl md:p-12"
              >
                <div className="mb-10 flex flex-wrap items-end justify-between gap-6 border-b border-line pb-8">
                  <div>
                    <span className="mb-2 block text-[0.8rem] font-semibold tracking-tight text-cobalt">
                      Audit complete
                    </span>
                    <h4 className="max-w-xl break-all text-[1.15rem] font-semibold tracking-[-0.02em]">
                      {report.url}
                    </h4>
                  </div>

                  <ScoreRing score={report.score} />
                </div>

                <div className="mb-10 grid grid-cols-2 gap-x-8 gap-y-5 text-[0.85rem] md:grid-cols-4">
                  <Fact label="Title" value={report.summary.titleLength ? `${report.summary.titleLength} chars` : 'missing'} bad={!report.summary.titleLength} />
                  <Fact label="Indexable" value={report.summary.indexable ? 'yes' : 'blocked'} bad={!report.summary.indexable} />
                  <Fact label="Structured data" value={report.summary.schemaTypes.length ? report.summary.schemaTypes.slice(0, 2).join(', ') : 'none'} bad={!report.summary.schemaTypes.length} />
                  <Fact label="States an offer" value={report.summary.statesAnOffer ? 'yes' : 'no'} bad={!report.summary.statesAnOffer} />
                  <Fact label="Redirects" value={String(report.summary.redirects)} bad={report.summary.redirects > 1} />
                  <Fact label="Images without alt" value={`${report.summary.imagesMissingAlt} of ${report.summary.images}`} bad={report.summary.imagesMissingAlt > 0} />
                  <Fact label="Render-blocking" value={String(report.summary.renderBlockingScripts)} bad={report.summary.renderBlockingScripts > 0} />
                  <Fact label="Longest form" value={report.summary.forms ? `${report.summary.longestFormFields} fields` : 'no form'} bad={report.summary.longestFormFields > 6 || !report.summary.forms} />
                </div>

                {report.findings.length === 0 ? (
                  <p className="text-[0.95rem] text-ink-soft">
                    Nothing flagged on the on-page checks. That is rare.
                  </p>
                ) : (
                  <ul className="flex flex-col divide-y divide-line border-y border-line">
                    {report.findings.map((f) => (
                      <li key={f.id} className="flex flex-col gap-2 py-5 md:flex-row md:gap-8">
                        <span className={`h-fit w-fit shrink-0 rounded-full px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.1em] ${SEVERITY_TONE[f.severity]}`}>
                          {f.severity}
                        </span>
                        <span className="block">
                          <span className="mb-1.5 block text-[1rem] font-semibold tracking-[-0.02em]">
                            {f.title}
                          </span>
                          <span className="mb-2 block max-w-2xl break-words text-[0.9rem] leading-relaxed text-ink-soft">
                            {f.detail}
                          </span>
                          <span className="block max-w-2xl text-[0.9rem] leading-relaxed text-ink">
                            <strong className="font-semibold">Fix:</strong> {f.fix}
                          </span>
                        </span>
                      </li>
                    ))}
                  </ul>
                )}

                <p className="mt-8 text-[0.85rem] text-ink-faint">
                  These are the on-page checks. Core Web Vitals and field performance data are
                  added once the PageSpeed key is configured.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

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
