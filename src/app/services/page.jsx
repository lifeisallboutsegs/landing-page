import Link from 'next/link';
import StandaloneNav from '@/components/StandaloneNav';
import { services } from '@/lib/site-pages';

export const metadata = {
  title: 'Services',
  description: 'Landing pages, website builds, SEO, Google Ads and conversion reviews designed to work as one growth system.',
  alternates: { canonical: '/services' },
};

export default function ServicesPage() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <header className="mx-auto w-full max-w-[1440px] px-6 py-6 sm:px-8 md:px-16"><StandaloneNav /></header>
      <section className="mx-auto w-full max-w-[1440px] px-6 pb-20 pt-16 sm:px-8 md:px-16 md:pb-28 md:pt-28">
        <p className="mb-5 text-xs font-medium uppercase tracking-[0.16em] text-cobalt">Services</p>
        <h1 className="max-w-4xl text-[clamp(3rem,7vw,7rem)] font-semibold leading-[0.92] tracking-[-0.07em]">The pieces of a growth system, made to work together.</h1>
        <p className="mt-10 max-w-2xl text-lg leading-relaxed text-ink-soft md:text-xl">Start with the problem you need to solve. Each service can stand alone; the strongest results come when the customer journey, demand and conversion path reinforce each other.</p>
      </section>
      <figure className="mb-20 w-full sm:mb-28">
        <img src="/assets/what-we-offer-banner.png" alt="What we offer: Build, attract and convert" className="block h-auto w-full" />
        <figcaption className="sr-only">Digital Web Assurances connects website building, demand generation and conversion.</figcaption>
      </figure>
      <section className="mx-auto grid w-full max-w-[1440px] gap-px overflow-hidden border-y border-line bg-line md:grid-cols-2">
        {Object.entries(services).map(([slug, service], index) => <Link key={slug} href={`/services/${slug}`} className="group bg-paper p-7 transition-colors hover:bg-porcelain sm:p-10 md:p-14"><span className="font-mono text-xs text-cobalt">0{index + 1}</span><h2 className="mt-16 text-[clamp(1.8rem,3.2vw,3rem)] font-semibold leading-none tracking-[-0.05em] group-hover:text-cobalt">{service.label}</h2><p className="mt-5 max-w-xl text-base leading-relaxed text-ink-soft">{service.description}</p><span className="mt-10 inline-block text-sm font-medium">Explore service →</span></Link>)}
      </section>
      <section className="mx-auto w-full max-w-[1440px] px-6 py-20 sm:px-8 md:px-16 md:py-28"><h2 className="max-w-2xl text-[clamp(2rem,4.5vw,4.5rem)] font-semibold leading-[0.98] tracking-[-0.06em]">Not sure which service you need?</h2><Link href="/contact" className="mt-8 inline-flex rounded-full bg-ink px-5 py-3 text-sm font-medium text-paper">Tell us what needs to work better</Link></section>
    </main>
  );
}
