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
  // The heading and intro live inside the client component so they can collapse
  // once results arrive — without that, every query pushes the table below the
  // fold. They are still server-rendered into the HTML, so nothing is lost to
  // crawlers.
  return (
    <main className="h-screen overflow-hidden bg-paper text-ink">
      <KeywordTool />
    </main>
  );
}
