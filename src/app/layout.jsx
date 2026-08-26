import '@fontsource-variable/geist';
import './globals.css';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://digitalwebassurances.com';

/**
 * The Vite build shipped `<title>dwa-site</title>` and nothing else — no
 * description, no canonical, no social card — on a client-rendered page. For an
 * agency selling SEO that is the worst possible shop window, and Google Ads
 * scores landing page experience partly on it. Metadata lives here so every
 * route inherits a sane default and can override what it needs.
 */
export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Digital Web Assurances — Landing pages, SEO and Google Ads',
    // Route segments set their own title; this keeps the brand on the end.
    template: '%s | Digital Web Assurances',
  },
  description:
    'We build the digital system that turns attention into customers — landing pages designed to convert, SEO that compounds, and Google Ads pointed at pages that are ready for the traffic.',
  applicationName: 'Digital Web Assurances',
  keywords: [
    'landing page design',
    'conversion rate optimisation',
    'technical SEO audit',
    'Google Ads management',
    'SEO agency',
  ],
  authors: [{ name: 'Digital Web Assurances' }],
  creator: 'Digital Web Assurances',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: 'Digital Web Assurances',
    url: SITE_URL,
    title: 'Digital Web Assurances — Landing pages, SEO and Google Ads',
    description:
      'Landing pages designed to convert, SEO that compounds, and Google Ads pointed at pages that are ready for the traffic.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Digital Web Assurances — Landing pages, SEO and Google Ads',
    description:
      'Landing pages designed to convert, SEO that compounds, and Google Ads pointed at pages that are ready for the traffic.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  icons: { icon: '/favicon.svg' },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#ffffff',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-paper font-sans text-ink antialiased">{children}</body>
    </html>
  );
}
