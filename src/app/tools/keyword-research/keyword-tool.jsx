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
    'h-12 w-full rounded-none border-0 border-b border-line bg-transparent px-0 text-[1rem] outline-none transition-colors focus:border-cobalt placeholder:text-ink-faint';

  return (
    <>
      <form onSubmit={onSubmit} className="mb-4 grid grid-cols-1 gap-8 md:grid-cols-[1.3fr_1fr_auto]">
        <label className="block">
          <span className="mb-2 block text-[0.78rem] font-medium tracking-tight text-ink-soft">
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
          <span className="mb-2 block text-[0.78rem] font-medium tracking-tight text-ink-soft">
            Where? <span className="text-ink-faint">(optional)</span>
          </span>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="London"
            className={field}
          />
        </label>

        <div className="flex items-end">
          <button
            type="submit"
            disabled={status === 'running'}
            className="h-12 rounded-full bg-ink px-8 text-[0.9rem] font-medium text-white transition-transform duration-200 active:scale-[0.98] disabled:opacity-60"
          >
            {status === 'running' ? 'Researching…' : 'Find keywords'}
          </button>
        </div>
      </form>

      <div className="mb-14 flex flex-wrap items-center gap-2">
        {['shallow', 'standard', 'deep'].map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => setDepth(d)}
            className={`rounded-full border px-4 py-1.5 text-[0.8rem] capitalize transition-all duration-300 ${
              depth === d
                ? 'border-ink bg-ink text-white'
                : 'border-line text-ink-soft hover:border-ink/40'
            }`}
          >
            {d}
          </button>
        ))}
        <span className="ml-2 text-[0.8rem] text-ink-faint">
          {depth === 'deep' ? 'Slower, many more phrases' : depth === 'shallow' ? 'Fastest' : 'Balanced'}
        </span>
      </div>

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
        >
          <div className="mb-10 flex flex-wrap items-baseline justify-between gap-4 border-b border-line pb-6">
            <h2 className="text-[1.3rem] font-semibold tracking-[-0.03em]">
              {data.total} phrases for “{data.seed}”
            </h2>
            <span className="text-[0.82rem] text-ink-faint">Source: {data.provider.label}</span>
          </div>

          {/* Never let an estimate be mistaken for measured data. */}
          {data.disclaimer && (
            <p className="mb-10 max-w-3xl rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-[0.88rem] leading-relaxed text-amber-900">
              {data.disclaimer}
            </p>
          )}

          {data.clusters.length > 0 && (
            <div className="mb-12">
              <h3 className="mb-5 text-[0.78rem] font-medium uppercase tracking-[0.14em] text-ink-faint">
                Topic clusters
              </h3>
              <div className="flex flex-wrap gap-3">
                {data.clusters.map((c) => (
                  <span
                    key={c.topic}
                    className="rounded-full border border-line px-4 py-2 text-[0.85rem]"
                    title={c.keywords.join('\n')}
                  >
                    {c.topic} <span className="text-ink-faint">{c.count}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mb-6 flex flex-wrap gap-2">
            {['all', 'transactional', 'commercial', 'informational', 'navigational'].map((i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIntentFilter(i)}
                className={`rounded-full border px-4 py-1.5 text-[0.8rem] capitalize transition-colors ${
                  intentFilter === i ? 'border-ink bg-ink text-white' : 'border-line text-ink-soft'
                }`}
              >
                {i}
              </button>
            ))}
          </div>

          <div className="overflow-x-auto rounded-xl border border-line">
            <table className="w-full min-w-[680px] text-left text-[0.92rem]">
              <thead className="border-b border-line text-[0.72rem] uppercase tracking-[0.12em] text-ink-faint">
                <tr>
                  <th className="px-5 py-3.5 font-medium">Keyword</th>
                  <th className="px-5 py-3.5 font-medium">Intent</th>
                  <th className="px-5 py-3.5 font-medium">Difficulty</th>
                  <th className="px-5 py-3.5 font-medium">Opportunity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((k) => (
                  <tr key={k.keyword} className="transition-colors hover:bg-porcelain/60">
                    <td className="px-5 py-3.5">{k.keyword}</td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[0.72rem] font-medium ${INTENT_TONE[k.intent]}`}
                      >
                        {k.intent}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <DifficultyBar value={k.difficulty} />
                    </td>
                    <td className="px-5 py-3.5 tabular-nums font-medium">{k.opportunity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-14 rounded-2xl border border-line bg-porcelain px-8 py-10 text-center">
            <h3 className="mb-3 text-[1.2rem] font-semibold tracking-[-0.02em]">
              Want these turned into pages that rank?
            </h3>
            <p className="mx-auto mb-7 max-w-lg text-[0.95rem] leading-relaxed text-ink-soft">
              That is the work we do. Tell us which of these matter to your business and we will
              tell you honestly what it would take.
            </p>
            <a
              href="/#start"
              className="inline-block rounded-full bg-ink px-8 py-3.5 text-[0.9rem] font-medium text-white"
            >
              Start a project
            </a>
          </div>
        </motion.div>
      )}
    </>
  );
}
