"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function AdminLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const result = await signIn("credentials", {
                redirect: false,
                email,
                password,
            });

            if (result?.error) {
                toast.error("Acesso Negado", {
                    description: "Credenciais inválidas ou sem permissão.",
                });
            } else {
                // We double check role on server side, but client side redirect here
                // Note: The credentials provider doesn't easy return the user role in the result object immediately
                // We rely on session check in the dashboard layout to kick them out if not admin
                toast.success("Bem-vindo, Administrador!", {
                    description: "Redirecionando para o painel..."
                });
                router.push("/admin");
                router.refresh();
            }
        } catch (error) {
            toast.error("Erro inesperado");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
            <Card className="mx-auto max-w-sm w-full bg-gray-800 border-gray-700 text-white">
                <CardHeader>
                    <CardTitle className="text-2xl text-center text-red-500">Admin Panel</CardTitle>
                    <CardDescription className="text-center text-gray-400">
                        Área restrita. Acesso monitorado.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email Administrativo</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="admin@kingofsurvivors.com"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="password">Senha Forte</Label>
                                <PasswordInput
                                    id="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="bg-gray-700 border-gray-600 text-white"
                                />
                            </div>
                            <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white" disabled={loading}>
                                {loading ? "Verificando..." : "Acessar Sistema"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
