"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Users, ShieldAlert, CheckCircle, XCircle, Search, Settings2, ShieldCheck, Mail, Link as LinkIcon, BadgePercent } from "lucide-react";
import { toast } from "react-hot-toast";
import { Input } from "@/components/ui/Input";
import { SciFiCard } from "@/components/ui/SciFiCard";
import Link from "next/link";

interface UserInfo {
    uid: string;
    email: string;
    fullName: string;
    slug: string;
    role: "admin" | "guest";
    isActive: boolean;
    specialBadge?: string;
}

export default function AdminUsersPage() {
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState<UserInfo[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "users"));
            const data = querySnapshot.docs.map(doc => {
                const docData = doc.data();
                return {
                    uid: docData.uid || doc.id,
                    email: docData.email,
                    fullName: docData.fullName,
                    slug: docData.slug,
                    role: docData.role || "guest",
                    isActive: docData.isActive !== false,
                    specialBadge: docData.specialBadge || ""
                } as UserInfo;
            });
            setUsers(data);
        } catch (error) {
            console.error("Error fetching users:", error);
            toast.error("Error leyendo matriz de usuarios");
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = async (userId: string, currentStatus: boolean) => {
        try {
            await updateDoc(doc(db, "users", userId), { isActive: !currentStatus });
            setUsers(users.map(u => u.uid === userId ? { ...u, isActive: !currentStatus } : u));
            toast.success(currentStatus ? "Usuario suspendido: Acceso Revocado" : "Usuario activado: Acceso Concedido", { icon: currentStatus ? "⛔" : "✅" });
        } catch (error) {
            console.error(error);
            toast.error("Error al cambiar estado");
        }
    };

    const toggleRole = async (userId: string, currentRole: string) => {
        const newRole = currentRole === "admin" ? "guest" : "admin";
        try {
            await updateDoc(doc(db, "users", userId), { role: newRole });
            setUsers(users.map(u => u.uid === userId ? { ...u, role: newRole } : u));
            toast.success(`Nivel de Privilegios: ${newRole.toUpperCase()}`);
        } catch (error) {
            console.error(error);
            toast.error("Error al actualizar rol");
        }
    };

    const filteredUsers = users.filter(u =>
        u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.slug?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-sci-border/50 pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        <Users className="h-8 w-8 text-sci-accent" />
                        Base de Datos General
                    </h1>
                    <p className="text-sci-metallic mt-1 text-sm">Control maestro de identidades, roles de sistema y parámetros de control de acceso.</p>
                </div>

                <div className="relative w-full md:max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-sci-metallic" />
                    <Input
                        placeholder="Buscar identificador, nombre o correo..."
                        className="pl-9 bg-black/40 border-sci-border/50 hover:border-sci-accent/30 focus:border-sci-accent h-10 w-full"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center p-12">
                    <div className="animate-pulse text-sci-accent text-sm font-mono tracking-widest uppercase flex items-center gap-3">
                        <Settings2 className="h-4 w-4 animate-spin" /> Desencriptando registros...
                    </div>
                </div>
            ) : (
                <>
                    {/* DESKTOP VIEW: Glassmorphism Table */}
                    <div className="hidden md:block">
                        <SciFiCard className="p-0 overflow-hidden bg-black/40 border-sci-border/40">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm whitespace-nowrap">
                                    <thead className="bg-sci-dark/80 border-b border-sci-border/50 text-xs font-mono text-sci-metallic uppercase tracking-widest">
                                        <tr>
                                            <th className="px-6 py-4 font-semibold">Identidad</th>
                                            <th className="px-6 py-4 font-semibold">Credenciales</th>
                                            <th className="px-6 py-4 font-semibold">Estado & Nivel</th>
                                            <th className="px-6 py-4 font-semibold text-right">Controles Root</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-sci-border/30">
                                        {filteredUsers.map((user) => (
                                            <tr key={user.uid} className="hover:bg-sci-accent/5 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 rounded-full bg-sci-dark border border-sci-border/50 flex items-center justify-center text-sci-accent font-bold text-xs shrink-0">
                                                            {user.fullName?.substring(0, 2).toUpperCase() || "XX"}
                                                        </div>
                                                        <div>
                                                            <Link href={`/${user.slug}`} target="_blank" className="font-bold text-white hover:text-sci-accent hover:underline transition-colors block">
                                                                {user.fullName || "Materia Oscura"}
                                                            </Link>
                                                            <div className="text-xs text-sci-metallic font-mono flex items-center gap-1.5 mt-0.5">
                                                                <LinkIcon className="h-3 w-3" /> /{user.slug}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4 text-sci-silver font-mono text-xs">
                                                    <div className="flex items-center gap-2">
                                                        <Mail className="h-3 w-3 text-sci-metallic" />
                                                        {user.email}
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        {user.role === 'admin' ? (
                                                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono tracking-widest bg-sci-accent/10 text-sci-accent border border-sci-accent/30 uppercase">
                                                                <ShieldCheck className="h-3 w-3" /> Admin
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono tracking-widest text-sci-metallic border border-sci-border/50 uppercase">
                                                                Guest
                                                            </span>
                                                        )}

                                                        {!user.isActive ? (
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono tracking-widest bg-red-900/10 text-red-400 border border-red-900/30 uppercase">
                                                                <ShieldAlert className="h-3 w-3" /> Suspend
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono tracking-widest text-green-400 border border-transparent uppercase">
                                                                <div className="h-1.5 w-1.5 rounded-full bg-green-500 shadow-[0_0_5px_#22c55e]"></div> Active
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>


                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => toggleRole(user.uid, user.role)}
                                                            className="px-3 py-1.5 border border-sci-border rounded hover:bg-sci-accent/10 hover:border-sci-accent/30 text-[10px] font-mono text-sci-silver hover:text-white uppercase tracking-wider transition-all"
                                                            title="Permutar Rol del Sistema"
                                                        >
                                                            {user.role === 'admin' ? 'Demote' : 'Promote'}
                                                        </button>

                                                        <button
                                                            onClick={() => toggleStatus(user.uid, user.isActive)}
                                                            className={`w-[100px] flex items-center justify-center gap-1.5 px-3 py-1.5 border rounded text-[10px] font-mono uppercase tracking-wider transition-all ${user.isActive
                                                                ? "border-sci-border text-sci-silver hover:border-red-900/50 hover:text-red-400 hover:bg-red-900/10"
                                                                : "border-green-900/30 text-green-500 bg-green-900/10 hover:bg-green-900/20 hover:border-green-500/50"
                                                                }`}
                                                        >
                                                            {user.isActive ? (
                                                                <><XCircle className="h-3 w-3" /> Revocar</>
                                                            ) : (
                                                                <><CheckCircle className="h-3 w-3" /> Admitir</>
                                                            )}
                                                        </button>

                                                        <Link
                                                            href={`/${user.slug}`}
                                                            target="_blank"
                                                            className="w-8 h-8 flex items-center justify-center border border-sci-border rounded text-sci-metallic hover:bg-sci-border hover:text-white transition-all ml-1"
                                                            title="Ver Perfil Público"
                                                        >
                                                            <LinkIcon className="h-3.5 w-3.5" />
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </SciFiCard>
                    </div>

                    {/* MOBILE VIEW: Stacked Cards */}
                    <div className="md:hidden grid gap-4">
                        {filteredUsers.map((user) => (
                            <SciFiCard key={user.uid} className="p-4 bg-black/40 border-sci-border/40 flex flex-col gap-4">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-sci-dark border border-sci-border/50 flex items-center justify-center text-sci-accent font-bold text-sm shrink-0">
                                            {user.fullName?.substring(0, 2).toUpperCase() || "XX"}
                                        </div>
                                        <div>
                                            <Link href={`/${user.slug}`} target="_blank" className="font-bold text-white text-base hover:text-sci-accent hover:underline transition-colors block">
                                                {user.fullName || "Materia Oscura"}
                                            </Link>
                                            <div className="text-xs text-sci-metallic font-mono mt-0.5">/{user.slug}</div>
                                        </div>
                                    </div>
                                    <Link
                                        href={`/${user.slug}`}
                                        target="_blank"
                                        className="h-8 w-8 flex items-center justify-center border border-sci-border rounded text-sci-metallic hover:bg-sci-border hover:text-white transition-all shrink-0"
                                    >
                                        <LinkIcon className="h-4 w-4" />
                                    </Link>
                                </div>

                                <div className="bg-sci-dark/50 border border-sci-border/30 rounded px-3 py-2 text-xs font-mono text-sci-silver break-all flex items-center gap-2">
                                    <Mail className="h-3.5 w-3.5 text-sci-accent shrink-0" />
                                    {user.email}
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {user.role === 'admin' ? (
                                        <span className="flex-1 justify-center inline-flex items-center gap-1.5 px-2 py-1.5 rounded text-[10px] font-mono tracking-widest bg-sci-accent/10 text-sci-accent border border-sci-accent/30 uppercase">
                                            <ShieldCheck className="h-3 w-3" /> Admin
                                        </span>
                                    ) : (
                                        <span className="flex-1 justify-center inline-flex items-center gap-1.5 px-2 py-1.5 rounded text-[10px] font-mono tracking-widest text-sci-metallic border border-sci-border/50 uppercase">
                                            Guest
                                        </span>
                                    )}

                                    {!user.isActive ? (
                                        <span className="flex-1 justify-center inline-flex items-center gap-1 px-2 py-1.5 rounded text-[10px] font-mono tracking-widest bg-red-900/10 text-red-400 border border-red-900/30 uppercase">
                                            <ShieldAlert className="h-3 w-3" /> Suspended
                                        </span>
                                    ) : (
                                        <span className="flex-1 justify-center inline-flex items-center gap-1.5 px-2 py-1.5 rounded text-[10px] font-mono tracking-widest text-green-400 border border-transparent uppercase">
                                            <div className="h-1.5 w-1.5 rounded-full bg-green-500 shadow-[0_0_5px_#22c55e]"></div> Active
                                        </span>
                                    )}
                                </div>


                                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-sci-border/30">
                                    <button
                                        onClick={() => toggleRole(user.uid, user.role)}
                                        className="py-2.5 border border-sci-border rounded hover:bg-sci-accent/10 hover:border-sci-accent/30 text-[10px] font-mono text-white uppercase tracking-wider transition-all"
                                    >
                                        Invertir Rol
                                    </button>

                                    <button
                                        onClick={() => toggleStatus(user.uid, user.isActive)}
                                        className={`py-2.5 flex items-center justify-center gap-1.5 border rounded text-[10px] font-mono uppercase tracking-wider transition-all font-bold ${user.isActive
                                            ? "border-red-900/50 text-red-500 hover:bg-red-900/10"
                                            : "border-green-500/50 text-green-500 hover:bg-green-900/20"
                                            }`}
                                    >
                                        {user.isActive ? (
                                            <><XCircle className="h-3.5 w-3.5" /> Revocar</>
                                        ) : (
                                            <><CheckCircle className="h-3.5 w-3.5" /> Admitir</>
                                        )}
                                    </button>
                                </div>
                            </SciFiCard>
                        ))}
                    </div>

                    {filteredUsers.length === 0 && (
                        <div className="text-center py-12 text-sci-metallic italic text-sm border border-sci-border/30 rounded-xl m-4">
                            La consulta no arrojó resultados en los registros del sistema.
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
