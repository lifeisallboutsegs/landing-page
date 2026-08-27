import Link from 'next/link';

export default function MarketingPage({ page, kind = 'Company' }) {
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
      <header className="mx-auto flex w-full max-w-[1440px] items-center justify-between px-6 py-6 sm:px-8 md:px-16">
        <Link href="/" className="text-sm font-semibold tracking-tight">Digital Web Assurances</Link>
        <Link href="/#start" className="rounded-full border border-ink px-4 py-2 text-sm font-medium transition-colors hover:bg-ink hover:text-paper">Start a project</Link>
      </header>
      <article className="mx-auto grid w-full max-w-[1440px] gap-12 px-6 pb-20 pt-16 sm:px-8 md:grid-cols-[minmax(0,1.25fr)_minmax(18rem,0.75fr)] md:px-16 md:pb-32 md:pt-28">
        <div>
          <p className="mb-6 text-xs font-medium uppercase tracking-[0.16em] text-cobalt">{kind} / {page.label}</p>
          <h1 className="max-w-4xl text-[clamp(2.8rem,6.8vw,6.8rem)] font-semibold leading-[0.92] tracking-[-0.07em]">{page.title}</h1>
          <p className="mt-10 max-w-2xl text-lg leading-relaxed text-ink-soft md:text-xl">{page.intro}</p>
          <div className="mt-12 flex flex-wrap gap-3">
            <Link href="/#start" className="rounded-full bg-ink px-5 py-3 text-sm font-medium text-paper transition-transform hover:-translate-y-0.5">Start a project</Link>
            <Link href="/#diagnose" className="rounded-full border border-line px-5 py-3 text-sm font-medium transition-colors hover:border-ink">Run the free audit</Link>
          </div>
        </div>
        <aside className="self-end border-t border-line pt-6 md:border-l md:border-t-0 md:pl-10 md:pt-0">
          <p className="mb-6 text-sm font-medium text-ink-soft">What this includes</p>
          <ul className="space-y-5">
            {page.points.map((point, index) => (
              <li key={point} className="flex gap-4 text-base leading-relaxed"><span className="font-mono text-xs text-cobalt">0{index + 1}</span><span>{point}</span></li>
            ))}
          </ul>
        </aside>
      </article>
      <footer className="border-t border-line px-6 py-8 text-sm text-ink-soft sm:px-8 md:px-16"><Link href="/" className="hover:text-ink">← Back to Digital Web Assurances</Link></footer>
    </main>
  );
}
