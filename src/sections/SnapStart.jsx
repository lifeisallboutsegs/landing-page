import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Label } from '@/components/ui/label';
import { TextHoverEffect } from '@/components/ui/text-hover-effect';
import { Globe3D } from '@/components/ui/3d-globe';
import { Button as StatefulButton } from '@/components/ui/stateful-button';
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalTrigger,
} from '@/components/ui/animated-modal';
import SplitText from '@/components/SplitText';
import BlurText from '@/components/BlurText';
import AnimatedContent from '@/components/AnimatedContent';
import Magnet from '@/components/Magnet';
import { useInView } from '@/hooks/use-in-view';
import { useSnapTransition } from '@/hooks/use-snap-transition';
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, Clock, MessageSquare, ShieldCheck } from 'lucide-react';

const FOOTER_LINKS = [
  {
    heading: 'Services',
    links: ['Landing pages', 'Website builds', 'SEO', 'Google Ads', 'Conversion review'],
  },
  {
    heading: 'Company',
    links: ['Work', 'About', 'Process', 'Contact'],
  },
  {
    heading: 'Free tools',
    links: ['Technical SEO audit', 'Keyword research'],
  },
];

/** Point this at the real backend via VITE_LEAD_ENDPOINT at build time. */
const LEAD_ENDPOINT = import.meta.env.VITE_LEAD_ENDPOINT || '/api/leads';

const AFTER_SEND = [
  {
    icon: MessageSquare,
    title: 'A person reads it',
    body: 'Not a sequence and not an SDR. The enquiry goes to whoever would actually run the work, and they reply to what you wrote.',
  },
  {
    icon: Clock,
    title: 'A reply inside one working day',
    body: 'Usually with a question or two first. We would rather understand the problem than send a proposal that guesses at it.',
  },
  {
    icon: ShieldCheck,
    title: 'A straight answer on fit',
    body: 'Including when the answer is no. If someone else is a better fit for what you need, we will say so and point you at them.',
  },
];

const SERVICES = ['New website', 'SEO', 'Google Ads', 'All three', 'Not sure yet'];

/**
 * Paid traffic is the whole point of this page, so the form captures the ad
 * attribution alongside the enquiry — a lead you can't trace back to a campaign
 * can't tell you which campaign to keep paying for.
 */
function attribution() {
  const params = new URLSearchParams(window.location.search);
  const utm = {};
  for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid']) {
    const value = params.get(key);
    if (value) utm[key] = value;
  }
  return {
    ...utm,
    landing_page: window.location.pathname,
    referrer: document.referrer || null,
    submitted_at: new Date().toISOString(),
  };
}

const STEPS = [
  { key: 'need', kicker: 'What you need' },
  { key: 'you', kicker: 'About you' },
  { key: 'detail', kicker: 'The detail' },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Deliberately not a single stacked form. Asking one thing at a time is the
 * conversion argument this whole page makes, so the form makes it too: state
 * is held in React rather than read from the DOM at submit, because steps
 * unmount as they animate out and FormData would lose whatever is not on
 * screen.
 */
function LeadForm() {
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);
  const [step, setStep] = useState(0);
  const [touched, setTouched] = useState(false);
  const [values, setValues] = useState({
    service: SERVICES[0],
    name: '',
    email: '',
    website: '',
    message: '',
    company_website_confirm: '',
  });

  const set = (key) => (event) => setValues((v) => ({ ...v, [key]: event.target.value }));

  const stepValid = () => {
    if (step === 0) return Boolean(values.service);
    if (step === 1) return values.name.trim().length > 1 && EMAIL_RE.test(values.email);
    return true;
  };

  const next = () => {
    if (!stepValid()) return setTouched(true);
    setTouched(false);
    setStep((n) => Math.min(n + 1, STEPS.length - 1));
  };

  const back = () => {
    setTouched(false);
    setStep((n) => Math.max(n - 1, 0));
  };

  const send = async () => {
    // Honeypot: real people never fill a hidden field. Ads traffic attracts bots.
    if (values.company_website_confirm) return;
    const { company_website_confirm, ...data } = values;

    setStatus('sending');
    setError(null);

    try {
      const response = await fetch(LEAD_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, meta: attribution() }),
      });
      if (!response.ok) throw new Error(`Request failed (${response.status})`);
      setStatus('sent');
    } catch (err) {
      setStatus('error');
      setError(err.message);
    }
  };

  const shell =
    'relative overflow-hidden rounded-2xl border border-white/70 bg-white/70 p-8 shadow-[0_12px_50px_rgba(11,11,18,0.10)] backdrop-blur-xl md:p-10';

  if (status === 'sent') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className={shell}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 220, damping: 16 }}
          className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-ink text-white"
        >
          <Check className="h-5 w-5" />
        </motion.div>
        <h3 className="mb-4 text-[1.5rem] font-semibold tracking-[-0.03em]">Got it — thank you.</h3>
        <p className="max-w-sm text-[0.98rem] leading-relaxed text-ink-soft">
          We read every enquiry ourselves and reply within one working day, usually with a
          question or two before any proposal.
        </p>
        <button
          type="button"
          onClick={() => {
            setStatus('idle');
            setStep(0);
            setValues((v) => ({ ...v, name: '', email: '', website: '', message: '' }));
          }}
          className="mt-8 text-sm font-medium text-cobalt underline underline-offset-4"
        >
          Send another
        </button>
      </motion.div>
    );
  }

  const field =
    'peer h-11 w-full rounded-none border-0 border-b border-line bg-transparent px-0 text-[0.95rem] text-ink shadow-none outline-none placeholder:text-ink-faint/90 focus:border-cobalt';
  const sweep =
    'pointer-events-none absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 bg-cobalt transition-transform duration-500 ease-out peer-focus:scale-x-100';
  const transition = { duration: 0.38, ease: [0.22, 1, 0.36, 1] };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (step < STEPS.length - 1) next();
      }}
      className={shell}
    >
      <div className="mb-8 flex items-baseline justify-between gap-4">
        <h3 className="text-[1.5rem] font-semibold tracking-[-0.03em]">Start a project</h3>
        <span className="shrink-0 font-mono text-[0.75rem] tracking-tight text-ink-faint">
          {String(step + 1).padStart(2, '0')} / {String(STEPS.length).padStart(2, '0')}
        </span>
      </div>

      {/* Progress rail — the only element that persists across steps, so it
          reads as one conversation rather than three separate forms. */}
      <div className="mb-9 flex gap-1.5">
        {STEPS.map((s, i) => (
          <button
            key={s.key}
            type="button"
            onClick={() => i < step && setStep(i)}
            className={`h-1 flex-1 overflow-hidden rounded-full bg-line ${i < step ? 'cursor-pointer' : 'cursor-default'}`}
            aria-label={s.kicker}
          >
            <motion.span
              className="block h-full rounded-full bg-ink"
              initial={false}
              animate={{ scaleX: i <= step ? 1 : 0 }}
              style={{ originX: 0 }}
              transition={transition}
            />
          </button>
        ))}
      </div>

      <div className="min-h-[17rem]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 28 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -28 }}
            transition={transition}
            className="flex flex-col gap-7"
          >
            <span className="text-[0.8rem] font-semibold tracking-tight text-cobalt">
              {STEPS[step].kicker}
            </span>

            {step === 0 && (
              <>
                <p className="text-[1.15rem] font-medium leading-snug tracking-[-0.02em]">
                  What do you need from us?
                </p>
                <div className="flex flex-wrap gap-2">
                  {SERVICES.map((service) => {
                    const active = values.service === service;
                    return (
                      <button
                        key={service}
                        type="button"
                        onClick={() => {
                          setValues((v) => ({ ...v, service }));
                          window.setTimeout(next, 180);
                        }}
                        className={`select-none rounded-full border px-4 py-2 text-[0.85rem] transition-all duration-300 ease-out active:scale-95 ${
                          active
                            ? '-translate-y-0.5 border-ink bg-ink text-white shadow-[0_6px_18px_rgba(11,11,18,0.22)]'
                            : 'border-line text-ink-soft hover:-translate-y-0.5 hover:border-ink/40 hover:bg-white'
                        }`}
                      >
                        {service}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[0.85rem] text-ink-faint">Pick one — it just routes your enquiry.</p>
              </>
            )}

            {step === 1 && (
              <>
                <div className="grid grid-cols-1 gap-7 sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="lead-name" className="text-[0.8rem] font-medium tracking-tight text-ink-soft">
                      Name
                    </Label>
                    <div className="relative">
                      <input
                        id="lead-name"
                        value={values.name}
                        onChange={set('name')}
                        autoComplete="name"
                        placeholder="Your name"
                        className={field}
                      />
                      <span className={sweep} />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="lead-email" className="text-[0.8rem] font-medium tracking-tight text-ink-soft">
                      Email
                    </Label>
                    <div className="relative">
                      <input
                        id="lead-email"
                        type="email"
                        value={values.email}
                        onChange={set('email')}
                        autoComplete="email"
                        placeholder="you@company.com"
                        className={field}
                      />
                      <span className={sweep} />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="lead-website" className="text-[0.8rem] font-medium tracking-tight text-ink-soft">
                    Website <span className="normal-case tracking-normal text-ink-faint">(optional)</span>
                  </Label>
                  <div className="relative">
                    <input
                      id="lead-website"
                      value={values.website}
                      onChange={set('website')}
                      placeholder="yourcompany.com"
                      className={field}
                    />
                    <span className={sweep} />
                  </div>
                </div>

                <AnimatePresence>
                  {touched && !stepValid() && (
                    <motion.p
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-[0.85rem] text-red-600"
                    >
                      A name and a valid email is all we need to reply.
                    </motion.p>
                  )}
                </AnimatePresence>
              </>
            )}

            {step === 2 && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="lead-message" className="text-[0.8rem] font-medium tracking-tight text-ink-soft">
                  Anything useful to know?
                </Label>
                <div className="relative">
                  <textarea
                    id="lead-message"
                    rows={4}
                    value={values.message}
                    onChange={set('message')}
                    placeholder="What you sell, who buys it, and what is not working right now."
                    className="peer w-full resize-none rounded-none border-0 border-b border-line bg-transparent px-0 text-[0.95rem] text-ink shadow-none outline-none placeholder:text-ink-faint/90 focus:border-cobalt"
                  />
                  <span className={sweep} />
                </div>
                <p className="mt-1 text-[0.85rem] text-ink-faint">Optional — skip it and we'll ask.</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Honeypot — hidden from people, irresistible to bots. */}
      <input
        type="text"
        value={values.company_website_confirm}
        onChange={set('company_website_confirm')}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="sr-only"
      />

      <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-line pt-7">
        {step > 0 && (
          <button
            type="button"
            onClick={back}
            className="group inline-flex items-center gap-2 text-sm font-medium text-ink-soft transition-colors hover:text-ink"
          >
            <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
            Back
          </button>
        )}

        {step < STEPS.length - 1 ? (
          <Magnet padding={50} magnetStrength={7}>
            <button
              type="button"
              onClick={next}
              className="group inline-flex items-center gap-3 rounded-full bg-ink px-8 py-4 text-sm font-medium text-white transition-transform duration-200 active:scale-[0.98]"
            >
              Continue
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </Magnet>
        ) : (
          <Magnet padding={50} magnetStrength={7}>
            {/* type="button": motion.button defaults to submit inside a form,
                which would fire the request twice. */}
            <StatefulButton
              type="button"
              onClick={send}
              className="group min-w-0 gap-3 bg-ink px-8 py-4 text-sm font-medium text-white ring-offset-transparent hover:ring-cobalt/40"
            >
              <span className="inline-flex items-center gap-3">
                Send enquiry
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </StatefulButton>
          </Magnet>
        )}

        <span className="text-[0.8rem] text-ink-faint">Or email hello@digitalwebassurances.com</span>
      </div>

      {status === 'error' && (
        <p role="alert" className="mt-5 text-[0.88rem] text-red-600">
          That didn't send{error ? ` — ${error}` : ''}. Please email us directly and we'll pick it up.
        </p>
      )}
    </form>
  );
}

export default function SnapStart() {
  const motionRef = useSnapTransition();
  const [bgRef] = useInView();
  // The globe band needs its own observer — sharing bgRef would leave only the
  // element that mounted last actually attached.
  const [globeRef, globeLive] = useInView();

  return (
    <section
      id="start"
      data-snap="start"
      className="relative z-10 w-full overflow-clip bg-paper text-ink"
    >
      {/* The destination. A spotlight that tracks the pointer — the light at
          the end of the path, finally reachable. */}
      <div ref={bgRef} className="pointer-events-none absolute inset-0 z-0 overflow-clip">
        <div
          className="drift-a absolute right-[4%] top-[6%] h-[44rem] w-[44rem] rounded-full opacity-80"
          style={{ background: 'radial-gradient(circle, rgba(255,138,91,0.16) 0%, rgba(255,255,255,0) 66%)' }}
        />
        <div
          className="drift-b absolute -left-[8%] top-[42%] h-[46rem] w-[46rem] rounded-full opacity-80"
          style={{ background: 'radial-gradient(circle, rgba(27,75,224,0.13) 0%, rgba(255,255,255,0) 68%)' }}
        />

        {/* Slowly turning globe, bleeding off the bottom-left corner — the
            reach behind the offer. Deliberately markerless: the demo's avatar
            pins read as a global client list we have not earned. It sits
            behind the copy at low opacity and never takes the pointer, so the
            form keeps every click. */}
      </div>

      <div ref={motionRef} className="relative z-10">
        {/* Final CTA + lead capture, held in one panel. The globe bleeds out of
            the bottom-left corner and is clipped by the panel's own radius, so
            the crop reads as deliberate framing instead of an accident — and it
            lands in the empty space under the copy, clear of every line of
            type. The panel is tinted rather than white so it separates from the
            page without another sheet of paper on paper. */}
        <div className="mx-auto w-full max-w-[1600px] px-8 py-28 md:px-16">
          <div className="relative overflow-hidden rounded-[2rem] border border-line bg-gradient-to-br from-porcelain via-paper to-porcelain px-8 pt-14 pb-[15rem] shadow-[0_24px_80px_rgba(11,11,18,0.08)] md:px-14 md:pt-16 md:pb-[17rem]">
            <div
              ref={globeRef}
              className="pointer-events-none absolute -bottom-[19rem] -left-[10rem] size-[34rem] md:-bottom-[22rem] md:-left-[7rem] md:size-[40rem]"
            >
              {globeLive && (
                <Globe3D
                  className="h-full w-full"
                  config={{
                    autoRotateSpeed: 0.22,
                    showAtmosphere: true,
                    atmosphereColor: '#4da6ff',
                    atmosphereIntensity: 0.5,
                    atmosphereBlur: 3,
                    bumpScale: 3,
                    ambientIntensity: 0.85,
                  }}
                />
              )}
            </div>

            <div className="relative z-10 grid grid-cols-1 gap-16 lg:grid-cols-[1fr_minmax(0,30rem)] lg:gap-24">
            <div className="flex flex-col justify-center">
              <h2 className="mb-8 max-w-3xl text-[clamp(2.4rem,4.8vw,4.6rem)] font-semibold leading-[1] tracking-[-0.045em]">
                <SplitText
                  text="Your next customer is already searching."
                  splitType="lines"
                  ease="expo.out"
                  delay={120}
                  duration={1.2}
                  textAlign="left"
                  tag="span"
                />
              </h2>

              <BlurText
                text="Let's build the system that gets them to you."
                delay={30}
                stepDuration={0.2}
                animateBy="words"
                direction="top"
                className="mb-12 max-w-2xl text-[clamp(1.1rem,1.9vw,1.6rem)] leading-snug text-ink-soft"
              />

              <AnimatedContent
                distance={28}
                direction="vertical"
                delay={0.4}
                duration={0.9}
                ease="power3.out"
                className="flex flex-col gap-6"
              >
                <ul className="flex flex-col gap-4 border-t border-line pt-8">
                  {[
                    'A reply from the person who would actually run the work',
                    'A straight answer on whether we are a fit, including when we are not',
                    'No retainer lock-in before we have proven anything',
                  ].map((point) => (
                    <li key={point} className="flex items-baseline gap-4 text-[0.98rem] text-ink-soft">
                      <span className="h-px w-6 shrink-0 translate-y-[-0.35em] bg-cobalt" />
                      {point}
                    </li>
                  ))}
                </ul>

                <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
                  <a
                    href="#diagnose"
                    className="group inline-flex w-fit items-center gap-2.5 text-sm font-medium text-ink-soft transition-colors hover:text-ink"
                  >
                    <span>Or run the free audit first</span>
                    <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>

                  {/* Deliberately a secondary action. The form itself stays on
                      the page — putting the only conversion point behind a
                      click would contradict the argument this site makes. This
                      answers the "what am I signing up for" hesitation that
                      otherwise stops someone filling it in. */}
                  <Modal>
                    <ModalTrigger className="group !w-fit !px-0 !py-0 text-sm font-medium !text-ink-soft transition-colors hover:!text-ink">
                      <span className="inline-flex items-center gap-2.5 underline decoration-line underline-offset-4 transition-colors group-hover:decoration-ink">
                        What happens after you send
                      </span>
                    </ModalTrigger>

                    <ModalBody className="md:max-w-xl">
                      <ModalContent>
                        <span className="mb-4 block text-[0.8rem] font-semibold tracking-tight text-cobalt">
                          No sales sequence
                        </span>
                        <h3 className="mb-8 text-[clamp(1.4rem,2.4vw,2rem)] font-semibold leading-[1.1] tracking-[-0.03em] text-ink">
                          Three things, in this order.
                        </h3>

                        <ol className="flex flex-col gap-7">
                          {AFTER_SEND.map((item, i) => (
                            <li key={item.title} className="flex gap-5">
                              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-porcelain text-ink">
                                <item.icon className="h-4 w-4" strokeWidth={1.7} />
                              </span>
                              <span className="block">
                                <span className="mb-1.5 flex items-baseline gap-3">
                                  <span className="font-mono text-[0.7rem] text-ink-faint">
                                    {String(i + 1).padStart(2, '0')}
                                  </span>
                                  <span className="text-[1rem] font-semibold tracking-[-0.02em] text-ink">
                                    {item.title}
                                  </span>
                                </span>
                                <span className="block text-[0.93rem] leading-relaxed text-ink-soft">
                                  {item.body}
                                </span>
                              </span>
                            </li>
                          ))}
                        </ol>
                      </ModalContent>

                      <ModalFooter className="!bg-porcelain">
                        <span className="mr-auto text-[0.82rem] text-ink-soft">
                          No retainer lock-in before we have proven anything.
                        </span>
                      </ModalFooter>
                    </ModalBody>
                  </Modal>
                </div>
              </AnimatedContent>
            </div>

            <AnimatedContent distance={32} direction="vertical" delay={0.2} duration={0.9} ease="power3.out">
              <LeadForm />
            </AnimatedContent>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-line bg-paper">
          <div className="mx-auto w-full max-w-[1600px] px-8 py-16 md:px-16">
            <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
              <div className="col-span-2 md:col-span-1">
                <span className="mb-4 block text-sm font-semibold tracking-tight">
                  Digital Web Assurances
                </span>
                <p className="max-w-xs text-[0.9rem] leading-relaxed text-ink-soft">
                  We build the digital system that turns attention into customers.
                </p>
              </div>

              {FOOTER_LINKS.map((group) => (
                <div key={group.heading}>
                  <span className="mb-5 block text-[0.8rem] font-medium tracking-tight text-ink-soft">
                    {group.heading}
                  </span>
                  <ul className="flex flex-col gap-3">
                    {group.links.map((link) => (
                      <li key={link}>
                        <a
                          href="#start"
                          className="text-[0.92rem] text-ink-soft transition-colors hover:text-ink"
                        >
                          {link}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Large mouse-reactive wordmark. */}
            <div className="mt-16 h-32 w-full md:h-48">
              <TextHoverEffect text="GROWTH" duration={0.3} />
            </div>

            <div className="flex flex-col gap-3 border-t border-line pt-8 text-[0.8rem] font-medium tracking-tight text-ink-soft sm:flex-row sm:items-center sm:justify-between">
              <span>© {new Date().getFullYear()} Digital Web Assurances</span>
              <span>Build — Attract — Convert — Grow</span>
            </div>
          </div>
        </footer>
      </div>
    </section>
  );
}
