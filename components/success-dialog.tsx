import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import Image from "next/image";
import { Product, ProductImage, ColorVariant } from "@prisma/client";

interface SuccessDialogProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  onConfirm: () => void;
  product: Product | null;
  selectedColorVariant: (ColorVariant & { images: ProductImage[] }) | null;
  selectedSize: string;
  userDetails: {
    fullName: string;
    address: string;
    governorate: string;
    phone: string;
  };
}

export function SuccessDialog({
  isOpen,
  onClose,
  message,
  onConfirm,
  product,
  selectedColorVariant,
  selectedSize,
  userDetails,
}: SuccessDialogProps) {
  if (!product || !selectedColorVariant) return null;

  const mainImage = selectedColorVariant.images.find((img: ProductImage) => img.isMain)?.url || selectedColorVariant.images[0]?.url;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Succès!</DialogTitle>
          <DialogDescription>
            <p>{message}</p>
            <div className="flex items-center gap-4 mt-4">
              <div className="relative w-24 h-24">
                <Image
                  src={mainImage}
                  alt={`${product.name} - ${selectedColorVariant.color}`}
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold">{product.name}</h3>
                <p>Couleur: {selectedColorVariant.color}</p>
                <p>Taille: {selectedSize}</p>
                <p>Prix: {product.salePrice ? product.salePrice : product.price} TND</p>
              </div>
            </div>
            <div className="mt-4">
              <h4 className="text-md font-bold">Détails de l'utilisateur:</h4>
              <p>Nom: {userDetails.fullName}</p>
              <p>Adresse: {userDetails.address}, {userDetails.governorate}</p>
              <p>Téléphone: {userDetails.phone}</p>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={onClose} variant="outline">Annuler</Button>
          <Button onClick={onConfirm} className="bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-white font-bold">Confirmer la commande</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}