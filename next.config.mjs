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
