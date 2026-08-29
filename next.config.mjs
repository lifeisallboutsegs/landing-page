const isDevelopment = process.env.NODE_ENV === 'development';

const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDevelopment ? " 'unsafe-eval'" : ''} https://www.googletagmanager.com https://connect.facebook.net https://static.cloudflareinsights.com`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https://fonts.gstatic.com",
  `connect-src 'self'${isDevelopment ? ' ws: wss:' : ''} https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com https://*.googleadservices.com https://*.doubleclick.net https://www.facebook.com https://connect.facebook.net https://cloudflareinsights.com`,
  "frame-src 'self' https://www.googletagmanager.com",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  ...(!isDevelopment ? ['upgrade-insecure-requests'] : []),
].join('; ');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // The VPS deploy runs `next start` against a self-contained build rather than
  // a platform adapter, so trace the server bundle and its deps into .next.
  output: 'standalone',
  reactStrictMode: true,

  // Do not advertise the framework and version to anyone scanning for known
  // Next.js CVEs.
  poweredByHeader: false,

  // The dev server is also previewed through this machine's public address.
  // Next 16 blocks dev chunks/HMR from non-localhost origins unless each host
  // is explicitly trusted. This affects development only; production CORS is
  // intentionally left same-origin.
  allowedDevOrigins: ['103.106.33.83'],

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: contentSecurityPolicy },
          // Stops the browser guessing content types, which is how a benign
          // upload becomes an executable script.
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            // Nothing here needs a camera, a microphone or a location.
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          {
            // Two years, preloadable. Only safe once TLS is actually working on
            // the domain — see DEPLOY.md before switching DNS.
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
      {
        // The admin surface must never be cached by a proxy or the browser.
        source: '/admin/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, must-revalidate' },
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
        ],
      },
      {
        source: '/api/:path*',
        headers: [{ key: 'Cache-Control', value: 'no-store' }],
      },
    ];
  },
};

export default nextConfig;
