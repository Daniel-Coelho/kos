"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Trophy,
    LogOut,
    Shield,
    User
} from "lucide-react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    const sidebarItems = [
        { name: "Meus Jogos", href: "/dashboard", icon: Trophy },
        { name: "Perfil", href: "/profile", icon: User },
    ];

    return (
        <div className="flex h-screen bg-pitch text-foreground overflow-hidden">
            {/* Sidebar */}
            <aside className="hidden md:flex flex-col w-64 border-r border-sidebar-border bg-sidebar">
                <div className="p-6 border-b border-sidebar-border flex items-center gap-2">
                    <Shield className="w-6 h-6 text-sidebar-primary" />
                    <span className="text-xl font-bold tracking-tight text-sidebar-foreground">King Of Survivors</span>
                </div>

                <ScrollArea className="flex-1 py-4">
                    <nav className="space-y-1 px-2">
                        {sidebarItems.map((item) => (
                            <Button
                                key={item.href}
                                variant={pathname === item.href ? "secondary" : "ghost"}
                                className={`w-full justify-start transition-all duration-200 ${pathname === item.href
                                        ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                                        : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                                    }`}
                                asChild
                            >
                                <Link href={item.href}>
                                    <item.icon className={`mr-2 h-4 w-4 ${pathname === item.href ? "text-sidebar-primary" : ""}`} />
                                    {item.name}
                                </Link>
                            </Button>
                        ))}
                    </nav>
                </ScrollArea>

                <div className="p-4 border-t border-sidebar-border bg-black/10">
                    <Button variant="outline" className="w-full text-red-400 hover:text-red-500 hover:bg-red-500/10 border-red-500/20 backdrop-blur-sm" asChild>
                        <Link href="/">
                            <LogOut className="mr-2 h-4 w-4" /> Sair
                        </Link>
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto bg-background/30 backdrop-blur-[2px] relative">
                <div className="absolute inset-0 bg-gradient-to-br from-green-950/10 to-transparent pointer-events-none -z-10" />
                {children}
            </main>
        </div>
    );
}

