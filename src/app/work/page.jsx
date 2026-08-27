import MarketingPage from '@/components/MarketingPage';
import { companyPages } from '@/lib/site-pages';
export const metadata = { title: 'Work', description: companyPages.work.description, alternates: { canonical: '/work' } };
export default function WorkPage() { return <MarketingPage page={companyPages.work} />; }
