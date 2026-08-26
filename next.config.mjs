/** @type {import('next').NextConfig} */
const nextConfig = {
  // The VPS deploy runs `next start` against a self-contained build rather than
  // a platform adapter, so trace the server bundle and its deps into .next.
  output: 'standalone',
  reactStrictMode: true,
};

export default nextConfig;
