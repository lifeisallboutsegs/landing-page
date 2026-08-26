import {
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

/**
 * Enquiries from the site's lead form.
 *
 * Paid traffic is the point of this site, so attribution is stored alongside
 * the enquiry rather than bolted on later — a lead you cannot trace back to a
 * campaign cannot tell you which campaign to keep paying for. utm/gclid live in
 * their own columns because they get filtered and grouped constantly; anything
 * else the client sends is kept in `meta` so we never silently drop data.
 */
export const leads = pgTable(
  'leads',
  {
    id: serial('id').primaryKey(),

    name: varchar('name', { length: 200 }).notNull(),
    email: varchar('email', { length: 320 }).notNull(),
    website: varchar('website', { length: 500 }),
    service: varchar('service', { length: 100 }),
    message: text('message'),

    // Attribution
    utmSource: varchar('utm_source', { length: 200 }),
    utmMedium: varchar('utm_medium', { length: 200 }),
    utmCampaign: varchar('utm_campaign', { length: 200 }),
    utmTerm: varchar('utm_term', { length: 200 }),
    utmContent: varchar('utm_content', { length: 200 }),
    gclid: varchar('gclid', { length: 500 }),
    landingPage: varchar('landing_page', { length: 500 }),
    referrer: varchar('referrer', { length: 1000 }),

    // Operational
    status: varchar('status', { length: 30 }).notNull().default('new'),
    notes: text('notes'),
    ipHash: varchar('ip_hash', { length: 64 }),
    userAgent: varchar('user_agent', { length: 500 }),
    meta: jsonb('meta'),

    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('leads_created_at_idx').on(t.createdAt),
    index('leads_status_idx').on(t.status),
    index('leads_email_idx').on(t.email),
  ],
);

/**
 * Results of the public SEO audit tool.
 *
 * Cached by URL so repeat requests for the same site do not re-spend the
 * PageSpeed Insights quota, and so a submitted audit doubles as a soft lead
 * signal even when the visitor never fills the form in.
 */
export const audits = pgTable(
  'audits',
  {
    id: serial('id').primaryKey(),
    url: varchar('url', { length: 500 }).notNull(),
    normalisedUrl: varchar('normalised_url', { length: 500 }).notNull(),
    email: varchar('email', { length: 320 }),

    status: varchar('status', { length: 30 }).notNull().default('queued'),
    // 0-100 rollup we compute from the sections below.
    score: integer('score'),
    // Full PSI payload plus our own on-page crawl findings.
    result: jsonb('result'),
    error: text('error'),

    ipHash: varchar('ip_hash', { length: 64 }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    completedAt: timestamp('completed_at', { withTimezone: true }),
  },
  (t) => [
    index('audits_normalised_url_idx').on(t.normalisedUrl),
    index('audits_created_at_idx').on(t.createdAt),
  ],
);

/**
 * Admin logins. Deliberately tiny: one table, password hashes only, no OAuth
 * dependency. Sessions are signed cookies rather than rows.
 */
export const adminUsers = pgTable('admin_users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 320 }).notNull().unique(),
  name: varchar('name', { length: 200 }),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  role: varchar('role', { length: 30 }).notNull().default('admin'),

  // Lockout state. Counting failures on the account as well as the IP means a
  // distributed attempt cannot dodge the limit by rotating source addresses.
  failedAttempts: integer('failed_attempts').notNull().default(0),
  lockedUntil: timestamp('locked_until', { withTimezone: true }),

  lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

/**
 * Server-side admin sessions.
 *
 * Opaque random tokens rather than JWTs, deliberately: a JWT stays valid until
 * it expires, so logging out or discovering a stolen token cannot actually
 * revoke access. A row can be deleted. Only the SHA-256 of the token is stored,
 * so a database leak does not hand over usable session cookies.
 */
export const adminSessions = pgTable(
  'admin_sessions',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .notNull()
      .references(() => adminUsers.id, { onDelete: 'cascade' }),
    tokenHash: varchar('token_hash', { length: 64 }).notNull().unique(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    lastSeenAt: timestamp('last_seen_at', { withTimezone: true }).notNull().defaultNow(),
    ipHash: varchar('ip_hash', { length: 64 }),
    userAgent: varchar('user_agent', { length: 500 }),
  },
  (t) => [index('admin_sessions_token_hash_idx').on(t.tokenHash)],
);

/**
 * Sliding-window counter for public endpoints. The audit tool and lead form are
 * unauthenticated and will be pointed at by ads, so they need a floor against
 * abuse that survives a process restart — hence the table rather than memory.
 */
export const rateLimits = pgTable(
  'rate_limits',
  {
    id: serial('id').primaryKey(),
    bucket: varchar('bucket', { length: 120 }).notNull(),
    hits: integer('hits').notNull().default(1),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  },
  (t) => [index('rate_limits_bucket_idx').on(t.bucket)],
);
