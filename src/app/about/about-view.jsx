'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { TEAM_GROUPS } from '@/lib/about-content.js';

gsap.registerPlugin(ScrollTrigger);

function initials(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

/** A person with a photo, angled; without one, an initials tile on white. */
function Member({ person, index }) {
  const tilt = index % 3 === 0 ? 'sm:rotate-[2deg]' : index % 3 === 1 ? 'sm:-rotate-[2deg]' : 'sm:rotate-[1deg]';
  return (
    <li data-reveal className="group">
      <div
        className={`relative mb-4 aspect-square w-full overflow-hidden rounded-2xl border border-line bg-paper shadow-[0_14px_44px_rgba(11,11,18,0.08)] transition-transform duration-500 ${tilt} group-hover:rotate-0`}
      >
        {person.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={person.photoUrl}
            alt={person.name}
            className="h-full w-full object-cover object-top"
          />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-porcelain to-paper text-[1.9rem] font-semibold tracking-[-0.04em] text-cobalt/70">
            {initials(person.name)}
          </span>
        )}
      </div>
      <span className="block text-[1rem] font-semibold leading-tight tracking-[-0.02em] text-ink">
        {person.name}
      </span>
      <span className="mt-1 block text-[0.9rem] text-ink-soft">{person.role}</span>
    </li>
  );
}

export default function AboutView({ content, team }) {
  const root = useRef(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      // Opening: each block lifts in once as it enters. Transform only — an
      // opacity tween on a ScrollTrigger whose position goes stale (late fonts
      // or images) can strand a block invisible; a stale `y` tween just skips
      // the slide.
      gsap.utils.toArray('[data-reveal]').forEach((el) => {
        gsap.from(el, {
          y: 24,
          duration: 0.7,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        });
      });

      // The founder frame is hung at an angle and straightens as you scroll to it.
      gsap.utils.toArray('[data-straighten]').forEach((el) => {
        gsap.fromTo(
          el,
          { rotate: -4.5 },
          {
            rotate: 0,
            ease: 'none',
            scrollTrigger: { trigger: el, start: 'top bottom', end: 'top 40%', scrub: 0.4 },
          },
        );
      });

      // Decorative shapes drift on a slow scrub.
      gsap.utils.toArray('[data-drift]').forEach((el) => {
        gsap.fromTo(
          el,
          { yPercent: -12 },
          {
            yPercent: 12,
            ease: 'none',
            scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 0.6 },
          },
        );
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={root} className="overflow-clip">
      {/* Hero */}
      <section className="relative mx-auto w-full max-w-[1440px] px-6 pb-16 pt-16 sm:px-8 md:px-16 md:pb-24 md:pt-28">
        <span
          data-drift
          aria-hidden="true"
          className="pointer-events-none absolute right-[6%] top-24 hidden h-40 w-40 rotate-12 rounded-3xl bg-coral/15 md:block"
        />
        <span
          data-drift
          aria-hidden="true"
          className="pointer-events-none absolute right-[16%] top-56 hidden h-24 w-24 rounded-full border-2 border-cobalt/25 md:block"
        />

        <p data-reveal className="mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-cobalt">
          {content.kicker}
        </p>
        <h1
          data-reveal
          className="max-w-4xl text-[clamp(2.8rem,7vw,7rem)] font-semibold leading-[0.9] tracking-[-0.07em]"
        >
          {content.heroTitle}
        </h1>
        <p data-reveal className="mt-9 max-w-2xl text-lg leading-relaxed text-ink-soft md:text-xl">
          {content.heroIntro}
        </p>
      </section>

      {/* Founder */}
      <section className="relative border-y border-line bg-porcelain">
        <div className="mx-auto grid w-full max-w-[1440px] gap-14 px-6 py-16 sm:px-8 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] md:gap-20 md:px-16 md:py-28">
          <div className="relative mx-auto w-full max-w-sm">
            <span
              aria-hidden="true"
              className="absolute -left-6 -top-6 hidden h-full w-full rotate-6 rounded-[2.4rem] bg-cobalt/10 sm:block"
            />
            <span
              aria-hidden="true"
              className="absolute -bottom-8 -right-8 hidden h-40 w-40 rounded-full border-2 border-coral/40 sm:block"
            />
            <div
              data-straighten
              className="relative overflow-hidden rounded-[2rem] border border-line bg-paper shadow-[0_30px_90px_rgba(11,11,18,0.16)]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={content.founderPhoto}
                alt={`${content.founderName}, ${content.founderRole?.toLowerCase() ?? 'founder'} of Digital Web Assurances`}
                className="block aspect-[4/5] w-full object-cover object-top"
              />
            </div>
          </div>

          <div data-reveal>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-cobalt">
              {content.founderRole || 'Founder'}
            </p>
            <h2 className="text-[clamp(2.2rem,4.4vw,3.8rem)] font-semibold leading-[1] tracking-[-0.05em]">
              {content.founderName}
            </h2>
            {content.founderTagline && (
              <p className="mt-3 max-w-xl text-[1.05rem] font-medium text-ink-soft">
                {content.founderTagline}
              </p>
            )}
            <div className="mt-8 max-w-2xl space-y-5 text-[1rem] leading-relaxed text-ink-soft sm:text-[1.05rem]">
              {(content.founderBio ?? []).map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
            <Link
              href="/#start"
              className="mt-9 inline-flex rounded-full bg-ink px-6 py-3.5 text-sm font-medium text-paper transition-transform hover:-translate-y-0.5"
            >
              Work with us
            </Link>
          </div>
        </div>
      </section>

      {/* Engineering lead — photo on the right, angled the other way, so it
          reads as a companion to the founder block rather than a repeat. */}
      <section className="mx-auto w-full max-w-[1440px] px-6 py-16 sm:px-8 md:px-16 md:py-28">
        <div data-reveal className="mb-12 md:mb-16">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cobalt">Engineering</p>
          <h2 className="mt-4 max-w-2xl text-[clamp(2rem,4vw,3.4rem)] font-semibold leading-[1] tracking-[-0.05em]">
            {content.leadHeading}
          </h2>
        </div>

        <div className="grid gap-14 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] md:gap-20">
          <div data-reveal className="order-2 max-w-2xl md:order-1">
            <p className="text-[1.15rem] font-semibold tracking-[-0.02em]">
              {content.leadName}{' '}
              <span className="font-normal text-ink-soft">— {content.leadRole}</span>
            </p>
            <div className="mt-5 space-y-5 text-[1rem] leading-relaxed text-ink-soft sm:text-[1.05rem]">
              {(content.leadBio ?? []).map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </div>

          {content.leadPhoto && (
            <div className="relative order-1 mx-auto w-full max-w-xs md:order-2">
              <span
                aria-hidden="true"
                className="absolute -right-6 -top-6 hidden h-full w-full -rotate-6 rounded-[2rem] bg-coral/12 sm:block"
              />
              <span
                aria-hidden="true"
                className="absolute -bottom-7 -left-7 hidden h-32 w-32 rounded-2xl border-2 border-cobalt/25 sm:block"
              />
              <div
                data-straighten
                className="relative overflow-hidden rounded-[1.8rem] border border-line bg-paper shadow-[0_28px_80px_rgba(11,11,18,0.16)]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={content.leadPhoto}
                  alt={`${content.leadName}, ${content.leadRole}`}
                  className="block aspect-[4/5] w-full object-cover object-top"
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Team */}
      <section className="border-t border-line bg-porcelain">
        <div className="mx-auto w-full max-w-[1440px] px-6 py-16 sm:px-8 md:px-16 md:py-28">
          <h2
            data-reveal
            className="max-w-3xl text-[clamp(2rem,4.4vw,4rem)] font-semibold leading-[0.98] tracking-[-0.055em]"
          >
            {content.teamHeading}
          </h2>

          <div className="mt-12 space-y-14 sm:mt-16 sm:space-y-20">
            {TEAM_GROUPS.map((group, gi) => {
              const people = team[group.key] ?? [];
              if (!people.length) return null;
              return (
                <div key={group.key}>
                  <div
                    data-reveal
                    className="flex flex-col gap-2 border-t border-ink/15 pt-6 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8"
                  >
                    <h3 className="flex items-baseline gap-3 text-[clamp(1.4rem,2.6vw,2.1rem)] font-semibold tracking-[-0.035em]">
                      <span className="font-mono text-[0.8rem] font-semibold text-cobalt tabular-nums">
                        {String(gi + 1).padStart(2, '0')}
                      </span>
                      {group.label}
                    </h3>
                    <p className="max-w-sm text-[0.92rem] leading-relaxed text-ink-soft">{group.blurb}</p>
                  </div>

                  <ul className="mt-8 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
                    {people.map((person, i) => (
                      <Member key={`${person.name}-${i}`} person={person} index={i} />
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Belief */}
      {content.quote && (
        <section className="mx-auto w-full max-w-[1440px] px-6 py-20 sm:px-8 md:px-16 md:py-28">
          <div data-reveal className="relative max-w-3xl -rotate-1">
            <span
              aria-hidden="true"
              className="absolute -left-4 -top-10 select-none font-serif text-[6rem] leading-none text-cobalt/20 sm:-left-10 sm:text-[9rem]"
            >
              &ldquo;
            </span>
            <blockquote className="text-[clamp(1.6rem,3.6vw,2.8rem)] font-semibold leading-[1.12] tracking-[-0.04em]">
              {content.quote}
            </blockquote>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="mx-6 mb-20 rounded-3xl bg-ink px-7 py-12 text-paper sm:mx-8 sm:px-10 md:mx-auto md:mb-28 md:max-w-[1312px] md:px-16 md:py-16">
        <p className="text-sm text-paper/60">Ready when you are.</p>
        <div className="mt-7 flex flex-col gap-7 md:flex-row md:items-end md:justify-between">
          <h2 className="max-w-2xl text-[clamp(2rem,4.2vw,4rem)] font-semibold leading-[0.98] tracking-[-0.055em]">
            Tell us what needs to work better.
          </h2>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/#start"
              className="inline-flex rounded-full bg-paper px-5 py-3 text-sm font-medium text-ink transition-transform hover:-translate-y-0.5"
            >
              Start a project
            </Link>
            <Link
              href="/services"
              className="inline-flex rounded-full border border-paper/25 px-5 py-3 text-sm font-medium transition-colors hover:border-paper"
            >
              See the services
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-line px-6 py-8 text-sm text-ink-soft sm:px-8 md:px-16">
        <Link href="/" className="hover:text-ink">
          ← Back to Digital Web Assurances
        </Link>
      </footer>
    </div>
  );
}
