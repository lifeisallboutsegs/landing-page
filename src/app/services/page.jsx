import Link from 'next/link';
import StandaloneNav from '@/components/StandaloneNav';
import Reveal from '@/components/Reveal';
import { services } from '@/lib/site-pages';

export const metadata = {
  title: 'Services',
  description:
    'MERN websites, landing pages, SEO, Google and Meta Ads, server-side tracking and conversion reviews — the steps from a customer searching to a sale, run by one team.',
  alternates: { canonical: '/services' },
};

const FUNNEL = [
  'Keyword research',
  'SEO',
  'MERN website',
  'Google Ads',
  'Meta Ads',
  'Server-side tracking',
  'The sale',
];

export default function ServicesPage() {
  return (
    <main className="min-h-screen overflow-clip bg-paper text-ink">
      <header className="mx-auto w-full max-w-[1440px] px-6 py-6 sm:px-8 md:px-16">
        <StandaloneNav />
      </header>

      <section className="relative mx-auto w-full max-w-[1440px] px-6 pb-14 pt-16 sm:px-8 md:px-16 md:pb-20 md:pt-28">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-8 top-8 hidden h-48 w-48 rotate-12 rounded-[2.4rem] bg-coral/12 lg:block"
        />
        <Reveal as="p" className="mb-5 text-xs font-semibold uppercase tracking-[0.16em] text-cobalt">
          Services
        </Reveal>
        <Reveal
          as="h1"
          delay={0.05}
          className="max-w-4xl text-[clamp(2.8rem,6.6vw,6.6rem)] font-semibold leading-[0.92] tracking-[-0.07em]"
        >
          Every step from a search to a sale — and each one on its own.
        </Reveal>
        <Reveal as="p" delay={0.1} className="mt-9 max-w-2xl text-lg leading-relaxed text-ink-soft md:text-xl">
          Each service can stand alone. The reason to run them with one team is that the search term,
          the page, the campaign and the tracking stop being someone else's problem.
        </Reveal>

        {/* The order the pieces sit in, rather than a decorative banner. */}
        <Reveal
          as="ol"
          delay={0.15}
          className="mt-12 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm font-medium text-ink-soft"
        >
          {FUNNEL.map((step, i) => (
            <li key={step} className="flex items-center gap-3">
              <span className={i === FUNNEL.length - 1 ? 'text-coral' : 'text-ink'}>{step}</span>
              {i < FUNNEL.length - 1 && <span className="text-ink-faint">→</span>}
            </li>
          ))}
        </Reveal>
      </section>

      <section className="mx-auto grid w-full max-w-[1440px] gap-px overflow-hidden border-y border-line bg-line md:grid-cols-2">
        {Object.entries(services).map(([slug, service], index) => (
          <Reveal
            key={slug}
            delay={(index % 2) * 0.06}
            className="bg-paper transition-colors hover:bg-porcelain"
          >
            <Link href={`/services/${slug}`} className="group block p-7 sm:p-10 md:p-14">
              <span className="text-sm font-semibold text-cobalt tabular-nums">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h2 className="mt-14 text-[clamp(1.8rem,3.2vw,3rem)] font-semibold leading-none tracking-[-0.05em] group-hover:text-cobalt">
                {service.label}
              </h2>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-soft">
                {service.description}
              </p>
              <span className="mt-10 inline-block text-sm font-medium">Explore service →</span>
            </Link>
          </Reveal>
        ))}
      </section>

      <section className="mx-auto w-full max-w-[1440px] px-6 py-20 sm:px-8 md:px-16 md:py-28">
        <Reveal
          as="h2"
          className="max-w-2xl text-[clamp(2rem,4.5vw,4.5rem)] font-semibold leading-[0.98] tracking-[-0.06em]"
        >
          Not sure which one is the bottleneck?
        </Reveal>
        <Reveal as="p" delay={0.05} className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
          Run the free technical audit, or tell us what is not working and we will point at the step
          that is costing you the most.
        </Reveal>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/#start"
            className="inline-flex rounded-full bg-ink px-5 py-3 text-sm font-medium text-paper transition-transform hover:-translate-y-0.5"
          >
            Tell us what needs to work better
          </Link>
          <Link
            href="/#diagnose"
            className="inline-flex rounded-full border border-line px-5 py-3 text-sm font-medium transition-colors hover:border-ink"
          >
            Run the free audit
          </Link>
        </div>
      </section>
    </main>
  );
}
