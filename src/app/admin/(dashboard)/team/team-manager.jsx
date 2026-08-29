'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';

const BLANK = { name: '', role: '', groupName: 'core', photoUrl: '', sortOrder: 0, published: true };

function PhotoField({ value, onChange }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  const upload = async (file) => {
    if (!file) return;
    setBusy(true);
    setErr(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? `Failed (${res.status})`);
      onChange(data.url);
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-full border border-line bg-porcelain text-[0.65rem] text-ink-faint">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="h-full w-full object-cover" />
        ) : (
          'no photo'
        )}
      </span>
      <div className="min-w-0 flex-1">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="/uploads/team/… or paste a URL"
          className="h-9 w-full rounded-lg border border-line bg-porcelain/40 px-2.5 text-[0.82rem] outline-none focus:border-cobalt"
        />
        <div className="mt-1 flex items-center gap-3">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="text-[0.72rem] font-medium text-cobalt underline underline-offset-2 disabled:opacity-50"
          >
            {busy ? 'uploading…' : 'upload image'}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="text-[0.72rem] text-ink-faint underline underline-offset-2"
            >
              clear
            </button>
          )}
          {err && <span className="text-[0.72rem] text-red-600">{err}</span>}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => upload(e.target.files?.[0])}
        />
      </div>
    </div>
  );
}

function Row({ member, groups, onSaved }) {
  const router = useRouter();
  const [v, setV] = useState(member);
  const [status, setStatus] = useState('idle');
  const [err, setErr] = useState(null);
  const isNew = !member.id;

  const set = (k) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setV((s) => ({ ...s, [k]: val }));
  };

  const save = async () => {
    setStatus('saving');
    setErr(null);
    try {
      const res = await fetch('/api/admin/team', {
        method: isNew ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isNew ? v : { ...v, id: member.id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? `Failed (${res.status})`);
      setStatus('saved');
      if (isNew) setV(BLANK);
      onSaved?.();
      router.refresh();
      setTimeout(() => setStatus('idle'), 2000);
    } catch (e) {
      setStatus('idle');
      setErr(e.message);
    }
  };

  const remove = async () => {
    if (!confirm(`Remove ${member.name}?`)) return;
    setStatus('saving');
    try {
      const res = await fetch(`/api/admin/team?id=${member.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? 'Failed');
      router.refresh();
    } catch (e) {
      setStatus('idle');
      setErr(e.message);
    }
  };

  return (
    <div className="rounded-xl border border-line bg-paper p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-[0.72rem] text-ink-faint">Name</span>
          <input value={v.name} onChange={set('name')} className="h-9 w-full rounded-lg border border-line bg-porcelain/40 px-2.5 text-[0.85rem] outline-none focus:border-cobalt" />
        </label>
        <label className="block">
          <span className="mb-1 block text-[0.72rem] text-ink-faint">Role</span>
          <input value={v.role} onChange={set('role')} className="h-9 w-full rounded-lg border border-line bg-porcelain/40 px-2.5 text-[0.85rem] outline-none focus:border-cobalt" />
        </label>
        <label className="block">
          <span className="mb-1 block text-[0.72rem] text-ink-faint">Group</span>
          <select value={v.groupName} onChange={set('groupName')} className="h-9 w-full rounded-lg border border-line bg-porcelain/40 px-2 text-[0.85rem] outline-none focus:border-cobalt">
            {groups.map((g) => (
              <option key={g.key} value={g.key}>
                {g.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-[0.72rem] text-ink-faint">Order</span>
          <input type="number" min="0" value={v.sortOrder} onChange={set('sortOrder')} className="h-9 w-full rounded-lg border border-line bg-porcelain/40 px-2.5 text-[0.85rem] outline-none focus:border-cobalt" />
        </label>
        <div className="sm:col-span-2">
          <span className="mb-1 block text-[0.72rem] text-ink-faint">Photo</span>
          <PhotoField value={v.photoUrl ?? ''} onChange={(url) => setV((s) => ({ ...s, photoUrl: url }))} />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-4 border-t border-line pt-3">
        <label className="flex items-center gap-2 text-[0.8rem] text-ink-soft">
          <input type="checkbox" checked={!!v.published} onChange={set('published')} />
          Published
        </label>
        <button
          type="button"
          onClick={save}
          disabled={status === 'saving' || !v.name.trim() || !v.role.trim()}
          className="rounded-full bg-ink px-4 py-1.5 text-[0.8rem] font-medium text-white disabled:opacity-50"
        >
          {status === 'saving' ? 'Saving…' : status === 'saved' ? 'Saved ✓' : isNew ? 'Add member' : 'Save'}
        </button>
        {!isNew && (
          <button type="button" onClick={remove} className="text-[0.8rem] text-red-600 underline underline-offset-2">
            Remove
          </button>
        )}
        {err && <span className="text-[0.78rem] text-red-600">{err}</span>}
      </div>
    </div>
  );
}

function ImportRoster({ groups, seed }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  const run = async () => {
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch('/api/admin/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seed: true }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? 'Failed');
      router.refresh();
    } catch (e) {
      setBusy(false);
      setErr(e.message);
    }
  };

  return (
    <div className="rounded-xl border border-dashed border-line bg-paper p-6">
      <p className="mb-1 text-[0.9rem] font-medium">The team list is empty</p>
      <p className="mb-4 max-w-lg text-[0.85rem] text-ink-soft">
        Right now <code className="rounded bg-porcelain px-1">/about</code> shows the built-in roster
        below. Import it once and every person becomes an editable row — change names, roles, order,
        add photos, or remove anyone.
      </p>
      <button
        type="button"
        onClick={run}
        disabled={busy}
        className="rounded-full bg-ink px-5 py-2 text-[0.82rem] font-medium text-white disabled:opacity-50"
      >
        {busy ? 'Importing…' : 'Import the built-in roster'}
      </button>
      {err && <span className="ml-3 text-[0.78rem] text-red-600">{err}</span>}

      <div className="mt-6 space-y-4 opacity-70">
        {groups.map((g) => (
          <div key={g.key}>
            <p className="mb-1 text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-ink-faint">
              {g.label}
            </p>
            <ul className="text-[0.85rem] text-ink-soft">
              {(seed[g.key] ?? []).map((p) => (
                <li key={p.name}>
                  {p.name} — {p.role}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TeamManager({ rows, groups, seed }) {
  const empty = rows.length === 0;

  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-3 text-[0.95rem] font-semibold">Add a member</h2>
        <Row member={{ ...BLANK }} groups={groups} />
      </section>

      {empty ? (
        <ImportRoster groups={groups} seed={seed} />
      ) : (
        groups.map((g) => {
          const members = rows.filter((r) => r.groupName === g.key);
          return (
            <section key={g.key}>
              <h2 className="mb-3 text-[0.95rem] font-semibold">
                {g.label}{' '}
                <span className="font-normal text-ink-faint">({members.length})</span>
              </h2>
              <div className="space-y-3">
                {members.map((m) => (
                  <Row key={m.id} member={m} groups={groups} />
                ))}
                {members.length === 0 && (
                  <p className="text-[0.82rem] text-ink-faint">No one in this group yet.</p>
                )}
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}
