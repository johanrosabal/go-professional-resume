"use client";

import { useAuth } from "@/lib/AuthContext";
import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { SciFiCard } from "@/components/ui/SciFiCard";
import { Input } from "@/components/ui/Input";
import { GlowingButton } from "@/components/ui/GlowingButton";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { useDashboard } from "@/lib/DashboardContext";

interface Reference {
    id: string;
    name: string;
    company: string;
    role: string;
    contactInfo: string;
    relationship?: string;
    isActive?: boolean;
    translations?: {
        en?: {
            role?: string;
            relationship?: string;
        }
    }
}

export default function ReferencesPage() {
    const { user } = useAuth();
    const { editingLanguage } = useDashboard();

    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState<any>(null);
    const [localRef, setLocalRef] = useState<any[]>([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            try {
                const docRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setUserData(docSnap.data());
                }
            } catch (error) {
                console.error("Error fetching references:", error);
                toast.error("Error al cargar registros");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    useEffect(() => {
        if (!userData || !userData.references) {
            setLocalRef([]);
            return;
        } const mapped = userData.references.map((ref: any) => {
            if (editingLanguage === "es") {
                return {
                    id: ref.id,
                    name: ref.name || "",
                    company: ref.company || "",
                    contactInfo: ref.contactInfo || "",
                    role: ref.role || "",
                    relationship: ref.relationship || "",
                    isActive: ref.isActive !== false
                };
            } else {
                return {
                    id: ref.id,
                    name: ref.name || "",
                    company: ref.company || "",
                    contactInfo: ref.contactInfo || "",
                    role: ref.translations?.en?.role || "",
                    relationship: ref.translations?.en?.relationship || "",
                    isActive: ref.isActive !== false // Default to true if undefined
                };
            }
        });
        setLocalRef(mapped);
    }, [userData, editingLanguage]);

    const labels = {
        es: {
            title: "Contactos de Referencia",
            desc: "Añade colegas o líderes que avalen tu trabajo.",
            save: "Guardar Registros",
            saving: "Sincronizando...",
            add: "Añadir Nueva Referencia",
            name: "Nombre Completo",
            company: "Empresa / Entidad",
            role: "Cargo / Rol",
            contact: "Información de Contacto",
            relationship: "Relación Laboral (Opcional)",
            global: "Global",
            active: "Mostrar Públicamente",
            success: "Red de Referencias Sincronizada",
            error: "Error almacenando datos",
            loading: "Enlazando contactos..."
        },
        en: {
            title: "Reference Contacts",
            desc: "Add colleagues or leaders who endorse your work.",
            save: "Save Records",
            saving: "Synchronizing...",
            add: "Add New Reference",
            name: "Full Name",
            company: "Company / Entity",
            role: "Role / Position",
            contact: "Contact Information",
            relationship: "Working Relationship (Optional)",
            global: "Global",
            active: "Show Publicly",
            success: "Reference Network Synchronized",
            error: "Error storing data",
            loading: "Linking contacts..."
        }
    };

    const text = labels[editingLanguage];

    const handleAdd = () => {
        setLocalRef([
            ...localRef,
            { id: Date.now().toString(), name: "", company: "", role: "", contactInfo: "", relationship: "", isActive: true }
        ]);
    };

    const handleRemove = (id: string) => {
        setLocalRef(localRef.filter(ref => ref.id !== id));
    };

    const handleChange = (id: string, field: string, value: any) => {
        setLocalRef(localRef.map(ref =>
            ref.id === id ? { ...ref, [field]: value } : ref
        ));
    };

    const handleSave = async () => {
        if (!user) return;
        setSaving(true);
        try {
            const finalReferences = userData?.references ? [...userData.references] : [];

            // Reconstruct array handling edits, additions, and language mappings
            const updatedReferences = localRef.map(lref => {
                const existing = finalReferences.find((e: any) => e.id === lref.id) || { id: lref.id };

                if (editingLanguage === "es") {
                    return {
                        ...existing,
                        name: lref.name,
                        company: lref.company,
                        contactInfo: lref.contactInfo,
                        isActive: lref.isActive,
                        role: lref.role,
                        relationship: lref.relationship
                    };
                } else {
                    return {
                        ...existing,
                        name: lref.name,        // Global fields
                        company: lref.company,  // Global fields
                        contactInfo: lref.contactInfo, // Global fields
                        isActive: lref.isActive,
                        translations: {
                            ...existing.translations,
                            en: {
                                ...(existing.translations?.en || {}),
                                role: lref.role,
                                relationship: lref.relationship
                            }
                        }
                    };
                }
            });

            await updateDoc(doc(db, "users", user.uid), {
                references: updatedReferences,
                updatedAt: new Date().toISOString()
            });

            setUserData((prev: any) => ({ ...prev, references: updatedReferences }));
            toast.success(text.success);
        } catch (error) {
            console.error(error);
            toast.error(text.error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="animate-pulse text-sci-accent">{text.loading}</div>;
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-sci-border/50 pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">{text.title}</h1>
                    <p className="text-sci-metallic mt-1">{text.desc}</p>
                </div>
                <GlowingButton onClick={handleSave} disabled={saving}>
                    {saving ? text.saving : text.save}
                </GlowingButton>
            </div>

            <div className="space-y-6">
                {localRef.map((ref, index) => (
                    <SciFiCard key={ref.id} className="relative group p-6">
                        <button
                            onClick={() => handleRemove(ref.id)}
                            className="absolute top-4 right-4 p-2 text-sci-metallic hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors"
                            title="Eliminar Registro"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>

                        <h3 className="text-sci-accent text-sm font-mono mb-4 border-b border-sci-border/50 pb-2 uppercase tracking-widest flex items-center pr-10 gap-2">
                            <span className="w-2 h-2 rounded-full bg-sci-accent animate-pulse"></span>
                            NODE_REF_{index + 1}
                            <label className="ml-auto flex items-center gap-2 cursor-pointer group normal-case font-sans text-xs tracking-normal border border-sci-border/50 px-2 py-1 rounded-md bg-sci-dark hover:border-sci-accent/50 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={ref.isActive !== false}
                                    onChange={(e) => handleChange(ref.id, "isActive", e.target.checked)}
                                    className="w-3.5 h-3.5 rounded border-sci-border bg-black text-sci-accent focus:ring-sci-accent focus:ring-offset-0"
                                />
                                <span className={ref.isActive !== false ? "text-white" : "text-sci-metallic"}>{text.active}</span>
                            </label>
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-mono text-sci-metallic uppercase tracking-widest flex justify-between">
                                    {text.name} <span className="text-sci-accent/50">{editingLanguage === 'en' && text.global}</span>
                                </label>
                                <Input
                                    value={ref.name}
                                    onChange={(e) => handleChange(ref.id, "name", e.target.value)}
                                    placeholder={editingLanguage === 'es' ? "Ej. Sarah Connor" : "E.g. Sarah Connor"}
                                    className="bg-black/50 border-sci-border/50 text-sci-silver font-mono focus:border-sci-accent"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-mono text-sci-metallic uppercase tracking-widest flex justify-between">
                                    {text.company} <span className="text-sci-accent/50">{editingLanguage === 'en' && text.global}</span>
                                </label>
                                <Input
                                    value={ref.company}
                                    onChange={(e) => handleChange(ref.id, "company", e.target.value)}
                                    placeholder={editingLanguage === 'es' ? "Ej. CyberDyne Systems" : "E.g. CyberDyne Systems"}
                                    className="bg-black/50 border-sci-border/50 text-sci-silver font-mono focus:border-sci-accent"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-mono text-sci-metallic uppercase tracking-widest flex justify-between">
                                    {text.role}
                                </label>
                                <Input
                                    value={ref.role}
                                    onChange={(e) => handleChange(ref.id, "role", e.target.value)}
                                    placeholder={editingLanguage === 'es' ? "Ej. Director de Ingeniería" : "E.g. Director of Engineering"}
                                    className="bg-black/50 border-sci-border/50 focus:border-sci-accent"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-mono text-sci-metallic uppercase tracking-widest flex justify-between">
                                    {text.contact} <span className="text-sci-accent/50">{editingLanguage === 'en' && text.global}</span>
                                </label>
                                <Input
                                    value={ref.contactInfo}
                                    onChange={(e) => handleChange(ref.id, "contactInfo", e.target.value)}
                                    placeholder={editingLanguage === 'es' ? "Email o Teléfono" : "Email or Phone"}
                                    className="bg-black/50 border-sci-border/50 text-sci-silver font-mono focus:border-sci-accent"
                                />
                            </div>

                            <div className="space-y-1.5 md:col-span-2">
                                <label className="text-[10px] font-mono text-sci-metallic uppercase tracking-widest flex justify-between">
                                    {text.relationship}
                                </label>
                                <Input
                                    value={ref.relationship}
                                    onChange={(e) => handleChange(ref.id, "relationship", e.target.value)}
                                    placeholder={editingLanguage === 'es' ? "Ej. Ex-Jefe Directo..." : "E.g. Former Manager..."}
                                    className="bg-black/50 border-sci-border/50 focus:border-sci-accent"
                                />
                            </div>
                        </div>
                    </SciFiCard>
                ))}

                <button
                    onClick={handleAdd}
                    className="w-full flex flex-col items-center justify-center p-8 border-2 border-dashed border-sci-border/50 rounded-xl text-sci-metallic hover:text-sci-accent hover:border-sci-accent hover:bg-sci-accent/5 transition-all group"
                >
                    <div className="h-10 w-10 rounded-full bg-sci-dark border border-sci-border/50 flex items-center justify-center mb-2 group-hover:border-sci-accent group-hover:shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all">
                        <Plus className="h-5 w-5" />
                    </div>
                    <span className="font-mono text-sm tracking-widest uppercase mt-2">{text.add}</span>
                </button>
            </div>
        </div>
    );
}
