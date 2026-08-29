/**
 * SERP-grounded keyword difficulty.
 *
 * The old difficulty number was a guess from phrase length. This replaces it
 * with a look at who actually ranks: for each keyword we pull the real results
 * page from Bing (which, unlike Google and DuckDuckGo, answers server-side
 * requests) and score how hard that first page looks to break into —
 *
 *  - big-brand / high-authority domains present (harder)
 *  - result titles that exactly match the phrase (well-optimised competition)
 *  - forum / Q&A / user-generated results ranking (a gap — easier)
 *  - how many distinct domains hold the page (a single site owning it = entrenched)
 *  - paid ads on the query (commercial competition, confirms intent)
 *
 * It is still an estimate — real difficulty needs link-graph data nobody gives
 * away — and it is best-effort: if the SERP can't be read, the caller keeps its
 * own phrase-structure estimate for that keyword. Every input here is a measured
 * property of the live results page, not a property of the string.
 */

import * as cheerio from 'cheerio';

const TIMEOUT_MS = 7000;

// Domains that, when they rank, mean you are competing with serious SEO budgets
// or an unassailable brand. Substring match, so subdomains and TLD variants count.
const AUTHORITY = [
  'wikipedia.org', 'amazon.', 'youtube.com', 'facebook.com', 'linkedin.com',
  'instagram.com', 'apple.com', 'microsoft.com', 'nytimes.com', 'forbes.com',
  'theguardian.com', 'bbc.co.uk', 'bbc.com', 'hubspot.com', 'shopify.com',
  'medium.com', 'yelp.com', 'tripadvisor.', 'indeed.com', 'glassdoor.com',
  'healthline.com', 'webmd.com', 'investopedia.com', 'techradar.com', 'pcmag.com',
  'cnet.com', 'wirecutter.com', 'which.co.uk', 'trustpilot.com', 'gov.uk',
];

// User-generated results ranking on page one usually means weak dedicated
// competition — a real opening for a purpose-built page.
const UGC = ['reddit.com', 'quora.com', 'stackexchange.com', 'stackoverflow.com', 'medium.com', 'facebook.com'];

const GOV_EDU = /\.(gov|edu|gov\.[a-z]{2}|ac\.[a-z]{2})$/;

/** Bing shows the display URL in a <cite>; the first token is the domain. */
function citeDomain(text) {
  const first = (text || '').trim().split(/[\s›>|]/)[0] || '';
  return first
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .replace(/\/.*$/, '')
    .toLowerCase() || null;
}

async function fetchSerp(keyword) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(
      `https://www.bing.com/search?q=${encodeURIComponent(keyword)}&form=QBLH&setmkt=en-GB`,
      {
        signal: controller.signal,
        headers: {
          'user-agent':
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0 Safari/537.36',
          accept: 'text/html,application/xhtml+xml',
          'accept-language': 'en-GB,en;q=0.9',
          cookie: '_EDGE_S=mkt=en-gb',
        },
      },
    );
    if (!response.ok) return null;
    return await response.text();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** Turns one results page into a difficulty score and the signals behind it. */
function scoreSerp(html, keyword) {
  const $ = cheerio.load(html);
  const results = [];

  $('li.b_algo').each((_, el) => {
    const domain = citeDomain($(el).find('cite').first().text());
    if (!domain) return;
    results.push({ domain, title: $(el).find('h2').text().trim().toLowerCase() });
  });

  if (results.length < 3) return null; // a blocked or empty page — don't trust it

  const adCount = $('.b_ad li.b_algo, .b_ad li.b_ad, .sb_adTA').length;
  const phrase = keyword.toLowerCase();
  const domains = new Set(results.map((r) => r.domain));

  const authorityHits = results.filter(
    (r) => AUTHORITY.some((a) => r.domain.includes(a)) || GOV_EDU.test(r.domain),
  ).length;
  const ugcHits = results.filter((r) => UGC.some((u) => r.domain.endsWith(u))).length;
  const exactTitleHits = results.filter((r) => r.title.includes(phrase)).length;

  let difficulty = 32;
  difficulty += Math.min(authorityHits, 6) * 8;
  difficulty += Math.min(exactTitleHits, 6) * 3;
  difficulty -= Math.min(ugcHits, 4) * 7;
  difficulty += adCount >= 3 ? 10 : adCount > 0 ? 4 : -4;
  difficulty += domains.size <= 4 ? 6 : domains.size >= 9 ? -3 : 0;

  return {
    difficulty: Math.max(5, Math.min(95, Math.round(difficulty))),
    signals: {
      resultsSeen: results.length,
      distinctDomains: domains.size,
      authorityDomains: authorityHits,
      ugcResults: ugcHits,
      exactMatchTitles: exactTitleHits,
      ads: adCount,
    },
  };
}

/**
 * Analyses the SERP for each keyword, `concurrency` at a time. Returns a Map
 * keyed by keyword; keywords whose SERP could not be read are simply absent, so
 * the caller falls back to its own estimate for those.
 */
export async function analyzeSerps(keywords, { concurrency = 4 } = {}) {
  const out = new Map();
  const queue = [...keywords];

  async function worker() {
    while (queue.length) {
      const keyword = queue.shift();
      const html = await fetchSerp(keyword);
      if (!html) continue;
      const scored = scoreSerp(html, keyword);
      if (scored) out.set(keyword, scored);
    }
  }

  await Promise.all(Array.from({ length: Math.max(1, Math.min(concurrency, queue.length)) }, worker));
  return out;
}
