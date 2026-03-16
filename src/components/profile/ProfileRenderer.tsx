"use client";

import { useRef, useEffect, useState } from "react";
import { SciFiCard } from "@/components/ui/SciFiCard";
import { AnimatedBackground } from "@/components/ui/AnimatedBackground";
import { ResumePrintLayout } from "@/components/profile/ResumePrintLayout";
import { Github, Linkedin, Mail, MapPin, Terminal, Phone, MessageCircle, Calendar, Flag, BookOpen, Users, Globe, ChevronDown, Download } from "lucide-react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

function EducationCard({ edu, text }: { edu: any, text: any }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <SciFiCard glowOnHover className="flex flex-col border border-sci-border/50 bg-sci-dark/30 relative">
            <div
                className={`cursor-pointer group select-none ${edu.description ? 'hover:bg-sci-card/30 rounded p-1 -m-1 transition-colors' : ''}`}
                onClick={() => edu.description && setIsOpen(!isOpen)}
            >
                <div className="flex justify-between items-start mb-2 pr-8">
                    <h4 className={`font-bold text-lg transition-colors ${edu.description ? 'group-hover:text-sci-accent text-white' : 'text-white'}`}>{edu.degree}</h4>
                    <time className="text-xs font-mono text-sci-metallic bg-sci-dark px-2 py-1 rounded border border-sci-border/50 shrink-0">
                        {edu.startDate} — {edu.endDate || text.present}
                    </time>
                </div>
                <div className="text-sci-accent text-sm font-medium">{edu.institution}</div>

                {edu.description && (
                    <div className="absolute top-5 right-5">
                        <ChevronDown className={`w-5 h-5 text-sci-metallic transition-transform duration-300 ${isOpen ? 'rotate-180 text-sci-accent' : 'group-hover:text-sci-silver'}`} />
                    </div>
                )}
            </div>

            {edu.description && (
                <div className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0'}`}>
                    <div className="overflow-hidden">
                        <div
                            className="text-sci-silver text-sm leading-relaxed border-t border-sci-border/30 pt-4 pb-1 [&_ul]:list-disc [&_ul]:ml-4 [&_ol]:list-decimal [&_ol]:ml-4"
                            dangerouslySetInnerHTML={{ __html: edu.description }}
                        />
                    </div>
                </div>
            )}
        </SciFiCard>
    );
}

export function ProfileRenderer({ profileData }: { profileData: any }) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const langFromUrl = searchParams.get('lang') as 'es' | 'en' | null;
    const lang = langFromUrl === 'en' ? 'en' : 'es'; // Default to 'es'

    const toggleLang = () => {
        const nextLang = lang === 'es' ? 'en' : 'es';
        router.replace(`${pathname}?lang=${nextLang}`, { scroll: false });
    };

    // Helper syntax for getting the translated string
    const loc = (baseObj: any, field: string) => {
        if (!baseObj) return "";
        if (lang === 'en' && baseObj.translations?.en?.[field]) {
            return baseObj.translations.en[field];
        }
        return baseObj[field] || "";
    };

    const experiences = profileData.experiences?.map((exp: any) => ({
        ...exp,
        role: loc(exp, 'role'),
        company: loc(exp, 'company'),
        description: loc(exp, 'description'),
    })) || [];

    const education = profileData.education?.map((edu: any) => ({
        ...edu,
        degree: loc(edu, 'degree'),
        institution: loc(edu, 'institution'),
        description: loc(edu, 'description'),
    })) || [];

    const references = (profileData.references || [])
        .filter((ref: any) => ref.isActive !== false)
        .map((ref: any) => ({
            ...ref,
            role: loc(ref, 'role'),
            relationship: loc(ref, 'relationship'),
        }));

    const labels = {
        es: {
            status: "Sys_Status: Activo",
            execSummary: "Bio_Presentación",
            history: "Experiencia_Laboral",
            present: "Actual",
            noExp: "No hay registros de experiencia detectados en el sistema.",
            edu: "Formación_Académica",
            ref: "Nodos_Referencia",
            in: "en"
        },
        en: {
            status: "Sys_Status: Active",
            execSummary: "Bio_Presentation",
            history: "Work_Experience",
            present: "Present",
            noExp: "No experience records detected in the system.",
            edu: "Academic_Training",
            ref: "Reference_Nodes",
            in: "at"
        }
    };

    const text = labels[lang];

    return (
        <div className="min-h-screen print:min-h-0 relative overflow-x-hidden print:overflow-visible bg-sci-dark print:bg-white text-white print:text-gray-900 font-sans">
            <AnimatedBackground />

            {/* Top Right Controls */}
            <div className="fixed top-4 right-4 z-50 flex items-center gap-3 print:hidden">
                <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 bg-black/60 backdrop-blur-md border border-sci-border/50 hover:border-sci-accent/50 text-sci-silver hover:text-white px-3 py-1.5 rounded-full text-xs font-mono font-bold tracking-widest transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)] group"
                    title={lang === 'es' ? 'Guardar como PDF / Imprimir' : 'Save as PDF / Print'}
                >
                    <Download className="w-3.5 h-3.5 text-sci-accent group-hover:-translate-y-0.5 transition-transform" />
                    <span className="hidden sm:inline">PDF</span>
                </button>

                <button
                    onClick={toggleLang}
                    className="flex items-center gap-2 bg-black/60 backdrop-blur-md border border-sci-border/50 hover:border-sci-accent/50 text-sci-silver hover:text-white px-3 py-1.5 rounded-full text-xs font-mono font-bold tracking-widest transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)]"
                >
                    <Globe className="w-3.5 h-3.5 text-sci-accent" />
                    <span className={lang === 'es' ? 'text-sci-accent' : ''}>ES</span>
                    <span className="text-sci-border">|</span>
                    <span className={lang === 'en' ? 'text-sci-accent' : ''}>EN</span>
                </button>
            </div>

            {/* Exclusive Layout explicitly built for PDF Export / Printing */}
            <ResumePrintLayout profileData={profileData} lang={lang} labels={labels} />

            {/* Complex Web Layout (Hidden strictly on Print) */}
            <main className="max-w-5xl mx-auto px-6 py-12 md:py-20 z-10 animate-in fade-in duration-500 print:hidden">

                {/* Header Section */}
                <header className="mb-20 print:mb-10">
                    <div className="flex flex-wrap justify-center gap-4 mb-12 animate-in slide-in-from-top-4 duration-700">
                        {profileData.countryOfOrigin && (
                            <div className="group flex items-center gap-3 px-4 py-2 rounded-full border border-sci-border/50 bg-sci-dark/50 hover:bg-sci-accent/10 hover:border-sci-accent/50 transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                                <Flag className="h-4 w-4 text-sci-metallic group-hover:text-sci-accent transition-colors" />
                                <span className="text-sm font-mono text-sci-silver group-hover:text-white transition-colors">{profileData.countryOfOrigin}</span>
                            </div>
                        )}
                        {profileData.location && (
                            <div className="group flex items-center gap-3 px-4 py-2 rounded-full border border-sci-border/50 bg-sci-dark/50 hover:bg-sci-accent/10 hover:border-sci-accent/50 transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                                <MapPin className="h-4 w-4 text-sci-metallic group-hover:text-sci-accent transition-colors" />
                                <span className="text-sm font-mono text-sci-silver group-hover:text-white transition-colors">{profileData.location}</span>
                            </div>
                        )}
                        {profileData.phone && !profileData.hidePhone && (
                            <a href={`tel:${profileData.phone}`} className="group flex items-center gap-3 px-4 py-2 rounded-full border border-sci-border/50 bg-sci-dark/50 hover:bg-sci-accent/10 hover:border-sci-accent/50 transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                                <Phone className="h-4 w-4 text-sci-metallic group-hover:text-sci-accent transition-colors" />
                                <span className="text-sm font-mono text-sci-silver group-hover:text-white transition-colors">{profileData.phone}</span>
                            </a>
                        )}
                        {profileData.whatsapp && !profileData.hideWhatsapp && (
                            <a href={`https://wa.me/${profileData.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="group flex items-center gap-3 px-4 py-2 rounded-full border border-sci-border/50 bg-sci-dark/50 hover:bg-green-400/10 hover:border-green-400/50 transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                                <MessageCircle className="h-4 w-4 text-sci-metallic group-hover:text-green-400 transition-colors" />
                                <span className="text-sm font-mono text-sci-silver group-hover:text-white transition-colors">{profileData.whatsapp}</span>
                            </a>
                        )}
                        {profileData.birthdate && !profileData.hideBirthdate && (
                            <div className="group flex items-center gap-3 px-4 py-2 rounded-full border border-sci-border/50 bg-sci-dark/50 hover:bg-sci-accent/10 hover:border-sci-accent/50 transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                                <Calendar className="h-4 w-4 text-sci-metallic group-hover:text-sci-accent transition-colors" />
                                <span className="text-sm font-mono text-sci-silver group-hover:text-white transition-colors">{profileData.birthdate}</span>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col md:flex-row print:flex-row gap-8 items-start md:items-center print:items-center">
                        <div className="h-40 w-40 md:h-48 md:w-48 print:h-32 print:w-32 shrink-0 relative flex items-center justify-center group">
                            {/* Animated Sci-Fi Rings Layer */}
                            <div className="absolute inset-0 rounded-full border border-sci-accent/30 bg-sci-accent/5 animate-[spin_10s_linear_infinite] print:hidden" />
                            <div className="absolute inset-2 rounded-full border border-dashed border-sci-accent/50 animate-[spin_15s_linear_infinite_reverse] print:hidden" />
                            <div className="absolute inset-[-10px] rounded-full border border-sci-accent/10 scale-95 opacity-0 group-hover:scale-110 group-hover:opacity-100 transition-all duration-700 print:hidden" />

                            {/* Inner Picture Container */}
                            <div className="absolute inset-4 rounded-full overflow-hidden border-2 border-sci-border bg-sci-dark flex items-center justify-center shadow-[0_0_30px_rgba(0,240,255,0.15)] z-10 transition-transform duration-500 group-hover:scale-105 group-hover:border-sci-accent/50">
                                {profileData.photoURL && !profileData.hidePhoto ? (
                                    <img src={profileData.photoURL} alt={profileData.fullName} className="h-full w-full object-cover" />
                                ) : (
                                    <span className="text-4xl font-mono text-sci-silver uppercase">
                                        {profileData.fullName?.substring(0, 2)}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4 flex-1 text-center md:text-left flex flex-col items-center md:items-start">
                            <h1 className="text-5xl font-bold tracking-tight text-white print:text-black">
                                {profileData.fullName}
                            </h1>

                            <h2 className="text-xl text-sci-metallic font-light border-l-0 md:border-l-2 border-sci-accent md:pl-4 transition-all" key={`title-${lang}`}>
                                {loc(profileData, 'professionalTitle') || "Profesional en Tecnología"}
                            </h2>

                            {profileData.specialBadge && (
                                <div className="mt-2 inline-flex border border-sci-accent/50 bg-sci-accent/10 px-3 py-1 text-xs font-mono tracking-widest text-sci-accent uppercase rounded">
                                    {profileData.specialBadge}
                                </div>
                            )}

                            <div className="flex flex-wrap justify-center md:justify-start gap-3 pt-3">
                                {profileData.email && (
                                    <a href={`mailto:${profileData.email}`} className="group flex items-center gap-2 px-4 py-1.5 rounded-full border border-sci-border/50 bg-sci-dark/50 hover:bg-sci-accent/10 hover:border-sci-accent/50 transition-all shadow-[0_0_10px_rgba(0,0,0,0.5)]">
                                        <Mail className="h-3.5 w-3.5 text-sci-metallic group-hover:text-sci-accent transition-colors" />
                                        <span className="text-xs font-mono text-sci-silver group-hover:text-white transition-colors">{profileData.email}</span>
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Full-width Bio Section */}
                {loc(profileData, 'bio') && (
                    <section className="w-full mb-16 animate-in fade-in duration-700 delay-150 print:block">
                        <h3 className="flex items-center gap-2 text-lg font-mono text-sci-accent mb-6 uppercase tracking-widest border-b border-sci-border/30 pb-3">
                            <Terminal className="h-5 w-5" />
                            {text.execSummary}
                        </h3>
                        <div
                            key={`bio-${lang}`}
                            className="text-base text-sci-silver leading-relaxed font-light [&_ul]:list-disc [&_ul]:ml-6 [&_ol]:list-decimal [&_ol]:ml-6 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-white [&_h3]:mt-6 [&_h3]:mb-3 [&_p]:mb-4"
                            dangerouslySetInnerHTML={{ __html: loc(profileData, 'bio') }}
                        />

                        {/* Social Links below Bio */}
                        {(profileData.githubUrl || profileData.linkedinUrl) && (
                            <div className="flex flex-wrap gap-4 mt-8 pt-6 border-t border-sci-border/10 print:hidden">
                                {profileData.linkedinUrl && !profileData.hideLinkedin && (
                                    <a href={profileData.linkedinUrl} target="_blank" rel="noreferrer" className="group flex items-center gap-3 px-6 py-2.5 rounded-xl border border-sci-border/50 bg-sci-dark/80 hover:bg-sci-accent/10 hover:border-sci-accent/50 transition-all shadow-[0_0_15px_rgba(0,240,255,0.05)] hover:shadow-[0_0_20px_rgba(0,240,255,0.15)]">
                                        <Linkedin className="h-5 w-5 text-sci-metallic group-hover:text-sci-accent transition-colors" />
                                        <span className="text-sm font-mono tracking-widest text-sci-silver group-hover:text-white transition-colors uppercase">LinkedIn</span>
                                    </a>
                                )}
                                {profileData.githubUrl && !profileData.hideGithub && (
                                    <a href={profileData.githubUrl} target="_blank" rel="noreferrer" className="group flex items-center gap-3 px-6 py-2.5 rounded-xl border border-sci-border/50 bg-sci-dark/80 hover:bg-sci-accent/10 hover:border-sci-accent/50 transition-all shadow-[0_0_15px_rgba(0,240,255,0.05)] hover:shadow-[0_0_20px_rgba(0,240,255,0.15)]">
                                        <Github className="h-5 w-5 text-sci-metallic group-hover:text-sci-accent transition-colors" />
                                        <span className="text-sm font-mono tracking-widest text-sci-silver group-hover:text-white transition-colors uppercase">GitHub</span>
                                    </a>
                                )}
                            </div>
                        )}
                    </section>
                )}

                {/* Experience Timeline */}
                <section>
                    <h3 className="flex items-center gap-2 text-lg font-mono text-sci-accent mb-8 uppercase tracking-widest">
                        <Terminal className="h-5 w-5" />
                        {text.history}
                    </h3>

                    <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-sci-border before:to-transparent print:before:hidden">
                        {experiences.length > 0 ? (
                            experiences.map((exp: any, index: number) => (
                                <div key={index} className="relative flex items-start gap-6 group is-active">
                                    <div className="flex items-center justify-center w-10 h-10 rounded-full border border-sci-border bg-sci-dark text-sci-accent shrink-0 shadow-[0_0_0_4px_rgba(5,11,20,1)] z-10 transition-colors group-hover:border-sci-accent group-hover:bg-sci-accent/10">
                                        <div className="w-2 h-2 rounded-full bg-sci-accent" />
                                    </div>

                                    <div className="flex-1 p-5 rounded-xl border border-sci-border bg-sci-card/50 backdrop-blur-sm transition-all group-hover:border-sci-accent/30 group-hover:bg-sci-card hover:shadow-[0_0_30px_rgba(0,240,255,0.05)]">
                                        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-2">
                                            <h4 className="font-bold text-white text-lg">{exp.role}</h4>
                                            <time className="text-xs font-mono text-sci-metallic bg-sci-dark px-2 py-1 rounded border border-sci-border/50">
                                                {exp.startDate} — {exp.endDate || text.present}
                                            </time>
                                        </div>
                                        <div className="text-sci-accent text-sm mb-4 font-medium">{exp.company}</div>
                                        {exp.description && (
                                            <div
                                                className="text-sci-silver text-sm leading-relaxed [&_ul]:list-disc [&_ul]:ml-6 [&_ol]:list-decimal [&_ol]:ml-6 [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-white [&_h3]:mt-4 [&_h3]:mb-2 [&_p]:mb-2"
                                                dangerouslySetInnerHTML={{ __html: exp.description }}
                                            />
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sci-metallic pl-12 md:pl-0 md:text-center italic">{text.noExp}</p>
                        )}
                    </div>
                </section>

                {/* Education Timeline */}
                {education.length > 0 && (
                    <section className="mt-20">
                        <h3 className="flex items-center gap-2 text-lg font-mono text-sci-accent mb-8 uppercase tracking-widest">
                            <BookOpen className="h-5 w-5" />
                            {text.edu}
                        </h3>

                        <div className="flex flex-col gap-4">
                            {education.map((edu: any, index: number) => (
                                <EducationCard key={index} edu={edu} text={text} />
                            ))}
                        </div>
                    </section>
                )}

                {/* References */}
                {references.length > 0 && (
                    <section className="mt-20">
                        <h3 className="flex items-center gap-2 text-lg font-mono text-sci-accent mb-8 uppercase tracking-widest">
                            <Users className="h-5 w-5" />
                            {text.ref}
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {references.map((ref: any, index: number) => (
                                <SciFiCard key={index} glowOnHover className="flex flex-col relative overflow-hidden border border-sci-border/50 bg-sci-dark/30">
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-sci-accent/5 rounded-bl-[100px] pointer-events-none" />
                                    <h4 className="font-bold text-white text-lg mb-1">{ref.name}</h4>
                                    <div className="text-sci-accent text-sm font-medium mb-3">
                                        {ref.role} <span className="text-sci-metallic font-light">{text.in}</span> {ref.company}
                                    </div>
                                    <div className="mt-auto pt-4 border-t border-sci-border/30 text-sm text-sci-silver space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-3 w-3 text-sci-metallic" /> {ref.contactInfo}
                                        </div>
                                        {ref.relationship && (
                                            <div className="flex items-center gap-2">
                                                <Users className="h-3 w-3 text-sci-metallic" /> {ref.relationship}
                                            </div>
                                        )}
                                    </div>
                                </SciFiCard>
                            ))}
                        </div>
                    </section>
                )}
            </main>
        </div >
    );
}
