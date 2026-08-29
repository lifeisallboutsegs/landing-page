/**
 * Code-defined defaults for the About page and the team roster.
 *
 * These are what the site renders with an empty database. The admin CMS
 * (`/admin/content`, `/admin/team`) writes rows that override them; nothing
 * here is ever required to come from the database.
 */

export const aboutDefaults = {
  kicker: 'About · formerly Develop With Arim',
  heroTitle: 'From a freelance studio to a full-funnel agency.',
  heroIntro:
    'Digital Web Assurances started as Develop With Arim, the freelance practice of software engineer and SEO specialist Siddik Arim. It has grown into a full team that builds the site, runs the search and paid campaigns, and owns the tracking that ties them together.',

  founderName: 'Siddik Arim',
  founderRole: 'Founder',
  founderPhoto: '/assets/siddik-arim.jpg',
  founderTagline:
    'Software engineer and SEO specialist, with an instinct for the business behind the brief.',
  founderBio: [
    'Digital Web Assurances began as Develop With Arim — Siddik taking on freelance web development for whoever would hire him. It grew into a full agency on the back of one pattern he kept seeing: a business pays for traffic, the traffic arrives, and nothing happens, because the site, the SEO and the ads are three separate contracts with no one accountable for the result.',
    'His work spans high-performance SaaS platforms and ecommerce stores through to the SEO and paid-media playbooks that bring them customers. The technical depth means a page is engineered to rank and convert, not just to look finished; the commercial read means the strategy is pointed at revenue, not activity.',
  ],

  leadName: 'Al Shadab Arnab',
  leadRole: 'Senior Software Engineer',
  leadPhoto: '/assets/al-shadab-arnab.jpg',
  leadHeading: 'The technical backbone',
  leadBio: [
    'Arnab leads the build. His work is in scalable architecture and performance — robust backend systems and the frontend experiences on top of them — and in holding every project to the same bar for code quality and reliability.',
    'A bias toward clean code and unglamorous problem-solving is what keeps the things we ship maintainable after we hand them over.',
  ],

  teamHeading: 'The people behind every pixel, strategy and sale.',
  quote: 'We don’t just build websites. We build the system a business grows on.',
};

export const TEAM_GROUPS = [
  { key: 'leadership', label: 'Leadership', blurb: 'Steering the vision and the numbers.' },
  {
    key: 'advisory',
    label: 'Advisory & management',
    blurb: 'Guiding business growth and keeping the operation honest.',
  },
  {
    key: 'core',
    label: 'The core team',
    blurb: 'The engineers, marketers and sellers who bring each project to life.',
  },
];

export const teamDefaults = {
  leadership: [
    { name: 'Siddik Arim', role: 'Founder & CEO' },
    { name: 'Nabil Mahmud', role: 'Chief Operating Officer' },
    { name: 'Sharmin Sultana', role: 'Chief Financial Officer' },
  ],
  advisory: [
    { name: 'Fardin Ahmed', role: 'Administrative Manager' },
    { name: 'Maksudul Alam', role: 'Financial Advisor' },
    { name: 'Mehrun Jhaved', role: 'Business Consultant' },
  ],
  core: [
    { name: 'Al Shadab Arnab', role: 'Senior Software Engineer' },
    { name: 'Shakib Ahmed', role: 'Software Engineer' },
    { name: 'Tamzidur Rahman Methu', role: 'Software Engineer' },
    { name: 'Shak. Md. Ferdus', role: 'Web Developer' },
    { name: 'Nahid Islam', role: 'Head of Sales' },
    { name: 'Istiyak Ahamed Siam', role: 'Marketing Executive' },
    { name: 'Md. Rahim', role: 'Paid Ads Expert' },
    { name: 'Mariam Mitu', role: 'Intern' },
  ],
};
