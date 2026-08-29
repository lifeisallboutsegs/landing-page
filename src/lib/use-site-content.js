'use client';

import { createContext, useContext } from 'react';

import { GLOBAL_DEFAULTS, HOME_DEFAULTS } from '@/lib/cms-defaults';

const SiteContentContext = createContext({ home: HOME_DEFAULTS, global: GLOBAL_DEFAULTS });

export function SiteContentProvider({ value, children }) {
  return <SiteContentContext.Provider value={value}>{children}</SiteContentContext.Provider>;
}

/**
 * CMS-editable copy for the home page and global settings. Always returns a
 * fully-populated object — the code defaults back every field the provider (or
 * the database) has not set.
 */
export function useSiteContent() {
  const ctx = useContext(SiteContentContext);
  return {
    home: { ...HOME_DEFAULTS, ...(ctx?.home ?? {}) },
    global: { ...GLOBAL_DEFAULTS, ...(ctx?.global ?? {}) },
  };
}
