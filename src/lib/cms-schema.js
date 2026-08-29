/**
 * Declarative description of everything editable from /admin. One schema drives
 * the whole content editor — add a field here and it appears in the panel,
 * saves to `site_content`, and is merged over the code default on the page.
 *
 * Field types the editor understands:
 *   text | textarea | paras (blank-line separated → string[])
 *   list (one per line → string[]) | url | image | number | toggle
 *   repeater ({ item: Field[] } → object[])
 */

import { services } from './site-pages.js';

const pointsField = {
  name: 'points',
  label: 'Summary points',
  type: 'list',
  help: 'One per line. Shown in the “In short” list.',
};

const serviceGroups = Object.entries(services).map(([slug, s]) => ({
  id: `service:${slug}`,
  label: s.label,
  group: 'Services',
  preview: `/services/${slug}`,
  fields: [
    { name: 'label', label: 'Menu label', type: 'text' },
    { name: 'title', label: 'Page headline', type: 'textarea' },
    { name: 'description', label: 'Meta / card description', type: 'textarea' },
    { name: 'intro', label: 'Intro paragraph', type: 'textarea' },
    pointsField,
    {
      name: 'deliverables',
      label: 'What the work covers',
      type: 'repeater',
      item: [
        { name: 'title', label: 'Title', type: 'text' },
        { name: 'body', label: 'Detail', type: 'textarea' },
      ],
    },
    { name: 'body', label: '“Why it works this way” paragraphs', type: 'paras' },
  ],
}));

export const CMS_GROUPS = [
  // ─────────────────────────── Global ───────────────────────────
  {
    id: 'site:global',
    label: 'Site settings',
    group: 'Global',
    preview: '/',
    fields: [
      { name: 'siteName', label: 'Brand name', type: 'text' },
      { name: 'metaTitle', label: 'Default browser title', type: 'text' },
      {
        name: 'metaDescription',
        label: 'Default meta description',
        type: 'textarea',
        help: 'Used for search results and link previews. Keep it clear and under 165 characters.',
      },
      { name: 'contactEmail', label: 'Contact email', type: 'text' },
      { name: 'contactPhone', label: 'Contact phone', type: 'text' },
      { name: 'whatsapp', label: 'WhatsApp number (digits only, e.g. 8801518991960)', type: 'text' },
      { name: 'footerTagline', label: 'Footer tagline', type: 'text' },
      { name: 'footerBlurb', label: 'Footer blurb', type: 'textarea' },
    ],
  },

  // ─────────────────────────── Home ───────────────────────────
  {
    id: 'page:home',
    label: 'Home page',
    group: 'Pages',
    preview: '/',
    fields: [
      { name: 'heroKicker', label: 'Hero — eyebrow', type: 'text' },
      { name: 'heroHeadline', label: 'Hero — headline', type: 'textarea' },
      { name: 'heroSubcopy', label: 'Hero — sub-copy', type: 'textarea' },
      { name: 'heroCtaPrimary', label: 'Hero — primary button', type: 'text' },
      { name: 'heroCtaSecondary', label: 'Hero — secondary link', type: 'text' },
      { name: 'scrollCue', label: 'Scroll cue / footer strip text', type: 'text' },
      { name: 'flowKicker', label: 'Flow rail — eyebrow', type: 'text' },
      {
        name: 'flow',
        label: 'Search → sale journey steps',
        type: 'repeater',
        item: [
          { name: 'label', label: 'Step', type: 'text' },
          { name: 'note', label: 'Sub-line', type: 'text' },
        ],
      },
      { name: 'buildHeadline', label: 'Section “Build” — headline', type: 'text' },
      { name: 'buildBody', label: 'Section “Build” — intro', type: 'textarea' },
      { name: 'attractHeadline', label: 'Section “Attract” — headline', type: 'text' },
      { name: 'attractBody', label: 'Section “Attract” — intro', type: 'textarea' },
      { name: 'convertHeadline', label: 'Section “Convert” — headline', type: 'text' },
      { name: 'convertBody', label: 'Section “Convert” — intro', type: 'textarea' },
      { name: 'proofHeadline', label: 'Section “Proof” — headline', type: 'text' },
      { name: 'proofBody', label: 'Section “Proof” — intro', type: 'textarea' },
      { name: 'diagnoseHeadline', label: 'Section “Audit” — headline', type: 'text' },
      { name: 'diagnoseBody', label: 'Section “Audit” — intro', type: 'textarea' },
      { name: 'startHeadline', label: 'Section “Start” — headline', type: 'textarea' },
      { name: 'startSubcopy', label: 'Section “Start” — sub-copy', type: 'text' },
    ],
  },

  // ─────────────────────────── About ───────────────────────────
  {
    id: 'page:about',
    label: 'About page',
    group: 'Pages',
    preview: '/about',
    note: 'The team list has its own tab.',
    fields: [
      { name: 'kicker', label: 'Eyebrow', type: 'text' },
      { name: 'heroTitle', label: 'Headline', type: 'textarea' },
      { name: 'heroIntro', label: 'Intro paragraph', type: 'textarea' },
      { name: 'founderName', label: 'Founder — name', type: 'text' },
      { name: 'founderRole', label: 'Founder — label', type: 'text' },
      { name: 'founderPhoto', label: 'Founder — photo', type: 'image' },
      { name: 'founderTagline', label: 'Founder — tagline', type: 'textarea' },
      { name: 'founderBio', label: 'Founder — bio', type: 'paras' },
      { name: 'leadName', label: 'Engineering lead — name', type: 'text' },
      { name: 'leadRole', label: 'Engineering lead — role', type: 'text' },
      { name: 'leadPhoto', label: 'Engineering lead — photo', type: 'image' },
      { name: 'leadHeading', label: 'Engineering lead — heading', type: 'text' },
      { name: 'leadBio', label: 'Engineering lead — bio', type: 'paras' },
      { name: 'teamHeading', label: 'Team section heading', type: 'textarea' },
      { name: 'quote', label: 'Closing quote', type: 'textarea' },
    ],
  },

  // ─────────────────────────── Work / Process ───────────────────────────
  {
    id: 'page:work',
    label: 'Work page',
    group: 'Pages',
    preview: '/work',
    fields: [
      { name: 'title', label: 'Headline', type: 'textarea' },
      { name: 'description', label: 'Meta description', type: 'textarea' },
      { name: 'intro', label: 'Intro paragraph', type: 'textarea' },
      pointsField,
      {
        name: 'deliverables',
        label: 'Capability areas',
        type: 'repeater',
        item: [
          { name: 'title', label: 'Title', type: 'text' },
          { name: 'body', label: 'Detail', type: 'textarea' },
        ],
      },
      { name: 'body', label: 'Closing paragraphs', type: 'paras' },
    ],
  },
  {
    id: 'page:process',
    label: 'Process page',
    group: 'Pages',
    preview: '/process',
    fields: [
      { name: 'title', label: 'Headline', type: 'textarea' },
      { name: 'description', label: 'Meta description', type: 'textarea' },
      { name: 'intro', label: 'Intro paragraph', type: 'textarea' },
      pointsField,
      {
        name: 'deliverables',
        label: 'Steps',
        type: 'repeater',
        item: [
          { name: 'title', label: 'Step', type: 'text' },
          { name: 'body', label: 'Detail', type: 'textarea' },
        ],
      },
      { name: 'body', label: 'Closing paragraphs', type: 'paras' },
    ],
  },

  // ─────────────────────────── Contact ───────────────────────────
  {
    id: 'page:contact',
    label: 'Contact page',
    group: 'Pages',
    preview: '/contact',
    fields: [
      { name: 'title', label: 'Headline', type: 'textarea' },
      { name: 'intro', label: 'Intro paragraph', type: 'textarea' },
      {
        name: 'deliverables',
        label: 'What to expect (left-column list)',
        type: 'repeater',
        item: [
          { name: 'title', label: 'Title', type: 'text' },
          { name: 'body', label: 'Detail', type: 'textarea' },
        ],
      },
      {
        name: 'channels',
        label: 'Direct contact channels',
        type: 'repeater',
        item: [
          { name: 'label', label: 'Label (e.g. Email)', type: 'text' },
          { name: 'value', label: 'Shown value', type: 'text' },
          { name: 'href', label: 'Link (mailto: / tel: / https:)', type: 'text' },
          { name: 'note', label: 'Sub-note', type: 'text' },
        ],
      },
    ],
  },

  // ─────────────────────────── Services (one per) ───────────────────────────
  ...serviceGroups,
];

export const CMS_GROUP_ORDER = ['Global', 'Pages', 'Services'];

export function getGroup(id) {
  return CMS_GROUPS.find((g) => g.id === id);
}

// `page:home` <-> `page~home` for clean URL path segments.
export const groupToSlug = (id) => id.replace(':', '~');
export const slugToGroup = (slug) => slug.replace('~', ':');

/** CMS groups bucketed by their `group` label, in `CMS_GROUP_ORDER`. */
export function groupedNav() {
  return CMS_GROUP_ORDER.map((label) => ({
    label,
    items: CMS_GROUPS.filter((g) => g.group === label),
  })).filter((b) => b.items.length);
}
