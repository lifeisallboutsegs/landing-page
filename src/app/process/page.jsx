import MarketingPage from '@/components/MarketingPage';
import { companyPages } from '@/lib/site-pages';
export const metadata = { title: 'Process', description: companyPages.process.description, alternates: { canonical: '/process' } };
export default function ProcessPage() { return <MarketingPage page={companyPages.process} />; }
