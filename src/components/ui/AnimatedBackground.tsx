"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useState } from "react";

export const AnimatedBackground = () => {
    const { scrollYProgress } = useScroll();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Parallax velocities (different speeds for different layers)
    const y1 = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
    const y2 = useTransform(scrollYProgress, [0, 1], ["0%", "-50%"]);
    const y3 = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
    const y4 = useTransform(scrollYProgress, [0, 1], ["0%", "-20%"]);

    if (!mounted) return null;

    return (
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none opacity-60 print:hidden">
            {/* Soft Ambient Light 1 - Top Left */}
            <motion.div
                style={{ y: y1 }}
                className="absolute -top-[20%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-sci-accent/10 blur-[120px]"
            />

            {/* Soft Ambient Light 2 - Middle Right */}
            <motion.div
                style={{ y: y2 }}
                className="absolute top-[30%] -right-[10%] w-[40vw] h-[40vw] rounded-full bg-indigo-500/10 blur-[100px]"
            />

            {/* Soft Ambient Light 3 - Bottom left */}
            <motion.div
                style={{ y: y3 }}
                className="absolute bottom-[-10%] left-[10%] w-[45vw] h-[45vw] rounded-full bg-cyan-500/10 blur-[130px]"
            />

            {/* Slow moving drifting particles - Pure CSS animation via Tailwind classes if we had them, OR Framer Motion */}
            <motion.div
                animate={{
                    y: [0, -20, 0],
                    x: [0, 15, 0],
                    scale: [1, 1.05, 1],
                }}
                transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                style={{ y: y4 }}
                className="absolute top-[60%] right-[30%] w-[30vw] h-[30vw] rounded-full bg-sci-accent/5 blur-[100px]"
            />

            {/* Subtle moving grid lines could be achieved by animating standard CSS grid, but sticking to orbs keeps it elegant */}

            {/* Grid Overlay to maintain corporate sci-fi aesthetic but make it look like deep space */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02]" />
        </div>
    );
};
