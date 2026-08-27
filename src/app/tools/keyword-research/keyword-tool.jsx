'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';

const INTENT_TONE = {
  transactional: 'bg-emerald-100 text-emerald-800',
  commercial: 'bg-cobalt/10 text-cobalt',
  informational: 'bg-amber-100 text-amber-800',
  navigational: 'bg-zinc-100 text-zinc-600',
};

/** Difficulty is an estimate, so it is shown as a bar rather than a hard number. */
function DifficultyBar({ value }) {
  const tone = value < 30 ? 'bg-emerald-500' : value < 60 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <span className="flex items-center gap-2">
      <span className="h-1.5 w-16 overflow-hidden rounded-full bg-line">
        <motion.span
          className={`block h-full rounded-full ${tone}`}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        />
      </span>
      <span className="w-6 text-[0.78rem] tabular-nums text-ink-faint">{value}</span>
    </span>
  );
}

export default function KeywordTool() {
  const [seed, setSeed] = useState('');
  const [location, setLocation] = useState('');
  const [depth, setDepth] = useState('standard');
  const [status, setStatus] = useState('idle');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [intentFilter, setIntentFilter] = useState('all');

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!seed.trim()) return;

    setStatus('running');
    setError(null);
    setData(null);

    try {
      const response = await fetch('/api/keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seed, location, depth }),
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        setStatus('error');
        setError(payload.error ?? 'Could not fetch suggestions.');
        return;
      }

      setData(payload);
      setStatus('done');
    } catch {
      setStatus('error');
      setError('Could not reach the research service.');
    }
  };

  const rows =
    data?.keywords.filter((k) => intentFilter === 'all' || k.intent === intentFilter) ?? [];

  const field =
    'h-11 w-full rounded-none border-0 border-b border-line bg-transparent px-0 text-[0.95rem] outline-none transition-colors focus:border-cobalt placeholder:text-ink-faint';

  const hasResults = Boolean(data);

  return (
    <div className="flex h-screen flex-col">
      {/* Header collapses once there are results: the table then starts near the
          top of the viewport instead of being pushed below the fold. */}
      <div className="shrink-0 border-b border-line px-8 md:px-12">
        <div className="mx-auto w-full max-w-[1240px]">
          <motion.div
            initial={false}
            animate={{
              height: hasResults ? 56 : 'auto',
              opacity: 1,
            }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            {hasResults ? (
              <div className="flex h-14 items-center gap-4">
                <a href="/" className="text-[0.85rem] font-medium text-ink-soft hover:text-ink">
                  ← DWA
                </a>
                <span className="text-[0.85rem] text-ink-faint">Keyword research</span>
              </div>
            ) : (
              <div className="pt-16 pb-2">
                <a
                  href="/"
                  className="mb-10 inline-block text-[0.85rem] font-medium text-ink-soft transition-colors hover:text-ink"
                >
                  ← Digital Web Assurances
                </a>
                <span className="mb-4 block text-[0.8rem] font-semibold tracking-tight text-cobalt">
                  Free tool
                </span>
                <h1 className="mb-5 max-w-3xl text-[clamp(1.9rem,4vw,3.2rem)] font-semibold leading-[1.04] tracking-[-0.04em]">
                  Find what your customers are actually typing.
                </h1>
                <p className="mb-8 max-w-2xl text-[1rem] leading-relaxed text-ink-soft">
                  Enter the service you sell and where you sell it. We expand it against live
                  search suggestions, group the results by what the searcher wants, and rank them
                  by how winnable they look.
                </p>
              </div>
            )}
          </motion.div>

          {/* The form stays put across both states so submitting never moves it. */}
          <form
            onSubmit={onSubmit}
            className="grid grid-cols-1 gap-6 pb-5 md:grid-cols-[1.2fr_1fr_auto_auto] md:items-end md:gap-8"
          >
            <label className="block">
              <span className="mb-1.5 block text-[0.72rem] font-medium tracking-tight text-ink-soft">
                What do you sell?
              </span>
              <input
                value={seed}
                onChange={(e) => setSeed(e.target.value)}
                placeholder="roof repair"
                className={field}
                required
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-[0.72rem] font-medium tracking-tight text-ink-soft">
                Where? <span className="text-ink-faint">(optional)</span>
              </span>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="London"
                className={field}
              />
            </label>

            <div className="flex gap-1.5">
              {['shallow', 'standard', 'deep'].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDepth(d)}
                  title={d === 'deep' ? 'Slower, many more phrases' : d === 'shallow' ? 'Fastest' : 'Balanced'}
                  className={`rounded-full border px-3 py-1.5 text-[0.75rem] capitalize transition-all duration-300 ${
                    depth === d
                      ? 'border-ink bg-ink text-white'
                      : 'border-line text-ink-soft hover:border-ink/40'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={status === 'running'}
              className="h-11 rounded-full bg-ink px-7 text-[0.88rem] font-medium text-white transition-transform duration-200 active:scale-[0.98] disabled:opacity-60"
            >
              {status === 'running' ? 'Researching…' : 'Find keywords'}
            </button>
          </form>
        </div>
      </div>

      {/* Chrome stays fixed; only the table scrolls, so the first rows are on
          screen the moment a query returns rather than below a wall of summary. */}
      <div className="flex min-h-0 flex-1 flex-col px-8 md:px-12">
        <div className="mx-auto flex min-h-0 w-full max-w-[1240px] flex-1 flex-col py-5">
      {status === 'error' && (
        <p role="alert" className="mb-8 text-[0.95rem] text-red-600">
          {error}
        </p>
      )}

      <AnimatePresence mode="wait">
        {status === 'running' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-3"
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={i}
                className="h-12 rounded-lg bg-porcelain"
                animate={{ opacity: [0.45, 0.9, 0.45] }}
                transition={{ duration: 1.3, repeat: Infinity, delay: i * 0.08 }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {data && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-5 gap-y-1">
            <h2 className="text-[1.05rem] font-semibold tracking-[-0.03em]">
              {data.total} phrases for “{data.seed}”
            </h2>
            {/* An estimate must never read as measured data — but it does not
                need a full-width banner eating the fold, so it sits inline with
                the full wording on hover. */}
            {data.disclaimer && (
              <span
                className="cursor-help text-[0.76rem] text-amber-700 underline decoration-amber-300 underline-offset-2"
                title={data.disclaimer}
              >
                Estimates, not measured search volume — {data.provider.label}
              </span>
            )}
          </div>

          {data.clusters.length > 0 && (
            <div className="mb-3 flex shrink-0 gap-2 overflow-x-auto pb-1">
              {data.clusters.map((c) => (
                <span
                  key={c.topic}
                  className="shrink-0 rounded-full border border-line px-3 py-1 text-[0.78rem]"
                  title={c.keywords.join('\n')}
                >
                  {c.topic} <span className="text-ink-faint">{c.count}</span>
                </span>
              ))}
            </div>
          )}

          <div className="mb-3 flex flex-wrap gap-2">
            {['all', 'transactional', 'commercial', 'informational', 'navigational'].map((i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIntentFilter(i)}
                className={`rounded-full border px-3 py-1 text-[0.76rem] capitalize transition-colors ${
                  intentFilter === i ? 'border-ink bg-ink text-white' : 'border-line text-ink-soft'
                }`}
              >
                {i}
              </button>
            ))}
          </div>

          <div className="min-h-0 flex-1 overflow-auto rounded-xl border border-line">
            <table className="w-full min-w-[680px] text-left text-[0.88rem]">
              <thead className="sticky top-0 z-10 border-b border-line bg-paper text-[0.72rem] uppercase tracking-[0.12em] text-ink-faint">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Keyword</th>
                  <th className="px-4 py-2.5 font-medium">Intent</th>
                  <th className="px-4 py-2.5 font-medium">Difficulty</th>
                  <th className="px-4 py-2.5 font-medium">Opportunity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((k) => (
                  <tr key={k.keyword} className="transition-colors hover:bg-porcelain/60">
                    <td className="px-4 py-2">{k.keyword}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[0.72rem] font-medium ${INTENT_TONE[k.intent]}`}
                      >
                        {k.intent}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <DifficultyBar value={k.difficulty} />
                    </td>
                    <td className="px-4 py-2 tabular-nums font-medium">{k.opportunity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3 flex shrink-0 flex-wrap items-center justify-between gap-3 pt-1">
            <span className="text-[0.82rem] text-ink-soft">
              Want these turned into pages that rank? That is the work we do.
            </span>
            <a
              href="/#start"
              className="rounded-full bg-ink px-5 py-2 text-[0.82rem] font-medium text-white"
            >
              Start a project
            </a>
          </div>
        </motion.div>
      )}
        </div>
      </div>
    </div>
  );
}
