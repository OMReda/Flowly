"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Logo } from "@/components/logo";

const HERO_SHOTS = [
    {
        image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop",
        title: "Refined living,",
        italic: "intelligent choices.",
        description: "Curate your financial legacy with a platform designed for the discerning modern individual."
    },
    {
        image: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop",
        title: "Financial clarity,",
        italic: "designed for you.",
        description: "Join a new standard of wealth management where intelligence meets elegance."
    },
    {
        image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop",
        title: "Precision tracking,",
        italic: "absolute control.",
        description: "Experience the power of real-time insights combined with a minimalist, high-fidelity interface."
    }
];

export function AuthHero() {
    const [currentShot, setCurrentShot] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentShot((prev) => (prev + 1) % HERO_SHOTS.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="relative w-full h-full bg-zinc-950 flex flex-col justify-end p-12 overflow-hidden group/hero" data-developer="OMReda">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentShot}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                    className="absolute inset-0"
                >
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url('${HERO_SHOTS[currentShot].image}')` }}
                    >
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Logo - Pinned Top Left */}
            <div className="absolute top-12 left-12 z-10">
                <Logo className="w-10 h-10 opacity-90" />
            </div>

            <div className="relative z-10 space-y-8 max-w-lg mb-12">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentShot}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <h1 className="text-6xl text-white font-serif leading-tight tracking-tight">
                            {HERO_SHOTS[currentShot].title} <br />
                            <span className="italic text-emerald-300 font-medium">
                                {HERO_SHOTS[currentShot].italic}
                            </span>
                        </h1>
                        <div className="mt-8 pl-6 border-l-2 border-emerald-500/50">
                            <p className="text-zinc-200 text-lg leading-relaxed font-light">
                                {HERO_SHOTS[currentShot].description}
                            </p>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Indicators */}
            <div className="relative z-10 flex flex-col gap-6">
                <div className="flex gap-3">
                    {HERO_SHOTS.map((_, i) => (
                        <div
                            key={i}
                            className={`h-0.5 transition-all duration-700 ${i === currentShot ? "w-12 bg-emerald-400" : "w-6 bg-white/30"
                                }`}
                        />
                    ))}
                </div>
            </div>

            {/* Credit - Pinned Bottom Right */}
            <div className="absolute bottom-12 right-12 z-10 flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-emerald-500/50" />
                <p className="text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase">
                    Developed by <span className="text-white/60">OMReda</span>
                </p>
            </div>
        </div>
    );
}
