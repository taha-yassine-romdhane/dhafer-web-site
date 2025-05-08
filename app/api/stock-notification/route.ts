import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { phoneNumber, productId, productName, size, color } = await request.json();
    
    // Validate input
    if (!phoneNumber || !productId || !size || !color) {
      return NextResponse.json(
        { success: false, error: 'Informations incomplètes' },
        { status: 400 }
      );
    }
    
    // Clean the phone number
    let formattedPhone = phoneNumber.replace(/\D/g, '');
    
    // If it starts with 216 (Tunisia) and is longer than 8 digits, trim it
    if (formattedPhone.startsWith('216') && formattedPhone.length > 8) {
      formattedPhone = formattedPhone.substring(3);
    }
    
    // Validate Tunisian phone number format
    if (!/^\d{8}$/.test(formattedPhone)) {
      return NextResponse.json(
        { success: false, error: 'Format de numéro de téléphone invalide' },
        { status: 400 }
      );
    }
    
    // Check if the same notification already exists
    // Using raw query until prisma client is regenerated
    const existingNotifications = await prisma.$queryRaw<any[]>`
      SELECT * FROM "StockNotification" 
      WHERE "phoneNumber" = ${formattedPhone} 
      AND "productId" = ${Number(productId)} 
      AND "size" = ${size} 
      AND "color" = ${color} 
      AND "isNotified" = false 
      LIMIT 1
    `;
    
    if (Array.isArray(existingNotifications) && existingNotifications.length > 0) {
      return NextResponse.json({
        success: true,
        message: 'Vous êtes déjà inscrit pour cette notification'
      });
    }
    
    // Create a new stock notification using raw query
    await prisma.$executeRaw`
      INSERT INTO "StockNotification" ("phoneNumber", "productId", "productName", "size", "color", "isNotified", "createdAt") 
      VALUES (${formattedPhone}, ${Number(productId)}, ${productName}, ${size}, ${color}, false, ${new Date()})
    `;
    
    // Check if we should create an SMS subscriber as well
    const existingSubscriber = await prisma.sMSSubscriber.findFirst({
      where: {
        phoneNumber: formattedPhone
      }
    });
    
    // If not already a subscriber, create one
    if (!existingSubscriber) {
      await prisma.sMSSubscriber.create({
        data: {
          phoneNumber: formattedPhone,
          source: 'stock_notification',
          isActive: true
        }
      });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Notification de stock enregistrée avec succès'
    });
    
  } catch (error) {
    console.error('Error creating stock notification:', error);
    return NextResponse.json(
      { success: false, error: 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}
