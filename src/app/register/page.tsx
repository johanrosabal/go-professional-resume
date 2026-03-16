"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { SciFiCard } from "@/components/ui/SciFiCard";
import { GlowingButton } from "@/components/ui/GlowingButton";
import { Input } from "@/components/ui/Input";
import { motion } from "framer-motion";
import Link from "next/link";
import { UserPlus } from "lucide-react";

// Helper to create a slug from name
const generateSlug = (name: string) =>
    name.toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');

const registerSchema = z.object({
    fullName: z.string().min(2, "El nombre es requerido"),
    email: z.string().email("Correo inválido"),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
    const router = useRouter();
    const [error, setError] = useState("");

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data: RegisterFormValues) => {
        try {
            setError("");

            // 1. Create user in Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
            const user = userCredential.user;

            // 2. Update Auth Profile
            await updateProfile(user, { displayName: data.fullName });

            // 3. Create initial Firestore Document
            const initialSlug = generateSlug(data.fullName) + "-" + Math.floor(Math.random() * 1000);

            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                email: data.email,
                fullName: data.fullName,
                slug: initialSlug,
                role: "guest",
                isActive: true,
                createdAt: new Date().toISOString()
            });

            router.push("/dash");
        } catch (err: any) {
            if (err.code === 'auth/email-already-in-use') {
                setError("Las credenciales ya existen en el sistema.");
            } else {
                setError("Error en el registro. Intente nuevamente.");
            }
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
                            <UserPlus className="h-6 w-6" />
                        </div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">Solicitud de Acceso</h2>
                        <p className="text-sm text-sci-metallic mt-1">Crea tu identificador en el sistema</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <Input
                                type="text"
                                placeholder="Nombre Completo"
                                {...register("fullName")}
                            />
                            {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
                        </div>

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
                            {isSubmitting ? "Procesando..." : "Crear Perfil Base"}
                        </GlowingButton>
                    </form>

                    <div className="mt-6 text-center text-sm text-sci-metallic">
                        ¿Ya tienes credenciales?{" "}
                        <Link href="/login" className="text-sci-accent hover:underline">
                            Iniciar sesión
                        </Link>
                    </div>
                </SciFiCard>
            </motion.div>
        </div>
    );
}
