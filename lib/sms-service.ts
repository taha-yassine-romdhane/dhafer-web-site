import { Order, OrderItem, Product, ColorVariant, Size } from '@prisma/client';

// Generic type for orders with items
type OrderWithItems = Order & {
  items: Array<OrderItem & {
    product: Product;
    colorVariant?: ColorVariant;
    size?: { value: string } | null;
  }>;
};

// Type for direct API response
type DirectOrderWithItems = Order & {
  items: Array<OrderItem & {
    product: Product;
    colorVariant: any;
    size: Size | null;
  }>;
};

/**
 * Formats a phone number to ensure it starts with Tunisia country code (216)
 */
export function formatPhoneNumber(phone: string): string {
  // Strip any non-numeric characters
  let formattedPhone = phone.replace(/\D/g, '');
  
  // Add Tunisia country code if not present
  if (!formattedPhone.startsWith('216') && formattedPhone.length === 8) {
    formattedPhone = `216${formattedPhone}`;
  }
  
  return formattedPhone;
}

/**
 * Creates an order confirmation message in French
 */
export function createOrderConfirmationMessage(
  order: OrderWithItems | DirectOrderWithItems,
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
    let size = '';
    if (item.size) {
      // Access the value property safely
      size = item.size.value || '';
    } else if (item.sizeId) {
      // If we only have sizeId but not the size object
      console.log('Missing size value for sizeId:', item.sizeId);
    }
    
    const quantity = item.quantity;
    const price = item.price.toFixed(2);
    
    return `- ${productName} (${color}, Taille: ${size}) x${quantity}: ${price} DT`;
  }).join('\n');
  
  // Format total amount
  const totalAmount = order.totalAmount.toFixed(2);
  
  // Create the message
  return `Bonjour ${customerName},

Merci pour votre commande chez Dar Koftan!

Détails de la commande #${order.id}:
${itemsList}

Total: ${totalAmount} DT

Nous vous contacterons bientôt pour confirmer les détails de livraison.

Cordialement,
L'équipe Dar Koftan`;
}

/**
 * Sends an SMS using the WinSMS API
 */
export async function sendSms(phone: string, message: string): Promise<{
  success: boolean;
  response?: string;
  error?: string;
}> {
  try {
    // Format the phone number
    const formattedPhone = formatPhoneNumber(phone);
    
    // Validate Tunisian phone number format
    if (!/^216\d{8}$/.test(formattedPhone)) {
      return {
        success: false,
        error: 'Invalid phone number format'
      };
    }
    
    // Prepare the API call
    const encodedMessage = encodeURIComponent(message);
    const apiKey = process.env.WINSMS_API_KEY;
    const senderID = encodeURIComponent('Dar Koftan');
    
    if (!apiKey) {
      console.error('WINSMS_API_KEY is not defined in environment variables');
      return {
        success: false,
        error: 'SMS API key not configured'
      };
    }
    
    // Construct the URL
    const url = `https://www.winsmspro.com/sms/sms/api?action=send-sms&api_key=${apiKey}&to=${formattedPhone}&from=${senderID}&sms=${encodedMessage}`;
    
    // Log the API call (without exposing the API key)
    console.log('Calling WinSMS API with endpoint pattern:', 
      `https://www.winsmspro.com/sms/sms/api?action=send-sms&api_key=[HIDDEN]&to=${formattedPhone}&from=${senderID}&sms=${encodedMessage.substring(0, 20)}...`);
    
    // Make the API call
    const response = await fetch(url, {
      method: 'GET'
    });
    
    const responseText = await response.text();
    console.log('WinSMS API response:', responseText);
    
    // Check if the response indicates success
    const success = !responseText.toLowerCase().includes('error') && response.ok;
    
    return {
      success,
      response: responseText
    };
  } catch (error) {
    console.error('Error sending SMS:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Sends an order confirmation SMS
 */
export async function sendOrderConfirmationSms(
  order: OrderWithItems | DirectOrderWithItems,
  customerName: string,
  phoneNumber: string
): Promise<{
  success: boolean;
  response?: string;
  error?: string;
}> {
  // Create the confirmation message
  const message = createOrderConfirmationMessage(order, customerName);
  
  // Send the SMS
  return await sendSms(phoneNumber, message);
}
