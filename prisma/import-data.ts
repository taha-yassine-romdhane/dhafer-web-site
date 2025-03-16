import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function importData() {
  try {
    // Read exported JSON files
    const products = JSON.parse(fs.readFileSync(path.join(__dirname, 'exports/products.json'), 'utf-8'))
    const productImages = JSON.parse(fs.readFileSync(path.join(__dirname, 'exports/productImages.json'), 'utf-8'))
    const colorVariants = JSON.parse(fs.readFileSync(path.join(__dirname, 'exports/colorVariants.json'), 'utf-8'))
    const stock = JSON.parse(fs.readFileSync(path.join(__dirname, 'exports/stock.json'), 'utf-8'))

    // Import products first
    for (const product of products) {
      await prisma.product.create({
        data: {
          ...product,
          // Exclude any auto-generated fields if they exist
          id: undefined,
          createdAt: new Date(product.createdAt),
          updatedAt: new Date(product.updatedAt),
        }
      })
    }

    // Import product images
    for (const image of productImages) {
      await prisma.productImage.create({
        data: {
          ...image,
          id: undefined,
          createdAt: new Date(image.createdAt),
          updatedAt: new Date(image.updatedAt),
        }
      })
    }

    // Import color variants
    for (const variant of colorVariants) {
      await prisma.colorVariant.create({
        data: {
          ...variant,
          id: undefined,
          createdAt: new Date(variant.createdAt),
          updatedAt: new Date(variant.updatedAt),
        }
      })
    }

    // Import stock
    for (const item of stock) {
      await prisma.stock.create({
        data: {
          ...item,
          id: undefined,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt),
        }
      })
    }

    console.log('Data imported successfully!')
  } catch (error) {
    console.error('Error importing data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

importData()