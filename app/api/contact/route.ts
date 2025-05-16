import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyJwtToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for contact form validation
const contactSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').optional(),
  email: z.string().email('Email invalide').optional(),
  phone: z.string().optional(),
  message: z.string().min(10, 'Le message doit contenir au moins 10 caractères'),
  userId: z.number().optional(),
});

export async function POST(req: Request) { 
  try {
    const body = await req.json();
    const cookieStore = cookies();
    const token = cookieStore.get('token');
    let userId: number | undefined;

    // If token exists, verify it and get userId
    if (token) {
      const payload = await verifyJwtToken(token.value);
      if (payload?.userId && typeof payload.userId === 'number') {
        userId = payload.userId;
        
        // Get user data
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { username: true, email: true },
        });

        if (user) {
          body.name = user.username;
          body.email = user.email;
        }
      }
    }

    // Validate the request body
    const validatedData = contactSchema.parse(body);

    // If user is not logged in, require name and email
    if (!userId && (!validatedData.name || !validatedData.email)) {
      return NextResponse.json(
        { message: 'Le nom et l\'email sont requis pour les utilisateurs non connectés' },
        { status: 400 }
      );
    }

    // Create contact message
    const contact = await prisma.contact.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        message: validatedData.message,
        userId: userId,
      },
    });

    return NextResponse.json(
      { message: 'Message envoyé avec succès', contact },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Erreur de validation', errors: error.errors },
        { status: 400 }
      );
    }

    console.error('Contact submission error:', error);
    return NextResponse.json(
      { message: 'Une erreur s\'est produite. Veuillez réessayer plus tard.' },
      { status: 500 }
    );
  }
}