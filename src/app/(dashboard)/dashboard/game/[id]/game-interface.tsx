"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { makePick } from "@/lib/actions/game";
import { useRouter } from "next/navigation";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Club {
    id: string;
    name: string;
    logoUrl: string | null;
}

interface Match {
    id: string;
    homeTeam: string;
    awayTeam: string;
    stadium: string | null;
    startTime: Date;
    homeClub?: Club | null; // Optional because legacy data might not have it
    awayClub?: Club | null;
}

interface Pick {
    roundId: string;
    team: string;
    status: string;
}

interface GameInterfaceProps {
    participationId: string;
    roundNumber: number;
    roundId: string;
    deadline: string; // Formatted
    matches: Match[];
    pickHistory: Pick[];
    currentPick?: string; // If user already picked for this round
    disabled?: boolean;
}

export function GameInterface({
    participationId,
    roundNumber,
    roundId,
    deadline,
    matches,
    pickHistory,
    currentPick,
    disabled = false
}: GameInterfaceProps) {
    const [selectedTeam, setSelectedTeam] = useState<string>(currentPick || "");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const teams = Array.from(new Set(matches.flatMap(m => [m.homeTeam, m.awayTeam]))).sort();

    // Check if a team was picked in *previous* rounds (not the current one if we are updating)
    const isTeamPickedBefore = (team: string) => {
        return pickHistory.some(p => p.team === team && p.roundId !== roundId);
    }

    const handleConfirm = async () => {
        if (!selectedTeam) return;

        setLoading(true);
        try {
            await makePick(participationId, roundId, selectedTeam);
            toast.success(`Palpite confirmado: ${selectedTeam}`);
            router.refresh(); // Refresh server data
        } catch (error: any) {
            toast.error(error.message || "Erro ao salvar palpite.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="border-green-500/20 bg-gradient-to-br from-background/60 to-green-900/10 backdrop-blur-md">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                    <AlertCircle className="text-yellow-500" /> Rodada {roundNumber} - Escolha seu Time
                </CardTitle>
                <CardDescription className="text-white/70">
                    Prazo encerra em: <span className="font-bold text-white">{deadline}</span>
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {matches.map((match) => (
                            <div key={match.id} className="flex flex-col p-3 border rounded-lg bg-background/50 relative overflow-hidden group hover:border-green-500/30 transition-colors">
                                <div className="text-center text-xs text-white/40 mb-3 border-b border-white/5 pb-2">
                                    <p className="font-medium flex items-center justify-center gap-1">
                                        📅 {format(new Date(match.startTime), "EEEE, HH:mm", { locale: ptBR })}
                                        {match.stadium && <span className="mx-1">•</span>}
                                        {match.stadium && <span>🏟️ {match.stadium}</span>}
                                    </p>
                                </div>
                                <div className="flex items-center justify-center w-full gap-4 relative">
                                    {/* Home Team */}
                                    <div className="flex flex-col items-center justify-center flex-1 min-w-0 gap-2">
                                        <div className="w-12 h-12 relative flex items-center justify-center bg-white/5 rounded-full p-2">
                                            {match.homeClub?.logoUrl ? (
                                                <img src={match.homeClub.logoUrl} alt={match.homeTeam} className="w-full h-full object-contain" />
                                            ) : (
                                                <div className="w-full h-full rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-400">
                                                    {match.homeTeam.substring(0, 2).toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <span className="font-semibold text-white text-sm text-center line-clamp-1 w-full" title={match.homeTeam}>
                                            {match.homeTeam}
                                        </span>
                                    </div>

                                    {/* Vertical aligned 'X' */}
                                    <div className="flex items-center justify-center h-full pt-1">
                                        <span className="text-sm font-bold text-white/30 px-2">X</span>
                                    </div>

                                    {/* Away Team */}
                                    <div className="flex flex-col items-center justify-center flex-1 min-w-0 gap-2">
                                        <div className="w-12 h-12 relative flex items-center justify-center bg-white/5 rounded-full p-2">
                                            {match.awayClub?.logoUrl ? (
                                                <img src={match.awayClub.logoUrl} alt={match.awayTeam} className="w-full h-full object-contain" />
                                            ) : (
                                                <div className="w-full h-full rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-400">
                                                    {match.awayTeam.substring(0, 2).toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <span className="font-semibold text-white text-sm text-center line-clamp-1 w-full" title={match.awayTeam}>
                                            {match.awayTeam}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="pt-4 border-t border-white/10">
                        <label className="text-sm font-medium mb-2 block text-white">Seu palpite para sobreviver:</label>
                        <Select onValueChange={setSelectedTeam} value={selectedTeam} disabled={loading || disabled}>
                            <SelectTrigger className="w-full text-lg h-12 text-white bg-white/5 border-white/20">
                                <SelectValue placeholder="Selecione um time..." />
                            </SelectTrigger>
                            <SelectContent>
                                {teams.map(team => {
                                    const disabled = isTeamPickedBefore(team);
                                    return (
                                        <SelectItem key={team} value={team} disabled={disabled}>
                                            {team} {disabled && "(Já escolhido)"}
                                        </SelectItem>
                                    )
                                })}
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground mt-2 text-white/60">
                            * Você não pode repetir times que já escolheu anteriormente.
                        </p>
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <Button
                    size="lg"
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold shadow-[0_4px_10px_rgba(34,197,94,0.3)]"
                    onClick={handleConfirm}
                    disabled={!selectedTeam || loading || disabled}
                >
                    {loading ? "Confirmando..." : "CONFIRMAR PALPITE"}
                </Button>
            </CardFooter>
        </Card>
    );
}
