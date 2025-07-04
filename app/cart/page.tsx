'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Minus, Plus, Trash2, ArrowRight, X, CheckCircle2 } from 'lucide-react';
import { useCart } from '@/lib/context/cart-context';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth-context';
import { apiPost } from '@/lib/api-client';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const router = useRouter();
  const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCart();
  // Get user data directly from auth context
  const { isLoggedIn, user } = useAuth();
  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    phone: '',
    address: '',
    email: '',
  });
  const [validationErrors, setValidationErrors] = useState({
    name: false,
    phone: false,
    address: false,
    email: false // Email is optional so no validation error by default
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);

  const total = totalPrice;

  // Apply user data from auth context directly to the form
  useEffect(() => {
    setLoadingUser(true);
    console.log('Auth state changed:', { isLoggedIn, user });
    
    if (isLoggedIn && user) {
      console.log('User is logged in, applying user data to form');
      setCustomerDetails({
        name: user.username || '',
        phone: '', // Auth context doesn't have phone, will need to update if needed
        address: '', // Auth context doesn't have address, will need to update if needed
        email: user.email || '',
      });
    } else {
      console.log('User is not logged in or user data is missing');
    }
    
    setLoadingUser(false);
  }, [isLoggedIn, user]);
  
  // Load additional user details if needed
  useEffect(() => {
    // Only fetch additional details if user is already logged in and we have base data
    if (isLoggedIn && user && user.id) {
      const fetchAdditionalUserDetails = async () => {
        try {
          console.log('Fetching additional user details...');
          const response = await fetch('/api/users/profile');
          
          if (response.ok) {
            const data = await response.json();
            if (data.user) {
              // Update with additional details while preserving what we already have
              setCustomerDetails(prev => ({
                name: prev.name || data.user.username || '',
                phone: data.user.phone || prev.phone || '',
                address: data.user.address || prev.address || '',
                email: prev.email || data.user.email || '',
              }));
              console.log('Additional user details loaded');
            }
          }
        } catch (error) {
          console.error('Error fetching additional user details:', error);
        }
      };
      
      fetchAdditionalUserDetails();
    }
  }, [isLoggedIn, user]);

  const handleConfirmOrder = () => {
    // Reset validation errors
    const errors = {
      name: !customerDetails.name,
      phone: !customerDetails.phone,
      address: !customerDetails.address,
      email: false // Email is optional, so never show validation error
    };

    setValidationErrors(errors);

    // Check if any validation errors exist
    if (errors.name || errors.phone || errors.address) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      // Scroll to the first form field for better UX
      document.getElementById('customer-details')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    setShowConfirmation(true);
  };

  const handleSubmitOrder = async () => {
    setIsSubmitting(true);
    try {
      // Use apiPost which automatically includes the auth token in headers
      const order = await apiPost('/api/orders', {
        customerName: customerDetails.name,
        phoneNumber: customerDetails.phone,
        address: customerDetails.address,
        email: customerDetails.email, // Add email to the API request (optional)
        totalAmount: total,
        items: items.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          size: item.selectedSize,
          color: item.selectedColor,
          price: item.price,
        })),
      });

      // Close the confirmation dialog and show success message
      setShowConfirmation(false);
      setShowSuccessMessage(true);

      // Clear cart and reset customer details
      clearCart();
      setCustomerDetails({ name: '', phone: '', address: '', email: '' });

      // Show toast notification
      toast.success(
        'Commande créée avec succès!',
        {
          description: 'Nous vous contacterons bientôt pour confirmer les détails de votre commande.',
          duration: 8000, // Show for longer
          icon: '✅',
          style: {
            border: '2px solid #D4AF37',
            borderRadius: '8px',
            background: '#FFFBEB',
            padding: '16px',
            fontSize: '16px',
          },
        }
      );

      // Show another toast as a backup
      setTimeout(() => {
        toast.success('Votre commande a été créée avec succès!', { duration: 5000 });
      }, 500);

      // Redirect to home page after a longer delay
      setTimeout(() => {
        router.push('/');
      }, 5000);
    } catch (error) {
      console.error('Error submitting order:', error);
      toast.error('Échec de la soumission de la commande. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 text-[#7c3f61]">Panier</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-xl shadow-sm p-6 space-y-6 border border-[#7c3f61]/10">
              {items.length === 0 ? (
                <div className="text-center py-12">
                  <h2 className="text-xl font-medium text-gray-900 mb-4">Votre panier est vide</h2>
                  <p className="text-gray-500 mb-6">Il semble que vous n&apos;ayez encore rien ajouté</p>
                  <Link href="/collections">
                    <Button className="bg-[#7c3f61] hover:bg-[#7c3f61]/90 text-white">
                      Continuer vos achats
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              ) : (
                items.map((item) => (
                  <div key={`${item.id}-${item.selectedSize}-${item.selectedColor}`} className="flex gap-6 py-6 border-b last:border-0">
                    <div className="relative aspect-square w-24 overflow-hidden rounded-lg">
                      <Image
                        src={item.colorVariants?.find((v) => v.color === item.selectedColor)?.images[0]?.url || '/default-product.jpg'}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 flex flex-col">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="text-base font-medium text-gray-900">{item.name}</h3>
                          <p className="mt-1 text-sm text-gray-500">
                            {item.selectedColor} / {item.selectedSize}
                          </p>
                        </div>
                        <p className="text-base font-medium text-[#7c3f61]">
                          {Number((item.salePrice !== null && item.salePrice !== undefined ? item.salePrice : item.price) * item.quantity).toFixed(2)} TND
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 border-[#7c3f61]/20 hover:bg-[#7c3f61]/5"
                            onClick={() =>
                              updateQuantity(Number(item.id), Math.max(1, item.quantity - 1), item.selectedSize, item.selectedColor)
                            }
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 border-[#7c3f61]/20 hover:bg-[#7c3f61]/5"
                            onClick={() => updateQuantity(Number(item.id), item.quantity + 1, item.selectedSize, item.selectedColor)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => removeItem(Number(item.id), item.selectedSize, item.selectedColor)}
                        >
                          <Trash2 className="h-4 w-4 mr-2 text-gray-500" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-xl shadow-sm p-6 space-y-6 sticky top-4 border border-[#7c3f61]/10">
              <h2 className="text-lg font-semibold text-[#7c3f61]">Résumé de la commande</h2>

              {/* Customer Details */}
              <div id="customer-details" className="space-y-4">
                {loadingUser && isLoggedIn ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7c3f61]"></div>
                  </div>
                ) : (
                  <>
                    <div>
                      <Label htmlFor="name">Nom et prénom*</Label>
                      <Input
                        id="name"
                        value={customerDetails.name}
                        onChange={(e) => !isLoggedIn && setCustomerDetails({ ...customerDetails, name: e.target.value })}
                        className={`${validationErrors.name ? 'border-red-500' : ''} ${isLoggedIn ? 'bg-gray-100' : ''}`}
                        placeholder="votre nom et prénom"
                        readOnly={isLoggedIn}
                      />
                      {isLoggedIn && <p className="text-xs text-gray-500 mt-1">Information du compte (non modifiable)</p>}
                      {validationErrors.name && <p className="text-red-500 text-sm mt-1">Ce champ est obligatoire</p>}
                    </div>
                    <div>
                      <Label htmlFor="phone">Numéro de téléphone*</Label>
                      <Input
                        id="phone"
                        value={customerDetails.phone}
                        onChange={(e) => setCustomerDetails({ ...customerDetails, phone: e.target.value })}
                        className={validationErrors.phone ? 'border-red-500' : ''}
                        placeholder="votre numéro de téléphone"
                      />
                      {validationErrors.phone && <p className="text-red-500 text-sm mt-1">Ce champ est obligatoire</p>}
                    </div>
              
                    <div>
                      <Label htmlFor="address">Adresse de livraison*</Label>
                      <Input
                        id="address"
                        value={customerDetails.address}
                        onChange={(e) => setCustomerDetails({ ...customerDetails, address: e.target.value })}
                        className={validationErrors.address ? 'border-red-500' : ''}
                        placeholder="votre adresse de livraison"
                      />
                      {validationErrors.address && <p className="text-red-500 text-sm mt-1">Ce champ est obligatoire</p>}
                    </div>
                  </>
                )}
              </div>
              
              {/* Summary */}
              <div className="border-t border-[#7c3f61]/10 pt-4">
                <div className="flex justify-between mb-2">
                  <span>Sous-total</span>
                  <span className="text-[#7c3f61]">{totalPrice.toFixed(2)} TND</span>
                </div>
                <div className="flex justify-between mb-4">
                  <span>Frais de livraison</span>
                  <span className="text-[#7c3f61]">7 TND</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span className="text-[#7c3f61]">{totalPrice + 7} TND</span>
                </div>
              </div>
              
              {/* Order Button - Moved inside the sticky container */}
              <Button
                className="w-full bg-[#7c3f61] hover:bg-[#7c3f61]/90 text-white mt-6"
                onClick={handleConfirmOrder}
                disabled={items.length === 0 || isSubmitting}
              >
                Commander
              </Button>
            </div>
          </div>
        </div>
      </div>
      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-[#7c3f61]">Confirmation de commande</h2>
              <button onClick={() => setShowConfirmation(false)} className="text-gray-500 hover:text-gray-700">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="border-b border-[#7c3f61]/10 pb-4">
                <h3 className="font-medium mb-2">Détails du client</h3>
                <p>
                  <span className="text-gray-600">Nom:</span> {customerDetails.name}
                </p>
                <p>
                  <span className="text-gray-600">Téléphone:</span> {customerDetails.phone}
                </p>
                <p>
                  <span className="text-gray-600">Adresse:</span> {customerDetails.address}
                </p>
              </div>

              <div className="border-b border-[#7c3f61]/10 pb-4">
                <h3 className="font-medium mb-2">Articles commandés</h3>
                {items.map((item) => (
                  <div key={`${item.id}-${item.selectedSize}-${item.selectedColor}`} className="flex justify-between mb-2">
                    <div>
                      <span className="font-medium">{item.name}</span>
                      <div className="text-sm text-gray-600">
                        {item.quantity}x @ {(item.salePrice !== null && item.salePrice !== undefined ? item.salePrice : item.price).toFixed(2)} TND
                        {item.selectedSize && ` - Taille: ${item.selectedSize}`}
                        {item.selectedColor && ` - Couleur: ${item.selectedColor}`}
                      </div>
                    </div>
                    <span className="text-[#7c3f61]">{(item.quantity * (item.salePrice !== null && item.salePrice !== undefined ? item.salePrice : item.price)).toFixed(2)} TND</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Sous-total</span>
                  <span className="text-[#7c3f61]">{totalPrice.toFixed(2)} TND</span>
                </div>
                <div className="flex justify-between">
                  <span>Frais de livraison</span>
                  <span className="text-[#7c3f61]">7 TND</span>
                </div>
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span className="text-[#7c3f61]">{totalPrice + 7} TND</span>
                </div>
              </div>
              <div className="mt-6 space-y-4">
                <p className="text-sm text-gray-600">
                  En confirmant cette commande, vous acceptez que nous vous contactions prochainement pour confirmer les détails de votre commande et organiser la livraison.
                </p>
                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    className="w-full border-[#7c3f61]/20 hover:bg-[#7c3f61]/5 text-[#7c3f61]"
                    onClick={() => setShowConfirmation(false)}
                  >
                    Annuler
                  </Button>
                  <Button
                    className="w-full bg-[#7c3f61] hover:bg-[#7c3f61]/90 text-white"
                    onClick={handleSubmitOrder}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Envoi en cours...' : 'Confirmer la commande'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-xl max-w-md w-full p-8 shadow-2xl border-2 border-[#7c3f61] text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-[#7c3f61] mb-4">Commande créée avec succès!</h2>
            <p className="text-gray-600 mb-6">
              Nous vous contacterons bientôt pour confirmer les détails de votre commande et organiser la livraison.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Redirection vers la page d'accueil dans quelques secondes...
            </p>
            <Button
              className="w-full bg-[#7c3f61] hover:bg-[#7c3f61]/90 text-white py-3"
              onClick={() => router.push('/')}
            >
              Retour à l'accueil
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}