/**
 * Thin, safe wrappers over gtag / fbq. Every call is a no-op when the tags are
 * not loaded (no measurement IDs configured, or consent withheld), so the rest
 * of the app can call these unconditionally.
 */

const CONSENT_KEY = 'dwa-consent';

const GRANTED = {
  ad_storage: 'granted',
  ad_user_data: 'granted',
  ad_personalization: 'granted',
  analytics_storage: 'granted',
};
const DENIED = {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
};

export function getConsent() {
  try {
    return localStorage.getItem(CONSENT_KEY);
  } catch {
    return null;
  }
}

export function grantConsent() {
  try {
    localStorage.setItem(CONSENT_KEY, 'granted');
  } catch {
    /* private mode — session-only */
  }
  if (typeof window === 'undefined') return;
  window.gtag?.('consent', 'update', GRANTED);
  window.fbq?.('consent', 'grant');
}

export function denyConsent() {
  try {
    localStorage.setItem(CONSENT_KEY, 'denied');
  } catch {
    /* ignore */
  }
  if (typeof window === 'undefined') return;
  window.gtag?.('consent', 'update', DENIED);
}

/** A generic event, mirrored to GA4 and Meta. */
export function trackEvent(name, params = {}) {
  if (typeof window === 'undefined') return;
  window.gtag?.('event', name, params);
}

/** Fired when the lead form is submitted successfully — the primary conversion. */
export function trackLead(detail = {}) {
  if (typeof window === 'undefined') return;

  window.gtag?.('event', 'generate_lead', { currency: 'USD', value: 0, ...detail });

  const adsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
  const label = process.env.NEXT_PUBLIC_GOOGLE_ADS_LEAD_LABEL;
  if (adsId && label) {
    window.gtag?.('event', 'conversion', { send_to: `${adsId}/${label}` });
  }

  window.fbq?.('track', 'Lead', detail);
}

/** Soft conversion: someone ran the free SEO audit to completion. */
export function trackAuditComplete(detail = {}) {
  trackEvent('audit_complete', detail);
  if (typeof window !== 'undefined') window.fbq?.('trackCustom', 'AuditComplete', detail);
}
