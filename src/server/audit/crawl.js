import * as cheerio from 'cheerio';

import { safeFetch } from './safe-fetch.js';

/**
 * On-page audit.
 *
 * Covers the checks the site's Diagnose section promises that PageSpeed
 * Insights does not do well: title/meta, heading order, canonical and
 * indexability, redirect chains, structured data, whether the page states an
 * offer, and how much friction its forms add. Performance and Core Web Vitals
 * come from PSI and are merged in alongside these.
 *
 * Every finding carries `severity` and a `fix` written for the site owner, not
 * for us — this report is the lead magnet, so it has to be useful on its own.
 */

const SEVERITY_WEIGHT = { critical: 25, high: 12, medium: 6, low: 2 };

function finding(id, severity, title, detail, fix) {
  return { id, severity, title, detail, fix };
}

/** Words that indicate the page actually makes an offer rather than describing itself. */
const OFFER_SIGNALS = [
  'free', 'book', 'get a quote', 'get started', 'contact', 'call', 'trial',
  'demo', 'consultation', 'enquire', 'inquiry', 'quote', 'audit', 'buy', 'order',
];

export async function crawl(rawUrl) {
  const page = await safeFetch(rawUrl);
  const $ = cheerio.load(page.html);
  const findings = [];

  // ---- Title -------------------------------------------------------------
  const title = $('head title').first().text().trim();
  if (!title) {
    findings.push(
      finding('title-missing', 'critical', 'No page title',
        'The page has no <title>, so search results and browser tabs fall back to the URL.',
        'Add a <title> of roughly 50-60 characters that names the outcome and the place.'),
    );
  } else if (title.length > 65) {
    findings.push(
      finding('title-long', 'medium', `Title is ${title.length} characters`,
        `Google truncates around 60. Yours: "${title}"`,
        'Trim to about 60 characters, keeping the most specific words first.'),
    );
  } else if (title.length < 15) {
    findings.push(
      finding('title-short', 'medium', `Title is only ${title.length} characters`,
        `"${title}" leaves ranking terms on the table.`,
        'Expand to roughly 50-60 characters describing what the page offers.'),
    );
  }

  // ---- Meta description --------------------------------------------------
  const description = $('head meta[name="description"]').attr('content')?.trim() ?? '';
  if (!description) {
    findings.push(
      finding('description-missing', 'high', 'No meta description',
        'Google will invent a snippet from page text, so you do not control the pitch in search results.',
        'Write 140-160 characters that state the offer and give a reason to click.'),
    );
  } else if (description.length > 165) {
    findings.push(
      finding('description-long', 'low', `Meta description is ${description.length} characters`,
        'It will be cut short in results.',
        'Trim to about 155 characters.'),
    );
  }

  // ---- Headings ----------------------------------------------------------
  const h1s = $('h1').map((_, el) => $(el).text().trim()).get().filter(Boolean);
  if (h1s.length === 0) {
    findings.push(
      finding('h1-missing', 'high', 'No H1 heading',
        'Nothing on the page declares its main subject.',
        'Add a single H1 that says what the page is for in the visitor’s language.'),
    );
  } else if (h1s.length > 1) {
    findings.push(
      finding('h1-multiple', 'medium', `${h1s.length} H1 headings`,
        `Competing main headings blur the topic: ${h1s.slice(0, 3).map((h) => `"${h}"`).join(', ')}`,
        'Keep one H1 and demote the rest to H2.'),
    );
  }

  // Heading order: a jump like H2 -> H4 breaks the document outline.
  const order = $('h1,h2,h3,h4,h5,h6').map((_, el) => Number(el.tagName[1])).get();
  let skipped = null;
  for (let i = 1; i < order.length; i += 1) {
    if (order[i] - order[i - 1] > 1) { skipped = [order[i - 1], order[i]]; break; }
  }
  if (skipped) {
    findings.push(
      finding('heading-skip', 'low', `Heading levels jump from H${skipped[0]} to H${skipped[1]}`,
        'Screen readers and crawlers both use heading order to understand structure.',
        'Step heading levels one at a time.'),
    );
  }

  // ---- Indexability ------------------------------------------------------
  const robotsMeta = ($('head meta[name="robots"]').attr('content') ?? '').toLowerCase();
  const xRobots = (page.headers.get('x-robots-tag') ?? '').toLowerCase();
  if (robotsMeta.includes('noindex') || xRobots.includes('noindex')) {
    findings.push(
      finding('noindex', 'critical', 'This page blocks indexing',
        `A noindex directive is present (${robotsMeta || xRobots}), so it cannot rank at all.`,
        'Remove the noindex unless the page is deliberately private.'),
    );
  }

  // ---- Canonical ---------------------------------------------------------
  const canonical = $('head link[rel="canonical"]').attr('href')?.trim();
  if (!canonical) {
    findings.push(
      finding('canonical-missing', 'medium', 'No canonical URL',
        'Without one, parameter and variant URLs can be treated as duplicates competing with each other.',
        'Add <link rel="canonical"> pointing at the preferred version of this page.'),
    );
  } else {
    try {
      const resolved = new URL(canonical, page.finalUrl);
      if (resolved.origin !== new URL(page.finalUrl).origin) {
        findings.push(
          finding('canonical-offsite', 'high', 'Canonical points to another domain',
            `This page hands its ranking to ${resolved.origin}.`,
            'Point the canonical at this domain unless the content genuinely lives elsewhere.'),
        );
      }
    } catch {
      findings.push(
        finding('canonical-invalid', 'medium', 'Canonical URL is malformed', `Found: "${canonical}"`,
          'Use an absolute https URL.'),
      );
    }
  }

  // ---- Redirect chain ----------------------------------------------------
  if (page.chain.length > 2) {
    findings.push(
      finding('redirect-chain', 'medium', `${page.chain.length - 1} redirects before the page loads`,
        page.chain.map((c) => `${c.status} ${c.url}`).join(' → '),
        'Point the first URL straight at the final one. Every hop costs time and leaks link equity.'),
    );
  }

  // ---- Structured data ---------------------------------------------------
  const jsonLd = $('script[type="application/ld+json"]');
  const schemaTypes = [];
  jsonLd.each((_, el) => {
    try {
      const parsed = JSON.parse($(el).contents().text());
      for (const node of [].concat(parsed['@graph'] ?? parsed)) {
        if (node?.['@type']) schemaTypes.push([].concat(node['@type']).join('/'));
      }
    } catch {
      findings.push(
        finding('schema-invalid', 'medium', 'Structured data is not valid JSON',
          'A JSON-LD block failed to parse, so Google will ignore it.',
          'Validate it with the Rich Results Test.'),
      );
    }
  });
  if (schemaTypes.length === 0) {
    findings.push(
      finding('schema-missing', 'medium', 'No structured data',
        'Nothing tells Google what kind of entity this page describes, so rich results are off the table.',
        'Add Organization and LocalBusiness JSON-LD, plus Service or Product where relevant.'),
    );
  }

  // ---- Social preview ----------------------------------------------------
  if (!$('head meta[property="og:title"]').attr('content')) {
    findings.push(
      finding('og-missing', 'low', 'No OpenGraph tags',
        'Shared links will render as a bare URL with no image or headline.',
        'Add og:title, og:description and og:image.'),
    );
  }

  // ---- Images ------------------------------------------------------------
  const images = $('img');
  const missingAlt = images.filter((_, el) => !$(el).attr('alt')?.trim()).length;
  if (missingAlt > 0) {
    findings.push(
      finding('img-alt', missingAlt > 5 ? 'medium' : 'low',
        `${missingAlt} of ${images.length} images have no alt text`,
        'Alt text is both an accessibility requirement and the only way image search can read them.',
        'Describe what each image shows. Leave alt="" only for purely decorative images.'),
    );
  }

  // ---- Weight ------------------------------------------------------------
  const scripts = $('script[src]').length;
  const blocking = $('head script[src]:not([async]):not([defer])').length;
  if (blocking > 0) {
    findings.push(
      finding('render-blocking', blocking > 3 ? 'high' : 'medium',
        `${blocking} render-blocking script${blocking === 1 ? '' : 's'} in <head>`,
        'The browser cannot paint anything until these finish downloading and executing.',
        'Add defer (or async) to each, or move them to the end of <body>.'),
    );
  }

  // ---- Commercial checks -------------------------------------------------
  const bodyText = $('body').text().toLowerCase().replace(/\s+/g, ' ');
  const hasOffer = OFFER_SIGNALS.some((signal) => bodyText.includes(signal));
  if (!hasOffer) {
    findings.push(
      finding('no-offer', 'high', 'The page never states an offer',
        'No call to action, booking, quote or contact language was found. Traffic has nothing to do when it arrives.',
        'Add one primary action, phrased as the thing the visitor actually wants.'),
    );
  }

  const forms = $('form');
  let worstForm = 0;
  forms.each((_, el) => {
    const fields = $(el).find('input:not([type=hidden]):not([type=submit]), select, textarea').length;
    if (fields > worstForm) worstForm = fields;
  });
  if (forms.length === 0) {
    findings.push(
      finding('no-form', 'medium', 'No form on the page',
        'Every enquiry has to happen somewhere else, which costs you the ones who would not bother.',
        'Add a short enquiry form asking only for what you need to reply.'),
    );
  } else if (worstForm > 6) {
    findings.push(
      finding('form-long', 'medium', `Longest form asks for ${worstForm} fields`,
        'Each additional field measurably reduces completions.',
        'Cut to the fields you genuinely need to respond — usually a name, an email and one question.'),
    );
  }

  // ---- Score -------------------------------------------------------------
  const penalty = findings.reduce((sum, f) => sum + (SEVERITY_WEIGHT[f.severity] ?? 0), 0);
  const score = Math.max(0, Math.min(100, 100 - penalty));

  return {
    url: page.finalUrl,
    requestedUrl: rawUrl,
    fetchedAt: new Date().toISOString(),
    score,
    summary: {
      title: title || null,
      titleLength: title.length,
      description: description || null,
      descriptionLength: description.length,
      h1: h1s,
      canonical: canonical ?? null,
      indexable: !(robotsMeta.includes('noindex') || xRobots.includes('noindex')),
      schemaTypes,
      images: images.length,
      imagesMissingAlt: missingAlt,
      scripts,
      renderBlockingScripts: blocking,
      forms: forms.length,
      longestFormFields: worstForm,
      redirects: page.chain.length - 1,
      redirectChain: page.chain,
      statesAnOffer: hasOffer,
    },
    findings: findings.sort(
      (a, b) => (SEVERITY_WEIGHT[b.severity] ?? 0) - (SEVERITY_WEIGHT[a.severity] ?? 0),
    ),
  };
}
