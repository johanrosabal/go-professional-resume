"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useDashboard } from "@/lib/DashboardContext";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { X, Copy, Check, Upload, Sparkles, Download } from "lucide-react";
import { GlowingButton } from "./GlowingButton";
import { toast } from "react-hot-toast";

interface AITranslationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AITranslationModal({ isOpen, onClose }: AITranslationModalProps) {
    const { user } = useAuth();
    const { editingLanguage } = useDashboard();

    const [loading, setLoading] = useState(false);
    const [exportJson, setExportJson] = useState("");
    const [importJson, setImportJson] = useState("");
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!isOpen || !user) return;

        if (editingLanguage === "es") {
            generateExportData();
        } else {
            setImportJson(""); // Clear previous paste
        }
    }, [isOpen, editingLanguage, user]);

    const generateExportData = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const docSnap = await getDoc(doc(db, "users", user.uid));
            if (docSnap.exists()) {
                const data = docSnap.data();

                // Extract only translatable fields
                const payload = {
                    metadata: {
                        do_not_translate: "Only translate the values matching the keys below. Keep everything as strictly valid JSON.",
                        target_language: "English"
                    },
                    profile: {
                        professionalTitle: data.professionalTitle || "",
                        bio: data.bio || ""
                    },
                    experiences: (data.experiences || []).map((exp: any) => ({
                        id: exp.id,
                        role: exp.role || "",
                        company: exp.company || "",
                        description: exp.description || ""
                    })),
                    education: (data.education || []).map((edu: any) => ({
                        id: edu.id,
                        degree: edu.degree || "",
                        institution: edu.institution || "",
                        description: edu.description || ""
                    })),
                    references: (data.references || []).map((ref: any) => ({
                        id: ref.id,
                        role: ref.role || "",
                        relationship: ref.relationship || ""
                    }))
                };

                setExportJson(JSON.stringify(payload, null, 2));
            }
        } catch (error) {
            console.error("Error generating export payload:", error);
            toast.error("Error al generar matriz de datos.");
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(exportJson);
        setCopied(true);
        toast.success("JSON copiado al portapapeles");
        setTimeout(() => setCopied(false), 2000);
    };

    const handleImportSave = async () => {
        if (!user) return;
        setLoading(true);
        try {
            // Remove markdown code blocks (e.g., ```json ... ```) commonly output by AI
            const cleanedJson = importJson.replace(/(?:^|\n)```(?:json)?\s*([\s\S]*?)\s*```/g, '$1').trim();
            const jsonStr = cleanedJson.startsWith('{') ? cleanedJson : importJson; // fallback just in case

            const parsed = JSON.parse(jsonStr);

            // Build the update payload for translations.en
            const updatePayload: any = {};

            if (parsed.profile) {
                if (parsed.profile.professionalTitle) updatePayload["translations.en.professionalTitle"] = parsed.profile.professionalTitle;
                if (parsed.profile.bio) updatePayload["translations.en.bio"] = parsed.profile.bio;
            }

            // For Arrays (Experiences, Education, References) we must overwrite the entire array 
            // because Firestore doesn't support easy deep-updating objects inside array elements mapped by ID safely 
            // without pulling the array first. Let's pull the array first.

            const docRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const currentData = docSnap.data();

                // Process Experiences
                if (parsed.experiences && Array.isArray(parsed.experiences)) {
                    const updatedExp = (currentData.experiences || []).map((exp: any) => {
                        const translatedMatch = parsed.experiences.find((pe: any) => pe.id === exp.id);
                        if (translatedMatch) {
                            return {
                                ...exp,
                                translations: {
                                    ...exp.translations,
                                    en: {
                                        role: translatedMatch.role || "",
                                        company: translatedMatch.company || "",
                                        description: translatedMatch.description || ""
                                    }
                                }
                            };
                        }
                        return exp;
                    });
                    updatePayload.experiences = updatedExp;
                }

                // Process Education
                if (parsed.education && Array.isArray(parsed.education)) {
                    const updatedEdu = (currentData.education || []).map((edu: any) => {
                        const translatedMatch = parsed.education.find((pe: any) => pe.id === edu.id);
                        if (translatedMatch) {
                            return {
                                ...edu,
                                translations: {
                                    ...edu.translations,
                                    en: {
                                        degree: translatedMatch.degree || "",
                                        institution: translatedMatch.institution || "",
                                        description: translatedMatch.description || ""
                                    }
                                }
                            };
                        }
                        return edu;
                    });
                    updatePayload.education = updatedEdu;
                }

                // Process References
                if (parsed.references && Array.isArray(parsed.references)) {
                    const updatedRef = (currentData.references || []).map((ref: any) => {
                        const translatedMatch = parsed.references.find((pe: any) => pe.id === ref.id);
                        if (translatedMatch) {
                            return {
                                ...ref,
                                translations: {
                                    ...ref.translations,
                                    en: {
                                        role: translatedMatch.role || "",
                                        relationship: translatedMatch.relationship || ""
                                    }
                                }
                            };
                        }
                        return ref;
                    });
                    updatePayload.references = updatedRef;
                }
            }

            await updateDoc(docRef, updatePayload);
            toast.success("Traducción asimilada exitosamente");
            onClose();
            // Force a reload to refresh all dashboard context seamlessly
            window.location.reload();

        } catch (error) {
            console.error("Error importing JSON:", error);
            toast.error("El formato JSON no es válido o está corrupto.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <div className="bg-sci-dark border border-sci-border shadow-2xl rounded-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="px-6 py-4 flex items-center justify-between border-b border-sci-border/50 bg-black/40">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-sci-accent" />
                        {editingLanguage === 'es' ? "Exportar Nodos (IA)" : "Importar Traducción (IA)"}
                    </h2>
                    <button onClick={onClose} className="p-1 hover:bg-sci-border rounded-md text-sci-metallic hover:text-white transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Body Content */}
                <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                    {editingLanguage === 'es' ? (
                        <div className="space-y-4">
                            <p className="text-sm text-sci-silver">
                                Copia este JSON exacto y pégalo en una IA como <a href="https://gemini.google.com/" target="_blank" rel="noreferrer" className="text-sci-accent hover:underline font-bold font-mono">Gemini</a>, ChatGPT o Claude con el texto: <br />
                                <strong className="text-sci-accent font-mono bg-sci-accent/10 p-1 rounded">"Traduce los valores de este JSON a un inglés profesional corporativo. Mantén exactamente la estructura y las llaves (keys) originales en formato JSON puro."</strong>
                            </p>

                            <div className="relative">
                                {loading ? (
                                    <div className="h-64 bg-black/50 border border-sci-border/50 rounded-md flex items-center justify-center">
                                        <span className="text-sci-metallic animate-pulse">Analizando matrices...</span>
                                    </div>
                                ) : (
                                    <textarea
                                        readOnly
                                        value={exportJson}
                                        className="w-full h-80 bg-[#0d1521] border border-sci-border rounded-md p-4 font-mono text-xs text-sci-silver focus:outline-none custom-scrollbar"
                                    />
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-sm text-sci-silver">
                                Pega aquí exactamente la respuesta <strong className="text-sci-accent">JSON generada por la IA</strong>. El sistema procesará el paquete de datos y actualizará tu perfil en Inglés de manera automática.
                            </p>

                            <textarea
                                value={importJson}
                                onChange={(e) => setImportJson(e.target.value)}
                                placeholder='{\n  "profile": {\n    "professionalTitle": "Senior Software Engineer",\n    ... \n  }\n}'
                                className="w-full h-80 bg-[#0d1521] border border-sci-border rounded-md p-4 font-mono text-xs text-sci-silver focus:outline-none focus:border-sci-accent transition-colors custom-scrollbar"
                            />
                        </div>
                    )}
                </div>

                {/* Footer Controls */}
                <div className="px-6 py-4 border-t border-sci-border/50 bg-black/40 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-sci-border rounded-md text-sm font-medium text-sci-metallic hover:text-white hover:bg-sci-border transition-colors"
                    >
                        Cancelar
                    </button>

                    {editingLanguage === 'es' ? (
                        <GlowingButton onClick={handleCopy} disabled={loading || !exportJson} className="flex gap-2">
                            {copied ? <Check className="h-4 w-4" /> : <Download className="h-4 w-4" />}
                            {copied ? "¡Copiado!" : "Copiar JSON"}
                        </GlowingButton>
                    ) : (
                        <GlowingButton onClick={handleImportSave} disabled={loading || !importJson.trim()} className="flex gap-2">
                            <Upload className="h-4 w-4" />
                            {loading ? "Integrando..." : "Sincronizar"}
                        </GlowingButton>
                    )}
                </div>

            </div>
        </div>
    );
}
