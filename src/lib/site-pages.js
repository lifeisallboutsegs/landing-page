/**
 * Copy for every static marketing page. Each entry is deliberately specific —
 * `deliverables` and `body` differ page to page so no two pages read like the
 * same template with the nouns swapped.
 *
 *  - intro:        one paragraph under the H1
 *  - points:       three short lines for the aside ("what this includes")
 *  - deliverables: 3–4 { title, body } — the real scope of the work
 *  - body:         1–2 paragraphs of plain argument for why this is done this way
 *  - image:        decorative aside art (aria-hidden)
 */

export const services = {
  websites: {
    label: 'MERN websites',
    title: 'Websites built on the MERN stack, shaped to convert.',
    description:
      'Custom React, Node, Express and MongoDB websites and web apps — engineered for speed, search and the next customer action.',
    intro:
      'A brochure site tells people you exist. We build working web applications — configurators, portals, booking flows, content that updates itself — on React, Node, Express and MongoDB, with the conversion path designed before the first component.',
    points: [
      'React + Node + Express + MongoDB',
      'Server-rendered for search, interactive for conversion',
      'Your own API, not a stack of embeds',
    ],
    deliverables: [
      {
        title: 'Architecture & data model',
        body: 'Information architecture around the questions a buyer actually asks, and a MongoDB schema that will not fight you in six months.',
      },
      {
        title: 'React front end',
        body: 'A fast, accessible interface — server-rendered where it helps search, interactive where it helps conversion.',
      },
      {
        title: 'Node / Express API',
        body: 'Your own API for forms, search, auth and integrations, instead of a pile of third-party scripts slowing the page down.',
      },
      {
        title: 'Launch & handover',
        body: 'Deployed to your infrastructure with the build documented, so another developer can pick it up without calling us.',
      },
    ],
    body: [
      'Most agency "web apps" are a template with a form bolted on. If the thing you need has state — a quote that changes as options are picked, an account area, a multi-step application — it needs a real front end and a real back end. That is what MERN is for.',
      'We build the smallest version that proves the idea, put it in front of real users, and grow it from there. No eighteen-month rebuild.',
    ],
    image: '/assets/website-build-system.png',
  },

  'landing-pages': {
    label: 'Landing pages',
    title: 'Landing pages that give paid traffic somewhere worth arriving.',
    description:
      'Conversion-focused landing page design and build for campaigns that need clicks to become qualified enquiries.',
    intro:
      'A landing page has a few seconds to make one specific person feel understood. We shape the message, the proof and the single next action around that moment, then build it to load fast on the worst phone on the worst connection.',
    points: [
      'One audience, one promise, one action',
      'Built for green Core Web Vitals',
      'Server-side conversion tracking from day one',
    ],
    deliverables: [
      {
        title: 'Message & offer',
        body: 'One page, one audience, one promise. The value lands before the fold; objections are answered where they occur.',
      },
      {
        title: 'Design & build',
        body: 'A fast static or server-rendered page — not a page builder — so Core Web Vitals stay green and the ad quality score benefits.',
      },
      {
        title: 'Tracking & variants',
        body: 'Conversions wired to your analytics and ad platforms server-side, with a second variant ready once traffic proves the first.',
      },
    ],
    body: [
      'The most expensive mistake in paid media is sending good traffic to a page designed for a brochure. The ad made a promise; the page has to keep it in the first sentence.',
      'We treat the landing page as part of the campaign, not a separate deliverable — the search term, the ad and the page are written together.',
    ],
    image: '/assets/northbeam-mockup.png',
  },

  seo: {
    label: 'SEO',
    title: 'SEO that compounds into a dependable source of demand.',
    description:
      'Technical SEO, intent-led content direction and on-page work that helps the right customers find you — and keep finding you.',
    intro:
      'Search growth is not a blogging quota. We fix the technical barriers first, find the terms that signal someone is ready to buy, and improve the specific pages that deserve to rank for them.',
    points: [
      'Technical fixes before content',
      'Terms chosen for intent, not just volume',
      'Reviewed against booked work, not vanity rankings',
    ],
    deliverables: [
      {
        title: 'Technical foundation',
        body: 'Crawlability, indexation, site speed, structured data and internal links — the things that quietly cap every page you publish.',
      },
      {
        title: 'Keyword & intent map',
        body: 'What your buyers search and where they are in the decision, so effort goes to terms that convert, not just terms with volume.',
      },
      {
        title: 'On-page & content',
        body: 'We rewrite and restructure the pages that are close, and brief the new ones that fill real gaps.',
      },
      {
        title: 'Measurement',
        body: 'Rankings, clicks and assisted conversions in one view, reviewed monthly against what actually booked work.',
      },
    ],
    body: [
      'Most SEO reports celebrate movement on keywords nobody searches with a credit card in hand. We start from the query a paying customer types and work backwards.',
      'It is slow for the first few months and then it is the cheapest demand you have. We are candid about that timeline before you commit.',
    ],
    image: '/assets/search-intent-lens.png',
  },

  'google-ads': {
    label: 'Google Ads',
    title: 'Google Ads pointed at the intent that can actually convert.',
    description:
      'Google Search, Shopping and Performance Max management wired to conversion-ready pages and honest measurement.',
    intro:
      'Paid search should generate demand today and teach you what the market responds to. We connect the search term, the ad, the landing page and the reporting so every pound of spend has a job.',
    points: [
      'Structure around qualified intent',
      'Ads and landing pages written together',
      'Bidding optimised to booked revenue',
    ],
    deliverables: [
      {
        title: 'Account structure',
        body: 'Campaigns organised around qualified intent, with match types and negatives that stop budget leaking to browsers and job-seekers.',
      },
      {
        title: 'Ads & page match',
        body: 'Ad copy and landing pages written together, so the click keeps the promise the ad made.',
      },
      {
        title: 'Conversion tracking',
        body: 'Server-side conversions and offline conversion import, so bidding optimises toward booked revenue, not form fills.',
      },
      {
        title: 'Ongoing management',
        body: 'Weekly negative-keyword and search-term review, budget shifted toward what closes, and a plain-English report.',
      },
    ],
    body: [
      'Google will happily spend your budget on traffic that never had a chance of buying. Most of the work is discipline: negatives, search-term review, and refusing to chase volume.',
      'The account stays transparent and in your name. If we part ways, you keep everything.',
    ],
    image: '/assets/google-ads-calibration.png',
  },

  'meta-ads': {
    label: 'Meta Ads',
    title: 'Meta Ads that create demand and catch the people search misses.',
    description:
      'Facebook and Instagram advertising — feed, Reels, Stories and retargeting — built to generate demand, not just impressions.',
    intro:
      'Search captures people who already know what they want. Meta is where you reach the rest: the people with the problem who have not gone looking yet, and the people who visited once and left.',
    points: [
      'Demand generation, not just retargeting',
      'Creative that reads as native to the feed',
      'Conversions API for measurement that lasts',
    ],
    deliverables: [
      {
        title: 'Audience & offer',
        body: "Who is worth reaching, and the offer that earns a stranger's attention in a feed built to ignore ads.",
      },
      {
        title: 'Creative direction',
        body: 'Briefs for feed, Reels and Stories creative that looks native, plus a testing plan so the winners are found fast.',
      },
      {
        title: 'Retargeting & exclusions',
        body: 'Warm audiences from site and CRM data, with exclusions so you stop paying to reach people who already bought.',
      },
      {
        title: 'Server-side events',
        body: 'The Conversions API set up properly, so measurement and optimisation survive iOS and cookie loss.',
      },
    ],
    body: [
      'Most Meta accounts are just retargeting — reminding people who were already going to buy. That looks efficient and grows nothing.',
      'The work is at the top of the funnel: an offer and creative strong enough to interrupt someone who was not looking, measured honestly enough to know if it worked.',
    ],
    image: '/assets/growth-flow-hero.png',
  },

  analytics: {
    label: 'Server-side tracking',
    title: 'Server-side tracking, so you know which click actually paid off.',
    description:
      'First-party, server-side analytics and conversion tracking — GA4, the Meta Conversions API and Google Ads — that survives cookie loss and ad blockers.',
    intro:
      'Ad blockers, iOS and the end of third-party cookies have quietly broken the measurement most businesses still make decisions on. We rebuild it server-side, from your own domain.',
    points: [
      'First-party events from your own domain',
      'Meta CAPI + Google enhanced conversions',
      'Offline revenue fed back to bidding',
    ],
    deliverables: [
      {
        title: 'Server-side container',
        body: 'A tagging server on your own subdomain (GA4 + server-side GTM), so events come from you, not a blockable third-party script.',
      },
      {
        title: 'Conversions API',
        body: 'Meta CAPI and Google Ads enhanced conversions wired in, with event deduplication so nothing is double-counted.',
      },
      {
        title: 'Offline conversions',
        body: 'Booked revenue and closed deals imported back from your CRM, so ad platforms optimise toward money, not form fills.',
      },
      {
        title: 'One honest dashboard',
        body: 'Channels, assisted conversions and cost-per-booked-job in one place, with the caveats stated plainly.',
      },
    ],
    body: [
      'If your analytics still depends on a script from a third-party domain and a browser cookie, a large and growing share of your customers are invisible in it.',
      'Server-side tracking is not about collecting more — it is about counting the conversions you already earned but could not see. Done right, it also improves how the ad platforms bid.',
    ],
    image: '/assets/conversion-path.png',
  },

  'conversion-review': {
    label: 'Conversion review',
    title: 'Find the quiet friction that stops visitors becoming enquiries.',
    description:
      'A practical review of your site and landing pages, focused on the decisions a visitor makes before contacting you.',
    intro:
      'Traffic is only useful when the page earns the next action. We walk the sequence a visitor experiences, mark the places doubt builds, and turn that into changes your team can ship.',
    points: [
      'Mobile-first walkthrough of the real journey',
      'Findings backed by your own data',
      'A ranked, buildable fix list',
    ],
    deliverables: [
      {
        title: 'Heuristic walkthrough',
        body: 'Every step from ad or search result to enquiry, on mobile first, noting where attention or trust leaks.',
      },
      {
        title: 'Data check',
        body: 'Analytics, session recordings and form analytics read together to confirm where people actually drop.',
      },
      {
        title: 'Prioritised fixes',
        body: 'A ranked list — effort against likely impact — that a developer or your team can act on without us.',
      },
    ],
    body: [
      'A conversion review is not a redesign. It is the cheapest way to find out whether you have a traffic problem or a page problem before spending on either.',
      'You keep the document. If you never work with us again, it is still useful.',
    ],
    image: '/assets/work-strategy-workbench.png',
  },
};

export const companyPages = {
  about: {
    label: 'About',
    title: 'From a freelance studio to a full-funnel agency.',
    description:
      'Digital Web Assurances — formerly Develop With Arim. The founder, the team, and how one group owns the whole path from a search to a sale.',
    intro:
      'Digital Web Assurances started as Develop With Arim, the freelance practice of software engineer and SEO specialist Siddik Arim. It has grown into a full team that builds the site, runs the search and paid campaigns, and owns the tracking that ties them together.',
    points: [
      'Formerly Develop With Arim',
      'Engineering, SEO, paid media and analytics in one team',
      'Led by an engineer with a nose for business',
    ],
    deliverables: [
      {
        title: 'One team, one number to call',
        body: 'The person who runs your ads can change your landing page the same afternoon. No ticket between agencies.',
      },
      {
        title: 'Engineering at the core',
        body: 'A senior engineering team on the MERN stack, so a SaaS platform or an ecommerce build is in scope, not just a marketing site.',
      },
      {
        title: 'Straight answers about fit',
        body: 'We will tell you when a smaller scope, a different specialist or no project at all is the right call.',
      },
    ],
    body: [
      'The model where SEO, web and paid are separate contracts exists for the agencies, not the client. Every handoff is a place results go to die.',
      'The team is structured so that owning the whole funnel is actually possible — engineers, SEO, paid media, sales and analytics under one roof.',
    ],
    image: '/assets/hero-growth-ribbon.png',
  },

  work: {
    label: 'Work',
    title: 'The kind of work we are built to take on.',
    description:
      'SaaS platforms, ecommerce builds, and the SEO and paid-media systems that bring them traffic — the work Digital Web Assurances is built for.',
    intro:
      'The work ranges from a single high-stakes landing page to a full SaaS platform with the demand engine attached. We are selective about scope, not about ambition. Named client stories will appear here as they are cleared to share.',
    points: [
      'SaaS platforms and web apps on the MERN stack',
      'Ecommerce builds and the campaigns that feed them',
      'SEO and paid-media systems, measured server-side',
    ],
    deliverables: [
      {
        title: 'Platforms & web apps',
        body: 'High-performance SaaS products and internal tools — React, Node, Express and MongoDB, architected to scale.',
      },
      {
        title: 'Ecommerce',
        body: 'Storefronts built for speed and search, wired to Google Shopping and Meta catalogue campaigns from day one.',
      },
      {
        title: 'Growth systems',
        body: 'A technical SEO foundation, Google and Meta campaigns, and server-side tracking that shows which channel earned the sale.',
      },
      {
        title: 'Landing pages & CRO',
        body: 'Single pages engineered to convert a specific campaign, and reviews that find why an existing one does not.',
      },
    ],
    body: [
      'Two of the tools on this site — the free technical SEO audit and the keyword research tool — are ours. They are a fair sample of how the team thinks about a problem.',
      'When there is client work worth showing, with permission and real numbers, it will appear here and not before.',
    ],
    image: '/assets/work-strategy-workbench.png',
  },

  process: {
    label: 'Process',
    title: 'Diagnose the bottleneck, fix that, measure it, repeat.',
    description:
      'The Digital Web Assurances process — from finding what actually limits growth to a system that keeps improving.',
    intro:
      'We do not start by building. We start by finding the single thing most limiting the number of qualified customers you get, because fixing anything else first is motion without progress.',
    points: [
      'Find the one real constraint first',
      'Ship the smallest change that moves it',
      'Confirm with revenue, then move to the next',
    ],
    deliverables: [
      {
        title: 'Diagnose',
        body: 'Audit the site, the demand and the tracking. Name the constraint. If it is not us, say so.',
      },
      {
        title: 'Build',
        body: 'Make the smallest change that moves the constraint — a page, a campaign, a measurement fix — and ship it.',
      },
      {
        title: 'Measure',
        body: 'Watch real behaviour and real revenue, not vanity metrics. Confirm it moved.',
      },
      {
        title: 'Repeat',
        body: 'The next constraint is now somewhere else. Go find it.',
      },
    ],
    body: [
      'Growth work fails when it becomes a checklist applied regardless of whether it was the problem — a blog when the issue was page speed, a redesign when the issue was the offer.',
      'One constraint at a time is slower to pitch and faster to results.',
    ],
    image: '/assets/project-brief-contact.png',
  },

  contact: {
    label: 'Contact',
    title: 'Tell us what needs to work better.',
    description:
      'Start a conversation with Digital Web Assurances about your website, SEO, Google or Meta Ads, tracking or conversion path.',
    intro:
      'Send the context you have — what you sell, who buys it, and what is not working. You will get a reply from the person who would actually do the work, with a straight answer about whether we are a fit.',
    points: ['A human reply, not a sequence', 'One working day', 'An honest answer about fit'],
    deliverables: [
      {
        title: 'No sales sequence',
        body: 'One human reads it and replies. No drip campaign, no SDR, no "quick call to qualify you".',
      },
      {
        title: 'A reply in one working day',
        body: 'Usually with a question or two before any proposal — we would rather understand the problem than guess at it.',
      },
      {
        title: 'A straight answer on fit',
        body: 'Including when the answer is that someone else is better for what you need.',
      },
    ],
    body: [
      'The fastest way to reach us is the form on the home page, or admin@developwitharim.com. Phone and WhatsApp are in the footer.',
      'If it is genuinely urgent, say so in the first line and it will be treated that way.',
    ],
    image: '/assets/project-brief-contact.png',
  },
};
