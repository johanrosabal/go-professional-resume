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
import dynamic from "next/dynamic";
import { useDashboard } from "@/lib/DashboardContext";

const RichTextEditor = dynamic(() => import("@/components/ui/RichTextEditor"), {
    ssr: false,
    loading: () => <div className="h-[200px] w-full bg-sci-dark/50 border border-sci-border/50 rounded-md animate-pulse"></div>
});

interface Experience {
    id: string;
    company: string;
    role: string;
    startDate: string;
    endDate: string;
    description: string;
    translations?: {
        en?: {
            role?: string;
            company?: string;
            description?: string;
        }
    }
}

export default function ExperiencePage() {
    const { user } = useAuth();
    const { editingLanguage } = useDashboard();

    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState<any>(null);
    const [localExp, setLocalExp] = useState<any[]>([]);
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
                console.error("Error fetching experience:", error);
                toast.error("Error cargando datos");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    useEffect(() => {
        if (!userData || !userData.experiences) {
            setLocalExp([]);
            return;
        }
        const mapped = userData.experiences.map((exp: any) => {
            if (editingLanguage === "es") {
                return {
                    id: exp.id,
                    startMonth: exp.startMonth || "",
                    startYear: exp.startYear || "",
                    endMonth: exp.endMonth || "",
                    endYear: exp.endYear || "",
                    isCurrent: exp.isCurrent || false,
                    company: exp.company || "",
                    role: exp.role || "",
                    description: exp.description || ""
                };
            } else {
                return {
                    id: exp.id,
                    startMonth: exp.startMonth || "",
                    startYear: exp.startYear || "",
                    endMonth: exp.endMonth || "",
                    endYear: exp.endYear || "",
                    isCurrent: exp.isCurrent || false,
                    company: exp.translations?.en?.company || "",
                    role: exp.translations?.en?.role || "",
                    description: exp.translations?.en?.description || ""
                };
            }
        });
        setLocalExp(mapped);
    }, [userData, editingLanguage]);

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 50 }, (_, i) => (currentYear - i).toString());
    const months = [
        { val: "01", es: "Enero", en: "January" },
        { val: "02", es: "Febrero", en: "February" },
        { val: "03", es: "Marzo", en: "March" },
        { val: "04", es: "Abril", en: "April" },
        { val: "05", es: "Mayo", en: "May" },
        { val: "06", es: "Junio", en: "June" },
        { val: "07", es: "Julio", en: "July" },
        { val: "08", es: "Agosto", en: "August" },
        { val: "09", es: "Septiembre", en: "September" },
        { val: "10", es: "Octubre", en: "October" },
        { val: "11", es: "Noviembre", en: "November" },
        { val: "12", es: "Diciembre", en: "December" }
    ];

    const labels = {
        es: {
            title: "Experiencia Laboral",
            desc: "Añade tu historial profesional para construir el nodo de experiencia.",
            save: "Guardar Registros",
            saving: "Sincronizando...",
            add: "Añadir Nueva Experiencia",
            role: "Cargo / Rol",
            company: "Empresa / Entidad",
            start: "Fecha de Inicio",
            end: "Fecha de Finalización",
            month: "Mes",
            year: "Año",
            current: "Actual",
            description: "Descripción de Funciones (Opcional)",
            global: "Global",
            success: "Registro Operativo Sincronizado",
            error: "Error almacenando datos"
        },
        en: {
            title: "Work Experience",
            desc: "Add your professional history to build the experience node.",
            save: "Save Records",
            saving: "Synchronizing...",
            add: "Add New Experience",
            role: "Role / Position",
            company: "Company / Entity",
            start: "Start Date",
            end: "End Date",
            month: "Month",
            year: "Year",
            current: "Present",
            description: "Role Description (Optional)",
            global: "Global",
            success: "Operational Record Synchronized",
            error: "Error storing data"
        }
    };

    const text = labels[editingLanguage];

    const handleAdd = () => {
        setLocalExp([
            ...localExp,
            { id: Date.now().toString(), company: "", role: "", startMonth: "", startYear: "", endMonth: "", endYear: "", isCurrent: false, description: "" }
        ]);
    };

    const handleRemove = (id: string) => {
        setLocalExp(localExp.filter(exp => exp.id !== id));
    };

    const handleChange = (id: string, field: string, value: string | boolean) => {
        setLocalExp(localExp.map(exp =>
            exp.id === id ? { ...exp, [field]: value } : exp
        ));
    };

    const handleSave = async () => {
        if (!user) return;
        setSaving(true);
        try {
            const finalExperiences = userData?.experiences ? [...userData.experiences] : [];

            const updatedExperiences = localExp.map(lexp => {
                const existing = finalExperiences.find((e: any) => e.id === lexp.id) || { id: lexp.id };

                if (editingLanguage === "es") {
                    return {
                        ...existing,
                        startMonth: lexp.startMonth,
                        startYear: lexp.startYear,
                        endMonth: lexp.endMonth,
                        endYear: lexp.endYear,
                        isCurrent: lexp.isCurrent,
                        startDate: lexp.startMonth && lexp.startYear ? `${lexp.startMonth}/${lexp.startYear}` : "",
                        endDate: lexp.isCurrent ? "Present" : (lexp.endMonth && lexp.endYear ? `${lexp.endMonth}/${lexp.endYear}` : ""),
                        role: lexp.role,
                        company: lexp.company,
                        description: lexp.description
                    };
                } else {
                    return {
                        ...existing,
                        startMonth: lexp.startMonth,
                        startYear: lexp.startYear,
                        endMonth: lexp.endMonth,
                        endYear: lexp.endYear,
                        isCurrent: lexp.isCurrent,
                        startDate: lexp.startMonth && lexp.startYear ? `${lexp.startMonth}/${lexp.startYear}` : "",
                        endDate: lexp.isCurrent ? "Present" : (lexp.endMonth && lexp.endYear ? `${lexp.endMonth}/${lexp.endYear}` : ""),
                        translations: {
                            ...existing.translations,
                            en: {
                                ...(existing.translations?.en || {}),
                                role: lexp.role,
                                company: lexp.company,
                                description: lexp.description
                            }
                        }
                    };
                }
            });

            await updateDoc(doc(db, "users", user.uid), {
                experiences: updatedExperiences,
                updatedAt: new Date().toISOString()
            });

            setUserData((prev: any) => ({ ...prev, experiences: updatedExperiences }));
            toast.success(text.success);
        } catch (error) {
            console.error(error);
            toast.error(text.error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="animate-pulse flex space-x-4">...</div>;

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
                {localExp.map((exp, index) => (
                    <SciFiCard key={exp.id} className="relative group p-6">
                        <button
                            onClick={() => handleRemove(exp.id)}
                            className="absolute top-4 right-4 p-2 text-sci-metallic hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>

                        <h3 className="text-sci-accent text-sm font-mono mb-4 border-b border-sci-border/50 pb-2 uppercase tracking-widest flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-sci-accent animate-pulse"></span>
                            NODE_EXP_{index + 1}
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-mono text-sci-metallic uppercase tracking-widest">{text.role}</label>
                                <Input
                                    value={exp.role}
                                    onChange={(e) => handleChange(exp.id, "role", e.target.value)}
                                    placeholder={editingLanguage === 'es' ? "Ej. Frontend Developer" : "E.g. Frontend Developer"}
                                    className="bg-black/50 border-sci-border/50 focus:border-sci-accent"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-mono text-sci-metallic uppercase tracking-widest">{text.company}</label>
                                <Input
                                    value={exp.company}
                                    onChange={(e) => handleChange(exp.id, "company", e.target.value)}
                                    placeholder={editingLanguage === 'es' ? "Ej. Tech Corp" : "E.g. Tech Corp"}
                                    className="bg-black/50 border-sci-border/50 focus:border-sci-accent"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-mono text-sci-metallic uppercase tracking-widest flex justify-between">
                                    {text.start} <span className="text-sci-accent/50">{editingLanguage === 'en' && text.global}</span>
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    <select
                                        value={exp.startMonth || ""}
                                        onChange={(e) => handleChange(exp.id, "startMonth", e.target.value)}
                                        className="bg-black/50 border-sci-border/50 text-sci-silver font-mono focus:border-sci-accent focus:ring-1 focus:ring-sci-accent rounded-md px-3 py-2 text-sm transition-colors"
                                    >
                                        <option value="">{text.month}</option>
                                        {months.map(m => <option key={m.val} value={m.val}>{editingLanguage === 'es' ? m.es : m.en}</option>)}
                                    </select>
                                    <select
                                        value={exp.startYear || ""}
                                        onChange={(e) => handleChange(exp.id, "startYear", e.target.value)}
                                        className="bg-black/50 border-sci-border/50 text-sci-silver font-mono focus:border-sci-accent focus:ring-1 focus:ring-sci-accent rounded-md px-3 py-2 text-sm transition-colors"
                                    >
                                        <option value="">{text.year}</option>
                                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center">
                                    <label className="text-[10px] font-mono text-sci-metallic uppercase tracking-widest flex justify-between gap-2">
                                        {text.end} <span className="text-sci-accent/50">{editingLanguage === 'en' && text.global}</span>
                                    </label>
                                    <label className="flex items-center gap-1.5 cursor-pointer text-xs font-mono text-sci-accent hover:text-white transition-colors group">
                                        <input
                                            type="checkbox"
                                            checked={exp.isCurrent || false}
                                            onChange={(e) => handleChange(exp.id, "isCurrent", e.target.checked)}
                                            className="w-3.5 h-3.5 rounded border-sci-border bg-black/50 text-sci-accent focus:ring-sci-accent focus:ring-offset-sci-dark cursor-pointer transition-colors"
                                        />
                                        <span className="group-hover:text-white">{text.current}</span>
                                    </label>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <select
                                        value={exp.endMonth || ""}
                                        onChange={(e) => handleChange(exp.id, "endMonth", e.target.value)}
                                        disabled={exp.isCurrent}
                                        className="bg-black/50 border-sci-border/50 text-sci-silver font-mono focus:border-sci-accent focus:ring-1 focus:ring-sci-accent rounded-md px-3 py-2 text-sm transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        <option value="">{text.month}</option>
                                        {months.map(m => <option key={m.val} value={m.val}>{editingLanguage === 'es' ? m.es : m.en}</option>)}
                                    </select>
                                    <select
                                        value={exp.endYear || ""}
                                        onChange={(e) => handleChange(exp.id, "endYear", e.target.value)}
                                        disabled={exp.isCurrent}
                                        className="bg-black/50 border-sci-border/50 text-sci-silver font-mono focus:border-sci-accent focus:ring-1 focus:ring-sci-accent rounded-md px-3 py-2 text-sm transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        <option value="">{text.year}</option>
                                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="col-span-1 md:col-span-2 space-y-1.5">
                                <label className="text-[10px] font-mono text-sci-metallic uppercase tracking-widest">{text.description}</label>
                                <RichTextEditor
                                    key={`${exp.id}-${editingLanguage}`}
                                    content={exp.description}
                                    onChange={(val) => handleChange(exp.id, "description", val)}
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
