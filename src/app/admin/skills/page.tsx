"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, doc, setDoc, deleteDoc, updateDoc, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Input } from "@/components/ui/Input";
import { Plus, Trash2, Cpu, Save, Edit2, X, Download, Upload, FileJson, Copy, Sparkles } from "lucide-react";
import { toast } from "react-hot-toast";
import { SciFiCard } from "@/components/ui/SciFiCard";
import { GlowingButton } from "@/components/ui/GlowingButton";

interface SkillInfo {
    id: string;
    name: string;
    category: string;
    translations?: {
        en?: {
            name?: string;
            category?: string;
        }
    }
}

export default function AdminSkillsPage() {
    const [loading, setLoading] = useState(true);
    const [skills, setSkills] = useState<SkillInfo[]>([]);
    const [saving, setSaving] = useState(false);
    const [importing, setImporting] = useState(false);
    const [importJson, setImportJson] = useState("");
    const [showImport, setShowImport] = useState(false);
    const [showExport, setShowExport] = useState(false);
    const [activeTab, setActiveTab] = useState("Conocimientos Técnicos");

    const [editingId, setEditingId] = useState<string | null>(null);
    const [newSkill, setNewSkill] = useState({
        name: "",
        category: "Conocimientos Técnicos",
        nameEn: "",
        categoryEn: "Technical Knowledge"
    });

    useEffect(() => {
        fetchSkills();
    }, []);

    const fetchSkills = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "system_skills"));
            const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SkillInfo));
            // Sort alphabetically by category, then by name
            data.sort((a, b) => {
                if (a.category === b.category) {
                    return a.name.localeCompare(b.name);
                }
                return a.category.localeCompare(b.category);
            });
            setSkills(data);
        } catch (error) {
            console.error("Error fetching skills:", error);
            toast.error("Error leyendo matriz de habilidades");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveNew = async () => {
        if (!newSkill.name || !newSkill.category) {
            toast.error("El nombre y la categoría son obligatorios", { icon: "⚠️" });
            return;
        }

        setSaving(true);
        try {
            const skillData = {
                name: newSkill.name.trim(),
                category: newSkill.category.trim(),
                translations: {
                    en: {
                        name: newSkill.nameEn.trim() || newSkill.name.trim(),
                        category: newSkill.categoryEn.trim() || newSkill.category.trim()
                    }
                }
            };

            if (editingId) {
                await updateDoc(doc(db, "system_skills", editingId), skillData);
                toast.success("Especialidad Actualizada Exitosamente");
                setEditingId(null);
            } else {
                const finalId = `SK_${newSkill.category.substring(0, 3)}_${Date.now().toString().slice(-6)}`.toUpperCase().replace(/\s/g, "");
                await setDoc(doc(db, "system_skills", finalId), skillData);
                toast.success("Habilidad Registrada en Matriz");
            }

            setNewSkill({
                name: "",
                category: newSkill.category,
                nameEn: "",
                categoryEn: newSkill.categoryEn
            });
            fetchSkills();
        } catch (error) {
            console.error(error);
            toast.error(editingId ? "Error al actualizar habilidad" : "Error al registrar habilidad");
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (skill: SkillInfo) => {
        setNewSkill({
            name: skill.name,
            category: skill.category,
            nameEn: skill.translations?.en?.name || "",
            categoryEn: skill.translations?.en?.category || ""
        });
        setEditingId(skill.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setNewSkill({ name: "", category: "Conocimientos Técnicos", nameEn: "", categoryEn: "Technical Knowledge" });
    };

    const handleRemove = async (id: string, name: string) => {
        if (confirm(`¿Confirmar purga de la habilidad: ${name}?`)) {
            try {
                await deleteDoc(doc(db, "system_skills", id));
                setSkills(skills.filter(s => s.id !== id));
                if (editingId === id) handleCancelEdit();
                toast.success(`Habilidad ${name} eliminada`);
            } catch (error) {
                console.error(error);
                toast.error("Error al eliminar la habilidad");
            }
        }
    };

    const handleExport = () => {
        setShowExport(true);
        toast.success("Catálogo procesado para exportación", { icon: "📄" });
    };

    const handleCopyExport = () => {
        const dataStr = JSON.stringify(skills, null, 2);
        navigator.clipboard.writeText(dataStr);
        toast.success("JSON copiado al portapapeles");
    };

    const handleDownloadExport = () => {
        const dataStr = JSON.stringify(skills, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const exportFileDefaultName = `skills_matrix_${new Date().toISOString().split('T')[0]}.json`;
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        toast.success("Descarga iniciada");
    };

    const handleImport = async () => {
        if (!importJson.trim()) {
            toast.error("Pega el JSON de traducción primero");
            return;
        }
        setImporting(true);
        try {
            const data = JSON.parse(importJson);
            if (!Array.isArray(data)) throw new Error("El formato debe ser un Array []");

            const batch = writeBatch(db);
            data.forEach((skill: any) => {
                if (!skill.id) return;
                const skillRef = doc(db, "system_skills", skill.id);
                // Clean ID from data to avoid redundancy in fields
                const { id, ...cleanData } = skill;
                batch.set(skillRef, cleanData, { merge: true });
            });

            await batch.commit();
            toast.success(`${data.length} habilidades sincronizadas exitosamente`);
            setImportJson("");
            setShowImport(false);
            fetchSkills();
        } catch (error: any) {
            console.error(error);
            toast.error("Error de importación: " + error.message);
        } finally {
            setImporting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="animate-pulse text-sci-accent text-sm font-mono tracking-widest uppercase flex items-center gap-3">
                    <Cpu className="h-4 w-4 animate-spin" /> Descifrando catálogo de habilidades...
                </div>
            </div>
        );
    }

    const CATEGORY_MAP = [
        { es: "Conocimientos Técnicos", en: "Technical Knowledge" },
        { es: "Habilidades Profesionales", en: "Technical Skills" },
        { es: "Software & Herramientas", en: "Software & Tools" },
        { es: "Idiomas", en: "Languages" }
    ];

    const handleCategoryChange = (esValue: string) => {
        const mapping = CATEGORY_MAP.find(m => m.es === esValue);
        setNewSkill({
            ...newSkill,
            category: esValue,
            categoryEn: mapping ? mapping.en : esValue
        });
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-sci-border/50 pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        <Cpu className="h-8 w-8 text-sci-accent" />
                        Catálogo de Especializaciones
                    </h1>
                    <p className="text-sci-metallic mt-1 text-sm">Biblioteca maestra de habilidades estandarizadas (Skills) para la plataforma.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2 bg-sci-dark border border-sci-border/50 rounded-lg text-sci-metallic hover:text-white hover:border-sci-accent transition-all text-sm font-mono uppercase tracking-widest"
                        title="Exportar para traducir"
                    >
                        <Download className="h-4 w-4" /> Exportar
                    </button>
                    <button
                        onClick={() => setShowImport(!showImport)}
                        className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-all text-sm font-mono uppercase tracking-widest ${showImport ? 'bg-sci-accent/20 border-sci-accent text-sci-accent' : 'bg-sci-dark border-sci-border/50 text-sci-metallic hover:text-white hover:border-sci-accent'}`}
                        title="Importar traducción"
                    >
                        <Upload className="h-4 w-4" /> Importar
                    </button>
                </div>
            </div>

            {showExport && (
                <SciFiCard className="p-6 border-amber-500/50 bg-amber-500/5 animate-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <Download className="h-5 w-5 text-amber-500" />
                            <h3 className="text-sm font-bold text-white uppercase tracking-widest">Extraer Datos para Gemini</h3>
                        </div>
                        <button onClick={() => setShowExport(false)} className="text-sci-metallic hover:text-white"><X className="h-4 w-4" /></button>
                    </div>
                    <p className="text-xs text-sci-metallic mb-4 font-mono">Copia este JSON y pásalo a Gemini con el prompt: <span className="text-amber-400">"Traduce este catálogo de habilidades al inglés respetando la estructura del objeto translations.en"</span></p>
                    <textarea
                        readOnly
                        value={JSON.stringify(skills, null, 2)}
                        className="w-full h-40 bg-black/60 border border-sci-border/50 rounded-lg p-3 text-xs font-mono text-amber-400 focus:border-amber-500 outline-none mb-4"
                        onClick={(e) => (e.target as HTMLTextAreaElement).select()}
                    />
                    <div className="flex justify-end gap-3">
                        <a
                            href="https://gemini.google.com/app"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 text-xs font-mono text-sci-accent hover:text-white border border-sci-accent/30 rounded-lg hover:bg-sci-accent/10 transition-all mr-auto"
                        >
                            <Sparkles className="h-3.5 w-3.5" /> Abrir Gemini AI
                        </a>
                        <button onClick={handleDownloadExport} className="flex items-center gap-2 px-4 py-2 text-xs font-mono text-sci-metallic hover:text-white border border-sci-border/30 rounded-lg hover:border-sci-accent transition-all">
                            <Download className="h-3.5 w-3.5" /> Descargar .json
                        </button>
                        <GlowingButton onClick={handleCopyExport} className="h-9 px-6 text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                            <Copy className="h-3.5 w-3.5" /> Copiar JSON
                        </GlowingButton>
                    </div>
                </SciFiCard>
            )}

            {showImport && (
                <SciFiCard className="p-6 border-sci-accent/50 bg-sci-accent/5 animate-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center gap-3 mb-4">
                        <FileJson className="h-5 w-5 text-sci-accent" />
                        <h3 className="text-sm font-bold text-white uppercase tracking-widest">Sincronización JSON (Traducciones Gemini)</h3>
                    </div>
                    <p className="text-xs text-sci-metallic mb-4 font-mono">Pega el JSON generado por la IA con las traducciones. Se actualizarán los campos existentes basados en el ID.</p>
                    <textarea
                        value={importJson}
                        onChange={(e) => setImportJson(e.target.value)}
                        placeholder='[ { "id": "SK_DES_123", "translations": { "en": { "name": "...", "category": "..." } } }, ... ]'
                        className="w-full h-40 bg-black/60 border border-sci-border/50 rounded-lg p-3 text-xs font-mono text-sci-accent focus:border-sci-accent outline-none mb-4"
                    />
                    <div className="flex justify-end gap-3">
                        <button onClick={() => setShowImport(false)} className="px-4 py-2 text-xs font-mono text-sci-metallic hover:text-white">Cancelar</button>
                        <GlowingButton onClick={handleImport} disabled={importing} className="h-9 px-6 text-xs transition-all">
                            {importing ? "Procesando..." : "Sincronizar Matriz"}
                        </GlowingButton>
                    </div>
                </SciFiCard>
            )}

            <SciFiCard className={`p-6 bg-black/40 border-sci-accent/30 shadow-[0_0_15px_rgba(0,240,255,0.05)] transition-all ${editingId ? 'border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/30' : ''}`}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className={`text-sm font-bold tracking-widest uppercase flex items-center gap-2 ${editingId ? 'text-amber-400' : 'text-white'}`}>
                        {editingId ? <Edit2 className="h-4 w-4" /> : <Plus className="h-4 w-4 text-sci-accent" />}
                        {editingId ? "Editando Especialidad" : "Registrar Nueva Especialidad"}
                    </h2>
                    {editingId && (
                        <button onClick={handleCancelEdit} className="text-sci-metallic hover:text-white flex items-center gap-1 text-xs font-mono uppercase transition-colors">
                            <X className="h-3.5 w-3.5" /> Cancelar
                        </button>
                    )}
                </div>

                <div className="space-y-6">
                    {/* Unified Category Selector */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-mono text-sci-metallic uppercase tracking-widest flex items-center gap-2">
                            <Cpu className="h-3 w-3" /> Pilar de Especialización (ES / EN)
                        </label>
                        <select
                            value={newSkill.category}
                            onChange={(e) => handleCategoryChange(e.target.value)}
                            className="w-full bg-black/60 border border-sci-border/50 rounded-lg px-4 py-3 text-sm text-sci-accent focus:border-sci-accent focus:ring-1 focus:ring-sci-accent/30 outline-none transition-all appearance-none cursor-pointer"
                            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2300f0ff' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.2rem' }}
                        >
                            {CATEGORY_MAP.map(m => (
                                <option key={m.es} value={m.es} className="bg-sci-dark">
                                    {m.es} / {m.en}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* ES Column */}
                        <div className="space-y-3 p-4 bg-sci-accent/5 rounded-lg border border-sci-accent/10">
                            <div className="text-[10px] font-mono text-sci-accent uppercase tracking-widest border-b border-sci-accent/20 pb-2 flex items-center gap-2">
                                <span>Español</span> 🇪🇸
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-mono text-sci-metallic uppercase tracking-widest">Nombre del Skill</label>
                                <Input
                                    value={newSkill.name}
                                    onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                                    placeholder="Ej. React.js"
                                    className="bg-black/50 border-sci-border/50 focus:border-sci-accent font-bold text-white"
                                />
                            </div>
                        </div>

                        {/* EN Column */}
                        <div className="space-y-3 p-4 bg-white/5 rounded-lg border border-white/10">
                            <div className="text-[10px] font-mono text-sci-metallic uppercase tracking-widest border-b border-white/10 pb-2 flex items-center gap-2">
                                <span>English</span> 🇺🇸
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-mono text-sci-metallic uppercase tracking-widest opacity-70">Skill Name (EN)</label>
                                <Input
                                    value={newSkill.nameEn}
                                    onChange={(e) => setNewSkill({ ...newSkill, nameEn: e.target.value })}
                                    placeholder="E.g. React.js"
                                    className="bg-black/50 border-sci-border/50 focus:border-sci-accent text-white"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-2">
                        <GlowingButton onClick={handleSaveNew} disabled={saving} className="h-12 px-12 text-sm font-bold min-w-[240px]">
                            {saving ? (
                                <div className="flex items-center gap-2">
                                    <Cpu className="h-4 w-4 animate-spin" /> Procesando...
                                </div>
                            ) : (
                                <span className="whitespace-nowrap">
                                    {editingId ? "Actualizar Especialidad" : "Registrar en el Sistema"}
                                </span>
                            )}
                        </GlowingButton>
                    </div>
                </div>
            </SciFiCard>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mt-8 mb-4 gap-4 px-1">
                <h2 className="text-sm font-bold text-sci-metallic tracking-widest uppercase flex items-center gap-2">
                    <Cpu className="h-4 w-4" /> Matriz de Conocimientos ({skills.length})
                </h2>

                <div className="flex flex-wrap gap-2">
                    {CATEGORY_MAP.map((cat) => {
                        const count = skills.filter(s => s.category === cat.es).length;
                        return (
                            <button
                                key={cat.es}
                                onClick={() => setActiveTab(cat.es)}
                                className={`px-4 py-2 text-[10px] font-mono uppercase tracking-widest rounded-lg border transition-all flex items-center gap-2 ${activeTab === cat.es
                                        ? 'bg-sci-accent/20 border-sci-accent text-sci-accent shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                                        : 'bg-sci-dark/40 border-sci-border/30 text-sci-metallic hover:border-sci-border hover:text-white'
                                    }`}
                            >
                                {cat.es}
                                <span className={`px-1.5 py-0.5 rounded ${activeTab === cat.es ? 'bg-sci-accent/30 text-sci-accent' : 'bg-white/5 text-sci-metallic/50'}`}>
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <SciFiCard className="p-0 overflow-hidden bg-black/40 border-sci-border/40">
                <div className="flex flex-col">
                    {/* Header */}
                    <div className="grid grid-cols-1 md:grid-cols-[1fr,1fr,auto] bg-sci-dark/80 border-b border-sci-border/50 text-[10px] font-mono text-sci-metallic uppercase tracking-widest px-6 py-4 gap-4">
                        <div className="hidden md:block">ES [Category / Skill]</div>
                        <div className="hidden md:block">EN [Category / Skill]</div>
                        <div className="hidden md:block text-right">Actions</div>
                        <div className="md:hidden">Especialidades</div>
                    </div>

                    {/* Body */}
                    <div className="divide-y divide-sci-border/30">
                        {skills
                            .filter(skill => skill.category === activeTab)
                            .map((skill) => (
                                <div key={skill.id} className={`grid grid-cols-1 md:grid-cols-[1fr,1fr,auto] p-6 gap-4 transition-colors group items-center ${editingId === skill.id ? 'bg-amber-500/5' : 'hover:bg-sci-accent/5'}`}>
                                    {/* ES Column */}
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-[9px] text-sci-accent/60 uppercase font-mono">{skill.category}</span>
                                        <span className="font-bold text-white break-words">{skill.name}</span>
                                    </div>

                                    {/* EN Column */}
                                    <div className="flex flex-col min-w-0 opacity-80">
                                        <span className="text-[9px] text-sci-metallic/60 uppercase font-mono">{skill.translations?.en?.category || '-'}</span>
                                        <span className="font-semibold text-sci-metallic break-words">{skill.translations?.en?.name || '-'}</span>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center justify-end gap-2 md:pl-4">
                                        <button
                                            onClick={() => handleEdit(skill)}
                                            className="p-2 border border-sci-border/50 rounded bg-sci-dark/50 text-sci-metallic hover:text-amber-400 hover:border-amber-400/50 transition-all flex-shrink-0"
                                            title="Editar"
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleRemove(skill.id, skill.name)}
                                            className="p-2 border border-sci-border/50 rounded bg-sci-dark/50 text-sci-metallic hover:text-red-400 hover:border-red-400/50 transition-all flex-shrink-0"
                                            title="Eliminar"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            </SciFiCard>
        </div>
    );
}
