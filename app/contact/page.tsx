"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Mail, Phone, Send } from "lucide-react";
import { toast } from "sonner";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Veuillez remplir tous les champs du formulaire.");
      return;
    }
    toast.success("Votre message a été envoyé avec succès!");
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <div className="min-h-screen ">
      <div className="max-w-7xl mx-auto px-4">
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
                  placeholder="Entrez votre message"
                  className="mt-1 border-[#D4AF37]/20 focus:border-[#D4AF37] focus:ring-[#D4AF37]"
                  rows={5}
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-white"
              >
                <Send className="mr-2 h-4 w-4" />
                Envoyer
              </Button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-xl shadow-sm p-8 border border-[#D4AF37]/20">
            <h2 className="text-xl font-semibold text-[#D4AF37] mb-6">
              Informations de Contact
            </h2>
            <div className="space-y-6">
              {/* Address */}
              <div className="flex items-start gap-4">
                <MapPin className="h-6 w-6 text-[#D4AF37] mt-1" />
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Adresse</h3>
                  <p className="text-gray-600">
                    123 Rue de la Mode, Tunis, Tunisie
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-4">
                <Mail className="h-6 w-6 text-[#D4AF37] mt-1" />
                <div>
                  <h3 className="text-lg font-medium text-gray-900">E-mail</h3>
                  <p className="text-gray-600">support@darkoftan.com</p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-4">
                <Phone className="h-6 w-6 text-[#D4AF37] mt-1" />
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Téléphone</h3>
                  <p className="text-gray-600">+216 12 345 678</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}