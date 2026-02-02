"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminLogoutButton() {
    return (
        <Button
            variant="outline"
            size="sm"
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="flex items-center gap-2"
        >
            <LogOut size={16} />
            Sair
        </Button>
    );
}
