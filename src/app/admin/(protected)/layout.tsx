import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import { LogoutButton } from "./logout-button";

export default async function AdminProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/admin/login");
    }

    // @ts-ignore
    if (session.user?.role !== "ADMIN") {
        redirect("/");
    }

    return (
        <div className="flex min-h-screen flex-col bg-slate-50 light">
            <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-white px-8 shadow-sm">
                <h1 className="text-xl font-bold text-[#cc0000]">Área Administrativa</h1>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-slate-500">
                        Logado como: <span className="font-medium text-slate-900">{session.user?.email}</span>
                    </span>
                    <LogoutButton />
                </div>
            </header>
            <main className="p-8 mx-auto w-full max-w-7xl">
                {children}
            </main>
        </div>
    );
}
