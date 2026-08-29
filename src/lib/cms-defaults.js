/**
 * Code defaults for every CMS group. These are what the site renders with an
 * empty database; a saved `site_content` row is shallow-merged over the matching
 * entry here. Keep the shapes in sync with `cms-schema.js`.
 */

import { aboutDefaults } from './about-content.js';
import { companyPages, services } from './site-pages.js';

export const HOME_DEFAULTS = {
  heroKicker: 'Digital growth, end to end',
  heroHeadline: 'We build the system behind your growth.',
  heroSubcopy:
    "One team for the whole path — from a customer's first search to the sale, with nothing handed off in between.",
  heroCtaPrimary: 'Start a project',
  heroCtaSecondary: 'See how it works',
  scrollCue: 'Research — Build — Advertise — Track — Convert',
  flowKicker: 'Search → sale',
  flow: [
    { label: 'A problem, a first search', note: 'Keyword research maps the exact phrases and the intent behind them.' },
    { label: 'Weighing up the options', note: 'SEO earns the organic shortlist; content answers the doubts.' },
    { label: 'The click that counts', note: 'Google & Meta Ads reach the people who need it now.' },
    { label: 'Landing on your page', note: 'A MERN-built site, designed to convert rather than just exist.' },
    { label: 'Deciding to enquire', note: 'One clear next step — no friction, nothing competing.' },
    { label: 'A sale, and its source', note: 'Server-side tracking proves which step earned it.' },
  ],
  buildHeadline: 'A website built to sell.',
  buildBody:
    'We design landing pages around what the visitor needs to see, understand and do next, then build them on a fast MERN stack. Not web development for its own sake — conversion architecture.',
  attractHeadline: 'Then we bring the right people to it.',
  attractBody:
    'A page that converts is worth nothing without demand pointed at it. We build two streams into the same destination — the search results you earn, and the placements you buy.',
  convertHeadline: 'Traffic is useless if nobody takes action.',
  convertBody:
    'This is the part most agencies skip. Between arriving and enquiring there are four things a visitor has to do — and each one is a place you can lose them.',
  proofHeadline: "We've actually built this.",
  proofBody:
    'The method behind the work: how we make a page clearer, align demand with the destination, and give each next decision a reason.',
  diagnoseHeadline: "See what's holding your website back.",
  diagnoseBody:
    'Before we talk about working together, run the free technical audit. It checks the same things we would check on day one — and you keep the report either way.',
  startHeadline: 'Your next customer is already searching.',
  startSubcopy: "Let's build the system that gets them to you.",
};

export const GLOBAL_DEFAULTS = {
  siteName: 'Digital Web Assurances',
  metaTitle: 'Digital Web Assurances — from a search to a sale, as one system',
  metaDescription:
    'One team for the whole path from a customer searching to the sale: keyword research, a MERN-built website, SEO, Google and Meta Ads, and server-side tracking. Free technical SEO audit.',
  contactEmail: 'admin@developwitharim.com',
  contactPhone: '+880 1518 991960',
  whatsapp: '8801518991960',
  footerTagline: 'From search to sale, handled end to end',
  footerBlurb:
    'One team from the first search to the closed sale — websites, SEO, Google and Meta Ads, and the tracking that proves what worked.',
};

export const CONTACT_DEFAULTS = {
  title: companyPages.contact.title,
  intro: companyPages.contact.intro,
  deliverables: companyPages.contact.deliverables,
  channels: [
    {
      label: 'Email',
      value: 'admin@developwitharim.com',
      href: 'mailto:admin@developwitharim.com',
      note: 'Read by a person, replied to within one working day.',
    },
    {
      label: 'Phone',
      value: '+880 1518 991960',
      href: 'tel:+8801518991960',
      note: 'Bangladesh time. Leave a message if we miss you.',
    },
    {
      label: 'WhatsApp',
      value: 'wa.me/8801518991960',
      href: 'https://wa.me/8801518991960',
      note: 'Fine for a quick question before a full brief.',
    },
  ],
};

export const CMS_DEFAULTS = {
  'site:global': GLOBAL_DEFAULTS,
  'page:home': HOME_DEFAULTS,
  'page:about': aboutDefaults,
  'page:work': companyPages.work,
  'page:process': companyPages.process,
  'page:contact': CONTACT_DEFAULTS,
  ...Object.fromEntries(Object.entries(services).map(([slug, s]) => [`service:${slug}`, s])),
};

export function cmsDefault(id) {
  return CMS_DEFAULTS[id] ?? {};
}
