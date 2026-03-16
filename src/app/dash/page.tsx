"use client";

import { useAuth } from "@/lib/AuthContext";
import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { doc, updateDoc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Input } from "@/components/ui/Input";
import { GlowingButton } from "@/components/ui/GlowingButton";
import { SciFiCard } from "@/components/ui/SciFiCard";
import { toast } from "react-hot-toast";
import { InputMask, format } from "@react-input/mask";
import dynamic from "next/dynamic";
import { useDashboard } from "@/lib/DashboardContext";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { Camera, Loader2 } from "lucide-react";

const RichTextEditor = dynamic(() => import("@/components/ui/RichTextEditor"), {
    ssr: false,
    loading: () => <div className="h-[200px] w-full bg-sci-dark/50 border border-sci-border/50 rounded-md animate-pulse"></div>
});

interface ProfileData {
    fullName: string;
    slug: string;
    professionalTitle: string;
    phone: string;
    whatsapp: string;
    birthDay: string;
    birthMonth: string;
    birthYear: string;
    countryOfOrigin: string;
    location: string;
    bio: string;
    githubUrl: string;
    linkedinUrl: string;
    hidePhoto: boolean;
    hideBirthdate: boolean;
    hideGithub: boolean;
    hideLinkedin: boolean;
    hidePhone: boolean;
    hideWhatsapp: boolean;
}

export default function DashboardPage() {
    const { user } = useAuth();
    const { editingLanguage } = useDashboard();

    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState<any>(null);
    const [systemCountries, setSystemCountries] = useState<any[]>([]);
    const [uploadingImage, setUploadingImage] = useState(false);

    const { register, handleSubmit, reset, control, formState: { isSubmitting } } = useForm<ProfileData>();

    useEffect(() => {
        const fetchSystemConfig = async () => {
            try {
                const snap = await getDocs(collection(db, "system_countries"));
                const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                data.sort((a: any, b: any) => a.name.localeCompare(b.name));
                setSystemCountries(data);
            } catch (error) {
                console.error("Error fetching admin countries:", error);
            }
        };

        const fetchProfile = async () => {
            if (!user) return;
            try {
                const docRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setUserData(docSnap.data());
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSystemConfig();
        fetchProfile();
    }, [user]);

    useEffect(() => {
        if (userData) {
            const formatPhone = (val: string) => {
                if (!val) return "";
                let digits = val.replace(/\D/g, "");
                if (digits.startsWith("506") && digits.length > 8) {
                    digits = digits.substring(3);
                }
                return format(digits, { mask: "(506) ____-____", replacement: { _: /\d/ } });
            };

            let parsedDay = "";
            let parsedMonth = "";
            let parsedYear = "";

            if (userData.birthdate) {
                // Assuming format YYYY-MM-DD
                const parts = userData.birthdate.split('-');
                if (parts.length === 3) {
                    parsedYear = parts[0];
                    parsedMonth = parts[1];
                    parsedDay = parts[2];
                }
            }

            const baseData = {
                fullName: userData.fullName || "",
                slug: userData.slug || "",
                phone: formatPhone(userData.phone),
                whatsapp: formatPhone(userData.whatsapp),
                birthDay: parsedDay,
                birthMonth: parsedMonth,
                birthYear: parsedYear,
                countryOfOrigin: userData.countryOfOrigin || "",
                location: userData.location || "",
                githubUrl: userData.githubUrl || "",
                linkedinUrl: userData.linkedinUrl || "",
                hidePhoto: userData.hidePhoto || false,
                hideBirthdate: userData.hideBirthdate || false,
                hideGithub: userData.hideGithub || false,
                hideLinkedin: userData.hideLinkedin || false,
                hidePhone: userData.hidePhone || false,
                hideWhatsapp: userData.hideWhatsapp || false,
            };

            if (editingLanguage === "es") {
                reset({
                    ...baseData,
                    professionalTitle: userData.professionalTitle || "",
                    bio: userData.bio || "",
                });
            } else {
                reset({
                    ...baseData,
                    professionalTitle: userData.translations?.en?.professionalTitle || "",
                    bio: userData.translations?.en?.bio || "",
                });
            }
        }
    }, [userData, editingLanguage, reset]);

    const labels = {
        es: {
            title: "Parámetros Principales",
            desc: "Configura la información base que será pública en tu perfil.",
            fullName: "Nombre Completo",
            slug: "Identificador de URL Público (Slug)",
            job: "Designación Profesional",
            phone: "Teléfono",
            whatsapp: "WhatsApp",
            birth: "Fecha de Nacimiento",
            birthDay: "Día",
            birthMonth: "Mes",
            birthYear: "Año",
            country: "País de Origen",
            location: "Ubicación Física",
            bio: "Bio de Sistema (Resumen)",
            github: "Enlace GitHub",
            linkedin: "Enlace LinkedIn",
            hidePhoto: "Ocultar foto en perfil público",
            hideBirthdate: "Ocultar en perfil",
            hideLink: "Ocultar en perfil",
            saving: "Sincronizando...",
            save: "Guardar Parámetros",
            loading: "Cargando módulos...",
            success: "Perfil sincronizado correctamente",
            error: "Error intergaláctico al sincronizar",
            globalNote: ""
        },
        en: {
            title: "Main Parameters",
            desc: "Configure the core information that will be public on your profile.",
            fullName: "Full Name",
            slug: "Public URL Identifier (Slug)",
            job: "Professional Title",
            phone: "Phone",
            whatsapp: "WhatsApp",
            birth: "Birthdate",
            birthDay: "Day",
            birthMonth: "Month",
            birthYear: "Year",
            country: "Country of Origin",
            location: "Physical Location",
            bio: "System Bio (Summary)",
            github: "GitHub Link",
            linkedin: "LinkedIn Link",
            hidePhoto: "Hide photo on public profile",
            hideBirthdate: "Hide on profile",
            hideLink: "Hide on profile",
            saving: "Synchronizing...",
            save: "Save Parameters",
            loading: "Loading modules...",
            success: "Profile synchronized successfully",
            error: "Intergalactic error during sync",
            globalNote: " (Global Domain)"
        }
    };

    const text = labels[editingLanguage];

    // Options mapping for rendering select
    const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, '0'));
    const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 100 }, (_, i) => (currentYear - i).toString());

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        if (!file.type.startsWith('image/')) {
            toast.error(editingLanguage === 'es' ? "Por favor selecciona una imagen válida" : "Please select a valid image");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error(editingLanguage === 'es' ? "La imagen no debe superar los 5MB" : "Image must be under 5MB");
            return;
        }

        setUploadingImage(true);
        try {
            const storageRef = ref(storage, `users/${user.uid}/profile_${Date.now()}`);
            const uploadResult = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(uploadResult.ref);

            // Save to Firestore immediately
            await updateDoc(doc(db, "users", user.uid), {
                photoURL: downloadURL,
                updatedAt: new Date().toISOString()
            });

            setUserData((prev: any) => ({ ...prev, photoURL: downloadURL }));
            toast.success(editingLanguage === 'es' ? "Foto actualizada" : "Photo updated");
        } catch (error: any) {
            console.error("Upload error:", error);
            if (error?.code === 'storage/unauthorized') {
                toast.error(editingLanguage === 'es'
                    ? "Permiso denegado. Revisa las reglas de Storage."
                    : "Permission denied. Check Storage rules.");
            } else {
                toast.error(editingLanguage === 'es' ? "Error al subir la imagen" : "Failed to upload image");
            }
        } finally {
            setUploadingImage(false);
        }
    };

    const handleImageDelete = async () => {
        if (!user || !userData?.photoURL) return;
        setUploadingImage(true);
        try {
            const imageRef = ref(storage, userData.photoURL);
            await deleteObject(imageRef);
            await updateDoc(doc(db, "users", user.uid), { photoURL: null });
            setUserData((prev: any) => ({ ...prev, photoURL: null }));
            toast.success(editingLanguage === 'es' ? "Foto eliminada de Storage" : "Photo deleted from Storage");
        } catch (error: any) {
            console.error("Delete error:", error);
            await updateDoc(doc(db, "users", user.uid), { photoURL: null });
            setUserData((prev: any) => ({ ...prev, photoURL: null }));
            toast.success(editingLanguage === 'es' ? "Referencia eliminada" : "Reference removed");
        } finally {
            setUploadingImage(false);
        }
    };

    const onSubmit = async (data: ProfileData) => {
        if (!user) return;
        try {
            // Reconstruct birthdate back to YYYY-MM-DD
            const combinedBirthdate = (data.birthYear && data.birthMonth && data.birthDay)
                ? `${data.birthYear}-${data.birthMonth}-${data.birthDay}`
                : "";

            const updatePayload: any = {
                fullName: data.fullName,
                slug: data.slug,
                phone: data.phone || "",
                whatsapp: data.whatsapp || "",
                birthdate: combinedBirthdate,
                countryOfOrigin: data.countryOfOrigin,
                location: data.location,
                githubUrl: data.githubUrl,
                linkedinUrl: data.linkedinUrl,
                hidePhoto: data.hidePhoto,
                hideBirthdate: data.hideBirthdate,
                hideGithub: data.hideGithub,
                hideLinkedin: data.hideLinkedin,
                hidePhone: data.hidePhone,
                hideWhatsapp: data.hideWhatsapp,
                updatedAt: new Date().toISOString()
            };

            if (editingLanguage === "es") {
                updatePayload.professionalTitle = data.professionalTitle;
                updatePayload.bio = data.bio;
            } else {
                updatePayload["translations.en.professionalTitle"] = data.professionalTitle;
                updatePayload["translations.en.bio"] = data.bio;
            }

            await updateDoc(doc(db, "users", user.uid), updatePayload);

            setUserData((prev: any) => {
                if (!prev) return prev;
                if (editingLanguage === "es") {
                    return { ...prev, ...updatePayload };
                } else {
                    return {
                        ...prev,
                        ...updatePayload,
                        translations: {
                            ...prev.translations,
                            en: {
                                ...(prev.translations?.en || {}),
                                professionalTitle: data.professionalTitle,
                                bio: data.bio
                            }
                        }
                    };
                }
            });

            toast.success(text.success);
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error(text.error);
        }
    };

    if (loading) {
        return <div className="animate-pulse flex space-x-4">{text.loading}</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">{text.title}</h1>
                <p className="text-sci-metallic mt-1">{text.desc}</p>
            </div>

            <SciFiCard>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Profile Picture Upload */}
                        <div className="md:col-span-2 flex items-center gap-6 mb-4">
                            <div className="relative h-24 w-24 rounded-2xl bg-sci-dark border border-sci-border flex items-center justify-center overflow-hidden shrink-0 group">
                                {userData?.photoURL ? (
                                    <img src={userData.photoURL} alt="Profile" className="h-full w-full object-cover" />
                                ) : (
                                    <span className="text-2xl font-mono text-sci-silver uppercase">
                                        {userData?.fullName?.substring(0, 2) || "NN"}
                                    </span>
                                )}

                                <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity z-10">
                                    {uploadingImage ? (
                                        <Loader2 className="w-6 h-6 text-sci-accent animate-spin" />
                                    ) : (
                                        <>
                                            <Camera className="w-6 h-6 text-sci-silver mb-1" />
                                            <span className="text-[10px] text-sci-silver uppercase tracking-widest">{editingLanguage === 'es' ? 'Cambiar' : 'Change'}</span>
                                        </>
                                    )}
                                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
                                </label>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-white font-medium">{editingLanguage === 'es' ? 'Fotografía de Perfil' : 'Profile Picture'}</h3>
                                <p className="text-sci-metallic text-sm mt-1 mb-3">{editingLanguage === 'es' ? 'Recomendado: Imagen cuadrada (1:1), máximo 5MB.' : 'Recommended: Square image (1:1), max 5MB.'}</p>

                                <label className="flex items-center gap-2 mb-3 cursor-pointer group w-fit">
                                    <input type="checkbox" {...register("hidePhoto")} className="w-4 h-4 rounded border-sci-border bg-sci-dark/50 text-sci-accent focus:ring-sci-accent focus:ring-offset-0 transition-colors" />
                                    <span className="text-sm text-sci-silver group-hover:text-white transition-colors">{text.hidePhoto}</span>
                                </label>

                                {userData?.photoURL && (
                                    <button
                                        type="button"
                                        onClick={handleImageDelete}
                                        disabled={uploadingImage}
                                        className="text-xs text-red-500 hover:text-red-400 font-mono transition-colors"
                                    >
                                        [{editingLanguage === 'es' ? 'Eliminar Foto Original' : 'Delete Original Photo'}]
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-sci-silver">{text.fullName} <span className="text-sci-accent/50 text-xs">{editingLanguage === 'en' && text.globalNote}</span></label>
                            <Input {...register("fullName")} placeholder="Ej. Jane Doe" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-sci-silver">{text.slug} <span className="text-sci-accent/50 text-xs">{editingLanguage === 'en' && text.globalNote}</span></label>
                            <div className="flex">
                                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-sci-border bg-sci-dark/50 text-sci-metallic text-sm">
                                    domain.com/
                                </span>
                                <Input
                                    {...register("slug")}
                                    className="rounded-l-none"
                                    placeholder="jane-doe"
                                />
                            </div>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium text-sci-silver">{text.job}</label>
                            <Input
                                {...register("professionalTitle")}
                                placeholder={editingLanguage === 'es' ? "Ej. Senior Cloud Platform Architect" : "E.g. Senior Cloud Platform Architect"}
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-end mb-1">
                                <label className="text-sm font-medium text-sci-silver block">
                                    {text.phone} <span className="text-sci-accent/50 text-xs">{editingLanguage === 'en' && text.globalNote}</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input type="checkbox" {...register("hidePhone")} className="w-4 h-4 rounded border-sci-border bg-sci-dark/50 text-sci-accent focus:ring-sci-accent focus:ring-offset-0 transition-colors" />
                                    <span className="text-xs text-sci-silver group-hover:text-white transition-colors">{text.hideLink}</span>
                                </label>
                            </div>
                            <InputMask
                                component={Input}
                                mask="(506) ____-____"
                                replacement={{ _: /\d/ }}
                                {...register("phone")}
                                type="tel"
                                placeholder={editingLanguage === 'es' ? "+506 8888-8888" : "+1 555-5555"}
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-end mb-1">
                                <label className="text-sm font-medium text-sci-silver block">
                                    {text.whatsapp} <span className="text-sci-accent/50 text-xs">{editingLanguage === 'en' && text.globalNote}</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input type="checkbox" {...register("hideWhatsapp")} className="w-4 h-4 rounded border-sci-border bg-sci-dark/50 text-sci-accent focus:ring-sci-accent focus:ring-offset-0 transition-colors" />
                                    <span className="text-xs text-sci-silver group-hover:text-white transition-colors">{text.hideLink}</span>
                                </label>
                            </div>
                            <InputMask
                                component={Input}
                                mask="(506) ____-____"
                                replacement={{ _: /\d/ }}
                                {...register("whatsapp")}
                                type="tel"
                                placeholder={editingLanguage === 'es' ? "+506 8888-8888" : "+1 555-5555"}
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-end mb-1">
                                <label className="text-sm font-medium text-sci-silver block">
                                    {text.birth} <span className="text-sci-accent/50 text-xs">{editingLanguage === 'en' && text.globalNote}</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input type="checkbox" {...register("hideBirthdate")} className="w-4 h-4 rounded border-sci-border bg-sci-dark/50 text-sci-accent focus:ring-sci-accent focus:ring-offset-0 transition-colors" />
                                    <span className="text-xs text-sci-silver group-hover:text-white transition-colors">{text.hideBirthdate}</span>
                                </label>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <select
                                    {...register("birthDay")}
                                    className="flex h-10 w-full rounded-md border border-sci-border bg-sci-dark/50 px-3 py-2 text-sm text-sci-silver focus:outline-none focus:ring-1 focus:ring-sci-accent focus:border-sci-accent disabled:opacity-50 transition-colors"
                                >
                                    <option value="">{text.birthDay}</option>
                                    {days.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>

                                <select
                                    {...register("birthMonth")}
                                    className="flex h-10 w-full rounded-md border border-sci-border bg-sci-dark/50 px-3 py-2 text-sm text-sci-silver focus:outline-none focus:ring-1 focus:ring-sci-accent focus:border-sci-accent disabled:opacity-50 transition-colors"
                                >
                                    <option value="">{text.birthMonth}</option>
                                    {months.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>

                                <select
                                    {...register("birthYear")}
                                    className="flex h-10 w-full rounded-md border border-sci-border bg-sci-dark/50 px-3 py-2 text-sm text-sci-silver focus:outline-none focus:ring-1 focus:ring-sci-accent focus:border-sci-accent disabled:opacity-50 transition-colors"
                                >
                                    <option value="">{text.birthYear}</option>
                                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-sci-silver">{text.country} <span className="text-sci-accent/50 text-xs">{editingLanguage === 'en' && text.globalNote}</span></label>
                            <select
                                {...register("countryOfOrigin")}
                                className="flex h-10 w-full rounded-md border border-sci-border bg-sci-dark/50 px-3 py-2 text-sm text-sci-silver placeholder:text-sci-metallic focus:outline-none focus:ring-1 focus:ring-sci-accent focus:border-sci-accent disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                            >
                                <option value="">{editingLanguage === 'es' ? "-- Seleccionar País --" : "-- Select Country --"}</option>
                                {systemCountries.map(c => (
                                    <option key={c.id} value={c.name}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium text-sci-silver">{text.location} <span className="text-sci-accent/50 text-xs">{editingLanguage === 'en' && text.globalNote}</span></label>
                            <Input {...register("location")} placeholder="San José, Costa Rica" />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium text-sci-silver">{text.bio}</label>
                            <Controller
                                name="bio"
                                control={control}
                                render={({ field }) => (
                                    <RichTextEditor
                                        key={editingLanguage}
                                        content={field.value || ""}
                                        onChange={field.onChange}
                                    />
                                )}
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-end mb-1">
                                <label className="text-sm font-medium text-sci-silver block">
                                    {text.github} <span className="text-sci-accent/50 text-xs">{editingLanguage === 'en' && text.globalNote}</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input type="checkbox" {...register("hideGithub")} className="w-4 h-4 rounded border-sci-border bg-sci-dark/50 text-sci-accent focus:ring-sci-accent focus:ring-offset-0 transition-colors" />
                                    <span className="text-xs text-sci-silver group-hover:text-white transition-colors">{text.hideLink}</span>
                                </label>
                            </div>
                            <Input {...register("githubUrl")} placeholder="https://github.com/..." />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-end mb-1">
                                <label className="text-sm font-medium text-sci-silver block">
                                    {text.linkedin} <span className="text-sci-accent/50 text-xs">{editingLanguage === 'en' && text.globalNote}</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input type="checkbox" {...register("hideLinkedin")} className="w-4 h-4 rounded border-sci-border bg-sci-dark/50 text-sci-accent focus:ring-sci-accent focus:ring-offset-0 transition-colors" />
                                    <span className="text-xs text-sci-silver group-hover:text-white transition-colors">{text.hideLink}</span>
                                </label>
                            </div>
                            <Input {...register("linkedinUrl")} placeholder="https://linkedin.com/in/..." />
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-sci-border">
                        <GlowingButton type="submit" disabled={isSubmitting}>
                            {isSubmitting ? text.saving : text.save}
                        </GlowingButton>
                    </div>
                </form>
            </SciFiCard>
        </div>
    );
}
