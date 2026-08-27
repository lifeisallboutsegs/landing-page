import MarketingPage from '@/components/MarketingPage';
import { companyPages } from '@/lib/site-pages';
export const metadata = { title: 'Contact', description: companyPages.contact.description, alternates: { canonical: '/contact' } };
export default function ContactPage() { return <MarketingPage page={companyPages.contact} />; }
