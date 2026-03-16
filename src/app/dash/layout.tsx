"use client";

import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { User, LogOut, FileText, Settings, Key, BookOpen, Users, ShieldAlert, Menu, X, Terminal, Sparkles, ExternalLink } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { DashboardProvider, useDashboard } from "@/lib/DashboardContext";
import { AITranslationModal } from "@/components/ui/AITranslationModal";

function TopBar({ userSlug }: { userSlug: string | null }) {
    const { editingLanguage, setEditingLanguage } = useDashboard();
    const [isAIModalOpen, setIsAIModalOpen] = useState(false);

    return (
        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3 mb-6 bg-black/40 border border-sci-border/50 rounded-lg p-3 shadow-lg z-10 relative">
            {userSlug && (
                <Link
                    href={`/${userSlug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold font-mono rounded bg-sci-dark/80 border border-sci-border text-sci-silver hover:border-sci-accent hover:text-white transition-all sm:mr-auto"
                >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>{editingLanguage === 'es' ? 'Ver Perfil Público' : 'View Public Profile'}</span>
                </Link>
            )}
            <div className="flex items-center gap-3">
                <button
                    onClick={() => setIsAIModalOpen(true)}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold font-mono rounded bg-sci-dark/80 border border-sci-accent/30 text-sci-accent hover:bg-sci-accent hover:text-black transition-all group shadow-[0_0_10px_rgba(0,240,255,0.1)] hover:shadow-[0_0_15px_rgba(0,240,255,0.3)]"
                    title={editingLanguage === 'es' ? "Asistente IA" : "AI Assistant"}
                >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline-block">AI Bridge</span>
                </button>

                <span className="text-xs font-mono text-sci-metallic uppercase tracking-widest hidden sm:inline-block border-l border-sci-border/50 pl-3">
                    {editingLanguage === 'es' ? 'Lenguaje de Edición:' : 'Editing Language:'}
                </span>
                <div className="flex bg-sci-dark/80 rounded-md border border-sci-border/50 p-1">
                    <button
                        onClick={() => setEditingLanguage('es')}
                        className={cn(
                            "px-3 py-1 text-xs font-bold font-mono rounded transition-all",
                            editingLanguage === 'es' ? "bg-sci-accent text-black" : "text-sci-silver hover:text-white"
                        )}
                    >
                        🇪🇸 ES
                    </button>
                    <button
                        onClick={() => setEditingLanguage('en')}
                        className={cn(
                            "px-3 py-1 text-xs font-bold font-mono rounded transition-all",
                            editingLanguage === 'en' ? "bg-sci-accent text-black" : "text-sci-silver hover:text-white"
                        )}
                    >
                        🇺🇸 EN
                    </button>
                </div>
            </div>

            <AITranslationModal
                isOpen={isAIModalOpen}
                onClose={() => setIsAIModalOpen(false)}
            />
        </div>
    );
}

function DashboardContent({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const { editingLanguage } = useDashboard();

    const [isAdmin, setIsAdmin] = useState(false);
    const [userSlug, setUserSlug] = useState<string | null>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const checkRoleAndAuth = async () => {
            if (!loading) {
                if (!user) {
                    router.push("/login");
                } else {
                    try {
                        const docRef = doc(db, "users", user.uid);
                        const docSnap = await getDoc(docRef);
                        if (docSnap.exists()) {
                            const data = docSnap.data();
                            if (data.role === "admin") {
                                setIsAdmin(true);
                            }
                            if (data.slug) {
                                setUserSlug(data.slug);
                            }
                        }
                    } catch (e) {
                        console.error("Error fetching user role", e);
                    }
                }
            }
        };
        checkRoleAndAuth();
    }, [user, loading, router]);

    // Close mobile menu when route changes
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    if (loading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-sci-dark">
                <div className="h-8 w-8 rounded-full border-2 border-sci-accent border-t-transparent animate-spin" />
            </div>
        );
    }

    const handleSignOut = async () => {
        await signOut(auth);
        router.push("/");
    };

    const navItems = [
        {
            name: editingLanguage === 'es' ? "Perfil Principal" : "Main Profile",
            href: "/dash",
            icon: User
        },
        {
            name: editingLanguage === 'es' ? "Experiencia Laboral" : "Work Experience",
            href: "/dash/experience",
            icon: FileText
        },
        {
            name: editingLanguage === 'es' ? "Formación Académica" : "Academic Training",
            href: "/dash/education",
            icon: BookOpen
        },
        {
            name: editingLanguage === 'es' ? "Referencias" : "References",
            href: "/dash/references",
            icon: Users
        },
        {
            name: editingLanguage === 'es' ? "Habilidades / Skills" : "Skills & Tech",
            href: "/dash/skills",
            icon: Terminal
        }
    ];

    const labels = {
        es: {
            adminOverride: "Panel Global (Admin)",
            logout: "Cerrar Sesión",
            sysAdmin: "Sys_Admin"
        },
        en: {
            adminOverride: "Global Panel (Admin)",
            logout: "Sign Out",
            sysAdmin: "Sys_Admin"
        }
    };

    const text = labels[editingLanguage];

    return (
        <div className="flex min-h-screen relative overflow-x-hidden bg-sci-dark">

            {/* Mobile Nav Toggle */}
            <div className="md:hidden fixed top-4 right-4 z-50">
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 bg-sci-dark border border-sci-border rounded-md text-white shadow-lg"
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

            {/* Sidebar */}
            <aside className={cn(
                "fixed inset-y-0 left-0 z-50 w-64 border-r border-sci-border bg-sci-dark/95 backdrop-blur-xl flex flex-col pt-8 transition-transform duration-300 md:relative md:translate-x-0 h-[100dvh] shrink-0",
                isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="px-6 mb-8 shrink-0">
                    <h2 className="text-lg font-bold text-white tracking-widest uppercase flex items-center gap-2">
                        <Terminal className="h-4 w-4 text-sci-accent" />
                        {text.sysAdmin}
                    </h2>
                    <p className="text-xs text-sci-metallic mt-1 truncate">{user.email}</p>
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
                                    "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-sci-accent/10 text-sci-accent border border-sci-accent/20"
                                        : "text-sci-silver hover:bg-sci-border hover:text-white"
                                )}
                            >
                                <Icon className="h-4 w-4 shrink-0" />
                                {item.name}
                            </Link>
                        );
                    })}

                    {isAdmin && (
                        <div className="pt-4 mt-4 border-t border-sci-border/50">
                            <Link
                                href="/admin/users"
                                className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors text-red-400 hover:bg-red-500/10 border border-red-500/30"
                            >
                                <ShieldAlert className="h-4 w-4 shrink-0" />
                                {text.adminOverride}
                            </Link>
                        </div>
                    )}
                </nav>

                <div className="p-4 mt-auto border-t border-sci-border shrink-0">
                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-red-400/10 rounded-md transition-colors"
                    >
                        <LogOut className="h-4 w-4 shrink-0" />
                        {text.logout}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-8 w-full min-w-0">
                <div className="max-w-4xl mx-auto pt-14 md:pt-0">
                    <TopBar userSlug={userSlug} />
                    {children}
                </div>
            </main>
        </div>
    );
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <DashboardProvider>
            <DashboardContent>
                {children}
            </DashboardContent>
        </DashboardProvider>
    );
}
