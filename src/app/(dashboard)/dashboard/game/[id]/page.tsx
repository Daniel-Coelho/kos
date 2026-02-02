"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, Calendar, CheckCircle, Skull, Trophy, Users, Shield } from "lucide-react";
import { toast } from "sonner";

export default function GamePage({ params }: { params: { id: string } }) {
    const [selectedTeam, setSelectedTeam] = useState<string>("");

    // Mock Data
    const gameInfo = {
        name: "Jogo Ouro",
        round: 12,
        deadline: "Sábado, 16:00",
        aliveCount: 142,
        totalPrize: "R$ 7.100,00",
        status: "ALIVE",
        repescagemAvailable: true,
    };

    const matches = [
        { id: "m1", home: "Flamengo", away: "Vasco", stadium: "Maracanã" },
        { id: "m2", home: "Palmeiras", away: "Corinthians", stadium: "Allianz Parque" },
        { id: "m3", home: "São Paulo", away: "Santos", stadium: "Morumbi" },
        { id: "m4", home: "Grêmio", away: "Inter", stadium: "Arena do Grêmio" },
    ];

    const pickHistory = [
        { round: 1, team: "Botafogo", result: "WIN" },
        { round: 2, team: "Bahia", result: "WIN" },
        { round: 3, team: "Fortaleza", result: "WIN" },
        { round: 4, team: "Cruzeiro", result: "WIN" },
        { round: 5, team: "Atlético-MG", result: "WIN" },
        { round: 6, team: "Vasco", result: "ERROR" }, // Used Repescagem logic mentally here
        { round: 7, team: "Flamengo", result: "WIN" },
    ];

    const handlePick = () => {
        if (!selectedTeam) return;
        toast.success(`Palpite confirmado: ${selectedTeam}`);
        // Logic to save would go here
    };

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
            {/* Header Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-background/40 backdrop-blur-md border-white/5">
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Sobreviventes</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-2xl font-bold flex items-center gap-2">
                            <Users className="text-green-400" /> {gameInfo.aliveCount}
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-background/40 backdrop-blur-md border-white/5">
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Prêmio Atual</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-2xl font-bold flex items-center gap-2">
                            <Trophy className="text-yellow-500" /> {gameInfo.totalPrize}
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-background/40 backdrop-blur-md border-white/5">
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-2xl font-bold flex items-center gap-2">
                            {gameInfo.status === "ALIVE" ? <CheckCircle className="text-green-500" /> : <Skull className="text-red-500" />}
                            {gameInfo.status === "ALIVE" ? "VIVO" : "ELIMINADO"}
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-background/40 backdrop-blur-md border-white/5">
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Repescagem</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-2xl font-bold flex items-center gap-2">
                            {gameInfo.repescagemAvailable ? <Badge variant="outline" className="text-green-500 border-green-500">Disponível</Badge> : <Badge variant="destructive">Usada</Badge>}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Picking Section */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-green-500/20 bg-gradient-to-br from-background/60 to-green-900/10 backdrop-blur-md">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertCircle className="text-yellow-500" /> Rodada {gameInfo.round} - Escolha seu Time
                            </CardTitle>
                            <CardDescription>
                                Prazo encerra em: <span className="font-bold text-foreground">{gameInfo.deadline}</span>
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {matches.map((match) => (
                                        <div key={match.id} className="flex flex-col p-3 border rounded-lg bg-background/50">
                                            <div className="flex items-center justify-between w-full">
                                                <span className="font-semibold">{match.home}</span>
                                                <span className="text-xs text-muted-foreground">x</span>
                                                <span className="font-semibold">{match.away}</span>
                                            </div>
                                            {match.stadium && (
                                                <div className="text-center text-xs text-muted-foreground mt-2 border-t pt-1 border-border/50">
                                                    🏟️ {match.stadium}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-4 border-t border-border/50">
                                    <label className="text-sm font-medium mb-2 block">Seu palpite para sobreviver:</label>
                                    <Select onValueChange={setSelectedTeam}>
                                        <SelectTrigger className="w-full text-lg h-12">
                                            <SelectValue placeholder="Selecione um time..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {matches.flatMap(m => [m.home, m.away]).map(team => (
                                                <SelectItem key={team} value={team} disabled={pickHistory.some(p => p.team === team)}>
                                                    {team} {pickHistory.some(p => p.team === team) && "(Já escolhido)"}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-muted-foreground mt-2">
                                        * Você não pode repetir times que já escolheu anteriormente.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button size="lg" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold shadow-[0_4px_10px_rgba(34,197,94,0.3)]" onClick={handlePick} disabled={!selectedTeam}>
                                CONFIRMAR PALPITE
                            </Button>
                        </CardFooter>
                    </Card>
                </div>

                {/* History Section */}
                <div>
                    <Card className="bg-background/40 backdrop-blur-md border-white/5">
                        <CardHeader>
                            <CardTitle>Histórico</CardTitle>
                            <CardDescription>Sua jornada até aqui</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4 relative pl-4 border-l-2 border-border ml-2">
                                {pickHistory.map((pick) => (
                                    <div key={pick.round} className="relative mb-6 last:mb-0">
                                        <div className={`absolute -left-[21px] top-1 w-4 h-4 rounded-full border-2 ${pick.result === 'WIN' ? 'bg-green-500 border-green-500' : 'bg-red-500 border-red-500'}`} />
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-sm font-bold">Rodada {pick.round}</span>
                                            <Badge variant={pick.result === 'WIN' ? "default" : "destructive"} className="text-xs">
                                                {pick.result === 'WIN' ? "VIVO" : "ERRO"}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-2 p-2 rounded bg-muted/50 text-sm">
                                            <Shield size={14} /> {pick.team}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div >
    );
}
