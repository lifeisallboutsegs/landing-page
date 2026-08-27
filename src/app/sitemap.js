const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://developwitharim.com';

export default function sitemap() {
  const now = new Date();
  return [
    { url: `${SITE}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    {
      url: `${SITE}/tools/keyword-research`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ];
}
