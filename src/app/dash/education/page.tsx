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

interface Education {
    id: string;
    institution: string;
    degree: string;
    startDate: string;
    endDate: string;
    description: string;
    translations?: {
        en?: {
            degree?: string;
            institution?: string;
            description?: string;
        }
    }
}

export default function EducationPage() {
    const { user } = useAuth();
    const { editingLanguage } = useDashboard();

    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState<any>(null);
    const [localEdu, setLocalEdu] = useState<any[]>([]);
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
                console.error("Error fetching education:", error);
                toast.error("Error al cargar registros");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    useEffect(() => {
        if (!userData || !userData.education) {
            setLocalEdu([]);
            return;
        }

        const mapped = userData.education.map((edu: any) => {
            if (editingLanguage === "es") {
                return {
                    id: edu.id,
                    startMonth: edu.startMonth || "",
                    startYear: edu.startYear || "",
                    endMonth: edu.endMonth || "",
                    endYear: edu.endYear || "",
                    isCurrent: edu.isCurrent || false,
                    degree: edu.degree || "",
                    institution: edu.institution || "",
                    description: edu.description || ""
                };
            } else {
                return {
                    id: edu.id,
                    startMonth: edu.startMonth || "",
                    startYear: edu.startYear || "",
                    endMonth: edu.endMonth || "",
                    endYear: edu.endYear || "",
                    isCurrent: edu.isCurrent || false,
                    degree: edu.translations?.en?.degree || "",
                    institution: edu.translations?.en?.institution || "",
                    description: edu.translations?.en?.description || ""
                };
            }
        });
        setLocalEdu(mapped);
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
            title: "Formación Académica",
            desc: "Añade tu historial educativo para construir el nodo académico.",
            save: "Guardar Registros",
            saving: "Sincronizando...",
            add: "Añadir Nueva Formación",
            degree: "Título Universitario / Certificación",
            institution: "Institución",
            start: "Fecha de Inicio",
            end: "Fecha de Finalización",
            month: "Mes",
            year: "Año",
            current: "Actual",
            description: "Descripción Adicional (Opcional)",
            global: "Global",
            success: "Nodo Académico Sincronizado",
            error: "Error almacenando datos"
        },
        en: {
            title: "Academic Training",
            desc: "Add your educational history to build the academic node.",
            save: "Save Records",
            saving: "Synchronizing...",
            add: "Add New Training",
            degree: "Degree / Certification",
            institution: "Institution",
            start: "Start Date",
            end: "End Date",
            month: "Month",
            year: "Year",
            current: "Present",
            description: "Additional Description (Optional)",
            global: "Global",
            success: "Academic Node Synchronized",
            error: "Error storing data"
        }
    };

    const text = labels[editingLanguage];

    const handleAdd = () => {
        setLocalEdu([
            ...localEdu,
            { id: Date.now().toString(), institution: "", degree: "", startMonth: "", startYear: "", endMonth: "", endYear: "", isCurrent: false, description: "" }
        ]);
    };

    const handleRemove = (id: string) => {
        setLocalEdu(localEdu.filter(edu => edu.id !== id));
    };

    const handleChange = (id: string, field: string, value: string | boolean) => {
        setLocalEdu(localEdu.map(edu =>
            edu.id === id ? { ...edu, [field]: value } : edu
        ));
    };

    const handleSave = async () => {
        if (!user) return;
        setSaving(true);
        try {
            const finalEducation = userData?.education ? [...userData.education] : [];

            const updatedEducation = localEdu.map(ledu => {
                const existing = finalEducation.find((e: any) => e.id === ledu.id) || { id: ledu.id };

                if (editingLanguage === "es") {
                    return {
                        ...existing,
                        startMonth: ledu.startMonth,
                        startYear: ledu.startYear,
                        endMonth: ledu.endMonth,
                        endYear: ledu.endYear,
                        isCurrent: ledu.isCurrent,
                        startDate: ledu.startMonth && ledu.startYear ? `${ledu.startMonth}/${ledu.startYear}` : "",
                        endDate: ledu.isCurrent ? "Present" : (ledu.endMonth && ledu.endYear ? `${ledu.endMonth}/${ledu.endYear}` : ""),
                        degree: ledu.degree,
                        institution: ledu.institution,
                        description: ledu.description
                    };
                } else {
                    return {
                        ...existing,
                        startMonth: ledu.startMonth,
                        startYear: ledu.startYear,
                        endMonth: ledu.endMonth,
                        endYear: ledu.endYear,
                        isCurrent: ledu.isCurrent,
                        startDate: ledu.startMonth && ledu.startYear ? `${ledu.startMonth}/${ledu.startYear}` : "",
                        endDate: ledu.isCurrent ? "Present" : (ledu.endMonth && ledu.endYear ? `${ledu.endMonth}/${ledu.endYear}` : ""),
                        translations: {
                            ...existing.translations,
                            en: {
                                ...(existing.translations?.en || {}),
                                degree: ledu.degree,
                                institution: ledu.institution,
                                description: ledu.description
                            }
                        }
                    };
                }
            });

            await updateDoc(doc(db, "users", user.uid), {
                education: updatedEducation,
                updatedAt: new Date().toISOString()
            });

            setUserData((prev: any) => ({ ...prev, education: updatedEducation }));
            toast.success(text.success);
        } catch (error) {
            console.error(error);
            toast.error(text.error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="animate-pulse flex space-x-4">...</div>;
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
                {localEdu.map((edu, index) => (
                    <SciFiCard key={edu.id} className="relative group p-6">
                        <button
                            onClick={() => handleRemove(edu.id)}
                            className="absolute top-4 right-4 p-2 text-sci-metallic hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>

                        <h3 className="text-sci-accent text-sm font-mono mb-4 border-b border-sci-border/50 pb-2 uppercase tracking-widest flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-sci-accent animate-pulse"></span>
                            NODE_EDU_{index + 1}
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5 md:col-span-2">
                                <label className="text-[10px] font-mono text-sci-metallic uppercase tracking-widest">{text.degree}</label>
                                <Input
                                    value={edu.degree}
                                    onChange={(e) => handleChange(edu.id, "degree", e.target.value)}
                                    placeholder={editingLanguage === 'es' ? "Ej. Ingeniería de Software" : "E.g. Software Engineering"}
                                    className="bg-black/50 border-sci-border/50 focus:border-sci-accent"
                                />
                            </div>

                            <div className="space-y-1.5 md:col-span-2">
                                <label className="text-[10px] font-mono text-sci-metallic uppercase tracking-widest">{text.institution}</label>
                                <Input
                                    value={edu.institution}
                                    onChange={(e) => handleChange(edu.id, "institution", e.target.value)}
                                    placeholder={editingLanguage === 'es' ? "Ej. Universidad Nacional" : "E.g. National University"}
                                    className="bg-black/50 border-sci-border/50 focus:border-sci-accent"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-mono text-sci-metallic uppercase tracking-widest flex justify-between">
                                    {text.start} <span className="text-sci-accent/50">{editingLanguage === 'en' && text.global}</span>
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    <select
                                        value={edu.startMonth || ""}
                                        onChange={(e) => handleChange(edu.id, "startMonth", e.target.value)}
                                        className="bg-black/50 border-sci-border/50 text-sci-silver font-mono focus:border-sci-accent focus:ring-1 focus:ring-sci-accent rounded-md px-3 py-2 text-sm transition-colors"
                                    >
                                        <option value="">{text.month}</option>
                                        {months.map(m => <option key={m.val} value={m.val}>{editingLanguage === 'es' ? m.es : m.en}</option>)}
                                    </select>
                                    <select
                                        value={edu.startYear || ""}
                                        onChange={(e) => handleChange(edu.id, "startYear", e.target.value)}
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
                                            checked={edu.isCurrent || false}
                                            onChange={(e) => handleChange(edu.id, "isCurrent", e.target.checked)}
                                            className="w-3.5 h-3.5 rounded border-sci-border bg-black/50 text-sci-accent focus:ring-sci-accent focus:ring-offset-sci-dark cursor-pointer transition-colors"
                                        />
                                        <span className="group-hover:text-white">{text.current}</span>
                                    </label>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <select
                                        value={edu.endMonth || ""}
                                        onChange={(e) => handleChange(edu.id, "endMonth", e.target.value)}
                                        disabled={edu.isCurrent}
                                        className="bg-black/50 border-sci-border/50 text-sci-silver font-mono focus:border-sci-accent focus:ring-1 focus:ring-sci-accent rounded-md px-3 py-2 text-sm transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        <option value="">{text.month}</option>
                                        {months.map(m => <option key={m.val} value={m.val}>{editingLanguage === 'es' ? m.es : m.en}</option>)}
                                    </select>
                                    <select
                                        value={edu.endYear || ""}
                                        onChange={(e) => handleChange(edu.id, "endYear", e.target.value)}
                                        disabled={edu.isCurrent}
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
                                    key={`${edu.id}-${editingLanguage}`}
                                    content={edu.description}
                                    onChange={(val) => handleChange(edu.id, "description", val)}
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
