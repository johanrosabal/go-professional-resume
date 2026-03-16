"use client";

import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Globe, LogOut, ShieldAlert, Key, Users, LayoutDashboard, Menu, X, Cpu } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [isAdmin, setIsAdmin] = useState(false);
    const [verifying, setVerifying] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const verifyAdmin = async () => {
            if (!loading && !user) {
                router.push("/login");
                return;
            }

            if (user) {
                try {
                    const docRef = doc(db, "users", user.uid);
                    const docSnap = await getDoc(docRef);

                    if (docSnap.exists() && docSnap.data().role === 'admin') {
                        setIsAdmin(true);
                    } else {
                        router.push("/dash");
                    }
                } catch (error) {
                    console.error("Error verifying admin:", error);
                    router.push("/dash");
                } finally {
                    setVerifying(false);
                }
            }
        };

        if (!loading) {
            verifyAdmin();
        }
    }, [user, loading, router]);

    // Close mobile menu when route changes
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    if (loading || verifying) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="h-8 w-8 rounded-full border-2 border-sci-accent border-t-transparent animate-spin" />
            </div>
        );
    }

    if (!isAdmin) return null;

    const navItems = [
        { name: "Directorio Global", href: "/admin/countries", icon: Globe },
        { name: "Catálogo de Habilidades", href: "/admin/skills", icon: Cpu },
        { name: "Gestión de Usuarios", href: "/admin/users", icon: Users },
    ];

    return (
        <div className="flex min-h-screen bg-sci-dark text-white font-sans relative overflow-x-hidden">
            {/* Background minimal effects */}
            <div className="absolute inset-0 pointer-events-none -z-10">
                <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-sci-accent/5 rounded-full blur-[150px]" />
                <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[150px]" />
            </div>

            {/* Mobile Nav Toggle */}
            <div className="md:hidden fixed top-4 right-4 z-50">
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 bg-black border border-sci-border/50 rounded-md text-white shadow-[0_0_15px_rgba(0,0,0,0.5)]"
                    aria-label="Toggle Menu"
                >
                    {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
            </div>

            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar Admin */}
            <aside className={cn(
                "fixed inset-y-0 left-0 z-50 w-64 border-r border-sci-border/50 bg-black/90 md:bg-black/40 backdrop-blur-3xl flex flex-col pt-8 shadow-2xl transition-transform duration-300 md:relative md:translate-x-0 h-[100dvh] shrink-0",
                isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="px-6 mb-8 shrink-0">
                    <h2 className="text-lg font-bold tracking-widest text-white uppercase flex items-center gap-2">
                        <LayoutDashboard className="h-5 w-5 text-sci-accent shrink-0" />
                        SYSTEM_ADMIN
                    </h2>
                    <p className="text-xs text-sci-metallic mt-1 truncate">Access: Executive Level</p>
                </div>

                <nav className="flex-1 px-4 space-y-2 overflow-y-auto pb-6">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all",
                                    isActive
                                        ? "bg-sci-accent/10 text-sci-accent border border-sci-accent/20 shadow-[inset_0_0_10px_rgba(0,240,255,0.05)]"
                                        : "text-sci-silver hover:bg-sci-border hover:text-white"
                                )}
                            >
                                <Icon className="h-4 w-4 shrink-0" />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 mt-auto border-t border-sci-border/30 shrink-0">
                    <button
                        onClick={() => router.push("/dash")}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-sci-silver hover:bg-sci-border rounded-md transition-colors mb-2"
                    >
                        <Key className="h-4 w-4 shrink-0" />
                        Volver a Dash Usuario
                    </button>
                    <button
                        onClick={() => signOut(auth)}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-sci-silver hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                    >
                        <LogOut className="h-4 w-4 shrink-0" />
                        Cerrar Sesión Global
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-8 w-full min-w-0 z-10 flex flex-col">
                <div className="w-full max-w-[1600px] mx-auto pt-14 md:pt-0 flex-1">
                    {children}
                </div>
            </main>
        </div>
    );
}
