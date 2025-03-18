"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Mail, Phone, Send } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { useAuth } from "@/contexts/auth-context";

// Contact form validation schema
const contactSchema = z.object({
  name: z.string().min(1, "Le nom est requis").optional(),
  email: z.string().email("Email invalide").optional(),
  phone: z.string().optional(),
  message: z.string().min(10, "Le message doit contenir au moins 10 caractères"),
});

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

      toast.success("Votre message a été envoyé avec succès!");
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

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-[#7c3f61] text-center">
          Contactez-Nous
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Form */}
          <div className="bg-white rounded-xl shadow-sm p-8 border border-[#7c3f61]/20">
            <h2 className="text-xl font-semibold text-[#7c3f61] mb-6">
              Envoyez-Nous un Message
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              {!user && (
                <>
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Nom Complet *
                    </label>
                    <Input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="Entrez votre nom complet"
                      className="mt-1 border-[#7c3f61]/20 focus:border-[#7c3f61] focus:ring-[#7c3f61]"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Adresse E-mail *
                    </label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="Entrez votre adresse e-mail"
                      className="mt-1 border-[#7c3f61]/20 focus:border-[#7c3f61] focus:ring-[#7c3f61]"
                      required
                    />
                  </div>
                </>
              )}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Téléphone (Optionnel)
                </label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="Entrez votre numéro de téléphone"
                  className="mt-1 border-[#7c3f61]/20 focus:border-[#7c3f61] focus:ring-[#7c3f61]"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                  Message *
                </label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  placeholder="Entrez votre message (minimum 10 caractères)"
                  className="mt-1 border-[#7c3f61]/20 focus:border-[#7c3f61] focus:ring-[#7c3f61]"
                  rows={5}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-[#7c3f61] hover:bg-[#7c3f61]/90 text-white"
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
          <div className="bg-white rounded-xl shadow-sm p-8 border border-[#7c3f61]/20">
            <h2 className="text-xl font-semibold text-[#7c3f61] mb-6">
              Informations de Contact
            </h2>
            <div className="space-y-6">
              <div className="flex items-start">
                <MapPin className="h-6 w-6 text-[#7c3f61] mt-1" />
                <div className="ml-4">
                  <h3 className="font-medium">Adresse</h3>
                  <p className="text-gray-600 mt-1">
                    M'saken, Sousse, Tunisie
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <Mail className="h-6 w-6 text-[#7c3f61] mt-1" />
                <div className="ml-4">
                  <h3 className="font-medium">Email</h3>
                  <p className="text-gray-600 mt-1">contact@aichic.tn</p>
                </div>
              </div>
              <div className="flex items-start">
                <Phone className="h-6 w-6 text-[#7c3f61] mt-1" />
                <div className="ml-4">
                  <h3 className="font-medium">Téléphone</h3>
                  <p className="text-gray-600 mt-1">+216 57 038 398</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;