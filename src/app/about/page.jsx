import StandaloneNav from '@/components/StandaloneNav';
import { getPageContent, getTeam } from '@/server/content.js';
import { teamDefaults } from '@/lib/about-content.js';
import { companyPages } from '@/lib/site-pages';
import AboutView from './about-view.jsx';

// ISR: rendered from the CMS + team table, cached, refreshed on a short
// interval. Admin saves call revalidatePath('/about') so edits show at once.
export const revalidate = 120;

export const metadata = {
  title: 'About',
  description: companyPages.about.description,
  alternates: { canonical: '/about' },
};

export default async function AboutPage() {
  const [content, team] = await Promise.all([
    getPageContent('page:about'),
    getTeam(teamDefaults),
  ]);

  return (
    <main className="min-h-screen bg-paper text-ink">
      <header className="mx-auto w-full max-w-[1440px] px-6 py-6 sm:px-8 md:px-16">
        <StandaloneNav />
      </header>
      <AboutView content={content} team={team} />
    </main>
  );
}
