"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Shield, Clock, CheckCircle, XCircle } from "lucide-react";

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8 text-[#7c3f61] text-center">
          Politique de Remboursement
        </h1>

        <div className="bg-white rounded-xl shadow-sm p-8 border border-[#7c3f61]/20">
          {/* Introduction */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-[#7c3f61] mb-4">
              Notre Engagement envers Vous
            </h2>
            <p className="text-gray-600">
              Chez Aichic Couture, nous nous engageons à vous offrir une expérience
              d'achat exceptionnelle. Si vous n'êtes pas entièrement satisfait de
              votre achat, nous sommes là pour vous aider.
            </p>
          </div>

          {/* Refund Eligibility */}
          <div className="flex items-start gap-4 mb-8">
            <Shield className="h-8 w-8 text-[#7c3f61] mt-1" />
            <div>
              <h2 className="text-xl font-semibold text-[#7c3f61]">
                Conditions de Remboursement
              </h2>
              <ul className="list-disc list-inside text-gray-600">
                <li>
                  Les articles doivent être retournés dans un état neuf, non
                  portés et avec leurs étiquettes d'origine.
                </li>
                <li>
                  La demande de remboursement doit être effectuée dans un délai
                  de <strong>3 jours</strong> à partir de la date de réception.
                </li>
                <li>
                  Les articles soldés ou en promotion ne sont pas éligibles au
                  remboursement.
                </li>
              </ul>
            </div>
          </div>

          {/* Refund Process */}
          <div className="flex items-start gap-4 mb-8">
            <Clock className="h-8 w-8 text-[#7c3f61] mt-1" />
            <div>
              <h2 className="text-xl font-semibold text-[#7c3f61]">
                Processus d'échange
              </h2>
              <ol className="list-decimal list-inside text-gray-600">
                <li>
                  Contactez notre service client à l'adresse{" "}
                  <strong>contact@aichic.tn</strong> ou navigatez sur la page de contact pour initier une demande
                  d'échange.
                </li>
                <li>
                  Une fois l'article reçu et inspecté, nous procéderons à l'échange dans un délai de <strong>5 jours ouvrables</strong>.
                </li>
              </ol>
            </div>
          </div>

          {/* Non-Refundable Items */}
          <div className="flex items-start gap-4 mb-8">
            <XCircle className="h-8 w-8 text-[#7c3f61] mt-1" />
            <div>
              <h2 className="text-xl font-semibold text-[#7c3f61]">
                Articles Non Remboursables
              </h2>
              <ul className="list-disc list-inside text-gray-600">
                <li>Articles soldés ou en promotion.</li>
                <li>Articles sur commande.</li>
                <li>Articles endommagés par le client.</li>
              </ul>
            </div>
          </div>

          {/* Exchange Methods */}
          <div className="flex items-start gap-4 mb-8">
            <CheckCircle className="h-8 w-8 text-[#7c3f61] mt-1" />
            <div>
              <h2 className="text-xl font-semibold text-[#7c3f61]">
                Méthodes d'échange
              </h2>
              <p className="text-gray-600">
                Les échanges sont effectués par la poste tunisienne 
              </p>
            </div>
          </div>

          {/* Call-to-Action */}
          <div className="text-center mt-8">
            <Link href="/contact">
              <Button className="bg-[#7c3f61] hover:bg-[#7c3f61]/90 text-white px-8 py-3 text-lg">
                Contactez Notre Service Client
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}