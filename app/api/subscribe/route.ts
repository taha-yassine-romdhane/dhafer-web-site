import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJwtToken } from '@/lib/auth';

// Helper function to get user's name from their ID
async function getUserName(userId: number): Promise<string> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { username: true, email: true }
    });
    
    if (user) {
      // Return username if available, otherwise use email or default
      if (user.username && user.username.trim() !== '') {
        return user.username;
      } else if (user.email) {
        // Use email as fallback (without the domain part)
        return user.email.split('@')[0];
      }
    }
    return 'Non spécifié';
  } catch (error) {
    console.error('Error fetching user name:', error);
    return 'Non spécifié';
  }
}

// Helper function to get user from Authorization header
async function getUserFromHeader(request: NextRequest) {
  try {
    // Get the Authorization header
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    
    // Extract the token
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    try {
      // Verify the token
      const payload = await verifyJwtToken(token);
      return payload;
    } catch (error) {
      console.error('Error verifying token from header:', error);
      return null;
    }
  } catch (error) {
    console.error('Error getting user from header:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, source: requestSource } = await request.json();
    
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
    
    // Try to get the logged-in user from the Authorization header
    const user = await getUserFromHeader(request);
    
    // Create a new subscriber
    let subscriberName = 'Non spécifié';
    
    if (user) {
      // Try to get the username first
      subscriberName = await getUserName(user.userId);
      
      // If still default, try using email directly from the token
      if (subscriberName === 'Non spécifié' && user.email) {
        subscriberName = user.email.split('@')[0];
      }
    }
    
    await prisma.sMSSubscriber.create({
      data: {
        phoneNumber: formattedPhone,
        source: requestSource || 'website_footer', // Use the source from request or default to website_footer
        name: subscriberName,
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
