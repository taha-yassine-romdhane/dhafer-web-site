/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
    // Improve memory usage
    optimizeCss: true,
  },
  // Simplified chunk loading configuration
  onDemandEntries: {
    // Keep generated pages in memory for 60 seconds
    maxInactiveAge: 60 * 1000,
    // Have 8 pages loaded in memory at once
    pagesBufferLength: 8,
  },
  webpack: (config, { isServer }) => {
    // Only apply these optimizations for client-side bundles
    if (!isServer) {
      // Use Next.js defaults for splitChunks with minimal customization
      config.optimization = {
        ...config.optimization,
        moduleIds: 'deterministic',
        // Simplified chunk splitting to improve reliability
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            // Only create a single vendor chunk for all node_modules
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              priority: 10,
              chunks: 'all',
              reuseExistingChunk: true,
            },
          },
        },
      };
    }
    return config;
  },
  // Configure hostname and port to listen on all interfaces
  serverRuntimeConfig: {
    hostname: '0.0.0.0',
    port: parseInt(process.env.PORT || '3000', 10),
  },
  // Disable ESLint during build to avoid failing on linting errors
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Disable TypeScript type checking during build
  typescript: {
    ignoreBuildErrors: true,
  },
  // Configure image domains
  images: {
    domains: ['ik.imagekit.io', 'images.daralkoftanalassil.com'],
    // Disable image optimization since sharp is not available in the Docker container
    // This will use the original images without optimization
    unoptimized: true,
  },
};

module.exports = nextConfig;
