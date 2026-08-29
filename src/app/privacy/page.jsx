import LegalPage from '@/components/LegalPage';

export const metadata = {
  title: 'Privacy policy',
  description:
    'How Digital Web Assurances collects, uses and protects personal data from the enquiry form, the free tools and analytics.',
  alternates: { canonical: '/privacy' },
  robots: { index: true, follow: true },
};

const UPDATED = '29 August 2026';

const SECTIONS = [
  {
    heading: 'Who we are',
    body: [
      'Digital Web Assurances (formerly Develop With Arim) is a digital growth agency operated by Siddik Arim. This policy covers digitalwebassurances.com and the tools hosted on it.',
      'Contact for any privacy question: admin@developwitharim.com, or +880 1518 991960.',
    ],
  },
  {
    heading: 'What we collect',
    body: [
      'When you submit the enquiry form we store what you enter — your name, email, website, the service you are interested in and your message — together with campaign attribution captured from the URL (UTM parameters and gclid), the page you submitted from, the referring page, a one-way hash of your IP address, your browser user-agent and a timestamp.',
      'When you run the free technical SEO audit we store the URL you submit, an optional email if you provide one, and a hash of your IP. The keyword research tool stores the query terms you enter.',
      'With your consent, analytics and advertising cookies (see “Cookies and analytics” below) collect standard usage data — pages viewed, approximate location, device and referral source.',
      'We do not ask for, and you should not send us, sensitive personal data or payment details through this site.',
    ],
  },
  {
    heading: 'Why we use it',
    body: [
      [
        'To reply to your enquiry and, if we work together, to deliver the project.',
        'To understand which marketing channels bring useful enquiries, so we can spend our own budget sensibly.',
        'To run and rate-limit the free tools and protect them from abuse.',
        'To measure the performance of our advertising, only where you have accepted marketing cookies.',
      ],
      'The legal bases are your consent (for analytics and advertising cookies, which you can withdraw at any time), and our legitimate interest in responding to enquiries and running the site securely.',
    ],
  },
  {
    heading: 'Where it is stored and who can see it',
    body: [
      'Enquiries and tool results are stored in a PostgreSQL database on a private server we control. New-enquiry notifications are sent to us by email through our mail provider.',
      'The audit tool sends the URL you submit to Google PageSpeed Insights and Mozilla’s HTTP Observatory to fetch performance and security data, and performs a search-engine lookup for that URL. Only the URL is shared with these services.',
      'Where you have accepted cookies, usage data is processed by Google (Google Analytics 4 and Google Ads) and Meta (the Meta Pixel). These providers may process data outside Bangladesh, including in the United States, under their own terms and safeguards.',
      'We do not sell personal data, and we do not share enquiry details with anyone except as needed to reply to you or deliver work you have engaged us for.',
    ],
  },
  {
    heading: 'Cookies and analytics',
    body: [
      'Essential functionality (such as remembering your cookie choice) does not require consent.',
      'Analytics and advertising cookies load only after you choose “Accept” on the banner. We use Google Consent Mode v2, so before consent no advertising or analytics identifiers are stored. Choosing “Decline” leaves the whole site fully usable.',
      'You can change your mind any time by clearing this site’s data in your browser, which brings the banner back.',
    ],
  },
  {
    heading: 'How long we keep it',
    body: [
      'Enquiry records are kept while there is a prospective or active working relationship and for a reasonable period afterwards for our records, then deleted.',
      'Audit results are cached for around 24 hours to avoid re-running the same checks, and cleared periodically after that.',
      'Analytics data retention follows the settings in Google Analytics and Meta.',
    ],
  },
  {
    heading: 'Your rights',
    body: [
      'You can ask us to show you the personal data we hold about you, correct it, delete it, or stop using it, and you can withdraw consent for cookies at any time. Email admin@developwitharim.com and we will respond within a reasonable time.',
      'This site is not directed at children and we do not knowingly collect data from anyone under 18.',
    ],
  },
  {
    heading: 'Changes to this policy',
    body: [
      'If this policy changes we will update this page and the “last updated” date above. Material changes will be reflected the next time you visit.',
    ],
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy policy"
      updated={UPDATED}
      intro="This explains what personal data we collect through this website, why, and what you can do about it. It is written to be read, not to hide behind."
      sections={SECTIONS}
    />
  );
}
