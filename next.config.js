/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: ['bcrypt'],
  },
  webpack: (config) => {
    config.externals = [...config.externals, 'bcrypt'];
    return config;
  },
  // Configure hostname and port to listen on all interfaces
  serverRuntimeConfig: {
    hostname: '0.0.0.0',
    port: parseInt(process.env.PORT || '3000', 10),
  },
  // Increase timeout for API routes
  api: {
    responseLimit: '8mb',
    bodyParser: {
      sizeLimit: '8mb',
    },
  },
};

module.exports = nextConfig;
