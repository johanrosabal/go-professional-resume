import React from 'react';
import { Mail, Phone, MapPin, Linkedin, Github, Globe, Calendar, Flag, Users } from 'lucide-react';

export const ResumePrintLayout = ({ profileData, lang, labels }: { profileData: any, lang: string, labels: any }) => {
    const text = labels[lang] || labels.en;

    const loc = (baseObj: any, field: string) => {
        if (!baseObj) return "";
        if (lang === 'en' && baseObj.translations?.en?.[field]) {
            return baseObj.translations.en[field];
        }
        return baseObj[field] || "";
    };

    const experiences = profileData.experiences || [];
    const education = profileData.education || [];
    const references = (profileData.references || []).filter((ref: any) => ref.isActive !== false);
    const skills = (profileData.skills || [])
        .filter((s: any) => s.isActive !== false)
        .map((s: any) => ({
            ...s,
            name: loc(s, 'name'),
            category: loc(s, 'category'),
        }));

    const groupedSkills = skills.reduce((acc: any, skill: any) => {
        const cat = skill.category || "General";
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(skill);
        return acc;
    }, {});

    return (
        <div className="hidden print:block w-full max-w-4xl mx-auto bg-white text-black font-sans text-sm px-10 py-8 leading-relaxed relative">

            {/* Repeating Footer for Print */}
            <div className="fixed bottom-0 left-0 right-0 text-center text-[10px] text-gray-400 pb-4 print:block hidden border-t border-gray-100 pt-2 bg-white">
                {profileData.fullName} • {loc(profileData, 'professionalTitle')} • {text.execSummary.replace('_', ' ')}
            </div>

            {/* Header */}
            {/* Header */}
            <header className="border-b-2 border-gray-800 pb-4 mb-6 flex items-end justify-between">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">{profileData.fullName}</h1>
                    <h2 className="text-xl text-gray-700 tracking-wide font-medium">
                        {loc(profileData, 'professionalTitle') || "Profesional"}
                    </h2>
                </div>

                <div className="text-right space-y-1 text-xs text-gray-600">
                    {profileData.email && (
                        <div className="flex items-center justify-end gap-2">
                            <span>{profileData.email}</span>
                            <Mail className="w-3.5 h-3.5 text-gray-400" />
                        </div>
                    )}
                    {profileData.phone && (
                        <div className="flex items-center justify-end gap-2">
                            <span>{profileData.phone}</span>
                            <Phone className="w-3.5 h-3.5 text-gray-400" />
                        </div>
                    )}
                    {profileData.location && (
                        <div className="flex items-center justify-end gap-2">
                            <span>{profileData.location}</span>
                            <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        </div>
                    )}
                </div>
            </header>

            {/* Main 2-Column Grid limit to Details + Bio */}
            <div className="grid grid-cols-[240px_1fr] gap-8 items-start mb-8">

                {/* Left Sidebar */}
                <aside className="space-y-8">
                    {/* Personal Details */}
                    <section>
                        <h3 className="text-sm font-bold tracking-widest uppercase text-gray-500 border-b border-gray-200 pb-2 mb-4">
                            {lang === 'es' ? 'Detalles' : 'Details'}
                        </h3>
                        <div className="space-y-3 text-gray-800 text-xs">
                            {profileData.countryOfOrigin && (
                                <div className="flex items-center gap-2">
                                    <Flag className="w-4 h-4 text-gray-500" />
                                    <span>{profileData.countryOfOrigin}</span>
                                </div>
                            )}
                            {profileData.birthdate && !profileData.hideBirthdate && (
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-gray-500" />
                                    <span>{profileData.birthdate}</span>
                                </div>
                            )}
                            {profileData.linkedinUrl && (
                                <div className="flex items-center gap-2">
                                    <Linkedin className="w-4 h-4 text-gray-500" />
                                    <span className="truncate max-w-[180px]">{profileData.linkedinUrl.replace(/^https?:\/\/(www\.)?/, '')}</span>
                                </div>
                            )}
                            {profileData.githubUrl && (
                                <div className="flex items-center gap-2">
                                    <Github className="w-4 h-4 text-gray-500" />
                                    <span className="truncate max-w-[180px]">{profileData.githubUrl.replace(/^https?:\/\/(www\.)?/, '')}</span>
                                </div>
                            )}
                        </div>
                    </section>
                </aside>

                {/* Right Content */}
                <div className="space-y-10">
                    {/* Bio */}
                    {loc(profileData, 'bio') && (
                        <section>
                            <h3 className="text-sm font-bold tracking-widest uppercase text-gray-500 border-b border-gray-200 pb-2 mb-4">
                                {text.execSummary.replace('_', ' ')}
                            </h3>
                            <div
                                className="text-gray-700 text-sm leading-relaxed [&_p]:mb-3"
                                dangerouslySetInnerHTML={{ __html: loc(profileData, 'bio') }}
                            />
                        </section>
                    )}
                </div>
            </div>

            {/* FULL WIDTH SECTIONS */}
            <div className="space-y-10">

                {/* Skills Section - Now Full Width */}
                {skills.length > 0 && (
                    <section className="break-inside-avoid">
                        <h3 className="text-sm font-bold tracking-widest uppercase text-gray-500 border-b border-gray-200 pb-2 mb-6">
                            {lang === 'es' ? 'Habilidades' : 'Skills'}
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-8">
                            {Object.entries(groupedSkills).map(([category, catSkills]: [string, any]) => (
                                <div key={category} className="break-inside-avoid">
                                    <div className="text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-wider">{category}</div>
                                    <div className="flex flex-wrap gap-x-2 gap-y-1.5">
                                        {catSkills.map((s: any, i: number) => (
                                            <span key={i} className="text-xs font-medium text-gray-800 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                                                {s.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Experience */}
                <section className="pt-4 mt-4">
                    <h3 className="text-sm font-bold tracking-widest uppercase text-gray-500 border-b border-gray-200 pb-2 mb-4">
                        {text.history.replace('_', ' ')}
                    </h3>
                    <div className="space-y-8">
                        {experiences.length > 0 ? experiences.map((exp: any, i: number) => (
                            <div key={i} className="mb-6 break-inside-avoid">
                                <div className="flex justify-between items-baseline mb-1">
                                    <h4 className="text-base font-bold text-gray-900">{loc(exp, 'role')}</h4>
                                    <span className="text-xs font-mono text-gray-500">
                                        {exp.startDate} — {exp.endDate || text.present}
                                    </span>
                                </div>
                                <div className="text-sm font-semibold text-gray-700 mb-2">{exp.company}</div>
                                {loc(exp, 'description') && (
                                    <div
                                        className="text-gray-600 text-sm leading-relaxed [&_ul]:list-disc [&_ul]:ml-5 [&_p]:mb-2"
                                        dangerouslySetInnerHTML={{ __html: loc(exp, 'description') }}
                                    />
                                )}
                            </div>
                        )) : (
                            <p className="text-gray-500 italic">{text.noExp}</p>
                        )}
                    </div>
                </section>

                {/* Education */}
                {education.length > 0 && (
                    <section className="break-inside-avoid">
                        <h3 className="text-sm font-bold tracking-widest uppercase text-gray-500 border-b border-gray-200 pb-2 mb-4">
                            {text.edu.replace('_', ' ')}
                        </h3>
                        <div className="space-y-6">
                            {education.map((edu: any, i: number) => (
                                <div key={i} className="mb-4">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h4 className="text-sm font-bold text-gray-900">{loc(edu, 'degree')}</h4>
                                        <span className="text-xs font-mono text-gray-500">
                                            {edu.startDate} — {edu.endDate || text.present}
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-700">{loc(edu, 'institution')}</div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* References */}
                {references.length > 0 && (
                    <section className="break-inside-avoid">
                        <h3 className="text-sm font-bold tracking-widest uppercase text-gray-500 border-b border-gray-200 pb-2 mb-4">
                            {text.ref.replace('_', ' ')}
                        </h3>
                        <div className="grid grid-cols-2 gap-6">
                            {references.map((ref: any, index: number) => (
                                <div key={index} className="break-inside-avoid">
                                    <h4 className="text-sm font-bold text-gray-900 mb-1">{ref.name}</h4>
                                    <div className="text-sm font-semibold text-gray-700 mb-1">
                                        {loc(ref, 'role') || ref.role} - <span className="font-normal">{ref.company}</span>
                                    </div>
                                    <div className="text-xs text-gray-600 space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-3 w-3 text-gray-400" /> {ref.contactInfo}
                                        </div>
                                        {ref.relationship && (
                                            <div className="flex items-center gap-2">
                                                <Users className="h-3 w-3 text-gray-400" /> {loc(ref, 'relationship') || ref.relationship}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

            </div>
        </div>
    );
};
