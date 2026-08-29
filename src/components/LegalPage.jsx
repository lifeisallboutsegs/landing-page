import Link from 'next/link';
import StandaloneNav from '@/components/StandaloneNav';

/**
 * Shared shell for /privacy and /terms. Plain prose — no animation, high
 * contrast, easy to read and to print.
 */
export default function LegalPage({ title, intro, updated, sections }) {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <header className="mx-auto w-full max-w-[1440px] px-6 py-6 sm:px-8 md:px-16">
        <StandaloneNav />
      </header>

      <article className="mx-auto w-full max-w-2xl px-6 pb-24 pt-16 sm:px-8 md:pt-24">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-cobalt">Legal</p>
        <h1 className="text-[clamp(2.2rem,5vw,3.6rem)] font-semibold leading-[0.98] tracking-[-0.05em]">
          {title}
        </h1>
        {updated && <p className="mt-4 text-sm text-ink-faint">Last updated {updated}</p>}
        {intro && <p className="mt-8 text-lg leading-relaxed text-ink-soft">{intro}</p>}

        <div className="mt-12 space-y-10">
          {sections.map((section) => (
            <section key={section.heading}>
              <h2 className="mb-4 text-[1.3rem] font-semibold tracking-[-0.02em]">{section.heading}</h2>
              <div className="space-y-4 text-[1rem] leading-relaxed text-ink-soft">
                {section.body.map((block, i) =>
                  Array.isArray(block) ? (
                    <ul key={i} className="ml-1 space-y-2">
                      {block.map((item) => (
                        <li key={item} className="flex gap-3">
                          <span className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-cobalt" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p key={i}>{block}</p>
                  ),
                )}
              </div>
            </section>
          ))}
        </div>

        <footer className="mt-16 border-t border-line pt-8 text-sm text-ink-soft">
          <Link href="/" className="hover:text-ink">
            ← Back to Digital Web Assurances
          </Link>
        </footer>
      </article>
    </main>
  );
}
