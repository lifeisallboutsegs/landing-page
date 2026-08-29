'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

import ImageInput from '@/components/admin/ImageInput';

/* ---------- value <-> editor-state conversion ---------- */

const toEdit = (field, value) => {
  if (field.type === 'paras') return (Array.isArray(value) ? value : []).join('\n\n');
  if (field.type === 'list') return (Array.isArray(value) ? value : []).join('\n');
  if (field.type === 'repeater') return Array.isArray(value) ? value : [];
  return value ?? '';
};

const fromEdit = (field, edited) => {
  if (field.type === 'paras' || field.type === 'list') {
    return String(edited)
      .split(field.type === 'paras' ? /\n\s*\n/ : /\n/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  if (field.type === 'number') return edited === '' ? '' : Number(edited);
  return edited;
};

const inputCls =
  'w-full rounded-lg border border-line bg-porcelain/40 px-3 py-2 text-[0.9rem] leading-relaxed outline-none focus:border-cobalt';

/* ---------- one field ---------- */

function Field({ field, value, onChange }) {
  if (field.type === 'image') {
    return <ImageInput value={value} onChange={onChange} />;
  }

  if (field.type === 'repeater') {
    const rows = Array.isArray(value) ? value : [];
    const setRow = (i, key, v) =>
      onChange(rows.map((r, idx) => (idx === i ? { ...r, [key]: v } : r)));
    const move = (i, dir) => {
      const j = i + dir;
      if (j < 0 || j >= rows.length) return;
      const next = rows.slice();
      [next[i], next[j]] = [next[j], next[i]];
      onChange(next);
    };
    return (
      <div className="space-y-3">
        {rows.map((row, i) => (
          <div key={i} className="rounded-xl border border-line bg-paper p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[0.72rem] font-semibold text-ink-faint">#{i + 1}</span>
              <span className="flex items-center gap-2 text-[0.72rem]">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="text-ink-soft disabled:opacity-30">↑</button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === rows.length - 1} className="text-ink-soft disabled:opacity-30">↓</button>
                <button type="button" onClick={() => onChange(rows.filter((_, idx) => idx !== i))} className="text-red-600 underline underline-offset-2">remove</button>
              </span>
            </div>
            <div className="grid gap-2">
              {field.item.map((sub) => (
                <label key={sub.name} className="block">
                  <span className="mb-0.5 block text-[0.7rem] text-ink-faint">{sub.label}</span>
                  {sub.type === 'textarea' ? (
                    <textarea rows={2} value={row[sub.name] ?? ''} onChange={(e) => setRow(i, sub.name, e.target.value)} className={inputCls} />
                  ) : (
                    <input value={row[sub.name] ?? ''} onChange={(e) => setRow(i, sub.name, e.target.value)} className={`${inputCls} py-1.5`} />
                  )}
                </label>
              ))}
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={() => onChange([...rows, Object.fromEntries(field.item.map((s) => [s.name, '']))])}
          className="rounded-full border border-dashed border-line px-4 py-1.5 text-[0.8rem] font-medium text-ink-soft transition-colors hover:border-cobalt hover:text-cobalt"
        >
          + Add row
        </button>
      </div>
    );
  }

  if (field.type === 'textarea' || field.type === 'paras' || field.type === 'list') {
    return (
      <textarea
        rows={field.type === 'paras' ? 6 : field.type === 'list' ? 5 : 3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputCls}
      />
    );
  }

  return (
    <input
      type={field.type === 'number' ? 'number' : 'text'}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`${inputCls} h-10 py-0`}
    />
  );
}

/* ---------- the editor ---------- */

export default function ContentEditor({ groupId, groupLabel, preview, note, schemaFields, initial, defaults }) {
  const initialState = useMemo(() => {
    const seed = {};
    for (const f of schemaFields) seed[f.name] = toEdit(f, initial[f.name] ?? defaults[f.name]);
    return seed;
  }, [schemaFields, initial, defaults]);

  const [values, setValues] = useState(initialState);
  // The last saved snapshot — updated on a successful save so the "unsaved
  // changes" flag clears without a reload.
  const [baseline, setBaseline] = useState(initialState);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);

  const dirty = useMemo(
    () => JSON.stringify(values) !== JSON.stringify(baseline),
    [values, baseline],
  );

  const set = (name) => (v) => setValues((s) => ({ ...s, [name]: v }));
  const resetField = (f) => setValues((s) => ({ ...s, [f.name]: toEdit(f, defaults[f.name]) }));
  const resetAll = () => {
    const seed = {};
    for (const f of schemaFields) seed[f.name] = toEdit(f, defaults[f.name]);
    setValues(seed);
  };

  const save = async (e) => {
    e.preventDefault();
    setStatus('saving');
    setError(null);
    const value = {};
    for (const f of schemaFields) value[f.name] = fromEdit(f, values[f.name]);
    try {
      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: groupId, value }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? `Failed (${res.status})`);
      setBaseline(values);
      setStatus('saved');
      setTimeout(() => setStatus('idle'), 2500);
    } catch (err) {
      setStatus('idle');
      setError(err.message);
    }
  };

  return (
    <form onSubmit={save}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[1.5rem] font-semibold tracking-[-0.03em]">{groupLabel}</h1>
          {note && <p className="mt-1 text-[0.85rem] text-ink-soft">{note}</p>}
        </div>
        {preview && (
          <Link
            href={preview}
            target="_blank"
            className="rounded-full border border-line px-3.5 py-1.5 text-[0.8rem] font-medium text-ink-soft transition-colors hover:border-ink/40 hover:text-ink"
          >
            View page ↗
          </Link>
        )}
      </div>

      <div className="space-y-6 rounded-2xl border border-line bg-paper p-6 sm:p-8">
        {schemaFields.map((f) => (
          <div key={f.name}>
            <div className="mb-1.5 flex items-baseline justify-between gap-3">
              <label className="text-[0.82rem] font-medium text-ink-soft">{f.label}</label>
              <button
                type="button"
                onClick={() => resetField(f)}
                className="text-[0.7rem] text-ink-faint underline underline-offset-2 hover:text-ink"
              >
                reset
              </button>
            </div>
            <Field field={f} value={values[f.name]} onChange={set(f.name)} />
            {f.help && <p className="mt-1 text-[0.75rem] text-ink-faint">{f.help}</p>}
          </div>
        ))}
      </div>

      <div className="sticky bottom-0 mt-4 flex flex-wrap items-center gap-4 rounded-2xl border border-line bg-paper/95 px-5 py-4 backdrop-blur">
        <button
          type="submit"
          disabled={status === 'saving' || !dirty}
          className="rounded-full bg-ink px-6 py-2.5 text-[0.85rem] font-medium text-white transition-transform active:scale-[0.98] disabled:opacity-50"
        >
          {status === 'saving' ? 'Saving…' : status === 'saved' ? 'Saved ✓' : 'Save & publish'}
        </button>
        <button
          type="button"
          onClick={resetAll}
          className="text-[0.82rem] font-medium text-ink-soft underline underline-offset-2 hover:text-ink"
        >
          Reset all to defaults
        </button>
        {dirty && <span className="text-[0.78rem] text-amber-600">Unsaved changes</span>}
        {error && <span className="text-[0.8rem] text-red-600">{error}</span>}
      </div>
    </form>
  );
}
