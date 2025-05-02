'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Minus, Plus, Trash2, ArrowRight, X } from 'lucide-react';
import { useCart } from '@/lib/context/cart-context';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCart();
  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    phone: '',
    address: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);
  
  const total = totalPrice ;

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await fetch('/api/users/profile');
        if (response.ok) {
          const data = await response.json();
          setCustomerDetails({
            name: data.user.username,
            phone: data.user.phone || '',
            address: data.user.address || '',
          });
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUserDetails();
  }, []);

  const handleConfirmOrder = () => {
    if (!customerDetails.name || !customerDetails.phone || !customerDetails.address) {
      toast.error('Veuillez remplir tous les détails du client');
      return;
    }
    setShowConfirmation(true);
  };

  const handleSubmitOrder = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerName: customerDetails.name,
          phoneNumber: customerDetails.phone,
          address: customerDetails.address,
          totalAmount: total,
          items: items.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
            size: item.selectedSize,
            color: item.selectedColor,
            price: item.price,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Échec de la création de la commande');
      }

      const order = await response.json();
      setShowConfirmation(false);
      toast.success('Commande soumise avec succès! Nous vous contacterons bientôt pour confirmer votre commande.');

      clearCart();
      setCustomerDetails({ name: '', phone: '', address: '' });
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
        <h1 className="text-3xl font-bold mb-8 text-[#D4AF37]">Panier</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-xl shadow-sm p-6 space-y-6 border border-[#D4AF37]/10">
              {items.length === 0 ? (
                <div className="text-center py-12">
                  <h2 className="text-xl font-medium text-gray-900 mb-4">Votre panier est vide</h2>
                  <p className="text-gray-500 mb-6">Il semble que vous n&apos;ayez encore rien ajouté</p>
                  <Link href="/collections">
                    <Button className="bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-white">
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
                        <p className="text-base font-medium text-[#D4AF37]">
                          {Number(item.price * item.quantity).toFixed(2)} TND
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 border-[#D4AF37]/20 hover:bg-[#D4AF37]/5"
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
                            className="h-8 w-8 border-[#D4AF37]/20 hover:bg-[#D4AF37]/5"
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
            <div className="bg-white rounded-xl shadow-sm p-6 space-y-6 sticky top-4 border border-[#D4AF37]/10">
              <h2 className="text-lg font-semibold text-[#D4AF37]">Résumé de la commande</h2>

              {/* Customer Details */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nom complet</Label>
                  <Input
                    id="name"
                    value={customerDetails.name}
                    onChange={(e) => setCustomerDetails((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Entrez votre nom complet"
                    className="border-[#D4AF37]/20 focus:border-[#D4AF37] focus:ring-[#D4AF37]"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Numéro de téléphone</Label>
                  <Input
                    id="phone"
                    value={customerDetails.phone}
                    onChange={(e) => setCustomerDetails((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder="Entrez votre numéro de téléphone"
                    className="border-[#D4AF37]/20 focus:border-[#D4AF37] focus:ring-[#D4AF37]"
                  />
                </div>
                <div>
                  <Label htmlFor="address">Adresse de livraison</Label>
                  <Input
                    id="address"
                    value={customerDetails.address}
                    onChange={(e) => setCustomerDetails((prev) => ({ ...prev, address: e.target.value }))}
                    placeholder="Entrez votre adresse de livraison"
                    className="border-[#D4AF37]/20 focus:border-[#D4AF37] focus:ring-[#D4AF37]"
                  />
                </div>
              </div>

              {/* Summary */}
              <div className="border-t border-[#D4AF37]/10 pt-4">
                <div className="flex justify-between mb-2">
                  <span>Sous-total</span>
                  <span className="text-[#D4AF37]">{totalPrice.toFixed(2)} TND</span>
                </div>
                <div className="flex justify-between mb-4">
                  <span>Frais de livraison</span>
                  <span className="text-[#D4AF37]"> 6 TND</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span className="text-[#D4AF37]">{totalPrice + 6} TND</span>
                </div>
              </div>

              <Button
                className="w-full bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-white"
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
              <h2 className="text-xl font-semibold text-[#D4AF37]">Confirmation de commande</h2>
              <button onClick={() => setShowConfirmation(false)} className="text-gray-500 hover:text-gray-700">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="border-b border-[#D4AF37]/10 pb-4">
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

              <div className="border-b border-[#D4AF37]/10 pb-4">
                <h3 className="font-medium mb-2">Articles commandés</h3>
                {items.map((item) => (
                  <div key={`${item.id}-${item.selectedSize}-${item.selectedColor}`} className="flex justify-between mb-2">
                    <div>
                      <span className="font-medium">{item.name}</span>
                      <div className="text-sm text-gray-600">
                        {item.quantity}x @ {item.price.toFixed(2)} TND
                        {item.selectedSize && ` - Taille: ${item.selectedSize}`}
                        {item.selectedColor && ` - Couleur: ${item.selectedColor}`}
                      </div>
                    </div>
                    <span className="text-[#D4AF37]">{(item.quantity * item.price).toFixed(2)} TND</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Sous-total</span>
                  <span className="text-[#D4AF37]">{totalPrice.toFixed(2)} TND</span>
                </div>
                <div className="flex justify-between">
                  <span>Frais de livraison</span>
                  <span className="text-[#D4AF37]">6 TND</span>
                </div>
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span className="text-[#D4AF37]">{totalPrice + 6} TND</span>
                </div>
              </div>
              <div className="mt-6 space-y-4">
                <p className="text-sm text-gray-600">
                  En confirmant cette commande, vous acceptez que nous vous contactions prochainement pour confirmer les détails de votre commande et organiser la livraison.
                </p>
                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    className="w-full border-[#D4AF37]/20 hover:bg-[#D4AF37]/5 text-[#D4AF37]"
                    onClick={() => setShowConfirmation(false)}
                  >
                    Annuler
                  </Button>
                  <Button
                    className="w-full bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-white"
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
    </div>
  );
}