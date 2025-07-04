'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Bell } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface StockNotificationFormProps {
  productId: number;
  productName: string;
  selectedSize: string;
  selectedColor: string;
  isAvailable: boolean;
  className?: string;
}

export function StockNotificationForm({
  productId,
  productName,
  selectedSize,
  selectedColor,
  isAvailable,
  className = '',
}: StockNotificationFormProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber.trim()) {
      toast.error('Veuillez entrer un numéro de téléphone');
      return;
    }
    
    // Basic Tunisian phone number validation
    const phoneRegex = /^(\+?216)?[0-9]{8}$/;
    const strippedPhone = phoneNumber.replace(/\D/g, '');
    
    if (!phoneRegex.test(strippedPhone) && strippedPhone.length !== 8) {
      toast.error('Veuillez entrer un numéro de téléphone tunisien valide');
      return;
    }
    
    try {
      setLoading(true);
      
      const response = await fetch('/api/stock-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber,
          productId,
          productName,
          size: selectedSize,
          color: selectedColor
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess(true);
        toast.success('Nous vous informerons lorsque le produit sera de nouveau disponible');
        setPhoneNumber('');
        setTimeout(() => {
          setIsOpen(false);
          setSuccess(false);
        }, 3000);
      } else {
        throw new Error(data.error || 'Une erreur est survenue');
      }
    } catch (error) {
      console.error('Error subscribing to stock notification:', error);
      toast.error('Une erreur est survenue. Veuillez réessayer plus tard.');
    } finally {
      setLoading(false);
    }
  };

  if (isAvailable) {
    return null; // Don't show the notification form if the product is available
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="mt-2 w-full border-[#7c3f61] text-[#7c3f61] hover:bg-[#7c3f61]/10"
        >
          <Bell className="mr-2 h-4 w-4" />
          Me prévenir quand disponible
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Notification de disponibilité</DialogTitle>
          <DialogDescription>
            Recevez une notification dès que ce produit est de nouveau en stock.
          </DialogDescription>
        </DialogHeader>
        
        {success ? (
          <div className="py-6 text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <Bell className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Demande enregistrée!</h3>
            <p className="text-sm text-gray-500">
              Nous vous enverrons un SMS dès que le produit {productName} ({selectedColor}, taille {selectedSize}) sera disponible.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Produit: {productName}</p>
              <p className="text-sm text-gray-500">Couleur: {selectedColor} - Taille: {selectedSize}</p>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="phone" className="block text-sm font-medium">
                Votre numéro de téléphone
              </label>
              <Input
                id="phone"
                type="tel"
                placeholder="+216 XX XXX XXX"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full"
                required
              />
              <p className="text-xs text-gray-500">
                Nous utiliserons ce numéro uniquement pour vous informer de la disponibilité du produit.
              </p>
            </div>
            
            <div className="pt-2 flex justify-end">
              <Button 
                type="submit" 
                disabled={loading} 
                className="bg-[#7c3f61] hover:bg-[#7c3f61]/90 text-white"
              >
                {loading ? 'Envoi en cours...' : 'M\'avertir'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
