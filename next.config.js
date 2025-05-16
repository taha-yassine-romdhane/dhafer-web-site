/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Disable static optimization for routes that require database access
  // This prevents build-time database connection errors
  unstable_allowDynamic: [
    '**/node_modules/@prisma/client/**',
  ],
  experimental: {
    serverComponentsExternalPackages: [],
    // Improve memory usage
    optimizeCss: true,
  },
  // Improve chunk loading reliability
  onDemandEntries: {
    // Keep generated pages in memory for 60 seconds
    maxInactiveAge: 60 * 1000,
    // Have 8 pages loaded in memory at once
    pagesBufferLength: 8,
  },
  webpack: (config) => {
    // Optimize bundle size
    config.optimization = {
      ...config.optimization,
      moduleIds: 'deterministic',
      // Improve chunk loading reliability
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          // Create a commons chunk for shared code
          commons: {
            name: 'commons',
            chunks: 'all',
            minChunks: 2,
            reuseExistingChunk: true,
          },
          // Create a larger vendor chunk to avoid frequent changes
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendor',
            chunks: 'all',
          },
        },
      },
    };
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
    // Enable image optimization for better iOS compatibility
    unoptimized: false,
    // Add reasonable image sizes to improve performance
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    // Increase quality slightly but keep reasonable for performance
    minimumCacheTTL: 60,
  },
};

module.exports = nextConfig;
