"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Shield, Lock, User, Mail, CreditCard } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 text-[#7c3f61] text-center">
          Politique de Confidentialité
        </h1>

        <div className="bg-white rounded-xl shadow-sm p-8 border border-[#7c3f61]/20">
          {/* Introduction */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-[#7c3f61] mb-4">
              Introduction
            </h2>
            <p className="text-gray-600">
              Chez Aichic, nous accordons une grande importance à la
              protection de vos données personnelles. Cette politique de
              confidentialité explique comment nous collectons, utilisons et
              protégeons vos informations lorsque vous utilisez notre site web.
            </p>
          </div>

          {/* Data Collection */}
          <div className="flex items-start gap-4 mb-8">
            <User className="h-8 w-8 text-[#7c3f61] mt-1" />
            <div>
              <h2 className="text-xl font-semibold text-[#7c3f61]">
                Collecte des Données
              </h2>
              <p className="text-gray-600">
                Nous collectons les informations suivantes lorsque vous utilisez
                notre site :
              </p>
              <ul className="list-disc list-inside text-gray-600">
                <li>Nom, prénom et coordonnées (e-mail, téléphone).</li>
                <li>Adresse de livraison et de facturation.</li>
                <li>Informations de paiement (sécurisées).</li>
                <li>Historique des commandes et préférences.</li>
              </ul>
            </div>
          </div>

          {/* Use of Data */}
          <div className="flex items-start gap-4 mb-8">
            <Mail className="h-8 w-8 text-[#7c3f61] mt-1" />
            <div>
              <h2 className="text-xl font-semibold text-[#7c3f61]">
                Utilisation des Données
              </h2>
              <p className="text-gray-600">
                Vos données sont utilisées pour les finalités suivantes :
              </p>
              <ul className="list-disc list-inside text-gray-600">
                <li>Traiter et gérer vos commandes.</li>
                <li>Vous fournir un service client de qualité.</li>
                <li>Vous informer des promotions et nouveautés.</li>
                <li>Améliorer votre expérience utilisateur.</li>
              </ul>
            </div>
          </div>

          {/* Data Protection */}
          <div className="flex items-start gap-4 mb-8">
            <Lock className="h-8 w-8 text-[#7c3f61] mt-1" />
            <div>
              <h2 className="text-xl font-semibold text-[#7c3f61]">
                Protection des Données
              </h2>
              <p className="text-gray-600">
                Nous mettons en œuvre des mesures de sécurité strictes pour
                protéger vos données contre tout accès non autorisé, modification
                ou divulgation. Vos informations de paiement sont cryptées et
                stockées de manière sécurisée.
              </p>
            </div>
          </div>

          {/* Data Sharing */}
          <div className="flex items-start gap-4 mb-8">
            <Shield className="h-8 w-8 text-[#7c3f61] mt-1" />
            <div>
              <h2 className="text-xl font-semibold text-[#7c3f61]">
                Partage des Données
              </h2>
              <p className="text-gray-600">
                Nous ne partageons vos données personnelles qu'avec des tiers de
                confiance dans les cas suivants :
              </p>
              <ul className="list-disc list-inside text-gray-600">
                <li>Pour le traitement des paiements.</li>
                <li>Pour la livraison des commandes.</li>
                <li>Pour répondre à des obligations légales.</li>
              </ul>
            </div>
          </div>

          {/* Your Rights */}
          <div className="flex items-start gap-4 mb-8">
            <CreditCard className="h-8 w-8 text-[#7c3f61] mt-1" />
            <div>
              <h2 className="text-xl font-semibold text-[#7c3f61]">
                Vos Droits
              </h2>
              <p className="text-gray-600">
                Conformément à la loi, vous avez le droit de :
              </p>
              <ul className="list-disc list-inside text-gray-600">
                <li>Accéder à vos données personnelles.</li>
                <li>Demander la rectification ou la suppression de vos données.</li>
                <li>Vous opposer à l'utilisation de vos données.</li>
                <li>Retirer votre consentement à tout moment.</li>
              </ul>
            </div>
          </div>

          {/* Contact Information */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-[#7c3f61] mb-4">
              Contact
            </h2>
            <p className="text-gray-600">
              Pour toute question concernant notre politique de confidentialité,
              veuillez nous contacter à l'adresse suivante :
            </p>
            <p className="text-gray-600 font-medium mt-2">
              E-mail : <strong>support@aichic.com</strong>
            </p>
          </div>

          {/* Call-to-Action */}
          <div className="text-center mt-8">
            <Link href="/contact">
              <Button className="bg-[#7c3f61] hover:bg-[#7c3f61]/90 text-white px-8 py-3 text-lg">
                Contactez-Nous
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}