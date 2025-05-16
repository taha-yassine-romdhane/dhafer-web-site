/**
 * Email utility functions using Resend API
 */

import { Order, OrderItem, Product, Size } from '@prisma/client';
import { Resend } from 'resend';

// Define types for order with items - made more flexible to accommodate different query results
type OrderWithItems = Order & {
  items: Array<{
    product: Product;
    colorVariant: any;
    size?: { id: number; value: string } | null;
    quantity: number;
    price: number;
    shippingCost: number;
    // Other fields are optional to accommodate different query structures
    [key: string]: any;
  }>;
};

const shippingCost = 6;
/**
 * Send an email using Resend API
 */
export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  // Log the email for debugging purposes
  console.log('------ EMAIL PREPARED ------');
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log('------------------------');
  
  // Check if we're in development mode or missing configuration
  if (!process.env.RESEND_API_KEY) {
    console.log('Missing Resend API key - email not actually sent');
    console.log('To send real emails, add RESEND_API_KEY to your .env file');
    return Promise.resolve();
  }
  
  try {
    // Initialize the Resend client
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Dar Koftan Al Assil <onboarding@resend.dev>',
      to,
      subject,
      html,
    });
    
    if (error) {
      console.error('Error sending email:', error);
      return;
    }
    
    console.log(`Email sent with ID: ${data?.id}`);
  } catch (error: any) {
    console.error('Error sending email:', error);
  }
}

/**
 * Send a password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  resetToken: string,
  baseUrl: string
): Promise<void> {
  const resetUrl = `${baseUrl}/reset-password/${resetToken}`;
  
  const subject = 'Reset your password';
  const html = `
    <h1>Reset Your Password</h1>
    <p>You requested a password reset for your account.</p>
    <p>Click the link below to reset your password:</p>
    <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #D4AF37; color: white; text-decoration: none; border-radius: 4px;">Reset Password</a>
    <p>This link will expire in 1 hour.</p>
    <p>If you didn't request this, please ignore this email.</p>
  `;
  
  return sendEmail({ to: email, subject, html });
}

/**
 * Creates an order confirmation email in HTML format
 */
function createOrderConfirmationEmail(
  order: OrderWithItems,
  customerName: string
): string {
  // Format items list
  const itemsList = order.items.map(item => {
    const productName = item.product.name;
    
    // Handle different order types
    let color = '';
    if ('colorVariant' in item && item.colorVariant) {
      color = item.colorVariant.color || '';
    }
    
    // Extract size value
    let size = 'N/A';
    if (item.size) {
      size = item.size.value;
    }
    
    const quantity = item.quantity;
    const price = (item.price * quantity).toFixed(2);
    
    return `<tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${productName}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${color}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${size}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${price} DT</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${shippingCost} DT</td>
      
    </tr>`;
  }).join('');
  
  // Format total amount
  const totalAmount = (order.totalAmount + shippingCost).toFixed(2);
  
  // Base URL for assets
  const logoUrl = 'https://daralkoftanalassil.com/logo1.png';
  
  // Create the HTML email
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Confirmation de Commande - Dar El Koftan Al Assil</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 20px; }
        .logo { max-width: 150px; height: auto; }
        h1 { color: #D4AF37; }
        .order-details { margin-bottom: 30px; }
        table { width: 100%; border-collapse: collapse; }
        th { background-color: #f8f8f8; text-align: left; padding: 10px; }
        .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #777; }
        .button { display: inline-block; padding: 10px 20px; background-color: #D4AF37; color: white; text-decoration: none; border-radius: 4px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="${logoUrl}" alt="Dar Koftan Logo" class="logo">
          <h1>Confirmation de Commande</h1>
        </div>
        
        <p>Bonjour ${customerName},</p>
        
        <p>Merci pour votre commande chez Dar Al Koftan Al Assil! Nous avons bien reçu votre commande et nous la traiterons dans les plus brefs délais.</p>
        
        <div class="order-details">
          <h2>Détails de la commande #${order.id}</h2>
          
          <table>
            <thead>
              <tr>
                <th>Produit</th>
                <th>Couleur</th>
                <th>Taille</th>
                <th>Quantité</th>
                <th>Prix</th>
                <th>Frais de livraison</th>
              </tr>
            </thead>
            <tbody>
              ${itemsList}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="4" style="text-align: right; padding: 10px; font-weight: bold;">Total:</td>
                <td style="padding: 10px; font-weight: bold;">${totalAmount} DT</td>
              </tr>
            </tfoot>
          </table>
        </div>
        
        <p>Nous vous contacterons bientôt pour confirmer les détails de livraison.</p>
        
        <p>Pour toute question concernant votre commande, n'hésitez pas à nous contacter.</p>
        
        <p>Cordialement,<br>L'équipe Dar Al Koftan Al Assil</p>
        
        <div class="footer">
          <p>© ${new Date().getFullYear()} Dar Al Koftan Al Assil. Tous droits réservés.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Sends an order confirmation email
 */
export async function sendOrderConfirmationEmail(
  order: OrderWithItems,
  customerName: string,
  email: string
): Promise<void> {
  const subject = `Confirmation de commande #${order.id} - Dar Koftan`;
  const html = createOrderConfirmationEmail(order, customerName);
  
  return sendEmail({ to: email, subject, html });
}
