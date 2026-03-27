"use client";

import { motion } from "framer-motion";
import { Dataset } from "@/types";

export default function HeroSection({ dataset }: { dataset: Dataset }) {
    const imageUrl = dataset.thumbnail_url
        ? `http://localhost:3001${dataset.thumbnail_url}`
        : "/placeholder.png";

    return (
        <section className="relative w-full h-[380px] overflow-hidden">
            <img
                src={imageUrl}
                alt={dataset.title}
                className="absolute inset-0 w-full h-full object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-900/80 to-slate-950" />

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 z-10">
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-green-400 bg-clip-text text-transparent"
                >
                    {dataset.title}
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="max-w-2xl text-gray-300 text-lg"
                >
                    {dataset.description?.slice(0, 180)}...
                </motion.p>
            </div>
        </section>
    );
}
