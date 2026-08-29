import Link from 'next/link';
import StandaloneNav from '@/components/StandaloneNav';
import Reveal from '@/components/Reveal';
import { companyPages, services } from '@/lib/site-pages';

/**
 * One layout for every static marketing page. The structure is fixed; the
 * substance (`intro`, `deliverables`, `body`, `points`) comes entirely from
 * `site-pages.js` and is written per page, so two pages never read as the same
 * template with the nouns swapped. Blocks scroll in via <Reveal>; the aside art
 * hangs at an angle and straightens on hover.
 */
export default function MarketingPage({ page, kind = 'Company', slug }) {
  const isService = kind === 'Service';
  const catalogue = isService ? services : companyPages;
  // `page` may be a CMS-merged copy (not the catalogue object), so match on the
  // passed slug first, then fall back to object identity.
  const currentSlug = slug ?? Object.keys(catalogue).find((s) => catalogue[s] === page);
  const related = Object.entries(catalogue).filter(([s]) => s !== currentSlug);

  const deliverables = page.deliverables ?? [];
  const deliverablesHeading = isService
    ? 'What the work actually covers.'
    : 'What that means in practice.';

  const schema = {
    '@context': 'https://schema.org',
    '@type': isService ? 'Service' : 'ProfessionalService',
    name: `Digital Web Assurances — ${page.label}`,
    description: page.description,
    provider: { '@type': 'Organization', name: 'Digital Web Assurances' },
    url: 'https://digitalwebassurances.com',
  };

  return (
    <main className="min-h-screen overflow-clip bg-paper text-ink">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <header className="mx-auto w-full max-w-[1440px] px-6 py-6 sm:px-8 md:px-16">
        <StandaloneNav />
      </header>

      {/* Intro */}
      <article className="relative mx-auto grid w-full max-w-[1440px] gap-12 px-6 pb-16 pt-16 sm:px-8 md:grid-cols-[minmax(0,1.25fr)_minmax(17rem,0.75fr)] md:px-16 md:pb-24 md:pt-24">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-10 top-4 hidden h-44 w-44 rotate-12 rounded-[2rem] bg-coral/12 lg:block"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-24 top-52 hidden h-20 w-20 rounded-full border-2 border-cobalt/20 lg:block"
        />

        <div>
          <Reveal as="p" className="mb-5 text-xs font-semibold uppercase tracking-[0.16em] text-cobalt">
            {isService ? 'Service' : 'Digital Web Assurances'}
          </Reveal>
          <Reveal
            as="h1"
            delay={0.05}
            className="max-w-4xl text-[clamp(2.6rem,6.4vw,6.2rem)] font-semibold leading-[0.92] tracking-[-0.065em]"
          >
            {page.title}
          </Reveal>
          <Reveal as="p" delay={0.1} className="mt-9 max-w-2xl text-lg leading-relaxed text-ink-soft md:text-xl">
            {page.intro}
          </Reveal>
          <Reveal delay={0.15} className="mt-11 flex flex-wrap gap-3">
            <Link
              href="/#start"
              className="rounded-full bg-ink px-5 py-3 text-sm font-medium text-paper transition-transform hover:-translate-y-0.5"
            >
              Start a project
            </Link>
            <Link
              href="/#diagnose"
              className="rounded-full border border-line px-5 py-3 text-sm font-medium transition-colors hover:border-ink"
            >
              Run the free audit
            </Link>
          </Reveal>
        </div>

        <aside className="self-end border-t border-line pt-6 md:border-l md:border-t-0 md:pl-10 md:pt-0">
          {page.image && (
            <div className="group relative mb-8 w-full max-w-sm">
              <span
                aria-hidden="true"
                className="absolute -left-4 -top-4 hidden h-full w-full rotate-6 rounded-2xl bg-cobalt/10 sm:block"
              />
              <img
                src={page.image}
                alt=""
                aria-hidden="true"
                className="relative w-full -rotate-[2.5deg] rounded-2xl border border-line object-contain shadow-[0_20px_60px_rgba(11,11,18,0.12)] transition-transform duration-500 group-hover:rotate-0"
              />
            </div>
          )}
          <p className="mb-5 text-sm font-semibold text-ink-soft">In short</p>
          <ul className="space-y-4">
            {page.points.map((point, index) => (
              <li key={point} className="flex gap-4 text-base leading-relaxed">
                <span className="text-sm font-semibold text-cobalt tabular-nums">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </aside>
      </article>

      {/* Deliverables */}
      {deliverables.length > 0 && (
        <section className="border-y border-line bg-porcelain">
          <div className="mx-auto w-full max-w-[1440px] px-6 py-16 sm:px-8 md:px-16 md:py-24">
            <Reveal
              as="h2"
              className="mb-12 max-w-2xl text-[clamp(1.9rem,3.6vw,3.4rem)] font-semibold leading-[1] tracking-[-0.05em]"
            >
              {deliverablesHeading}
            </Reveal>
            <div
              className={`grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 ${
                deliverables.length === 4 ? 'lg:grid-cols-2' : 'lg:grid-cols-3'
              }`}
            >
              {deliverables.map((item, index) => (
                <Reveal
                  key={item.title}
                  as="article"
                  delay={(index % 3) * 0.06}
                  className="flex flex-col bg-paper p-7 sm:p-9"
                >
                  <span className="text-sm font-semibold text-cobalt tabular-nums">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h3 className="mt-10 text-xl font-semibold tracking-[-0.03em]">{item.title}</h3>
                  <p className="mt-3 text-[0.98rem] leading-relaxed text-ink-soft">{item.body}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* The argument */}
      {page.body?.length > 0 && (
        <section className="mx-auto grid w-full max-w-[1440px] gap-10 px-6 py-16 sm:px-8 md:grid-cols-[0.5fr_1.5fr] md:px-16 md:py-24">
          <Reveal as="p" className="text-xs font-semibold uppercase tracking-[0.16em] text-cobalt">
            Why it works this way
          </Reveal>
          <div className="max-w-3xl space-y-6">
            {page.body.map((paragraph) => (
              <Reveal key={paragraph} as="p" className="text-lg leading-relaxed text-ink-soft">
                {paragraph}
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <Reveal className="mx-6 mb-20 rounded-3xl bg-ink px-7 py-12 text-paper sm:mx-8 sm:px-10 md:mx-auto md:mb-28 md:max-w-[1312px] md:px-16 md:py-16">
        <p className="text-sm text-paper/60">
          {isService ? `Think ${page.label.toLowerCase()} is the bottleneck?` : 'Have a project in mind?'}
        </p>
        <div className="mt-7 flex flex-col gap-7 md:flex-row md:items-end md:justify-between">
          <h2 className="max-w-2xl text-[clamp(2rem,4.2vw,4rem)] font-semibold leading-[0.98] tracking-[-0.055em]">
            Tell us what needs to work better.
          </h2>
          <Link
            href="/#start"
            className="inline-flex w-fit rounded-full bg-paper px-5 py-3 text-sm font-medium text-ink transition-transform hover:-translate-y-0.5"
          >
            Start a project
          </Link>
        </div>
      </Reveal>

      {/* Sibling pages */}
      <nav
        aria-label={isService ? 'Other services' : 'More about Digital Web Assurances'}
        className="mx-auto w-full max-w-[1440px] px-6 pb-20 sm:px-8 md:px-16 md:pb-28"
      >
        <p className="mb-6 text-xs font-semibold uppercase tracking-[0.16em] text-cobalt">
          {isService ? 'Other services' : 'More about us'}
        </p>
        <div className="grid border-t border-line sm:grid-cols-2 lg:grid-cols-3">
          {related.map(([slug, item]) => (
            <Link
              key={slug}
              href={isService ? `/services/${slug}` : `/${slug}`}
              className="group border-b border-line py-5 pr-5 text-lg font-medium tracking-tight transition-colors hover:text-cobalt"
            >
              {item.label}
              <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">→</span>
            </Link>
          ))}
        </div>
      </nav>

      <footer className="border-t border-line px-6 py-8 text-sm text-ink-soft sm:px-8 md:px-16">
        <Link href="/" className="hover:text-ink">
          ← Back to Digital Web Assurances
        </Link>
      </footer>
    </main>
  );
}
