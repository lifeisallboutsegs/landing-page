/**
 * Google PageSpeed Insights (Lighthouse + CrUX field data).
 *
 * This is the half of the audit that measures rather than inspects: a real
 * Lighthouse run on Google's infrastructure gives performance, SEO,
 * accessibility and best-practices scores, lab Core Web Vitals, and — when the
 * URL has enough Chrome traffic — real-world field data from the Chrome UX
 * Report.
 *
 * It is optional. Without PAGESPEED_API_KEY the public endpoint still works at a
 * low shared quota, so this is best-effort: any failure returns
 * `{ available: false, reason }` and the caller falls back to the on-page crawl
 * score alone. It must never throw the audit.
 */

const ENDPOINT = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';
// A cold Lighthouse run on a slow page routinely takes 20-30s.
const TIMEOUT_MS = Number(process.env.PAGESPEED_TIMEOUT_MS ?? 40000);

const CATEGORIES = ['performance', 'seo', 'accessibility', 'best-practices'];

/** Lab metric audits we surface as Core Web Vitals / loading facts. */
const METRIC_AUDITS = {
  lcp: 'largest-contentful-paint',
  cls: 'cumulative-layout-shift',
  tbt: 'total-blocking-time',
  fcp: 'first-contentful-paint',
  speedIndex: 'speed-index',
  tti: 'interactive',
};

/** CrUX field metrics, keyed the same way for a consistent shape. */
const FIELD_METRICS = {
  lcp: 'LARGEST_CONTENTFUL_PAINT_MS',
  cls: 'CUMULATIVE_LAYOUT_SHIFT_SCORE',
  inp: 'INTERACTION_TO_NEXT_PAINT',
  fcp: 'FIRST_CONTENTFUL_PAINT_MS',
  ttfb: 'EXPERIMENTAL_TIME_TO_FIRST_BYTE',
};

const pct = (score) => (typeof score === 'number' ? Math.round(score * 100) : null);

function toScores(categories = {}) {
  return {
    performance: pct(categories.performance?.score),
    seo: pct(categories.seo?.score),
    accessibility: pct(categories.accessibility?.score),
    bestPractices: pct(categories['best-practices']?.score),
  };
}

function toLabMetrics(audits = {}) {
  const out = {};
  for (const [key, id] of Object.entries(METRIC_AUDITS)) {
    const audit = audits[id];
    if (!audit) continue;
    out[key] = {
      value: typeof audit.numericValue === 'number' ? Math.round(audit.numericValue) : null,
      display: audit.displayValue ?? null,
      // Lighthouse scores each metric 0-1; < 0.9 is "needs improvement" or worse.
      rating: audit.score == null ? null : audit.score >= 0.9 ? 'good' : audit.score >= 0.5 ? 'needs-improvement' : 'poor',
    };
  }
  return out;
}

function toFieldData(loadingExperience) {
  const metrics = loadingExperience?.metrics;
  if (!metrics) return null;

  const out = { overall: loadingExperience.overall_category ?? null, metrics: {} };
  for (const [key, id] of Object.entries(FIELD_METRICS)) {
    const m = metrics[id];
    if (!m) continue;
    out.metrics[key] = {
      p75: m.percentile ?? null,
      category: m.category ?? null, // FAST | AVERAGE | SLOW
    };
  }
  return Object.keys(out.metrics).length ? out : null;
}

const SEVERITY_BY_SAVINGS = (ms) => (ms >= 2000 ? 'high' : ms >= 600 ? 'medium' : 'low');

/**
 * Lighthouse "opportunity" audits carry an estimated millisecond saving. We take
 * the biggest few and phrase them as fixes for the site owner, matching the
 * shape of the on-page crawl findings so they merge into one report.
 */
function toOpportunities(audits = {}) {
  const opps = [];
  for (const audit of Object.values(audits)) {
    const savings = audit?.details?.overallSavingsMs;
    if (audit?.details?.type !== 'opportunity' || !savings || savings < 150) continue;
    if (audit.score != null && audit.score >= 0.9) continue;
    opps.push({
      id: audit.id,
      severity: SEVERITY_BY_SAVINGS(savings),
      savingsMs: Math.round(savings),
      title: audit.title,
      detail:
        (audit.description ?? '').replace(/\s*\[Learn.*?\]\(.*?\)\.?/g, '').trim() ||
        `Lighthouse estimates roughly ${(savings / 1000).toFixed(1)}s could be saved here.`,
    });
  }
  return opps.sort((a, b) => b.savingsMs - a.savingsMs).slice(0, 5);
}

export async function runPageSpeed(rawUrl, { strategy = 'mobile' } = {}) {
  const params = new URLSearchParams({ url: rawUrl, strategy });
  for (const category of CATEGORIES) params.append('category', category);
  if (process.env.PAGESPEED_API_KEY) params.set('key', process.env.PAGESPEED_API_KEY);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let data;
  try {
    const response = await fetch(`${ENDPOINT}?${params}`, {
      signal: controller.signal,
      headers: { accept: 'application/json' },
    });
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      const reason = body?.error?.message ?? `PageSpeed API returned ${response.status}`;
      return { available: false, reason };
    }
    data = await response.json();
  } catch (error) {
    return {
      available: false,
      reason: error.name === 'AbortError' ? 'PageSpeed timed out' : 'PageSpeed request failed',
    };
  } finally {
    clearTimeout(timer);
  }

  const lh = data?.lighthouseResult;
  if (!lh?.categories) return { available: false, reason: 'PageSpeed returned no Lighthouse result' };

  return {
    available: true,
    strategy,
    testedUrl: lh.finalUrl ?? data.id ?? rawUrl,
    fetchedAt: lh.fetchTime ?? new Date().toISOString(),
    scores: toScores(lh.categories),
    metrics: toLabMetrics(lh.audits),
    // Page-level field data if this exact URL has enough traffic, else the
    // origin's. Null when Chrome has no data for either.
    field: toFieldData(data.loadingExperience) ?? toFieldData(data.originLoadingExperience),
    fieldScope: data.loadingExperience?.metrics ? 'page' : data.originLoadingExperience?.metrics ? 'origin' : null,
    opportunities: toOpportunities(lh.audits),
  };
}
