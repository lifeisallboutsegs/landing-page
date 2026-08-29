import Link from 'next/link';
import StandaloneNav from '@/components/StandaloneNav';
import Reveal from '@/components/Reveal';
import { companyPages } from '@/lib/site-pages';
import { getPageContent } from '@/server/content.js';

export const revalidate = 120;

export const metadata = {
  title: 'Contact',
  description: companyPages.contact.description,
  alternates: { canonical: '/contact' },
};

export default async function ContactPage() {
  const page = await getPageContent('page:contact');
  const CHANNELS = Array.isArray(page.channels) ? page.channels : [];
  return (
    <main className="min-h-screen overflow-clip bg-paper text-ink">
      <header className="mx-auto w-full max-w-[1440px] px-6 py-6 sm:px-8 md:px-16">
        <StandaloneNav />
      </header>

      <section className="relative mx-auto grid w-full max-w-[1440px] gap-12 px-6 pb-20 pt-16 sm:px-8 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] md:px-16 md:pb-28 md:pt-28">
        <div>
          <Reveal as="p" className="mb-5 text-xs font-semibold uppercase tracking-[0.16em] text-cobalt">
            Contact
          </Reveal>
          <Reveal
            as="h1"
            delay={0.05}
            className="max-w-3xl text-[clamp(2.6rem,6vw,5.6rem)] font-semibold leading-[0.94] tracking-[-0.06em]"
          >
            {page.title}
          </Reveal>
          <Reveal as="p" delay={0.1} className="mt-9 max-w-xl text-lg leading-relaxed text-ink-soft md:text-xl">
            {page.intro}
          </Reveal>

          <div className="mt-10">
            <Link
              href="/#start"
              className="inline-flex rounded-full bg-ink px-6 py-3.5 text-sm font-medium text-paper transition-transform hover:-translate-y-0.5"
            >
              Use the project form
            </Link>
            <p className="mt-3 text-sm text-ink-faint">
              Three short steps on the home page — the fastest way to give us the context.
            </p>
          </div>

          <ul className="mt-12 space-y-4 border-t border-line pt-8">
            {(page.deliverables ?? []).map((item) => (
              <li key={item.title} className="flex gap-4">
                <span className="mt-2 h-px w-6 shrink-0 bg-cobalt" />
                <span>
                  <span className="block text-[1rem] font-semibold tracking-[-0.02em]">{item.title}</span>
                  <span className="block text-[0.95rem] leading-relaxed text-ink-soft">{item.body}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <Reveal as="aside" delay={0.15} className="relative md:border-l md:border-line md:pl-12">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-6 -top-10 hidden h-28 w-28 rotate-12 rounded-2xl bg-coral/12 lg:block"
          />
          <p className="mb-6 text-sm font-semibold text-ink-soft">Or reach us directly</p>
          <ul className="space-y-6">
            {CHANNELS.map((channel) => (
              <li key={channel.label} className="border-t border-line pt-5 first:border-t-0 first:pt-0">
                <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-cobalt">
                  {channel.label}
                </span>
                <a
                  href={channel.href}
                  target={channel.href.startsWith('http') ? '_blank' : undefined}
                  rel={channel.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="mt-2 block text-lg font-medium tracking-tight transition-colors hover:text-cobalt"
                >
                  {channel.value}
                </a>
                <span className="mt-1 block text-sm leading-relaxed text-ink-soft">{channel.note}</span>
              </li>
            ))}
          </ul>

          <div className="mt-10 rounded-2xl border border-line bg-porcelain p-6">
            <p className="text-sm leading-relaxed text-ink-soft">
              Prefer to see the problem first? Run the{' '}
              <Link href="/#diagnose" className="font-medium text-cobalt underline underline-offset-4">
                free technical audit
              </Link>{' '}
              and send us the report.
            </p>
          </div>
        </Reveal>
      </section>

      <footer className="border-t border-line px-6 py-8 text-sm text-ink-soft sm:px-8 md:px-16">
        <Link href="/" className="hover:text-ink">
          ← Back to Digital Web Assurances
        </Link>
      </footer>
    </main>
  );
}
