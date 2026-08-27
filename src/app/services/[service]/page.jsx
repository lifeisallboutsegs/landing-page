import { notFound } from 'next/navigation';
import MarketingPage from '@/components/MarketingPage';
import { services } from '@/lib/site-pages';

export function generateStaticParams() {
  return Object.keys(services).map((service) => ({ service }));
}

export async function generateMetadata({ params }) {
  const { service } = await params;
  const page = services[service];
  if (!page) return {};
  return {
    title: page.label,
    description: page.description,
    alternates: { canonical: `/services/${service}` },
    openGraph: { title: `${page.label} | Digital Web Assurances`, description: page.description, url: `/services/${service}` },
  };
}

export default async function ServicePage({ params }) {
  const { service } = await params;
  const page = services[service];
  if (!page) notFound();
  return <MarketingPage page={page} kind="Service" />;
}
