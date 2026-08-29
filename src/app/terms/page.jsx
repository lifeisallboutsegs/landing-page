import LegalPage from '@/components/LegalPage';

export const metadata = {
  title: 'Terms of use',
  description: 'The terms that apply when you use the Digital Web Assurances website and its free tools.',
  alternates: { canonical: '/terms' },
  robots: { index: true, follow: true },
};

const UPDATED = '29 August 2026';

const SECTIONS = [
  {
    heading: 'Using this site',
    body: [
      'By using digitalwebassurances.com you agree to these terms. If you do not agree, please do not use the site.',
      'The site is operated by Digital Web Assurances (formerly Develop With Arim). Contact: admin@developwitharim.com.',
    ],
  },
  {
    heading: 'The free tools',
    body: [
      'The technical SEO audit and the keyword research tool are provided free and “as is”. The data they return is assembled from public sources and third-party APIs and may be incomplete, delayed or wrong. Do not rely on it as the sole basis for a business decision.',
      'The tools are rate-limited and intended for checking sites you own or are responsible for. Automated scraping, resale of the output, or use that degrades the service for others is not permitted.',
    ],
  },
  {
    heading: 'Enquiries are not a contract',
    body: [
      'Submitting the enquiry form starts a conversation. It does not create a client relationship or oblige either side to anything. Any engagement is governed by a separate written agreement signed by both parties.',
    ],
  },
  {
    heading: 'Intellectual property',
    body: [
      'The text, design, code and graphics on this site belong to Digital Web Assurances unless stated otherwise. You may view and share links to the pages, but not copy or republish substantial parts without permission.',
    ],
  },
  {
    heading: 'No warranty and limitation of liability',
    body: [
      'The site and its tools are provided without warranties of any kind, express or implied. To the fullest extent permitted by law, Digital Web Assurances is not liable for any loss or damage arising from use of, or inability to use, this site or its tools.',
    ],
  },
  {
    heading: 'Links to other sites',
    body: [
      'Where we link to third-party sites we do so for convenience. We are not responsible for their content or their practices.',
    ],
  },
  {
    heading: 'Governing law',
    body: [
      'These terms are governed by the laws of Bangladesh, and any dispute will be subject to the courts of Bangladesh.',
    ],
  },
  {
    heading: 'Changes',
    body: [
      'We may update these terms. The current version is always the one on this page, with the “last updated” date above.',
    ],
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of use"
      updated={UPDATED}
      intro="Short and plain: how you may use this website and the free tools on it."
      sections={SECTIONS}
    />
  );
}
