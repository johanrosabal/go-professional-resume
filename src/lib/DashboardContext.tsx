"use client";
import { createContext, useContext, useState, ReactNode } from "react";

export type LanguageMode = "es" | "en";

interface DashboardContextType {
    editingLanguage: LanguageMode;
    setEditingLanguage: (lang: LanguageMode) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
    const [editingLanguage, setEditingLanguage] = useState<LanguageMode>("es");

    return (
        <DashboardContext.Provider value={{ editingLanguage, setEditingLanguage }}>
            {children}
        </DashboardContext.Provider>
    );
}

export function useDashboard() {
    const context = useContext(DashboardContext);
    if (!context) {
        throw new Error("useDashboard must be used within a DashboardProvider");
    }
    return context;
}
