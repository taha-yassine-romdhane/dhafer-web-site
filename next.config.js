/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  // Increase timeouts for API routes
  experimental: {
    serverComponentsExternalPackages: ['bcrypt'],
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Increase the body parser size limit
  api: {
    bodyParser: {
      sizeLimit: '2mb',
    },
    responseLimit: false,
  },
  // Ensure proper handling of CORS and network issues
  poweredByHeader: false,
  // Increase the timeout for long-running operations
  httpAgentOptions: {
    keepAlive: true,
    timeout: 60000, // 60 seconds
  },
};

module.exports = nextConfig;
