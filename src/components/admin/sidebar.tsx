"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Shield,
    Gamepad2,
    Trophy,
    Users,
    UserCog,
    FileText,
    LogOut,
    Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";

const sidebarItems = [
    {
        title: "Dashboard",
        href: "/admin/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Gerenciar Clubes",
        href: "/admin/clubs",
        icon: Shield,
    },
    {
        title: "Gerenciar Jogos",
        href: "/admin/games",
        icon: Gamepad2,
    },
    {
        title: "Lançar Resultados",
        href: "/admin/results",
        icon: Trophy,
    },
    {
        title: "Gestão de Grupos",
        href: "/admin/groups",
        icon: Users,
    },
    {
        title: "Gestão de Usuários",
        href: "/admin/users",
        icon: UserCog,
    },
    {
        title: "Logs e Auditoria",
        href: "/admin/logs",
        icon: FileText,
    },
    {
        title: "Configurações",
        href: "/admin/settings",
        icon: Settings,
    },
];

export function AdminSidebar() {
    const pathname = usePathname();

    return (
        <div className="flex h-screen w-64 flex-col fixed left-0 top-0 border-r bg-white text-slate-800 shadow-md z-50">
            <div className="flex h-16 items-center border-b px-6">
                <h1 className="text-xl font-bold text-red-600">Área Administrativa</h1>
            </div>
            <div className="flex-1 overflow-y-auto py-4">
                <nav className="space-y-1 px-4">
                    {sidebarItems.map((item) => {
                        const isActive = pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-slate-100 text-slate-900"
                                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                )}
                            >
                                <item.icon className={cn("h-5 w-5", isActive ? "text-slate-900" : "text-slate-500")} />
                                {item.title}
                            </Link>
                        );
                    })}
                </nav>
            </div>
            <div className="border-t p-4">
                <button
                    onClick={() => signOut({ callbackUrl: "/admin/login" })}
                    className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                    <LogOut className="h-5 w-5" />
                    Sair
                </button>
            </div>
        </div>
    );
}
