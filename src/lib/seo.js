export const PRODUCTION_SITE_URL = 'https://developwitharim.com';

export const DEFAULT_META_DESCRIPTION =
  'Websites, SEO, Google and Meta Ads, and server-side tracking—one team taking customers from their first search through to a measurable sale.';

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1']);

/**
 * Keep public URLs on the real origin in production, even if a copied local
 * environment file accidentally leaves NEXT_PUBLIC_SITE_URL set to localhost.
 */
export function getSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;

  if (configured) {
    try {
      const url = new URL(configured);
      const isLocal = LOCAL_HOSTS.has(url.hostname);

      if (process.env.NODE_ENV !== 'production' || !isLocal) {
        return url.origin;
      }
    } catch {
      // Fall through to the known production origin.
    }
  }

  return PRODUCTION_SITE_URL;
}

export function conciseMetaDescription(value) {
  const description = value?.trim();
  return description && description.length <= 165 ? description : DEFAULT_META_DESCRIPTION;
}
