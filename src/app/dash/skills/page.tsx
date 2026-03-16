"use client";

import { useAuth } from "@/lib/AuthContext";
import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc, getDocs, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { SciFiCard } from "@/components/ui/SciFiCard";
import { Input } from "@/components/ui/Input";
import { GlowingButton } from "@/components/ui/GlowingButton";
import { Plus, Trash2, Zap, LayoutGrid, Cpu, Code, Lightbulb, Wrench, Terminal, Users, Box, Globe } from "lucide-react";
import { toast } from "react-hot-toast";
import { useDashboard } from "@/lib/DashboardContext";
import { cn } from "@/lib/utils";

interface Skill {
    id: string;
    name: string;
    level: number; // 1-5
    category: string;
    isActive: boolean;
    translations?: {
        en?: {
            name?: string;
            category?: string;
        }
    }
}

const CATEGORY_SUGGESTIONS = {
    es: ["Conocimientos Técnicos", "Habilidades Profesionales", "Software & Herramientas", "Idiomas"],
    en: ["Technical Knowledge", "Technical Skills", "Software & Tools", "Languages"]
};

const SKILL_ICONS: Record<string, any> = {
    "Conocimientos Técnicos": Code,
    "Technical Knowledge": Code,
    "Habilidades Profesionales": Users,
    "Technical Skills": Users,
    "Software & Herramientas": Box,
    "Software & Tools": Box,
    "Idiomas": Globe,
    "Languages": Globe,
    "default": Wrench
};

export default function SkillsPage() {
    const { user } = useAuth();
    const { editingLanguage } = useDashboard();

    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState<any>(null);
    const [localSkills, setLocalSkills] = useState<Skill[]>([]);
    const [systemSkills, setSystemSkills] = useState<any[]>([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            try {
                // Fetch User Data
                const docRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setUserData(docSnap.data());
                }

                // Fetch System Master Skills for suggestions
                const sysSnap = await getDocs(collection(db, "system_skills"));
                setSystemSkills(sysSnap.docs.map((d: any) => ({ id: d.id, ...d.data() })));
            } catch (error) {
                console.error("Error fetching skills:", error);
                toast.error("Error al cargar habilidades");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    useEffect(() => {
        if (!userData || !userData.skills) {
            setLocalSkills([]);
            return;
        }

        const mapped = userData.skills.map((skill: any) => {
            if (editingLanguage === "es") {
                return {
                    ...skill,
                    name: skill.name || "",
                    category: skill.category || "",
                    level: skill.level || 3,
                    isActive: skill.isActive !== false
                };
            } else {
                return {
                    ...skill,
                    name: skill.translations?.en?.name || skill.name || "",
                    category: skill.translations?.en?.category || skill.category || "",
                    level: skill.level || 3,
                    isActive: skill.isActive !== false
                };
            }
        });
        setLocalSkills(mapped);
    }, [userData, editingLanguage]);

    const labels = {
        es: {
            title: "Habilidades & Tecnologías",
            desc: "Gestiona tu stack tecnológico y habilidades profesionales por categorías.",
            save: "Sincronizar Datos",
            saving: "Guardando...",
            add: "Añadir Habilidad",
            name: "Nombre del Skill",
            category: "Categoría",
            level: "Nivel de Dominio",
            global: "Global",
            active: "Público",
            success: "Habilidades actualizadas con éxito",
            error: "Error al guardar cambios",
            loading: "Cargando matriz de habilidades...",
            levelDesc: ["Novato", "Aprendiz", "Intermedio", "Avanzado", "Experto"],
            catalog: "Sugerencia del Catálogo"
        },
        en: {
            title: "Skills & Tech Stack",
            desc: "Manage your technology stack and professional tools by categories.",
            save: "Sync Matrix",
            saving: "Saving...",
            add: "Add Skill",
            name: "Skill Name",
            category: "Category",
            level: "Mastery Level",
            global: "Global",
            active: "Public",
            success: "Skills matrix synchronized",
            error: "Error saving changes",
            loading: "Loading skills matrix...",
            levelDesc: ["Novice", "Apprentice", "Intermediate", "Advanced", "Expert"],
            catalog: "Catalog Suggestion"
        }
    };

    const text = labels[editingLanguage];

    const handleAdd = () => {
        const newSkill: Skill = {
            id: Date.now().toString(),
            name: "",
            category: "General",
            level: 3,
            isActive: true
        };
        setLocalSkills([...localSkills, newSkill]);
    };

    const handleRemove = (id: string) => {
        setLocalSkills(localSkills.filter(s => s.id !== id));
    };

    const handleChange = (id: string, field: keyof Skill, value: any) => {
        setLocalSkills(localSkills.map(s =>
            s.id === id ? { ...s, [field]: value } : s
        ));
    };

    // New: Handle Autocomplete Selection
    const handleSelectMasterSkill = (id: string, masterSkill: any) => {
        const isEs = editingLanguage === 'es';
        const name = isEs ? masterSkill.name : (masterSkill.translations?.en?.name || masterSkill.name);
        const category = isEs ? masterSkill.category : (masterSkill.translations?.en?.category || masterSkill.category);

        setLocalSkills(localSkills.map(s => {
            if (s.id === id) {
                const updated = {
                    ...s,
                    name,
                    category,
                    // Store the internal technical translations for cross-sync
                    translations: {
                        en: {
                            name: masterSkill.translations?.en?.name || masterSkill.name,
                            category: masterSkill.translations?.en?.category || masterSkill.category
                        }
                    }
                };
                // If we are editing in EN, we also need to update the base (ES) fields effectively or vice versa
                if (!isEs) {
                    updated.name = masterSkill.name; // Keep internal base as ES
                    updated.category = masterSkill.category;
                }
                return updated;
            }
            return s;
        }));
    };

    const handleSave = async () => {
        if (!user) return;
        setSaving(true);
        try {
            const finalSkills = userData?.skills ? [...userData.skills] : [];

            const updatedSkills = localSkills.map(ls => {
                const existing = finalSkills.find((e: any) => e.id === ls.id) || { id: ls.id };

                if (editingLanguage === "es") {
                    return {
                        ...existing,
                        ...ls,
                        translations: ls.translations || existing.translations // Preserve translations if selecting master skill
                    };
                } else {
                    return {
                        ...existing,
                        level: ls.level,
                        isActive: ls.isActive,
                        translations: {
                            ...existing.translations,
                            en: {
                                name: ls.name,
                                category: ls.category
                            }
                        }
                    };
                }
            });

            await updateDoc(doc(db, "users", user.uid), {
                skills: updatedSkills,
                updatedAt: new Date().toISOString()
            });

            setUserData((prev: any) => ({ ...prev, skills: updatedSkills }));
            toast.success(text.success);
        } catch (error) {
            console.error(error);
            toast.error(text.error);
        } finally {
            setSaving(false);
        }
    };

    // Group skills by category
    const groupedSkills = localSkills.reduce((acc, skill) => {
        const cat = skill.category || "General";
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(skill);
        return acc;
    }, {} as Record<string, Skill[]>);

    if (loading) {
        return <div className="animate-pulse text-sci-accent font-mono uppercase tracking-[0.2em]">{text.loading}</div>;
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-sci-border/50 pb-6 relative">
                <div className="absolute -left-4 top-0 w-1 h-full bg-sci-accent/30 rounded-full" />
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-widest uppercase flex items-center gap-3">
                        <Terminal className="h-8 w-8 text-sci-accent" />
                        {text.title}
                    </h1>
                    <p className="text-sci-metallic mt-1 font-mono text-sm uppercase tracking-wider">{text.desc}</p>
                </div>
                <GlowingButton onClick={handleSave} disabled={saving} className="min-w-[180px]">
                    {saving ? text.saving : text.save}
                </GlowingButton>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Categorized View */}
                <div className="lg:col-span-12 space-y-8">
                    {Object.entries(groupedSkills).map(([category, skills]) => {
                        const Icon = SKILL_ICONS[category] || SKILL_ICONS.default;
                        return (
                            <div key={category} className="space-y-4">
                                <h2 className="text-sci-accent font-mono text-sm tracking-[0.3em] uppercase flex items-center gap-3 bg-sci-accent/5 p-2 rounded-lg border-l-2 border-sci-accent">
                                    <Icon className="h-4 w-4" />
                                    {category}
                                    <span className="text-[10px] text-sci-metallic ml-auto border border-sci-border/50 px-2 py-0.5 rounded">
                                        {skills.length} NODES
                                    </span>
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {skills.map((skill) => (
                                        <SciFiCard key={skill.id} className="p-4 group relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                                <button
                                                    onClick={() => handleRemove(skill.id)}
                                                    className="p-1.5 text-sci-metallic hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>

                                            <div className="space-y-4">
                                                {/* Category Field - STEP 1 */}
                                                <div className="space-y-1">
                                                    <label className="text-[9px] font-mono text-sci-accent uppercase tracking-[0.2em]">
                                                        {text.category}
                                                    </label>
                                                    <select
                                                        value={skill.category}
                                                        onChange={(e) => handleChange(skill.id, "category", e.target.value)}
                                                        className="w-full h-10 px-3 rounded-md bg-black/60 border border-sci-border/40 text-xs text-sci-silver focus:border-sci-accent/60 focus:ring-1 focus:ring-sci-accent/30 outline-none appearance-none transition-all"
                                                    >
                                                        {CATEGORY_SUGGESTIONS[editingLanguage].map(cat => (
                                                            <option key={cat} value={cat}>{cat}</option>
                                                        ))}
                                                        {!CATEGORY_SUGGESTIONS[editingLanguage].includes(skill.category) && (
                                                            <option value={skill.category}>{skill.category}</option>
                                                        )}
                                                    </select>
                                                </div>

                                                {/* Skill Name Field - STEP 2 */}
                                                <div className="space-y-1 relative">
                                                    <label className="text-[9px] font-mono text-sci-accent uppercase tracking-[0.2em] flex justify-between">
                                                        {text.name}
                                                    </label>
                                                    <Input
                                                        value={skill.name}
                                                        onChange={(e) => handleChange(skill.id, "name", e.target.value)}
                                                        placeholder="Ej. React / Python"
                                                        className="h-10 text-xs bg-black/60 border-sci-border/40 focus:border-sci-accent/60"
                                                        list={`suggestions-${skill.id}`}
                                                    />
                                                    <datalist id={`suggestions-${skill.id}`}>
                                                        {systemSkills
                                                            .filter(s => {
                                                                const masterCat = editingLanguage === 'es' ? s.category : (s.translations?.en?.category || s.category);
                                                                return masterCat === skill.category;
                                                            })
                                                            .map(s => (
                                                                <option
                                                                    key={s.id}
                                                                    value={editingLanguage === 'es' ? s.name : (s.translations?.en?.name || s.name)}
                                                                >
                                                                    {text.catalog}
                                                                </option>
                                                            ))}
                                                    </datalist>
                                                </div>

                                                {/* Mastery Level Field */}
                                                <div className="space-y-3 pt-2">
                                                    <div className="flex justify-between items-center">
                                                        <label className="text-[9px] font-mono text-sci-metallic uppercase tracking-widest">
                                                            {text.level}: <span className="text-sci-accent">{text.levelDesc[skill.level - 1]}</span>
                                                        </label>
                                                        <div className="flex gap-1">
                                                            {[1, 2, 3, 4, 5].map((lvl) => (
                                                                <button
                                                                    key={lvl}
                                                                    onClick={() => handleChange(skill.id, "level", lvl)}
                                                                    className={cn(
                                                                        "w-5 h-1.5 rounded-sm transition-all",
                                                                        lvl <= skill.level
                                                                            ? "bg-sci-accent shadow-[0_0_8px_rgba(0,240,255,0.5)]"
                                                                            : "bg-sci-border/50 hover:bg-sci-accent/30"
                                                                    )}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Public Toggle Field - Compact footer style */}
                                                <div className="flex items-center justify-between pt-4 border-t border-sci-border/10">
                                                    <span className="text-[9px] font-mono text-sci-metallic uppercase tracking-widest">{text.active}</span>
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={skill.isActive}
                                                            onChange={(e) => handleChange(skill.id, "isActive", e.target.checked)}
                                                            className="sr-only peer"
                                                        />
                                                        <div className={cn(
                                                            "w-11 h-6 bg-sci-dark rounded-full border border-sci-border/50 peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-sci-metallic/50 after:border-sci-border/50 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sci-accent/30 peer-checked:border-sci-accent/50 peer-checked:after:bg-sci-accent"
                                                        )}></div>
                                                    </label>
                                                </div>
                                            </div>
                                        </SciFiCard>
                                    ))}
                                </div>
                            </div>
                        );
                    })}

                    {localSkills.length === 0 && (
                        <div className="text-center py-20 border-2 border-dashed border-sci-border/20 rounded-2xl bg-sci-accent/5">
                            <Code className="h-12 w-12 text-sci-border mx-auto mb-4 opacity-30" />
                            <p className="text-sci-metallic font-mono uppercase tracking-widest text-sm">No skills detected in neuro-link</p>
                            <p className="text-sci-border text-xs mt-2 uppercase">Please initialize new skill nodes</p>
                        </div>
                    )}

                    <button
                        onClick={handleAdd}
                        className="w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-sci-border/50 rounded-xl text-sci-metallic hover:text-sci-accent hover:border-sci-accent hover:bg-sci-accent/5 transition-all group"
                    >
                        <div className="h-10 w-10 rounded-full bg-sci-dark border border-sci-border/50 flex items-center justify-center mb-2 group-hover:border-sci-accent group-hover:shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all">
                            <Plus className="h-5 w-5" />
                        </div>
                        <span className="font-mono text-sm tracking-widest uppercase mt-2">{text.add}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
