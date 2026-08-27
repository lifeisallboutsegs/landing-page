const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://digitalwebassurances.com';

export default function sitemap() {
  const now = new Date();
  const servicePages = [
    'landing-pages',
    'websites',
    'seo',
    'google-ads',
    'conversion-review',
  ].map((service) => ({
    url: `${SITE}/services/${service}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  const companyPages = ['about', 'work', 'process', 'contact'].map((page) => ({
    url: `${SITE}/${page}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: page === 'contact' ? 0.7 : 0.6,
  }));

  return [
    { url: `${SITE}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    {
      url: `${SITE}/tools/keyword-research`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    ...servicePages,
    ...companyPages,
  ];
}
