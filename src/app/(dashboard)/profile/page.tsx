"use client";

import { useEffect, useState } from "react";
import { getUserProfile, updateUserProfile } from "@/lib/actions/user";
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
import { PasswordInput } from "@/components/ui/password-input";
import { toast } from "sonner";
import { User, Shield, Phone, Mail, Fingerprint, Lock, Save } from "lucide-react";

export default function ProfilePage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState({
        name: "",
        email: "",
        cpf: "",
        nickname: "",
        phone: "",
    });
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    useEffect(() => {
        async function loadProfile() {
            try {
                const data = await getUserProfile();
                if (data) {
                    setProfile({
                        name: data.name || "",
                        email: data.email || "",
                        cpf: data.cpf || "",
                        nickname: data.nickname || "",
                        phone: data.phone || "",
                    });
                }
            } catch (error) {
                toast.error("Erro ao carregar perfil");
            } finally {
                setLoading(false);
            }
        }
        loadProfile();
    }, []);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password && password !== confirmPassword) {
            toast.error("As senhas não coincidem");
            return;
        }

        setSaving(true);
        try {
            const result = await updateUserProfile({
                name: profile.name,
                nickname: profile.nickname,
                phone: profile.phone,
                password: password || undefined,
            });

            if (result.success) {
                toast.success("Perfil atualizado com sucesso!");
                setPassword("");
                setConfirmPassword("");
            }
        } catch (error: any) {
            toast.error("Erro ao atualizar perfil", {
                description: error.message,
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
            </div>
        );
    }

    return (
        <div className="container max-w-4xl py-10 px-4">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Meu Perfil</h1>
                <p className="text-muted-foreground">Gerencie suas informações pessoais e segurança da conta.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="bg-sidebar/50 border-sidebar-border backdrop-blur-sm text-white">
                    <CardHeader>
                        <CardTitle className="text-xl flex items-center gap-2">
                            <User className="w-5 h-5 text-yellow-500" />
                            Informações Pessoais
                        </CardTitle>
                        <CardDescription>Estes dados serão visíveis para outros jogadores no ranking.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleUpdate} className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Nome Completo</Label>
                                <Input
                                    id="name"
                                    value={profile.name}
                                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                    className="bg-black/20 text-white placeholder:text-white/40"
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="nickname">Apelido (Ranking)</Label>
                                <Input
                                    id="nickname"
                                    value={profile.nickname}
                                    onChange={(e) => setProfile({ ...profile, nickname: e.target.value })}
                                    className="bg-black/20 text-white placeholder:text-white/40"
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="phone">Celular</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="phone"
                                        value={profile.phone}
                                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                        className="bg-black/20 pl-10 text-white placeholder:text-white/40"
                                        placeholder="(00) 00000-0000"
                                    />
                                </div>
                            </div>
                            <Button type="submit" disabled={saving} className="bg-yellow-600 hover:bg-yellow-700 text-white mt-2">
                                {saving ? "Salvando..." : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" /> Salvar Alterações
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <div className="grid gap-6">
                    <Card className="bg-sidebar/50 border-sidebar-border backdrop-blur-sm text-white">
                        <CardHeader>
                            <CardTitle className="text-xl flex items-center gap-2">
                                <Shield className="w-5 h-5 text-yellow-500" />
                                Dados da Conta
                            </CardTitle>
                            <CardDescription>Informações de identificação (não editáveis).</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            <div className="grid gap-2 text-sm">
                                <Label className="text-white/70">Email de Login</Label>
                                <div className="flex items-center gap-2 p-3 bg-black/20 rounded-md border border-white/10">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <span>{profile.email}</span>
                                </div>
                            </div>
                            <div className="grid gap-2 text-sm">
                                <Label className="text-white/70">CPF registrados</Label>
                                <div className="flex items-center gap-2 p-3 bg-black/20 rounded-md border border-white/10">
                                    <Fingerprint className="h-4 w-4 text-muted-foreground" />
                                    <span>{profile.cpf}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-sidebar/50 border-sidebar-border backdrop-blur-sm text-white">
                        <CardHeader>
                            <CardTitle className="text-xl flex items-center gap-2">
                                <Lock className="w-5 h-5 text-yellow-500" />
                                Segurança
                            </CardTitle>
                            <CardDescription>Altere sua senha de acesso.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleUpdate} className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="password">Nova Senha</Label>
                                    <PasswordInput
                                        id="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="bg-black/20 text-white placeholder:text-white/40"
                                        placeholder="Deixe em branco para manter a atual"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                                    <PasswordInput
                                        id="confirmPassword"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="bg-black/20 text-white placeholder:text-white/40"
                                        placeholder="Repita a nova senha"
                                    />
                                </div>
                                <Button type="submit" disabled={saving || !password} className="bg-yellow-600 hover:bg-yellow-700 text-white mt-2">
                                    {saving ? "Atualizando..." : "Atualizar Senha"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
