import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import AdminLogoutButton from "./logout-button";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export default async function AdminLayout({ children }: { children: ReactNode }) {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "ADMIN") {
        redirect("/admin/login");
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <header className="bg-white shadow p-4 border-b border-gray-200">
                <div className="container mx-auto flex justify-between items-center">
                    <h1 className="text-xl font-bold text-red-600">Área Administrativa</h1>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-500">Logado como: {session.user?.email}</span>
                        <AdminLogoutButton />
                    </div>
                </div>
            </header>
            <main className="p-8 container mx-auto">
                {children}
            </main>
        </div>
    );
}
