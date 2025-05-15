"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Mail, Phone, Send, Clock, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { useAuth } from "@/contexts/auth-context";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Contact form validation schema
const contactSchema = z.object({
  name: z.string().min(1, "Le nom est requis").optional(),
  email: z.string().email("Email invalide").optional(),
  phone: z.string().optional(),
  message: z.string().min(10, "Le message doit contenir au moins 10 caractères"),
});

// Store locations data
const locations = [
  {
    city: "Jemmel",
    address: "105 Av. Habib Bourguiba, Jemmel",
    phone: "56 047 691",
    email: "ddarelkoftanalassil@gmail.com",
    hours: "08:30 - 20:00",
    image: "/jemmel-store.jpg",
    mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3243.184097027917!2d10.759540299999998!3d35.6231878!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1302118d3435b8f7%3A0x23da68cbce53bd56!2zREFSIEtPRlRBTiBBTCBBU1NJTCBKRU1NRUwgX9iv2KfYsSDYp9mE2YLZgdi32KfZhiDYp9mE2KPYtdmK2YQg2KzZhdin2YQ!5e0!3m2!1sfr!2stn!4v1746106948690!5m2!1sfr!2stn",
  },
  {
    city: "Sousse",
    address: "Avenue Khezama, Sousse",
    phone: "56 095 021",
    email: "ddarelkoftanalassil@gmail.com",
    hours: "09:00 - 20:00",
    image: "/sousse-store.jpg",
    mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3235.6789543261087!2d10.583948776268583!3d35.82642167271041!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x130212b6b0a9d0a1%3A0x1b1c0a0b0b0b0b0b!2sAvenue%20Khezama%2C%20Sousse!5e0!3m2!1sen!2stn!4v1706799661646!5m2!1sen!2stn",
  },
  {
    city: "Tunis",
    address: "40 Av. Fattouma Bourguiba, Tunis",
    phone: "56 048 365",
    email: "ddarelkoftanalassil@gmail.com",
    hours: "09:00 - 20:00",
    image: "/tunis-store.jpg",
    mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3235.6789543261087!2d10.583948776268583!3d35.82642167271041!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x130212b6b0a9d0a1%3A0x1b1c0a0b0b0b0b0b!2s40%20Avenue%20Fattouma%20Bourguiba%2C%20Tunis!5e0!3m2!1sen!2stn!4v1706799661646!5m2!1sen!2stn",
  },
];

const ContactPage = () => {
  const { user, isLoggedIn, checkAuth } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState(0);
  const [selectedMapLocation, setSelectedMapLocation] = useState(0);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  useEffect(() => {
    if (isLoggedIn && user) {
      setFormData((prev) => ({
        ...prev,
        name: user.username || "",
        email: user.email || "",
      }));
    }
  }, [isLoggedIn, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate form data
      const validatedData = contactSchema.parse(formData);

      // If user is not logged in, require name and email
      if (!user) {
        if (!formData.name || !formData.email) {
          toast.error("Le nom et l'email sont requis pour les utilisateurs non connectés");
          return;
        }
      }

      // Submit form data
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Important for sending cookies
        body: JSON.stringify({
          ...validatedData,
          userId: user?.id, // Include userId if user is logged in
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Une erreur s'est produite");
      }

      setShowSuccessDialog(true);
      setFormData({ ...formData, message: "", phone: "" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Une erreur s'est produite");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSuccessDialog = () => {
    setShowSuccessDialog(false);
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-[#D4AF37] text-center">
          Contactez-Nous
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Form */}
          <div className="bg-white rounded-xl shadow-sm p-8 border border-[#D4AF37]/20">
            <h2 className="text-xl font-semibold text-[#D4AF37] mb-6">
              Envoyez-Nous un Message
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              {!user && (
                <>
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Nom Complet
                    </label>
                    <Input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="Entrez votre nom complet"
                      className="mt-1 border-[#D4AF37]/20 focus:border-[#D4AF37] focus:ring-[#D4AF37]"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Adresse E-mail
                    </label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="Entrez votre adresse e-mail"
                      className="mt-1 border-[#D4AF37]/20 focus:border-[#D4AF37] focus:ring-[#D4AF37]"
                      required
                    />
                  </div>
                </>
              )}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Téléphone
                </label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="Entrez votre numéro de téléphone"
                  className="mt-1 border-[#D4AF37]/20 focus:border-[#D4AF37] focus:ring-[#D4AF37]"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                  Message
                </label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  placeholder="Entrez votre message (minimum 10 caractères)"
                  className="mt-1 border-[#D4AF37]/20 focus:border-[#D4AF37] focus:ring-[#D4AF37]"
                  rows={5}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-white"
                disabled={loading}
              >
                {loading ? (
                  "Envoi en cours..."
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Envoyer
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-xl shadow-sm p-8 border border-[#D4AF37]/20">
            <h2 className="text-xl font-semibold text-[#D4AF37] mb-6">
              Nos Magasins
            </h2>
            
            {/* Location Tabs */}
            <div className="flex mb-6 border-b border-gray-200">
              {locations.map((location, index) => (
                <button
                  key={index}
                  className={`px-4 py-2 font-medium text-sm ${selectedLocation === index 
                    ? 'text-[#D4AF37] border-b-2 border-[#D4AF37]' 
                    : 'text-gray-500 hover:text-[#D4AF37]'}`}
                  onClick={() => setSelectedLocation(index)}
                >
                  {location.city}
                </button>
              ))}
            </div>
            
            {/* Selected Location Details */}
            <div className="space-y-6 mb-8">
              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-[#D4AF37] mt-1" />
                <div className="ml-3">
                  <h3 className="font-medium">Adresse</h3>
                  <p className="text-gray-600 mt-1">{locations[selectedLocation].address}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Phone className="h-5 w-5 text-[#D4AF37] mt-1" />
                <div className="ml-3">
                  <h3 className="font-medium">Téléphone</h3>
                  <p className="text-gray-600 mt-1">+216 {locations[selectedLocation].phone}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Mail className="h-5 w-5 text-[#D4AF37] mt-1" />
                <div className="ml-3">
                  <h3 className="font-medium">Email</h3>
                  <p className="text-gray-600 mt-1">{locations[selectedLocation].email}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Clock className="h-5 w-5 text-[#D4AF37] mt-1" />
                <div className="ml-3">
                  <h3 className="font-medium">Heures d'ouverture</h3>
                  <p className="text-gray-600 mt-1">{locations[selectedLocation].hours}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Map with all locations - Full width section */}
      <div className="mt-12 max-w-7xl mx-auto p-4">
        <h2 className="text-2xl font-bold text-[#D4AF37] mb-4">Nos emplacements</h2>
        
        {/* Location Tabs for Map */}
        <div className="flex mb-6 border-b border-gray-200">
          {locations.map((location, index) => (
            <button
              key={index}
              className={`px-6 py-3 font-medium ${selectedMapLocation === index 
                ? 'text-[#D4AF37] border-b-2 border-[#D4AF37]' 
                : 'text-gray-500 hover:text-[#D4AF37]'}`}
              onClick={() => setSelectedMapLocation(index)}
            >
              {location.city}
            </button>
          ))}
        </div>
        
        <div className="aspect-video w-full overflow-hidden rounded-lg shadow-md border border-[#D4AF37]/20">
          <iframe 
            src={locations[selectedMapLocation].mapUrl}
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            allowFullScreen 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <DialogTitle className="text-center text-lg font-semibold text-gray-900">
              Message envoyé avec succès
            </DialogTitle>
            <DialogDescription className="text-center">
              <p className="text-gray-600 mt-2">
                Merci de nous avoir contacté. Nous avons bien reçu votre message et nous vous répondrons dans les plus brefs délais.
              </p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Button 
              onClick={handleCloseSuccessDialog}
              className="mt-2 w-full sm:w-auto bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-white"
            >
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContactPage;