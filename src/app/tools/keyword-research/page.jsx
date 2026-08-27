import KeywordTool from './keyword-tool.jsx';

/**
 * A standalone route rather than another scroll snap: "free keyword research
 * tool" is itself a search term, and a tool that ranks is a lead source that
 * does not cost ad spend. Server component so the copy is in the HTML.
 */
export const metadata = {
  title: 'Free keyword research tool',
  description:
    'Find the phrases people actually search for around your service, grouped by intent and ranked by opportunity. No account, no credit card.',
  alternates: { canonical: '/tools/keyword-research' },
  openGraph: {
    title: 'Free keyword research tool | Digital Web Assurances',
    description:
      'Real search phrases, grouped by intent and ranked by opportunity. No account required.',
    url: '/tools/keyword-research',
  },
};

export default function KeywordResearchPage() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <div className="mx-auto w-full max-w-[1100px] px-8 py-24 md:px-12">
        <a
          href="/"
          className="mb-12 inline-block text-[0.85rem] font-medium text-ink-soft transition-colors hover:text-ink"
        >
          ← Digital Web Assurances
        </a>

        <span className="mb-5 block text-[0.8rem] font-semibold tracking-tight text-cobalt">
          Free tool
        </span>
        <h1 className="mb-6 max-w-3xl text-[clamp(2.1rem,4.4vw,3.6rem)] font-semibold leading-[1.04] tracking-[-0.04em]">
          Find what your customers are actually typing.
        </h1>
        <p className="mb-14 max-w-2xl text-[1.05rem] leading-relaxed text-ink-soft">
          Enter the service you sell and where you sell it. We expand it against live search
          suggestions, group the results by what the searcher wants, and rank them by how winnable
          they look.
        </p>

        <KeywordTool />
      </div>
    </main>
  );
}
