import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

// Use a more compatible approach for connection configuration
let prismaOptions = {}
if (process.env.NODE_ENV === 'production') {
  prismaOptions = {
    log: ['error'],
  }
} else {
  prismaOptions = {
    log: ['query', 'error', 'warn'],
  }
}

export const prisma = globalForPrisma.prisma || new PrismaClient(prismaOptions)

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma