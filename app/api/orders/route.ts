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

export async function POST(req: Request) {
  try {
    // Extract user ID from JWT token if available
    let userId = null;
    const authHeader = req.headers.get('Authorization');
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

    const body = await req.json();
    const { customerName, phoneNumber, address, totalAmount, items } = body;

    // Validate required fields
    if (!customerName || !phoneNumber || !address || !totalAmount || !items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate each item and check stock
    for (const item of items) {
      if (!item.productId || !item.quantity || !item.price || !item.size || !item.color) {
        return NextResponse.json(
          { error: 'Invalid item data: missing required fields' },
          { status: 400 }
        );
      }

      // First, find the size ID from the size value
      const size = await prisma.size.findFirst({
        where: { value: item.size },
      });

      if (!size) {
        return NextResponse.json(
          { error: `Size ${item.size} not found` },
          { status: 404 }
        );
      }

      // Verify the product exists and get its color variant ID
      const product = await prisma.product.findFirst({
        where: { id: item.productId },
        include: {
          colorVariants: {
            where: {
              color: item.color,
            },
            include: {
              stocks: {
                where: { sizeId: size.id },
              },
            },
          },
        },
      });

      if (!product) {
        return NextResponse.json(
          { error: `Product with ID ${item.productId} not found` },
          { status: 404 }
        );
      }

      if (product.colorVariants.length === 0) {
        return NextResponse.json(
          { error: `Color variant ${item.color} not found for product ${item.productId}` },
          { status: 404 }
        );
      }



      // Assign the found colorVariantId
      item.colorVariantId = product.colorVariants[0].id;
    }

    // Store sizeIds for each item
    const itemsWithSizeIds = await Promise.all(items.map(async (item) => {
      const size = await prisma.size.findFirst({
        where: { value: item.size },
      });
      return {
        ...item,
        sizeId: size?.id
      };
    }));

    // Create the order with validated items
    const order = await prisma.order.create({
      data: {
        customerName,
        phoneNumber,
        address,
        totalAmount,
        status: 'PENDING',
        userId: userId ? Number(userId) : undefined, // Link order to user ID if logged in
        items: {
          create: itemsWithSizeIds.map((item) => ({
            quantity: item.quantity,
            sizeId: item.sizeId,
            price: item.price,
            productId: item.productId,
            colorVariantId: item.colorVariantId,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: true,
            colorVariant: {
              include: {
                images: {
                  where: { isMain: true },
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
      await addToSmsSubscribers(phoneNumber, customerName, userId, 'cart_order');
    } catch (subscribeError) {
      // Log the error but don't fail the order creation
      console.error('Failed to add customer to SMS subscribers:', subscribeError);
    }
    
    // Send notifications if we have the order details
    if (orderWithSizes) {
      // Send SMS confirmation
      try {
        const smsResult = await sendOrderConfirmationSms(
          orderWithSizes,
          customerName,
          phoneNumber
        );
        console.log('SMS confirmation result:', smsResult);
      } catch (smsError) {
        // Log the error but don't fail the order creation
        console.error('Failed to send confirmation SMS:', smsError);
      }
      
      // Send email confirmation if email is provided in the body
      if (body.email) {
        try {
          // Cast to OrderWithItems type to satisfy TypeScript
          await sendOrderConfirmationEmail(
            orderWithSizes as any,
            customerName,
            body.email
          );
          console.log('Email confirmation sent to:', body.email);
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
              customerName,
              user.email
            );
            console.log('Email confirmation sent to logged-in user:', user.email);
          }
        } catch (userEmailError) {
          console.error('Failed to send confirmation email to logged-in user:', userEmailError);
        }
      }
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error creating order:', error);

    // Improved error handling
    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: 'Failed to create order',
          details: error.message,
          type: error.constructor.name,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create order', details: 'Unknown error' },
      { status: 500 }
    );
  }
}