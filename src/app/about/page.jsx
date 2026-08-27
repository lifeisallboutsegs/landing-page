import MarketingPage from '@/components/MarketingPage';
import { companyPages } from '@/lib/site-pages';
export const metadata = { title: 'About', description: companyPages.about.description, alternates: { canonical: '/about' } };
export default function AboutPage() { return <MarketingPage page={companyPages.about} />; }
