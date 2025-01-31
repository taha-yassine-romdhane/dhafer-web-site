import Image from "next/image";
import { MapPin } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";

export default function AboutUs() {
    const owners = [
        {
            name: "Marie Dupont",
            role: "Fondatrice & Directrice Artistique",
            image: "marie-dupont.jpg",
        },
        {
            name: "Jean Martin",
            role: "PDG",
            image: "jean-martin.jpg",
        },
    ];

    const locations = [
        {
            city: "Paris, France",
            address: "123 Rue de la Mode, 75001 Paris",
            image: "paris-store.jpg",
            mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2624.991625693759!2d2.335455315674414!3d48.8583700792875!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47e66e2964e34e2d%3A0x8ddca9ee380ef7e0!2sTour%20Eiffel!5e0!3m2!1sfr!2sfr!4v1702403810",
        },
        {
            city: "Lyon, France",
            address: "456 Avenue des Tendances, 69002 Lyon",
            image: "lyon-store.jpg",
            mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2783.597257715981!2d4.835215315644904!3d45.757934979106!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47f4ea516ae88797%3A0x408ab2ae4bb21f0!2sPlace%20Bellecour!5e0!3m2!1sfr!2sfr!4v1702403810",
        },
        {
            city: "Marseille, France",
            address: "789 Boulevard de la Créativité, 13001 Marseille",
            image: "marseille-store.jpg",
            mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2904.093621073497!2d5.369757315631394!3d43.296482479134!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12c9c0c6a8e8e8e9%3A0x12c9c0c6a8e8e8e9!2sVieux%20Port%20de%20Marseille!5e0!3m2!1sfr!2sfr!4v1702403810",
        },
    ];

    return (
        <div className="container mx-auto px-4 py-16 bg-white">
            <h1 className="text-5xl font-extrabold text-center text-[#D4AF37] mb-8">
                À Propos de Trendy Threads
            </h1>

            {/* Histoire de la marque */}
            <section className="mb-16">
                <h2 className="text-3xl font-bold text-[#D4AF37] mb-4">Notre Histoire</h2>
                <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div>
                        <p className="text-lg mb-6 leading-relaxed">
                            Trendy Threads est une marque de mode dédiée à la création de vêtements
                            intemporels et élégants pour les femmes. Fondée en 2021 par Marie Dupont,
                            notre mission est de proposer une gamme de vêtements de haute qualité,
                            à la fois tendance et durables.
                        </p>
                        <p className="text-lg mb-6 leading-relaxed">
                            Au fil des années, nous sommes passés d'une boutique locale à une marque
                            internationale, mais nos valeurs fondamentales restent les mêmes : qualité,
                            durabilité et style.
                        </p>
                        <button className="bg-[#D4AF37] text-white py-2 px-6 rounded-lg font-medium hover:bg-[#D4AF37] transition">
                            Découvrez Nos Produits
                        </button>
                    </div>
                    <div className="relative h-[600px] rounded-lg overflow-hidden shadow-lg">
                        <Image
                            src="/atelier-trendy-threads.jpg"
                            alt="Atelier Trendy Threads"
                            layout="fill"
                            objectFit="cover"
                        />
                    </div>
                </div>
            </section>

            {/* Propriétaires */}
            <section className="mb-16">
                <h2 className="text-3xl font-bold text-[#D4AF37] mb-4">Rencontrez Notre Équipe</h2>
                <Carousel className="w-full max-w-4xl mx-auto">
                    <CarouselContent>
                        {owners.map((owner, index) => (
                            <CarouselItem key={index} className="p-4">
                                <Card className="hover:shadow-xl transition-shadow border border-[#D4AF37]">
                                    <CardContent className="flex flex-col items-center p-6">
                                        <div className="relative w-48 h-48 rounded-full overflow-hidden mb-4 shadow-md">
                                            <Image
                                                src={owner.image}
                                                alt={owner.name}
                                                layout="fill"
                                                objectFit="cover"
                                            />
                                        </div>
                                        <h3 className="text-xl font-semibold text-[#D4AF37]">
                                            {owner.name}
                                        </h3>
                                        <p className="text-gray-600">{owner.role}</p>
                                    </CardContent>
                                </Card>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious className="text-[#D4AF37]" />
                    <CarouselNext className="text-[#D4AF37]" />
                </Carousel>
            </section>

            {/* Emplacements */}
            <section>
                <h2 className="text-3xl font-bold text-[#D4AF37] mb-4">Nos Magasins</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {locations.map((location, index) => (
                        <Card
                            key={index}
                            className="hover:shadow-lg transition-shadow border border-[#D4AF37]"
                        >
                            <CardContent className="p-6">
                                <div className="flex items-start mb-4">
                                    <MapPin className="mr-2 h-6 w-6 text-[#D4AF37]" />
                                    <div>
                                        <h3 className="text-lg font-semibold">{location.city}</h3>
                                        <p className="text-gray-600">{location.address}</p>
                                    </div>
                                </div>
                                <div className="relative h-40 rounded-md overflow-hidden shadow-sm mb-4">
                                    <Image
                                        src={location.image}
                                        alt={`Magasin de ${location.city}`}
                                        layout="fill"
                                        objectFit="cover"
                                    />
                                </div>
                                <div className="relative h-60 rounded-md overflow-hidden shadow-sm">
                                    <iframe
                                        src={location.mapUrl}
                                        width="100%"
                                        height="100%"
                                        style={{ border: 0 }}
                                        allowFullScreen
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                        className="absolute inset-0"
                                    ></iframe>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>
        </div>
    );
}