"use client";

import Image from "next/image";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { motion } from 'framer-motion';

import { Card, CardContent } from "@/components/ui/card";

const locations = [
    {
        city: "Jemmel",
        address: "105 Av. Habib Bourguiba, Jemmel",
        phone: "56 047 691",
        email: "contact@daralkoftanalassil.com",
        hours: "08:30 - 20:00",
        image: "/jemmel-store.jpg",
        mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3243.184097027917!2d10.759540299999998!3d35.6231878!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1302118d3435b8f7%3A0x23da68cbce53bd56!2zREFSIEtPRlRBTiBBTCBBU1NJTCBKRU1NRUwgX9iv2KfYsSDYp9mE2YLZgdi32KfZhiDYp9mE2KPYtdmK2YQg2KzZhdin2YQ!5e0!3m2!1sfr!2stn!4v1746106948690!5m2!1sfr!2stn",
    },
    {
        city: "Sousse",
        address: "Avenue Khezama, Sousse",
        phone: "56 095 021",
        email: "contact@daralkoftanalassil.com",
        hours: "09:00 - 20:00",
        image: "/sousse-store.jpg",
        mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3235.6789543261087!2d10.583948776268583!3d35.82642167271041!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x130212b6b0a9d0a1%3A0x1b1c0a0b0b0b0b0b!2sAvenue%20Khezama%2C%20Sousse!5e0!3m2!1sen!2stn!4v1706799661646!5m2!1sen!2stn",
    },
    {
        city: "Tunis",
        address: "40 Av. Fattouma Bourguiba, Tunis",
        phone: "56 048 365",
        email: "contact@daralkoftanalassil.com",
        hours: "09:00 - 20:00",
        image: "/tunis-store.jpg",
        mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3235.6789543261087!2d10.583948776268583!3d35.82642167271041!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x130212b6b0a9d0a1%3A0x1b1c0a0b0b0b0b0b!2s40%20Avenue%20Fattouma%20Bourguiba%2C%20Tunis!5e0!3m2!1sen!2stn!4v1706799661646!5m2!1sen!2stn",
    },
];

const AboutUs = () => {
    return (
        <motion.div className="max-w-7xl mx-auto p-6">
            <div className="flex justify-center mb-8">
                <Image
                    src="/logo.webp"
                    alt="Dar Al Koftan Al Assil Logo"
                    width={200}
                    height={100}
                    objectFit="contain"
                />
            </div>
            
            <motion.h1 className="text-5xl font-extrabold text-center text-[#D4AF37] mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                À Propos de Dar Al Koftan Al Assil
            </motion.h1>

            {/* Histoire de la marque */}
            <motion.section className="mb-16" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                <h2 className="text-3xl font-bold text-[#D4AF37] mb-4">Notre Histoire</h2>
                <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div>
                        <p className="text-lg mb-6 leading-relaxed">
                            Le coftan est apprécié par la plupart des femmes pour sa légèreté et sa souplesse, 
                            et son style est flexible pour permettre la liberté et la participation à la création 
                            d'un style artistique qui correspond aux tendances et aux préférences personnelles, 
                            quel que soit le sens, du bas vers le haut.
                        </p>
                        <a href="/collections" className="bg-[#D4AF37] text-white py-2 px-6 rounded-lg font-medium hover:bg-[#C49B2F] transition">
                            Découvrez Nos Produits
                        </a>
                    </div>
                    <div className="relative h-[400px] rounded-lg overflow-hidden shadow-lg">
                        <iframe
                            width="100%"
                            height="100%"
                            src="https://www.youtube.com/embed/b0mBbr3QBg8"
                            title="Dar Al Koftan Al Assil"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="absolute inset-0"
                        ></iframe>
                    </div>
                </div>
            </motion.section>

            {/* Emplacements */}
            <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                <h2 className="text-3xl font-bold text-[#D4AF37] mb-4">Nos Magasins</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {locations.map((location, index) => (
                        <Card key={index}>
                            <CardContent>
                                <div className="space-y-4 p-4">
                                    <div className="flex items-start">
                                        <MapPin className="mr-2 h-6 w-6 text-[#D4AF37]" />
                                        <div>
                                            <h3 className="text-lg font-semibold">
                                                Dar Al Koftan Al Assil - {location.city}
                                            </h3>
                                            <p className="text-gray-600">{location.address}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <Phone className="mr-2 h-5 w-5 text-[#D4AF37]" />
                                        <p>{location.phone}</p>
                                    </div>
                                    <div className="flex items-center">
                                        <Mail className="mr-2 h-5 w-5 text-[#D4AF37]" />
                                        <p>{location.email}</p>
                                    </div>
                                    <div className="flex items-center">
                                        <Clock className="mr-2 h-5 w-5 text-[#D4AF37]" />
                                        <p>{location.hours}</p>
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
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </motion.section>
        </motion.div>
    );
};

export default AboutUs;