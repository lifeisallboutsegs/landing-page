import App from '@/App';
import { conciseMetaDescription, getSiteUrl } from '@/lib/seo';
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
    description: conciseMetaDescription(g.metaDescription),
    alternates: { canonical: '/' },
  };
}

export default async function HomePage() {
  const [home, global] = await Promise.all([
    getPageContent('page:home'),
    getPageContent('site:global'),
  ]);
  const siteUrl = getSiteUrl();
  const organizationId = `${siteUrl}/#organization`;
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': organizationId,
        name: global.siteName,
        alternateName: 'DWA',
        url: `${siteUrl}/`,
        logo: `${siteUrl}/assets/dwa-mark.jpg`,
        email: global.contactEmail,
        telephone: global.contactPhone,
        founder: { '@type': 'Person', name: 'Siddik Arim' },
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'sales',
          email: global.contactEmail,
          telephone: global.contactPhone,
          availableLanguage: ['English', 'Bengali'],
        },
      },
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        url: `${siteUrl}/`,
        name: global.siteName,
        alternateName: 'DWA',
        publisher: { '@id': organizationId },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }}
      />
      <App content={{ home, global }} />
    </>
  );
}
