import '@fontsource-variable/geist';
import './globals.css';
import Script from 'next/script';
import Analytics from '@/components/Analytics';
import ConsentBanner from '@/components/ConsentBanner';
import FloatingCta from '@/components/FloatingCta';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://digitalwebassurances.com';

const ANALYTICS_ON = Boolean(
  process.env.NEXT_PUBLIC_GA_ID ||
    process.env.NEXT_PUBLIC_GOOGLE_ADS_ID ||
    process.env.NEXT_PUBLIC_META_PIXEL_ID,
);

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
    default: 'Digital Web Assurances — from a search to a sale, as one system',
    // Route segments set their own title; this keeps the brand on the end.
    template: '%s | Digital Web Assurances',
  },
  description:
    'One team for the whole path from a customer searching to the sale: keyword research, a MERN-built website, SEO, Google and Meta Ads, and server-side tracking. Free technical SEO audit.',
  applicationName: 'Digital Web Assurances',
  keywords: [
    'MERN website development',
    'landing page design',
    'conversion rate optimisation',
    'technical SEO audit',
    'Google Ads management',
    'Meta Ads agency',
    'server-side tracking',
  ],
  authors: [{ name: 'Digital Web Assurances' }],
  creator: 'Digital Web Assurances',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: 'Digital Web Assurances',
    url: SITE_URL,
    title: 'From a search to a sale, as one system',
    description:
      'MERN sites, SEO, Google and Meta Ads, and the server-side tracking that ties every lead back to what earned it.',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'Digital Web Assurances' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'From a search to a sale, as one system',
    description:
      'MERN sites, SEO, Google and Meta Ads, and the server-side tracking that ties every lead back to what earned it.',
    images: ['/og.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#ffffff',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-paper font-sans text-ink antialiased">
        {ANALYTICS_ON && (
          // Consent Mode v2 — the default state, set before any tag loads. Ads
          // and analytics storage start denied and are lifted only if the
          // visitor has accepted (persisted in localStorage).
          <Script id="consent-default" strategy="beforeInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              window.gtag = gtag;
              var granted = false;
              try { granted = localStorage.getItem('dwa-consent') === 'granted'; } catch (e) {}
              gtag('consent', 'default', {
                ad_storage: granted ? 'granted' : 'denied',
                ad_user_data: granted ? 'granted' : 'denied',
                ad_personalization: granted ? 'granted' : 'denied',
                analytics_storage: granted ? 'granted' : 'denied',
                functionality_storage: 'granted',
                security_storage: 'granted',
                wait_for_update: 500
              });
              gtag('set', 'url_passthrough', true);
            `}
          </Script>
        )}

        {children}

        <FloatingCta />
        {ANALYTICS_ON && (
          <>
            <Analytics />
            <ConsentBanner enabled />
          </>
        )}
      </body>
    </html>
  );
}
