'use client';

import { useRef, useState } from 'react';

/** URL text field + upload button + thumbnail. Shared by the content editor
 *  and the team manager. Uploads go to /api/admin/upload. */
export default function ImageInput({ value, onChange, compact = false }) {
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
    <div className="flex items-start gap-3">
      <span
        className={`grid shrink-0 place-items-center overflow-hidden rounded-lg border border-line bg-porcelain text-[0.6rem] text-ink-faint ${
          compact ? 'h-11 w-11' : 'h-16 w-16'
        }`}
      >
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="h-full w-full object-cover" />
        ) : (
          'none'
        )}
      </span>
      <div className="min-w-0 flex-1">
        <input
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="/uploads/… or an image URL"
          className="h-9 w-full rounded-lg border border-line bg-porcelain/40 px-2.5 text-[0.85rem] outline-none focus:border-cobalt"
        />
        <div className="mt-1.5 flex items-center gap-3 text-[0.72rem]">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="font-medium text-cobalt underline underline-offset-2 disabled:opacity-50"
          >
            {busy ? 'uploading…' : 'upload image'}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="text-ink-faint underline underline-offset-2"
            >
              clear
            </button>
          )}
          {err && <span className="text-red-600">{err}</span>}
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
