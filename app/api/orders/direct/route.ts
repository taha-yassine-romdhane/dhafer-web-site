import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    // Create the order in the database
    const order = await prisma.order.create({
      data: {
        fullName: data.fullName,
        address: data.address,
        governorate: data.governorate,
        phone: data.phone,
        quantity: data.quantity,
        totalPrice: data.price * data.quantity,
        status: 'PENDING',
        productId: data.productId,
        colorVariantId: data.colorId,
        size: data.size,
      },
    })

    return NextResponse.json({ success: true, order })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}
