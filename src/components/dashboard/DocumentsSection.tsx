"use client";

import { useState } from "react";
import { useDashboard } from "@/lib/DashboardContext";
import { SciFiCard } from "@/components/ui/SciFiCard";
import { GlowingButton } from "@/components/ui/GlowingButton";
import { storage, db } from "@/lib/firebase";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { 
    FileText, 
    CreditCard, 
    GraduationCap, 
    Upload, 
    Trash2, 
    ExternalLink, 
    Loader2,
    CheckCircle2,
    ShieldAlert,
    Plus
} from "lucide-react";
import { toast } from "react-hot-toast";

interface DocumentMetadata {
    url: string;
    name: string;
    uploadedAt: string;
}

interface DocumentsSectionProps {
    uid: string;
    initialDocuments?: {
        hojaDelincuencia?: DocumentMetadata;
        cedulaIdentidad?: DocumentMetadata;
        titulosCertificaciones?: DocumentMetadata[];
    };
}

export function DocumentsSection({ uid, initialDocuments }: DocumentsSectionProps) {
    const { editingLanguage } = useDashboard();
    const [documents, setDocuments] = useState(initialDocuments || {});
    const [uploading, setUploading] = useState<Record<string, number>>({});

    const text = {
        es: {
            title: "Documentos Adjuntos",
            desc: "Gestiona tus documentos oficiales para validación técnica y profesional.",
            delincuencia: "Hoja de Delincuencia",
            cedula: "Cédula de Identidad / ID",
            titulos: "Títulos o Certificaciones",
            upload: "Subir Archivo",
            change: "Cambiar",
            delete: "Eliminar",
            view: "Ver Documento",
            empty: "Sin archivo adjunto",
            adding: "Añadiendo título...",
            success: "Documento actualizado correctamente",
            deleted: "Documento eliminado",
            error: "Error al gestionar el documento",
            maxSize: "El archivo no debe superar los 10MB",
            invalidType: "Tipo de archivo no permitido. Usa PDF, JPG o PNG.",
            addMore: "Agregar otro título"
        },
        en: {
            title: "Attached Documents",
            desc: "Manage your official documents for technical and professional validation.",
            delincuencia: "Criminal Record",
            cedula: "ID Card / Passport",
            titulos: "Degrees or Certifications",
            upload: "Upload File",
            change: "Change",
            delete: "Delete",
            view: "View Document",
            empty: "No file attached",
            adding: "Adding certificate...",
            success: "Document updated successfully",
            deleted: "Document deleted",
            error: "Error managing the document",
            maxSize: "File size must not exceed 10MB",
            invalidType: "File type not allowed. Use PDF, JPG or PNG.",
            addMore: "Add another certificate"
        }
    }[editingLanguage];

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: string, isArray: boolean = false) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validation
        if (file.size > 10 * 1024 * 1024) {
            toast.error(text.maxSize);
            return;
        }

        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
        if (!allowedTypes.includes(file.type)) {
            toast.error(text.invalidType);
            return;
        }

        const docId = isArray ? `${type}_${Date.now()}` : type;
        setUploading(prev => ({ ...prev, [docId]: 0 }));

        try {
            const fileName = `${type}_${Date.now()}_${file.name}`;
            const storageRef = ref(storage, `users/${uid}/documents/${fileName}`);
            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on('state_changed', 
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    setUploading(prev => ({ ...prev, [docId]: progress }));
                },
                (error) => {
                    console.error("Upload error:", error);
                    toast.error(text.error);
                    setUploading(prev => {
                        const next = { ...prev };
                        delete next[docId];
                        return next;
                    });
                },
                async () => {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    const docData: DocumentMetadata = {
                        url: downloadURL,
                        name: file.name,
                        uploadedAt: new Date().toISOString()
                    };

                    const userRef = doc(db, "users", uid);
                    
                    if (isArray) {
                        await updateDoc(userRef, {
                            "documents.titulosCertificaciones": arrayUnion(docData)
                        });
                        setDocuments(prev => ({
                            ...prev,
                            titulosCertificaciones: [...(prev.titulosCertificaciones || []), docData]
                        }));
                    } else {
                        await updateDoc(userRef, {
                            [`documents.${type}`]: docData
                        });
                        setDocuments(prev => ({
                            ...prev,
                            [type]: docData
                        }));
                    }

                    toast.success(text.success);
                    setUploading(prev => {
                        const next = { ...prev };
                        delete next[docId];
                        return next;
                    });
                }
            );
        } catch (error) {
            console.error("Error in upload handler:", error);
            toast.error(text.error);
        }
    };

    const handleDelete = async (type: string, docData: DocumentMetadata, isArray: boolean = false) => {
        if (!confirm(editingLanguage === 'es' ? "¿Estás seguro de eliminar este documento?" : "Are you sure you want to delete this document?")) return;

        try {
            // Delete from Storage
            const fileRef = ref(storage, docData.url);
            await deleteObject(fileRef).catch(err => {
                console.warn("Could not delete from storage (maybe already gone?):", err);
            });

            // Delete from Firestore
            const userRef = doc(db, "users", uid);
            if (isArray) {
                await updateDoc(userRef, {
                    "documents.titulosCertificaciones": arrayRemove(docData)
                });
                setDocuments(prev => ({
                    ...prev,
                    titulosCertificaciones: prev.titulosCertificaciones?.filter(d => d.url !== docData.url)
                }));
            } else {
                // To remove a field completely or set to null
                await updateDoc(userRef, {
                    [`documents.${type}`]: null
                });
                setDocuments(prev => ({
                    ...prev,
                    [type]: undefined
                }));
            }

            toast.success(text.deleted);
        } catch (error) {
            console.error("Delete error:", error);
            toast.error(text.error);
        }
    };

    const DocumentRow = ({ 
        label, 
        icon: Icon, 
        type, 
        docData 
    }: { 
        label: string, 
        icon: any, 
        type: string, 
        docData?: DocumentMetadata 
    }) => {
        const isUploading = uploading[type] !== undefined;

        return (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-sci-dark/40 border border-sci-border/50 rounded-lg gap-4 group hover:border-sci-accent/30 transition-all">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-sci-dark border border-sci-border flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                        <Icon className="h-6 w-6 text-sci-silver group-hover:text-sci-accent transition-colors" />
                    </div>
                    <div>
                        <h4 className="text-white font-medium text-sm sm:text-base">{label}</h4>
                        {docData ? (
                            <div className="flex items-center gap-2 mt-0.5">
                                <CheckCircle2 className="h-3.5 w-3.5 text-sci-accent" />
                                <span className="text-xs text-sci-metallic truncate max-w-[150px] sm:max-w-[250px]">
                                    {docData.name}
                                </span>
                            </div>
                        ) : (
                            <p className="text-xs text-red-500/70 uppercase tracking-widest mt-0.5">{text.empty}</p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {isUploading ? (
                        <div className="flex flex-col items-end gap-1">
                            <div className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 text-sci-accent animate-spin" />
                                <span className="text-xs font-mono text-sci-accent">{Math.round(uploading[type])}%</span>
                            </div>
                            <div className="w-24 h-1 bg-sci-border rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-sci-accent transition-all duration-300" 
                                    style={{ width: `${uploading[type]}%` }}
                                />
                            </div>
                        </div>
                    ) : (
                        <>
                            {docData && (
                                <>
                                    <a 
                                        href={docData.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="p-2 text-sci-silver hover:text-white hover:bg-white/10 rounded transition-all"
                                        title={text.view}
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                    </a>
                                    <button 
                                        onClick={() => handleDelete(type, docData)}
                                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded transition-all"
                                        title={text.delete}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </>
                            )}
                            
                            <label className="cursor-pointer">
                                <input 
                                    type="file" 
                                    className="hidden" 
                                    accept=".pdf,image/*" 
                                    onChange={(e) => handleUpload(e, type)} 
                                />
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-sci-dark border border-sci-border rounded text-xs font-mono text-sci-silver hover:border-sci-accent hover:text-white transition-all uppercase tracking-wider">
                                    <Upload className="h-3.5 w-3.5" />
                                    {docData ? text.change : text.upload}
                                </div>
                            </label>
                        </>
                    )}
                </div>
            </div>
        );
    };

    return (
        <SciFiCard className="mt-8">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <FileText className="h-5 w-5 text-sci-accent" />
                    {text.title}
                </h2>
                <p className="text-sci-metallic text-sm mt-1">{text.desc}</p>
            </div>

            <div className="space-y-4">
                <DocumentRow 
                    label={text.delincuencia} 
                    icon={ShieldAlert} 
                    type="hojaDelincuencia" 
                    docData={documents.hojaDelincuencia} 
                />
                
                <DocumentRow 
                    label={text.cedula} 
                    icon={CreditCard} 
                    type="cedulaIdentidad" 
                    docData={documents.cedulaIdentidad} 
                />

                {/* Titulos SECTION */}
                <div className="pt-4 border-t border-sci-border/30 mt-6">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sci-silver font-medium text-sm flex items-center gap-2 uppercase tracking-widest">
                            <GraduationCap className="h-4 w-4 text-sci-accent" />
                            {text.titulos}
                        </h4>
                        
                        <label className="cursor-pointer">
                            <input 
                                type="file" 
                                className="hidden" 
                                accept=".pdf,image/*" 
                                onChange={(e) => handleUpload(e, "titulosCertificaciones", true)} 
                            />
                            <div className="flex items-center gap-2 px-3 py-1 bg-sci-accent/10 border border-sci-accent/30 rounded text-[10px] font-bold text-sci-accent hover:bg-sci-accent hover:text-black transition-all uppercase tracking-widest">
                                <Plus className="h-3 w-3" />
                                {text.addMore}
                            </div>
                        </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {documents.titulosCertificaciones?.map((cert, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-sci-dark/20 border border-sci-border/30 rounded-md group hover:border-sci-accent/20 transition-all">
                                <div className="flex items-center gap-3 min-w-0">
                                    <FileText className="h-4 w-4 text-sci-metallic shrink-0" />
                                    <span className="text-xs text-sci-silver truncate" title={cert.name}>
                                        {cert.name}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <a 
                                        href={cert.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="p-1.5 text-sci-metallic hover:text-white transition-colors"
                                    >
                                        <ExternalLink className="h-3.5 w-3.5" />
                                    </a>
                                    <button 
                                        onClick={() => handleDelete("titulosCertificaciones", cert, true)}
                                        className="p-1.5 text-sci-metallic hover:text-red-400 transition-colors"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </div>
                        ))}

                        {(!documents.titulosCertificaciones || documents.titulosCertificaciones.length === 0) && (
                            <div className="md:col-span-2 py-8 border border-dashed border-sci-border/30 rounded-lg flex flex-col items-center justify-center bg-sci-dark/10">
                                <GraduationCap className="h-8 w-8 text-sci-border mb-2" />
                                <p className="text-xs text-sci-metallic uppercase tracking-tighter">{text.empty}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </SciFiCard>
    );
}

