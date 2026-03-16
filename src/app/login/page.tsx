"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { SciFiCard } from "@/components/ui/SciFiCard";
import { GlowingButton } from "@/components/ui/GlowingButton";
import { Input } from "@/components/ui/Input";
import { motion } from "framer-motion";
import Link from "next/link";
import { Shield } from "lucide-react";

const loginSchema = z.object({
    email: z.string().email("Correo inválido"),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const router = useRouter();
    const [error, setError] = useState("");

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormValues) => {
        try {
            setError("");
            await signInWithEmailAndPassword(auth, data.email, data.password);
            router.push("/dash");
        } catch (err: any) {
            setError("Credenciales inválidas o error de conexión.");
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-sci-accent/5 rounded-full blur-[100px] -z-10" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <SciFiCard glowOnHover>
                    <div className="flex flex-col items-center mb-8">
                        <div className="h-12 w-12 rounded-full bg-sci-dark border border-sci-border flex items-center justify-center mb-4 text-sci-accent">
                            <Shield className="h-6 w-6" />
                        </div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">Acceso Restringido</h2>
                        <p className="text-sm text-sci-metallic mt-1">Identifícate para entrar al sistema</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <Input
                                type="email"
                                placeholder="Identificador (Email)"
                                {...register("email")}
                            />
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                        </div>

                        <div>
                            <Input
                                type="password"
                                placeholder="Código de Seguridad (Password)"
                                {...register("password")}
                            />
                            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                        </div>

                        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                        <GlowingButton
                            type="submit"
                            className="w-full mt-6"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Autenticando..." : "Iniciar Sesión"}
                        </GlowingButton>
                    </form>

                    <div className="mt-6 text-center text-sm text-sci-metallic">
                        ¿No tienes credenciales?{" "}
                        <Link href="/register" className="text-sci-accent hover:underline">
                            Solicitar acceso
                        </Link>
                    </div>
                </SciFiCard>
            </motion.div>
        </div>
    );
}
