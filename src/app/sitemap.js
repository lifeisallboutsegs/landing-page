import { companyPages as company, services } from '@/lib/site-pages';
import { getSiteUrl } from '@/lib/seo';

export default function sitemap() {
  const site = getSiteUrl();
  const now = new Date();

  // Derived from the page catalogue so a new service or company page is picked
  // up automatically and the sitemap can never silently drift out of date.
  const servicePages = Object.keys(services).map((slug) => ({
    url: `${site}/services/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  const companyPages = Object.keys(company).map((slug) => ({
    url: `${site}/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: slug === 'contact' ? 0.7 : 0.6,
  }));

  const legalPages = ['privacy', 'terms'].map((slug) => ({
    url: `${site}/${slug}`,
    lastModified: now,
    changeFrequency: 'yearly',
    priority: 0.2,
  }));

  return [
    { url: `${site}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    {
      url: `${site}/tools/keyword-research`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    { url: `${site}/services`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    ...servicePages,
    ...companyPages,
    ...legalPages,
  ];
}
