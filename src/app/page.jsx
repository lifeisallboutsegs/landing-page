import App from '@/App';

/**
 * The home route is a server component so its metadata is rendered into the
 * HTML; the scroll narrative itself is a client component because every snap
 * depends on scroll position, WebGL and pointer events.
 */
export const metadata = {
  title: 'Landing pages, SEO and Google Ads that work as one system',
  description:
    'We design landing pages around what a visitor needs to see, understand and do next — then point search and paid traffic at them. Free technical SEO audit, no sales call attached.',
  alternates: { canonical: '/' },
};

export default function HomePage() {
  return <App />;
}
