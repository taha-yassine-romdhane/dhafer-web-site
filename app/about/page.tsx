"use client";

import Image from "next/image";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { motion } from 'framer-motion';

import { Card, CardContent } from "@/components/ui/card";

const AboutUs = () => {
    return (
        <motion.div className="max-w-7xl mx-auto p-6">
            <div className="flex justify-center mb-8">
                <Image
                    src="/logo.png"
                    alt="Aichic Logo"
                    width={200}
                    height={100}
                    objectFit="contain"
                />
            </div>

            <motion.h1 className="text-5xl font-extrabold text-center text-[#7c3f61] mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                À Propos de Aichic
            </motion.h1>

            {/* Histoire de la marque */}
            <motion.section className="mb-16" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                <h2 className="text-3xl font-bold text-[#7c3f61] mb-4">Notre Histoire</h2>
                <div className="grid gap-8 items-center">
                    <div>
                        <p className="text-lg mb-6 leading-relaxed">
                            Bienvenue chez AICHIC COUTURE, votre destination mode pour une élégance intemporelle et un style raffiné. Nous proposons des collections uniques, 
                            alliant tendances modernes et qualité exceptionnelle, pour sublimer chaque femme au quotidien. Notre mission 
                            est de vous offrir des vêtements qui reflètent votre personnalité avec chic et simplicité.
                            Rejoignez-nous et adoptez l'élégance à la tunisienne !
                        </p>
                        <a href="/collections" className="bg-[#7c3f61] text-white py-2 px-6 rounded-lg font-medium hover:bg-gray-700 transition">
                            Découvrez Nos Produits
                        </a>
                    </div>
                </div>
            </motion.section>

            {/* Emplacements */}
            <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                <h2 className="text-3xl font-bold text-[#7c3f61] mb-4">Nos Magasins</h2>
                <div className="grid gap-8">
                    <Card>
                        <CardContent>
                            <div className="space-y-4 p-4">
                                <div className="flex items-start">
                                    <MapPin className="mr-2 h-6 w-6 text-[#7c3f61]" />
                                    <div>
                                        <h3 className="text-lg font-semibold">
                                            Aichic - Msaken
                                        </h3>
                                        <p className="text-gray-600">Msaken</p>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <Phone className="mr-2 h-5 w-5 text-[#7c3f61] space-x-2" />
                                    <p className="text-gray-600 px-3" >57 038 398</p>
                                    <Phone className="mr-2 h-5 w-5 text-[#7c3f61] space-x-2" />
                                    <p className="text-gray-600 px-3" >57 038 399</p>
                                    <Phone className="mr-2 h-5 w-5 text-[#7c3f61] space-x-2" />
                                    <p className="text-gray-600 px-3" >57 038 400</p>
                                </div>
                                <div className="flex items-center">
                                    <Clock className="mr-2 h-5 w-5 text-[#7c3f61] space-x-2" />
                                    <p>09:00 - 20:00</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </motion.section>
        </motion.div>
    );
};

export default AboutUs;