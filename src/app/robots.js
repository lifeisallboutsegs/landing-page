const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://digitalwebassurances.com';

/**
 * Generated rather than a static file so the sitemap URL always matches the
 * deployed origin. /admin and the API are kept out of the index — an admin
 * login page in search results is only ever a liability.
 */
export default function robots() {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/admin/', '/api/'] }],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
