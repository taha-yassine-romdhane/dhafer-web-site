import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface SuccessDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
}

export function SuccessDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
}: SuccessDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            <p>{description}</p>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={onClose} className="bg-[#7c3f61] hover:bg-[#7c3f61]/90 text-white">Fermer</Button>
          <Button onClick={onConfirm} className="bg-[#7c3f61] hover:bg-[#7c3f61]/90 text-white">Confirmer la commande</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}