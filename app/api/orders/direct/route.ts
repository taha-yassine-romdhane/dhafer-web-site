import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJwtToken, getUser } from '@/lib/auth';
import { sendOrderConfirmationSms } from '@/lib/sms-service';
import { sendOrderConfirmationEmail } from '@/lib/email';

// Helper function to add customer to SMS subscribers
async function addToSmsSubscribers(phoneNumber: string, name: string, userId: number | null, source: string) {
  // Clean the phone number - remove any non-digit characters
  let formattedPhone = phoneNumber.replace(/\D/g, '');
  
  // If it starts with 216 (Tunisia) and is longer than 8 digits, trim it
  if (formattedPhone.startsWith('216') && formattedPhone.length > 8) {
    formattedPhone = formattedPhone.substring(3);
  }
  
  // Make sure it's a valid Tunisian phone number (8 digits)
  if (!/^\d{8}$/.test(formattedPhone)) {
    console.warn('Invalid phone number format for SMS subscription:', phoneNumber);
    return;
  }

  // Check if the subscriber already exists
  const existingSubscriber = await prisma.sMSSubscriber.findFirst({
    where: {
      phoneNumber: formattedPhone
    }
  });

  if (existingSubscriber) {
    // If the subscriber exists but is inactive, reactivate them
    if (!existingSubscriber.isActive) {
      await prisma.sMSSubscriber.update({
        where: { id: existingSubscriber.id },
        data: { isActive: true }
      });
    }
    // No need to do anything if they're already active
    return;
  }

  // Create a new subscriber
  await prisma.sMSSubscriber.create({
    data: {
      phoneNumber: formattedPhone,
      name: name || 'Non spécifié',
      source: source,
      isActive: true
    }
  });
}

export async function POST(request: Request) {
  try {
    // Extract user ID from JWT token if available
    let userId = null;
    const authHeader = request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const user = await verifyJwtToken(token);
        if (user && user.userId) {
          userId = user.userId;
        }
      } catch (error) {
        console.error('Error verifying token:', error);
        // Continue without user ID if token verification fails
      }
    }

    const data = await request.json();

    // Validate required fields
    if (!data.fullName || !data.phone || !data.address || !data.productId || !data.colorId || !data.sizeId || !data.quantity || !data.price) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Fetch the product to verify it exists
    const product = await prisma.product.findUnique({
      where: { id: Number(data.productId) },
      include: {
        colorVariants: {
          where: { id: Number(data.colorId) },
          include: {
            stocks: {
              where: { sizeId: Number(data.sizeId) },
            },
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Create the order
    const order = await prisma.order.create({
      data: {
        customerName: data.fullName,
        phoneNumber: data.phone,
        address: `${data.address}${data.governorate ? `, ${data.governorate}` : ''}`,
        totalAmount: Number(data.price) * Number(data.quantity),
        status: 'PENDING',
        userId: userId ? Number(userId) : undefined, // Associate with user if logged in
        items: {
          create: [
            {
              productId: Number(data.productId),
              colorVariantId: Number(data.colorId),
              sizeId: Number(data.sizeId),
              quantity: Number(data.quantity),
              price: Number(data.price),
            },
          ],
        },
      },
      include: {
        items: {
          include: {
            product: true,
            colorVariant: {
              include: {
                images: {
                  take: 1,
                },
              },
            },
          },
        },
      },
    });

    // Fetch complete order information including size details for notifications
    let orderWithSizes;
    try {
      orderWithSizes = await prisma.order.findUnique({
        where: { id: order.id },
        include: {
          items: {
            include: {
              product: true,
              colorVariant: true,
              size: {
                select: {
                  id: true,
                  value: true
                }
              }
            }
          }
        }
      });
    } catch (error) {
      console.error('Error fetching complete order details:', error);
    }

    // Save customer to SMS subscribers table
    try {
      await addToSmsSubscribers(data.phone, data.fullName, userId, 'direct_order');
    } catch (subscribeError) {
      // Log the error but don't fail the order creation
      console.error('Failed to add customer to SMS subscribers:', subscribeError);
    }
    
    // Send SMS confirmation if we have the order details
    if (orderWithSizes) {
      try {
        const smsResult = await sendOrderConfirmationSms(
          orderWithSizes,
          data.fullName,
          data.phone
        );
        console.log('SMS confirmation result:', smsResult);
      } catch (smsError) {
        // Log the error but don't fail the order creation
        console.error('Failed to send confirmation SMS:', smsError);
      }
      
      // Send email confirmation if email is provided
      if (data.email) {
        try {
          // Cast to OrderWithItems type to satisfy TypeScript
          await sendOrderConfirmationEmail(
            orderWithSizes as any,
            data.fullName,
            data.email
          );
          console.log('Email confirmation sent to:', data.email);
        } catch (emailError) {
          // Log the error but don't fail the order creation
          console.error('Failed to send confirmation email:', emailError);
        }
      } else if (userId) {
        // If no email provided but user is logged in, try to get their email
        try {
          const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { email: true }
          });
          
          if (user && user.email) {
            // Cast to OrderWithItems type to satisfy TypeScript
            await sendOrderConfirmationEmail(
              orderWithSizes as any,
              data.fullName,
              user.email
            );
            console.log('Email confirmation sent to logged-in user:', user.email);
          }
        } catch (userEmailError) {
          console.error('Failed to send confirmation email to logged-in user:', userEmailError);
        }
      }
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      {
        error: 'Failed to create order',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}