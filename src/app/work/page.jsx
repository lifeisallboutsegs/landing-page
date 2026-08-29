import MarketingPage from '@/components/MarketingPage';
import { getPageContent } from '@/server/content.js';

export const revalidate = 120;

export async function generateMetadata() {
  const page = await getPageContent('page:work');
  return { title: 'Work', description: page.description, alternates: { canonical: '/work' } };
}

export default async function WorkPage() {
  const page = await getPageContent('page:work');
  return <MarketingPage page={page} slug="work" />;
}
