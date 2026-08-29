import App from '@/App';
import { getPageContent } from '@/server/content.js';

/**
 * The home route is a server component so its metadata and CMS copy are
 * resolved server-side; the scroll narrative itself is a client component
 * because every snap depends on scroll position, WebGL and pointer events.
 */
export const revalidate = 120;

export async function generateMetadata() {
  const g = await getPageContent('site:global');
  return {
    title: g.metaTitle,
    description: g.metaDescription,
    alternates: { canonical: '/' },
  };
}

export default async function HomePage() {
  const [home, global] = await Promise.all([
    getPageContent('page:home'),
    getPageContent('site:global'),
  ]);
  return <App content={{ home, global }} />;
}
