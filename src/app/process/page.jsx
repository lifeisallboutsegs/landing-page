import MarketingPage from '@/components/MarketingPage';
import { getPageContent } from '@/server/content.js';

export const revalidate = 120;

export async function generateMetadata() {
  const page = await getPageContent('page:process');
  return { title: 'Process', description: page.description, alternates: { canonical: '/process' } };
}

export default async function ProcessPage() {
  const page = await getPageContent('page:process');
  return <MarketingPage page={page} slug="process" />;
}
