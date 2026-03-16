import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { notFound } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { ProfileRenderer } from "@/components/profile/ProfileRenderer";

export const revalidate = 0; // Force server components to fetch fresh Firestore data

// Server Component for the public profile route
export default async function PublicProfilePage(props: {
    params: Promise<{ slug: string }>;
}) {
    const params = await props.params;
    const { slug } = params;

    // Fetch from Firestore on the server
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("slug", "==", slug));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        notFound();
    }

    const docSnapshot = querySnapshot.docs[0];
    const profileData = docSnapshot.data();

    // Check if the administrator blocked the user
    if (profileData.isActive === false) {
        return (
            <div className="min-h-screen relative overflow-hidden bg-sci-dark text-white font-sans flex items-center justify-center">
                <div className="absolute inset-0 pointer-events-none -z-10">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-900/10 rounded-full blur-[150px]" />
                </div>
                <div className="text-center space-y-4 max-w-md border border-red-500/30 bg-red-500/5 p-12 rounded-2xl backdrop-blur-md">
                    <ShieldAlert className="h-16 w-16 text-red-500 mx-auto" />
                    <h1 className="text-3xl font-bold font-mono text-red-500 uppercase tracking-widest">Acceso Denegado</h1>
                    <p className="text-sci-silver font-light">
                        El identificador de usuario <span className="text-white font-mono">{slug}</span> se encuentra suspendido o ha sido revocado del sistema por el Administrador Global.
                    </p>
                </div>
            </div>
        );
    }

    return <ProfileRenderer profileData={profileData} />;
}
