import { createHash } from 'node:crypto';
import { z } from 'zod';

/**
 * Shape of a lead as it arrives from the browser.
 *
 * Kept deliberately permissive on the optional fields: a half-filled enquiry
 * from a real person is worth far more than a rejected one, so only name and
 * email are required. Everything is trimmed and length-capped so an oversized
 * paste cannot blow past the column widths.
 */
export const leadSchema = z.object({
  name: z.string().trim().min(2, 'Please tell us your name').max(200),
  email: z.string().trim().toLowerCase().email('That email does not look right').max(320),
  website: z.string().trim().max(500).optional().or(z.literal('')),
  service: z.string().trim().max(100).optional().or(z.literal('')),
  message: z.string().trim().max(5000).optional().or(z.literal('')),
  // Honeypot. Hidden from people, irresistible to bots.
  company_website_confirm: z.string().max(200).optional().or(z.literal('')),
  meta: z.record(z.string(), z.unknown()).optional(),
});

const ATTRIBUTION_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'gclid',
  'landing_page',
  'referrer',
];

/**
 * Splits the client-supplied `meta` blob into the attribution columns we query
 * on and whatever is left over. Anything unrecognised is preserved rather than
 * dropped — we would rather store an unexpected field than lose it.
 */
export function splitAttribution(meta = {}) {
  const known = {};
  const rest = {};

  for (const [key, value] of Object.entries(meta ?? {})) {
    if (ATTRIBUTION_KEYS.includes(key)) known[key] = value == null ? null : String(value).slice(0, 1000);
    else rest[key] = value;
  }

  return {
    utmSource: known.utm_source ?? null,
    utmMedium: known.utm_medium ?? null,
    utmCampaign: known.utm_campaign ?? null,
    utmTerm: known.utm_term ?? null,
    utmContent: known.utm_content ?? null,
    gclid: known.gclid ?? null,
    landingPage: known.landing_page ?? null,
    referrer: known.referrer ?? null,
    meta: Object.keys(rest).length ? rest : null,
  };
}

/**
 * We rate-limit and de-duplicate per client, but storing raw IPs of people who
 * have not yet become customers is more personal data than this needs. A salted
 * hash is enough to spot repeat submissions without keeping the address itself.
 */
export function hashIp(ip) {
  if (!ip) return null;
  const salt = process.env.IP_HASH_SALT || 'dwa-dev-salt';
  return createHash('sha256').update(`${salt}:${ip}`).digest('hex');
}

/** Best-effort client IP, trusting the reverse proxy in front of the app. */
export function clientIp(headers) {
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return headers.get('x-real-ip') || null;
}
