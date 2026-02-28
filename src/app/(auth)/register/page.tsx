"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const BRAZILIAN_TEAMS = [
    "ABC", "Amazonas", "América-MG", "Anápolis", "Athletic", "Atlético-GO",
    "Atletico-MG", "Atlhético-PR", "Avaí", "Bahia", "Barra-SC", "Botafogo-PB",
    "Botafogo-RJ", "Botafogo-SP", "Brusque", "Caxias", "Ceará", "Chapecoense",
    "Confiança", "Corinthians", "Coritiba", "CRB", "Cruzeiro", "CSA",
    "Ferroviária", "Figueirense", "Fortaleza", "Flamengo", "Floresta",
    "Fluminense", "Goiás", "Guarani", "Grêmio", "Inter de Limeira",
    "Internacional", "Itabaiana", "Ituano", "Juventude", "Londrina",
    "Maranhão", "Maringá", "Mirassol", "Náutico", "Novorizontino",
    "Operário-PR", "Palmeiras", "Paysandu", "Ponte Preta",
    "Red Bull Bragantino", "Remo", "Sampaio Corrêa", "Santa Cruz", "Santos",
    "São Bernardo", "São Paulo", "Sport", "Vasco", "Vitória",
    "Volta Redonda", "Ypiranga-RS"
].sort();

function RegisterForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const groupId = searchParams.get("groupId");

    const [formData, setFormData] = useState({
        name: "",
        cpf: "",
        nickname: "",
        email: "",
        phone: "",
        team: "",
        password: ""
    });
    const [loading, setLoading] = useState(false);

    const formatCPF = (value: string) => {
        const cleanValue = value.replace(/\D/g, "").slice(0, 11);
        if (cleanValue.length <= 3) return cleanValue;
        if (cleanValue.length <= 6) return `${cleanValue.slice(0, 3)}.${cleanValue.slice(3)}`;
        if (cleanValue.length <= 9) return `${cleanValue.slice(0, 3)}.${cleanValue.slice(3, 6)}.${cleanValue.slice(6)}`;
        return `${cleanValue.slice(0, 3)}.${cleanValue.slice(3, 6)}.${cleanValue.slice(6, 9)}-${cleanValue.slice(9, 11)}`;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value;
        if (e.target.id === "cpf") {
            value = formatCPF(value);
        }
        setFormData({ ...formData, [e.target.id]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Erro ao criar conta");
            }

            toast.success("Conta criada com  sucesso!", {
                description: "Faça login para continuar.",
            });

            // Redirect flow
            if (groupId) {
                const callbackUrl = encodeURIComponent(`/dashboard/join?groupId=${groupId}&checkout=true`);
                router.push(`/login?callbackUrl=${callbackUrl}`);
            } else {
                router.push("/login");
            }

        } catch (error: any) {
            toast.error("Erro no cadastro", {
                description: error.message,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="mx-auto max-w-md w-full">
            <CardHeader>
                <CardTitle className="text-2xl text-center">Cadastro de Sobrevivente</CardTitle>
                <CardDescription className="text-center">
                    Crie sua conta para participar dos grupos.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form className="grid gap-4" onSubmit={handleSubmit}>
                    <div className="grid gap-2">
                        <Label htmlFor="name">Nome Completo</Label>
                        <Input id="name" placeholder="Seu nome real" required value={formData.name} onChange={handleChange} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="cpf">CPF</Label>
                            <Input id="cpf" placeholder="000.000.000-00" required value={formData.cpf} onChange={handleChange} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="nickname">Apelido (Ranking)</Label>
                            <Input id="nickname" placeholder="Como quer ser visto" required value={formData.nickname} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email">Email (Login)</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="seu@email.com"
                            required
                            value={formData.email} onChange={handleChange}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="phone">Celular</Label>
                            <Input id="phone" placeholder="(11) 99999-9999" required value={formData.phone} onChange={handleChange} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="team">Time do Coração</Label>
                            <Select
                                value={formData.team}
                                onValueChange={(value) => setFormData({ ...formData, team: value })}
                                required
                            >
                                <SelectTrigger id="team" className="w-full bg-white text-black border-input">
                                    <SelectValue placeholder="Selecione seu time" />
                                </SelectTrigger>
                                <SelectContent className="bg-white border-input">
                                    {BRAZILIAN_TEAMS.map((team) => (
                                        <SelectItem
                                            key={team}
                                            value={team}
                                            className="text-black focus:bg-yellow-500 focus:text-white cursor-pointer"
                                        >
                                            {team}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password">Senha</Label>
                        <PasswordInput id="password" required value={formData.password} onChange={handleChange} />
                    </div>

                    <Button type="submit" className="w-full bg-yellow-600 hover:bg-yellow-700 text-white" disabled={loading}>
                        {loading ? "Criando..." : "Criar Conta"}
                    </Button>
                </form>
                <div className="mt-4 text-center text-sm">
                    Já tem uma conta?{" "}
                    <Link href={`/login${groupId ? `?callbackUrl=${encodeURIComponent(`/dashboard/join?groupId=${groupId}&checkout=true`)}` : ''}`} className="underline text-yellow-500">
                        Fazer login
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}

export default function RegisterPage() {
    return (
        <Suspense fallback={<div>Carregando...</div>}>
            <RegisterForm />
        </Suspense>
    );
}
