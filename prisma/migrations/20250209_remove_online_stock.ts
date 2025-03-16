import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Remove all online stock records
  await prisma.stock.deleteMany({
    where: {
      location: 'online'
    }
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
