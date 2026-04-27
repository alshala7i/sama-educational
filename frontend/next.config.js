/** @type {import('next').NextConfig} */
const nextConfig = {
  // Skip TypeScript and ESLint checks during Vercel build for faster deploys
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },

  // Proxy /api/* calls to the NestJS backend
  // In development: proxies to localhost:3001
  // In production (Vercel): proxies to the Railway backend via BACKEND_URL env var
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
