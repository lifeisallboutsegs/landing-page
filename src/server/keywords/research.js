import * as suggest from './providers/suggest.js';
import { analyzeSerps } from './serp.js';

/**
 * Keyword research, provider-agnostic.
 *
 * The free provider gives real phrases but no search volume. Google Ads
 * Keyword Planner gives real volume but needs an approved developer token, so
 * it slots in here later as a second provider without the caller changing.
 * Whatever the source, every row carries `volumeSource` so the UI can never
 * present a guess as if it were measured data.
 */

const PROVIDERS = { suggest };

/** Commercial intent, inferred from the words themselves. */
const INTENT_RULES = [
  { intent: 'transactional', weight: 3, words: ['buy', 'price', 'pricing', 'cost', 'quote', 'hire', 'order', 'cheap', 'affordable', 'deal', 'package'] },
  { intent: 'commercial', weight: 2, words: ['best', 'top', 'review', 'vs', 'versus', 'alternative', 'compare', 'agency', 'company', 'service', 'services', 'near me', 'consultant'] },
  { intent: 'informational', weight: 1, words: ['how', 'what', 'why', 'when', 'guide', 'tutorial', 'example', 'ideas', 'tips', 'meaning'] },
];

function classifyIntent(keyword) {
  for (const rule of INTENT_RULES) {
    if (rule.words.some((w) => keyword.includes(w))) {
      return { intent: rule.intent, intentWeight: rule.weight };
    }
  }
  return { intent: 'navigational', intentWeight: 1 };
}

/**
 * Difficulty proxy.
 *
 * Real difficulty needs backlink data we do not have. What we can say honestly
 * is that longer, more specific phrases are typically easier to rank for than
 * short head terms — so this is presented as an estimate, and named one.
 */
function estimateDifficulty(keyword, prominence) {
  const words = keyword.split(/\s+/).length;
  let score = 70;
  score -= (words - 1) * 9; // long tail is easier
  score += Math.min(prominence, 6) * 2; // widely suggested implies more competition
  if (keyword.includes('near me')) score -= 8; // local intent narrows the field
  return Math.max(5, Math.min(95, Math.round(score)));
}

/** Groups keywords by their most meaningful shared token, for content planning. */
function cluster(rows, seed) {
  const stop = new Set([
    'the', 'a', 'an', 'for', 'to', 'of', 'in', 'on', 'and', 'or', 'my', 'your',
    'is', 'are', 'with', 'best', 'how', ...seed.split(/\s+/),
  ]);

  const groups = new Map();
  for (const row of rows) {
    const token =
      row.keyword.split(/\s+/).find((w) => w.length > 2 && !stop.has(w)) ?? 'general';
    if (!groups.has(token)) groups.set(token, []);
    groups.get(token).push(row.keyword);
  }

  return [...groups.entries()]
    .filter(([, members]) => members.length > 1)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 12)
    .map(([topic, keywords]) => ({ topic, count: keywords.length, keywords: keywords.slice(0, 8) }));
}

export async function research(seed, options = {}) {
  const providerId = options.provider ?? process.env.KEYWORD_PROVIDER ?? 'suggest';
  const provider = PROVIDERS[providerId] ?? suggest;

  const raw = await provider.expand(seed, options);

  const place = (options.location ?? '').trim().toLowerCase();

  const rows = raw
    .filter((row) => row.keyword !== seed.trim().toLowerCase())
    // When a location is asked for, drop suggestions anchored to a different
    // place. Autocomplete happily returns "roof repair in karol bagh" for a
    // London query, and shipping that to a client would be embarrassing.
    .filter((row) => !place || !/\b(in|near)\s+\w/.test(row.keyword) || row.keyword.includes(place))
    .map((row) => {
      const { intent, intentWeight } = classifyIntent(row.keyword);
      const difficulty = estimateDifficulty(row.keyword, row.prominence);
      return {
        keyword: row.keyword,
        words: row.keyword.split(/\s+/).length,
        intent,
        intentWeight,
        difficulty,
        difficultySource: 'estimate',
        serpSignals: null,
        // Null until a provider that actually measures volume is configured.
        volume: row.volume ?? null,
        volumeSource: provider.providesVolume ? provider.id : null,
        prominence: row.prominence,
        sources: row.sources,
        // Ranks easy + commercially valuable first: what to write next.
        opportunity: Math.round(((100 - difficulty) / 100) * intentWeight * 100) / 10,
      };
    })
    .sort((a, b) => b.opportunity - a.opportunity);

  // Ground difficulty for the most promising phrases in their live SERP rather
  // than in phrase structure. Bounded to the top slice so the request count
  // stays polite; 'shallow' skips it for speed.
  const depth = options.depth ?? 'standard';
  let serpChecked = 0;
  if (depth !== 'shallow' && rows.length) {
    const lookN = depth === 'deep' ? 24 : 14;
    const targets = rows.slice(0, lookN);
    const serp = await analyzeSerps(targets.map((r) => r.keyword), {
      concurrency: Number(process.env.KEYWORDS_SERP_CONCURRENCY ?? 4),
    });
    for (const row of targets) {
      const hit = serp.get(row.keyword);
      if (!hit) continue;
      row.difficulty = hit.difficulty;
      row.difficultySource = 'serp';
      row.serpSignals = hit.signals;
      row.opportunity =
        Math.round(((100 - hit.difficulty) / 100) * row.intentWeight * 100) / 10;
      serpChecked += 1;
    }
    rows.sort((a, b) => b.opportunity - a.opportunity);
  }

  for (const row of rows) delete row.intentWeight;

  const disclaimer = provider.providesVolume
    ? null
    : serpChecked > 0
      ? `Phrases are real search suggestions from Google, Bing and DuckDuckGo. Difficulty for the top ${serpChecked} is scored from a live analysis of who currently ranks for each one (site authority, exact-match titles, forum results); the rest is estimated from phrase structure. None of this is measured search volume — connect Google Ads Keyword Planner for that.`
      : 'These are real phrases people search, ranked by the engines’ own suggestion ordering. Difficulty and opportunity are estimates from phrase structure and intent — not measured search volume. Connect Google Ads Keyword Planner for true volume figures.';

  return {
    seed: seed.trim().toLowerCase(),
    provider: { id: provider.id, label: provider.label, providesVolume: provider.providesVolume },
    generatedAt: new Date().toISOString(),
    total: rows.length,
    serpChecked,
    disclaimer,
    clusters: cluster(rows, seed),
    keywords: rows.slice(0, options.limit ?? 150),
  };
}

export const availableProviders = Object.values(PROVIDERS).map((p) => ({
  id: p.id,
  label: p.label,
  providesVolume: p.providesVolume,
}));
