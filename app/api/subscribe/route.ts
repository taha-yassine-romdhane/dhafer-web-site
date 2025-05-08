import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { phoneNumber } = await request.json();
    
    // Validate phone number
    if (!phoneNumber) {
      return NextResponse.json(
        { success: false, error: 'Numéro de téléphone requis' },
        { status: 400 }
      );
    }
    
    // Clean the phone number - remove any non-digit characters
    let formattedPhone = phoneNumber.replace(/\D/g, '');
    
    // If it starts with 216 (Tunisia) and is longer than 8 digits, trim it
    if (formattedPhone.startsWith('216') && formattedPhone.length > 8) {
      formattedPhone = formattedPhone.substring(3);
    }
    
    // Make sure it's a valid Tunisian phone number (8 digits)
    if (!/^\d{8}$/.test(formattedPhone)) {
      return NextResponse.json(
        { success: false, error: 'Format de numéro de téléphone invalide' },
        { status: 400 }
      );
    }
    
    // Check if the phone number already exists
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
        
        return NextResponse.json({
          success: true,
          message: 'Vous êtes maintenant réabonné à nos mises à jour par SMS!'
        });
      }
      
      // Already subscribed
      return NextResponse.json({
        success: true,
        message: 'Vous êtes déjà inscrit à nos mises à jour par SMS!'
      });
    }
    
    // Create a new subscriber
    await prisma.sMSSubscriber.create({
      data: {
        phoneNumber: formattedPhone,
        source: 'website_footer',
        isActive: true
      }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Merci! Vous êtes maintenant inscrit à nos mises à jour par SMS!'
    });
    
  } catch (error) {
    console.error('Error creating SMS subscriber:', error);
    return NextResponse.json(
      { success: false, error: 'Une erreur est survenue lors de l\'abonnement' },
      { status: 500 }
    );
  }
}
