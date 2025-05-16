// This file provides a fallback for Prisma during build time
// It prevents database connection errors during static site generation

// Check if we're in a build environment
const isBuildTime = process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build';

// Mock Prisma client for build time
const mockPrismaClient = {
  $connect: () => Promise.resolve(),
  $disconnect: () => Promise.resolve(),
  // Add mock implementations for any Prisma models you use during build
  product: {
    findMany: () => Promise.resolve([]),
    findUnique: () => Promise.resolve(null),
    count: () => Promise.resolve(0),
  },
  category: {
    findMany: () => Promise.resolve([]),
    findUnique: () => Promise.resolve(null),
  },
  colorVariant: {
    findMany: () => Promise.resolve([]),
  },
  carouselImage: {
    findMany: () => Promise.resolve([]),
  },
  user: {
    findUnique: () => Promise.resolve(null),
  },
  // Add other models as needed
  $queryRaw: () => Promise.resolve([]),
};

// Export real or mock client based on environment
module.exports = { isBuildTime, mockPrismaClient };
