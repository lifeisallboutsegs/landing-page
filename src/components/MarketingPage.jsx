import Link from 'next/link';
import StandaloneNav from '@/components/StandaloneNav';
import { companyPages, services } from '@/lib/site-pages';

export default function MarketingPage({ page, kind = 'Company' }) {
  const isService = kind === 'Service';
  const pageAssets = {
    'Landing pages': '/assets/northbeam-mockup.png',
    'Website builds': '/assets/website-build-system.png',
    SEO: '/assets/search-intent-lens.png',
    'Google Ads': '/assets/google-ads-calibration.png',
    'Conversion review': '/assets/conversion-path.png',
    About: '/assets/growth-flow-hero.png',
    Work: '/assets/work-strategy-workbench.png',
    Process: '/assets/what-we-offer-banner.png',
    Contact: '/assets/project-brief-contact.png',
  };
  const asset = pageAssets[page.label];
  const offers = isService
    ? [
      { title: `${page.label} foundation`, body: page.points[0] },
      { title: 'Build and launch', body: page.points[1] },
      { title: 'Learn and improve', body: page.points[2] },
    ]
    : [
      { title: 'Start with the actual problem', body: page.points[0] },
      { title: 'Make the work visible', body: page.points[1] },
      { title: 'Leave a durable system', body: page.points[2] },
    ];
  const related = isService ? Object.entries(services) : Object.entries(companyPages);
  const schema = {
    '@context': 'https://schema.org',
    '@type': kind === 'Service' ? 'Service' : 'ProfessionalService',
    name: `Digital Web Assurances — ${page.label}`,
    description: page.description,
    provider: { '@type': 'Organization', name: 'Digital Web Assurances' },
    url: 'https://digitalwebassurances.com',
  };

  return (
    <main className="min-h-screen bg-paper text-ink">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <header className="mx-auto w-full max-w-[1440px] px-6 py-6 sm:px-8 md:px-16">
        <StandaloneNav />
      </header>
      <article className="mx-auto grid w-full max-w-[1440px] gap-12 px-6 pb-20 pt-16 sm:px-8 md:grid-cols-[minmax(0,1.25fr)_minmax(18rem,0.75fr)] md:px-16 md:pb-28 md:pt-28">
        <div>
          <h1 className="max-w-4xl text-[clamp(2.8rem,6.8vw,6.8rem)] font-semibold leading-[0.92] tracking-[-0.07em]">{page.title}</h1>
          <p className="mt-10 max-w-2xl text-lg leading-relaxed text-ink-soft md:text-xl">{page.intro}</p>
          <div className="mt-12 flex flex-wrap gap-3">
            <Link href="/#start" className="rounded-full bg-ink px-5 py-3 text-sm font-medium text-paper transition-transform hover:-translate-y-0.5">Start a project</Link>
            <Link href="/#diagnose" className="rounded-full border border-line px-5 py-3 text-sm font-medium transition-colors hover:border-ink">Run the free audit</Link>
          </div>
        </div>
        <aside className="self-end border-t border-line pt-6 md:border-l md:border-t-0 md:pl-10 md:pt-0">
          <img src={asset} alt="" aria-hidden="true" className="mb-8 w-full max-w-sm object-contain" />
          <p className="mb-6 text-sm font-medium text-ink-soft">What this includes</p>
          <ul className="space-y-5">
            {page.points.map((point, index) => (
              <li key={point} className="flex gap-4 text-base leading-relaxed"><span className="font-mono text-xs text-cobalt">0{index + 1}</span><span>{point}</span></li>
            ))}
          </ul>
        </aside>
      </article>
      <section className="border-y border-line bg-porcelain">
        <div className="mx-auto w-full max-w-[1440px] px-6 py-20 sm:px-8 md:px-16 md:py-28">
          <div className="mb-12 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div><p className="mb-4 text-xs font-medium uppercase tracking-[0.16em] text-cobalt">The offer</p><h2 className="max-w-2xl text-[clamp(2rem,4vw,4rem)] font-semibold leading-[0.98] tracking-[-0.055em]">What we would actually work on.</h2></div>
            <p className="max-w-sm text-base leading-relaxed text-ink-soft">The work is scoped around the bottleneck, not a preset list of deliverables. These are the stages we use to make progress visible.</p>
          </div>
          <div className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-3">
            {offers.map((offer, index) => <article key={offer.title} className="bg-paper p-7 sm:p-9"><span className="font-mono text-xs text-cobalt">0{index + 1}</span><h3 className="mt-12 text-2xl font-semibold tracking-[-0.035em]">{offer.title}</h3><p className="mt-4 text-base leading-relaxed text-ink-soft">{offer.body}</p></article>)}
          </div>
        </div>
      </section>
      <section className="mx-auto grid w-full max-w-[1440px] gap-10 px-6 py-20 sm:px-8 md:grid-cols-[0.7fr_1.3fr] md:px-16 md:py-28">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-cobalt">How it works</p>
        <div><h2 className="max-w-3xl text-[clamp(2rem,4.4vw,4.4rem)] font-semibold leading-[0.98] tracking-[-0.06em]">A focused start, a clear build, and evidence for what comes next.</h2><div className="mt-10 grid gap-6 sm:grid-cols-3">{['Context', 'Direction', 'Momentum'].map((step, index) => <div key={step} className="border-t border-line pt-5"><span className="font-mono text-xs text-cobalt">0{index + 1}</span><h3 className="mt-6 text-lg font-semibold">{step}</h3><p className="mt-3 text-sm leading-relaxed text-ink-soft">{index === 0 ? 'We establish the commercial question and the current friction.' : index === 1 ? 'We choose the few changes that will make the clearest difference.' : 'We launch, measure and turn learning into the next useful move.'}</p></div>)}</div></div>
      </section>
      <section className="mx-6 mb-20 rounded-3xl bg-ink px-7 py-12 text-paper sm:mx-8 sm:px-10 md:mx-auto md:mb-28 md:max-w-[1312px] md:px-16 md:py-16"><p className="text-sm text-paper/60">Have a project in mind?</p><div className="mt-7 flex flex-col gap-7 md:flex-row md:items-end md:justify-between"><h2 className="max-w-2xl text-[clamp(2rem,4.2vw,4rem)] font-semibold leading-[0.98] tracking-[-0.055em]">Let’s find the next useful move.</h2><Link href="/#start" className="inline-flex w-fit rounded-full bg-paper px-5 py-3 text-sm font-medium text-ink transition-transform hover:-translate-y-0.5">Start a project</Link></div></section>
      <nav aria-label={isService ? 'Explore services' : 'Explore company pages'} className="mx-auto w-full max-w-[1440px] px-6 pb-20 sm:px-8 md:px-16 md:pb-28"><p className="mb-6 text-xs font-medium uppercase tracking-[0.16em] text-cobalt">{isService ? 'Explore services' : 'Explore Digital Web Assurances'}</p><div className="grid border-t border-line sm:grid-cols-2 lg:grid-cols-3">{related.map(([slug, item]) => <Link key={slug} href={isService ? `/services/${slug}` : `/${slug}`} className="group border-b border-line py-5 pr-5 text-lg font-medium tracking-tight transition-colors hover:text-cobalt">{item.label}<span className="ml-2 inline-block transition-transform group-hover:translate-x-1">→</span></Link>)}</div></nav>
      <footer className="border-t border-line px-6 py-8 text-sm text-ink-soft sm:px-8 md:px-16"><Link href="/" className="hover:text-ink">← Back to Digital Web Assurances</Link></footer>
    </main>
  );
}
