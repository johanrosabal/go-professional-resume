"use client";

import { motion } from "framer-motion";
import { GlowingButton } from "@/components/ui/GlowingButton";
import { SciFiCard } from "@/components/ui/SciFiCard";
import { Rocket, Shield, Zap, LogIn } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 overflow-hidden relative">

      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sci-accent/10 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] -z-10" />

      {/* Login Nav */}
      <nav className="absolute top-6 right-8 z-20">
        <Link href="/login" className="flex items-center gap-2 text-sm text-sci-silver hover:text-white transition-colors">
          <LogIn className="h-4 w-4" />
          Acceso Usuarios
        </Link>
      </nav>

      <main className="max-w-5xl w-full flex flex-col items-center text-center z-10">

        {/* Top Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center rounded-full border border-sci-border bg-sci-dark px-3 py-1 text-sm text-sci-silver mb-8"
        >
          <span className="flex h-2 w-2 rounded-full bg-sci-accent mr-2 animate-pulse"></span>
          Sistema Operativo de Carrera v1.0
        </motion.div>

        {/* Hero Title */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6"
        >
          Tu perfil profesional, <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-sci-silver via-white to-sci-accent">
            rediseñado para el futuro.
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-lg md:text-xl text-sci-metallic max-w-2xl mb-10"
        >
          Despliega un currículum interactivo con estética corporativa de alta tecnología. Destaca entre la multitud con un diseño que grita competencia técnica y elegancia ejecutiva.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
        >
          <Link href="/register">
            <GlowingButton size="lg" className="group">
              <Rocket className="mr-2 h-4 w-4 group-hover:-translate-y-1 transition-transform" />
              Inicializar Perfil
            </GlowingButton>
          </Link>
          <Link href="/login">
            <GlowingButton variant="secondary" size="lg">
              Entrar al Sistema
            </GlowingButton>
          </Link>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 w-full"
        >
          <SciFiCard glowOnHover className="flex flex-col items-center text-center">
            <div className="h-12 w-12 rounded-full bg-sci-dark border border-sci-border flex items-center justify-center mb-4 text-sci-accent">
              <Zap className="h-6 w-6" />
            </div>
            <h3 className="text-white font-semibold mb-2">Deploy Instantáneo</h3>
            <p className="text-sm text-sci-metallic">Tu currículum en línea en segundos, alojado en la infraestructura más rápida del mercado.</p>
          </SciFiCard>

          <SciFiCard glowOnHover className="flex flex-col items-center text-center">
            <div className="h-12 w-12 rounded-full bg-sci-dark border border-sci-border flex items-center justify-center mb-4 text-sci-accent">
              <Shield className="h-6 w-6" />
            </div>
            <h3 className="text-white font-semibold mb-2">Corporate Sci-Fi</h3>
            <p className="text-sm text-sci-metallic">Estética oscura premium diseñada específicamente para perfiles C-Level e ingenieros top.</p>
          </SciFiCard>

          <SciFiCard glowOnHover className="flex flex-col items-center text-center">
            <div className="h-12 w-12 rounded-full bg-sci-dark border border-sci-border flex items-center justify-center mb-4 text-sci-accent">
              <span className="font-mono font-bold text-lg">{`</>`}</span>
            </div>
            <h3 className="text-white font-semibold mb-2">Datos Estructurados</h3>
            <p className="text-sm text-sci-metallic">Optimizado para lectura humana y parsing avanzado (ATS) sin sacrificar el diseño visual.</p>
          </SciFiCard>
        </motion.div>

      </main>
    </div>
  );
}
