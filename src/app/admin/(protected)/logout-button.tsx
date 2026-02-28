"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
    return (
        <Button
            variant="outline"
            size="sm"
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="flex items-center gap-2 border-slate-300 text-slate-700 hover:text-red-600 hover:border-red-600 transition-colors bg-white shadow-sm"
        >
            <LogOut size={16} />
            Sair
        </Button>
    );
}
