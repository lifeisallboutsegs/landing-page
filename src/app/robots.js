import { getSiteUrl } from '@/lib/seo';

/**
 * Generated rather than a static file so the sitemap URL always matches the
 * deployed origin. /admin and the API are kept out of the index — an admin
 * login page in search results is only ever a liability.
 */
export default function robots() {
  const site = getSiteUrl();

  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/admin/', '/api/'] }],
    sitemap: `${site}/sitemap.xml`,
    host: site,
  };
}
