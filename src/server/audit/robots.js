/**
 * robots.txt and XML sitemap checks.
 *
 * These are the two files a crawler looks for before it reads anything else. A
 * robots.txt that blocks the whole site, or a missing/broken sitemap, are
 * common and quietly expensive mistakes, so the audit checks them directly
 * against the target's own origin.
 */

import { safeFetchText } from './safe-fetch.js';

/** Does any group that applies to all bots disallow the entire site? */
function blocksEverything(body) {
  const lines = body.split(/\r?\n/).map((l) => l.replace(/#.*/, '').trim());
  let appliesToAll = false;
  for (const line of lines) {
    const [rawField, ...rest] = line.split(':');
    if (!rest.length) continue;
    const field = rawField.trim().toLowerCase();
    const value = rest.join(':').trim();
    if (field === 'user-agent') appliesToAll = value === '*';
    else if (field === 'disallow' && appliesToAll && value === '/') return true;
    else if (field === 'allow' && appliesToAll && value === '/') return false;
  }
  return false;
}

export async function inspectRobots(origin) {
  const findings = [];
  const base = new URL(origin);

  const robots = await safeFetchText(new URL('/robots.txt', base).toString());
  let sitemapUrls = [];
  let robotsBlocksAll = false;

  if (!robots.ok || !robots.text.trim()) {
    findings.push({
      id: 'robots-missing', severity: 'low', title: 'No robots.txt',
      detail: 'Crawlers get a 404 where they expect crawl rules and your sitemap reference. Not fatal, but it is the standard place to point them at your sitemap.',
      fix: 'Add a robots.txt at the domain root, even a permissive one, with a "Sitemap:" line.',
    });
  } else {
    robotsBlocksAll = blocksEverything(robots.text);
    if (robotsBlocksAll) {
      findings.push({
        id: 'robots-blocks-all', severity: 'critical', title: 'robots.txt blocks the entire site',
        detail: 'A "Disallow: /" rule for all user-agents tells every search engine to stay out. Nothing on the site can be crawled or ranked.',
        fix: 'Remove or narrow the "Disallow: /" rule unless the site is meant to be invisible.',
      });
    }
    sitemapUrls = [...robots.text.matchAll(/^\s*sitemap:\s*(\S+)/gim)].map((m) => m[1]);
  }

  // Fall back to the conventional location if robots.txt did not name one.
  const sitemapToCheck = sitemapUrls[0] ?? new URL('/sitemap.xml', base).toString();
  const sitemap = await safeFetchText(sitemapToCheck, { accept: 'application/xml,text/xml,*/*' });
  const looksLikeXml = /<(urlset|sitemapindex)[\s>]/i.test(sitemap.text);
  const urlCount = (sitemap.text.match(/<loc>/gi) ?? []).length;

  if (!sitemap.ok || !looksLikeXml) {
    findings.push({
      id: 'sitemap-missing', severity: sitemapUrls.length ? 'medium' : 'low',
      title: sitemapUrls.length ? 'The sitemap in robots.txt does not load' : 'No XML sitemap found',
      detail: sitemapUrls.length
        ? `robots.txt points at ${sitemapToCheck}, but it did not return valid sitemap XML.`
        : 'Nothing at /sitemap.xml and none referenced in robots.txt. Search engines then have to discover every page by following links.',
      fix: 'Generate an XML sitemap, host it at a stable URL, and reference it from robots.txt.',
    });
  }

  return {
    robotsFound: robots.ok && Boolean(robots.text.trim()),
    robotsBlocksAll,
    sitemapUrl: looksLikeXml ? sitemapToCheck : null,
    sitemapUrlCount: looksLikeXml ? urlCount : 0,
    findings,
  };
}
