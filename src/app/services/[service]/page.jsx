import { notFound } from 'next/navigation';
import MarketingPage from '@/components/MarketingPage';
import { services } from '@/lib/site-pages';
import { getPageContent } from '@/server/content.js';

export const revalidate = 120;

export function generateStaticParams() {
  return Object.keys(services).map((service) => ({ service }));
}

export async function generateMetadata({ params }) {
  const { service } = await params;
  if (!services[service]) return {};
  const page = await getPageContent(`service:${service}`);
  return {
    title: page.label,
    description: page.description,
    alternates: { canonical: `/services/${service}` },
    openGraph: {
      title: `${page.label} | Digital Web Assurances`,
      description: page.description,
      url: `/services/${service}`,
    },
  };
}

export default async function ServicePage({ params }) {
  const { service } = await params;
  if (!services[service]) notFound();
  const page = await getPageContent(`service:${service}`);
  return <MarketingPage page={page} kind="Service" slug={service} />;
}
