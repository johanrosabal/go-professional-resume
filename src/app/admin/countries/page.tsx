"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Input } from "@/components/ui/Input";
import { Plus, Trash2, Globe, Save } from "lucide-react";
import { toast } from "react-hot-toast";
import { SciFiCard } from "@/components/ui/SciFiCard";
import { GlowingButton } from "@/components/ui/GlowingButton";

interface CountryInfo {
    id: string; // The country code, e.g. "CRI", "MEX"
    name: string; // "Costa Rica"
    phoneCode: string; // "+506"
    phoneMask: string; // "(506) ____-____"
}

export default function AdminCountriesPage() {
    const [loading, setLoading] = useState(true);
    const [countries, setCountries] = useState<CountryInfo[]>([]);
    const [saving, setSaving] = useState(false);

    // State for the new country form
    const [newCountry, setNewCountry] = useState({
        name: "",
        phoneCode: "",
        phoneMask: ""
    });

    useEffect(() => {
        fetchCountries();
    }, []);

    const fetchCountries = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "system_countries"));
            const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CountryInfo));
            // Sort alphabetically by name
            data.sort((a, b) => a.name.localeCompare(b.name));
            setCountries(data);
        } catch (error) {
            console.error("Error fetching countries:", error);
            toast.error("Error leyendo matriz de países");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveNew = async () => {
        if (!newCountry.name || !newCountry.phoneCode || !newCountry.phoneMask) {
            toast.error("Todos los campos del nodo son obligatorios", { icon: "⚠️" });
            return;
        }

        setSaving(true);
        try {
            // Document ID as first 3 letters capitalized (e.g., COS for Costa Rica)
            const finalId = newCountry.name.substring(0, 3).toUpperCase() + Date.now().toString().slice(-4);

            await setDoc(doc(db, "system_countries", finalId), {
                name: newCountry.name,
                phoneCode: newCountry.phoneCode,
                phoneMask: newCountry.phoneMask
            });

            toast.success("Nodo Continental Sincronizado");
            setNewCountry({ name: "", phoneCode: "", phoneMask: "" }); // Reset form
            fetchCountries(); // Refresh table
        } catch (error) {
            console.error(error);
            toast.error("Error crítico de escritura al registrar nodo");
        } finally {
            setSaving(false);
        }
    };

    const handleRemove = async (id: string, name: string) => {
        if (confirm(`¿Confirmar eliminación del registro maestro del país: ${name}?`)) {
            try {
                await deleteDoc(doc(db, "system_countries", id));
                setCountries(countries.filter(c => c.id !== id));
                toast.success(`Nodo ${name} eliminado exitosamente`);
            } catch (error) {
                console.error(error);
                toast.error("Error al eliminar el nodo");
            }
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="animate-pulse text-sci-accent text-sm font-mono tracking-widest uppercase flex items-center gap-3">
                    <Globe className="h-4 w-4 animate-spin" /> Analizando nodos planetarios...
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-sci-border/50 pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        <Globe className="h-8 w-8 text-sci-accent" />
                        Directorio Planetario
                    </h1>
                    <p className="text-sci-metallic mt-1 text-sm">Configuración global de países, códigos de área y máscaras telefónicas del sistema.</p>
                </div>
            </div>

            {/* Formulario de Alta */}
            <SciFiCard className="p-6 bg-black/40 border-sci-accent/30 shadow-[0_0_15px_rgba(0,240,255,0.05)]">
                <h2 className="text-sm font-bold text-white mb-4 tracking-widest uppercase flex items-center gap-2">
                    <Plus className="h-4 w-4 text-sci-accent" /> Registrar Nuevo Nodo
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div className="space-y-1.5 md:col-span-1">
                        <label className="text-[10px] font-mono text-sci-metallic uppercase tracking-widest">Nombre Geográfico</label>
                        <Input
                            value={newCountry.name}
                            onChange={(e) => setNewCountry({ ...newCountry, name: e.target.value })}
                            placeholder="Ej. Costa Rica"
                            className="bg-black/50 border-sci-border/50 focus:border-sci-accent"
                        />
                    </div>
                    <div className="space-y-1.5 md:col-span-1">
                        <label className="text-[10px] font-mono text-sci-metallic uppercase tracking-widest">Prefijo Global</label>
                        <Input
                            value={newCountry.phoneCode}
                            onChange={(e) => setNewCountry({ ...newCountry, phoneCode: e.target.value })}
                            placeholder="Ej. +506"
                            className="bg-black/50 border-sci-border/50 focus:border-sci-accent"
                        />
                    </div>
                    <div className="space-y-1.5 md:col-span-1">
                        <label className="text-[10px] font-mono text-sci-metallic uppercase tracking-widest">Máscara Telefónica UI</label>
                        <Input
                            value={newCountry.phoneMask}
                            onChange={(e) => setNewCountry({ ...newCountry, phoneMask: e.target.value })}
                            placeholder="Ej. (506) ____-____"
                            className="bg-black/50 border-sci-border/50 focus:border-sci-accent font-mono text-sci-accent/80"
                        />
                    </div>
                    <div className="md:col-span-1">
                        <GlowingButton
                            onClick={handleSaveNew}
                            disabled={saving}
                            className="w-full flex items-center justify-center gap-2 h-10"
                        >
                            <Save className="h-4 w-4" />
                            {saving ? "Ejecutando..." : "Sincronizar"}
                        </GlowingButton>
                    </div>
                </div>
            </SciFiCard>

            {/* Tabla de Registros */}
            <h2 className="text-sm font-bold text-sci-metallic mt-8 mb-2 tracking-widest uppercase flex items-center gap-2 pl-1">
                <Globe className="h-4 w-4" /> Nodos Existentes ({countries.length})
            </h2>

            <div className="hidden md:block">
                <SciFiCard className="p-0 overflow-hidden bg-black/40 border-sci-border/40">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-sci-dark/80 border-b border-sci-border/50 text-xs font-mono text-sci-metallic uppercase tracking-widest">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Nombre Geográfico</th>
                                    <th className="px-6 py-4 font-semibold">Prefijo Global</th>
                                    <th className="px-6 py-4 font-semibold">Máscara Telefónica UI</th>
                                    <th className="px-6 py-4 font-semibold text-right">Controles Root</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-sci-border/30">
                                {countries.map((country) => (
                                    <tr key={country.id} className="hover:bg-sci-accent/5 transition-colors group">
                                        <td className="px-6 py-4">
                                            <span className="font-bold text-white">{country.name}</span>
                                        </td>
                                        <td className="px-6 py-4 text-sci-silver font-mono text-xs">
                                            {country.phoneCode}
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs text-sci-accent/80">
                                            {country.phoneMask}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleRemove(country.id, country.name)}
                                                    className="w-8 h-8 flex items-center justify-center border border-sci-border rounded text-sci-metallic hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 transition-all"
                                                    title="Purgar Nodo Continental"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {countries.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="text-center py-12 text-sci-metallic italic text-sm">
                                            La base de datos geográfica está vacía. Registra el primer país arriba.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </SciFiCard>
            </div>

            {/* Vista Responsiva Mobile (Tarjetas) */}
            <div className="md:hidden grid gap-4">
                {countries.map((country) => (
                    <SciFiCard key={country.id} className="p-4 bg-black/40 border-sci-border/40 flex flex-col gap-3">
                        <div className="flex justify-between items-start">
                            <div className="font-bold text-white text-base">{country.name}</div>
                            <button
                                onClick={() => handleRemove(country.id, country.name)}
                                className="h-8 w-8 flex items-center justify-center border border-sci-border rounded text-sci-metallic hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 transition-all shrink-0"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                            <div className="bg-sci-dark/50 border border-sci-border/30 rounded px-3 py-2 text-sci-silver flex flex-col gap-1">
                                <span className="text-[9px] text-sci-metallic tracking-widest font-sans uppercase">Prefijo</span>
                                {country.phoneCode}
                            </div>
                            <div className="bg-sci-dark/50 border border-sci-border/30 rounded px-3 py-2 text-sci-accent/80 flex flex-col gap-1">
                                <span className="text-[9px] text-sci-metallic tracking-widest font-sans uppercase">Máscara UI</span>
                                {country.phoneMask}
                            </div>
                        </div>
                    </SciFiCard>
                ))}

                {countries.length === 0 && (
                    <div className="text-center py-12 text-sci-metallic italic text-sm border border-sci-border/30 rounded-xl">
                        La base de datos geográfica está vacía.
                    </div>
                )}
            </div>
        </div>
    );
}
