/**
 * Keyword ideas from public autocomplete endpoints.
 *
 * These are the suggestion APIs a browser's search box calls as you type. They
 * are public, unauthenticated, return JSON, and are not scraped out of a results
 * page — so this does not break every time a SERP layout changes.
 *
 * What they give us is real: the actual phrases people type, ranked by the
 * engine's own popularity ordering. What they do NOT give us is search volume.
 * Anything claiming to derive absolute monthly volume from autocomplete is
 * guessing, so this provider reports `volume: null` and the UI must say so.
 */

const TIMEOUT_MS = 8000;
const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'.split('');

// Question and comparison prefixes surface intent that the bare seed misses.
const MODIFIERS = [
  'how to', 'what is', 'why', 'best', 'cheap', 'near me',
  'vs', 'alternative', 'cost', 'price', 'services', 'agency', 'for',
];

async function fetchJson(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'user-agent': 'DWA-Keyword-Research/1.0 (+https://digitalwebassurances.com)',
        accept: 'application/json,text/javascript,*/*',
      },
    });
    if (!response.ok) return null;
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch {
      return null;
    }
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** Google's autocomplete endpoint. Returns [query, [suggestions], ...]. */
async function google(seed, { language, country }) {
  const url =
    'https://suggestqueries.google.com/complete/search?client=firefox' +
    `&hl=${encodeURIComponent(language)}&gl=${encodeURIComponent(country)}` +
    `&q=${encodeURIComponent(seed)}`;
  const data = await fetchJson(url);
  return Array.isArray(data?.[1]) ? data[1] : [];
}

/** DuckDuckGo's endpoint. Independent of Google, so it widens coverage. */
async function duckduckgo(seed) {
  const data = await fetchJson(
    `https://duckduckgo.com/ac/?q=${encodeURIComponent(seed)}&type=list`,
  );
  if (Array.isArray(data?.[1])) return data[1];
  if (Array.isArray(data)) return data.map((d) => d?.phrase).filter(Boolean);
  return [];
}

/**
 * Expands one seed into many by re-querying with each letter and modifier
 * appended — the technique every keyword tool uses under the hood. Requests run
 * in small batches so we stay polite rather than firing 40 at once.
 */
export async function expand(seed, { language = 'en', country = 'us', depth = 'standard' } = {}) {
  const term = seed.trim().toLowerCase();
  if (!term) return [];

  const variants = [term];
  if (depth !== 'shallow') {
    variants.push(...MODIFIERS.map((m) => (m === 'vs' || m === 'for' ? `${term} ${m}` : `${m} ${term}`)));
  }
  if (depth === 'deep') {
    variants.push(...ALPHABET.map((letter) => `${term} ${letter}`));
  }

  // rank = position in the engine's own ordering; lower is more popular.
  const hits = new Map();
  const record = (phrase, source, rank) => {
    const key = phrase.trim().toLowerCase();
    if (!key || key.length < 2) return;
    const existing = hits.get(key);
    if (existing) {
      existing.sources.add(source);
      existing.bestRank = Math.min(existing.bestRank, rank);
      existing.seen += 1;
    } else {
      hits.set(key, { keyword: key, sources: new Set([source]), bestRank: rank, seen: 1 });
    }
  };

  const BATCH = 5;
  for (let i = 0; i < variants.length; i += BATCH) {
    const batch = variants.slice(i, i + BATCH);
    await Promise.all(
      batch.map(async (variant) => {
        const [g, d] = await Promise.all([
          google(variant, { language, country }),
          duckduckgo(variant),
        ]);
        g.forEach((phrase, index) => record(phrase, 'google', index));
        d.forEach((phrase, index) => record(phrase, 'duckduckgo', index));
      }),
    );
  }

  return [...hits.values()].map((hit) => ({
    keyword: hit.keyword,
    sources: [...hit.sources],
    // How often the phrase resurfaced across different expansions. A proxy for
    // prominence, explicitly NOT a volume figure.
    prominence: hit.seen,
    bestRank: hit.bestRank,
  }));
}

export const id = 'suggest';
export const label = 'Autocomplete (free)';
export const providesVolume = false;
