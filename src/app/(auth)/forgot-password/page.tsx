"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Erro ao processar solicitação");
            }

            toast.success("Solicitação enviada!", {
                description: data.message,
            });

        } catch (error: any) {
            toast.error("Erro", {
                description: error.message,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="mx-auto max-w-sm w-full">
            <CardHeader>
                <CardTitle className="text-2xl text-center">Recuperar Senha</CardTitle>
                <CardDescription className="text-center">
                    Digite seu email para receber um link de redefinição.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="m@example.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <Button type="submit" className="w-full bg-yellow-600 hover:bg-yellow-700 text-white" disabled={loading}>
                            {loading ? "Enviando..." : "Enviar Link"}
                        </Button>
                    </div>
                </form>
                <div className="mt-4 text-center text-sm">
                    Lembrou a senha?{" "}
                    <Link href="/login" className="underline text-yellow-500">
                        Voltar para o login
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}
