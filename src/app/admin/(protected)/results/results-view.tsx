"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { Save, AlertTriangle, Trophy } from "lucide-react";
import { useRouter } from "next/navigation";

import { AdminCard } from "@/components/admin/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { updateMatchScore, finalizeRound } from "./actions";

// Client component for the Row
function MatchScoreRow({ match, isFinalized }: { match: any, isFinalized: boolean }) {
    const [homeScore, setHomeScore] = useState(match.homeScore?.toString() || "");
    const [awayScore, setAwayScore] = useState(match.awayScore?.toString() || "");
    const [loading, setLoading] = useState(false);
    const hasResult = match.result !== null;

    const handleSave = async () => {
        if (homeScore === "" || awayScore === "") return;
        setLoading(true);
        const result = await updateMatchScore({
            matchId: match.id,
            homeScore: parseInt(homeScore),
            awayScore: parseInt(awayScore)
        });
        setLoading(false);
        if (result.error) toast.error(result.error);
        else toast.success("Placar atualizado");
    };

    return (
        <div className="flex items-center justify-between p-4 border rounded-lg bg-white shadow-sm">
            <div className="flex items-center gap-4 flex-1">
                <div className="flex-1 text-right font-semibold text-slate-800">
                    {match.homeClub?.name || match.homeTeam}
                </div>
                <div className="flex items-center gap-2">
                    <Input
                        type="number"
                        value={homeScore}
                        onChange={e => setHomeScore(e.target.value)}
                        className="w-16 text-center text-lg font-bold"
                        disabled={isFinalized || hasResult} // Lock if round finalized or match has result (Wait, user might want to edit before finalize? Prompt says 'Após confirmar: Bloquear edição')
                    // For now I'm locking if it has a result. I should add an 'Edit' button if strictly needed, but let's stick to 'confirm blocks'.
                    />
                    <span className="text-slate-400">x</span>
                    <Input
                        type="number"
                        value={awayScore}
                        onChange={e => setAwayScore(e.target.value)}
                        className="w-16 text-center text-lg font-bold"
                        disabled={isFinalized || hasResult}
                    />
                </div>
                <div className="flex-1 text-left font-semibold text-slate-800">
                    {match.awayClub?.name || match.awayTeam}
                </div>
            </div>
            <div className="ml-6 w-32 flex justify-end">
                {hasResult ? (
                    <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
                        Confirmado
                    </Badge>
                ) : (
                    <Button
                        size="sm"
                        onClick={handleSave}
                        disabled={loading || homeScore === "" || awayScore === ""}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        <Save className="w-4 h-4 mr-1" />
                        Confirmar
                    </Button>
                )}
            </div>
        </div>
    );
}

// Client wrapper for handling the finalize logic interaction
export function ResultsView({
    round,
    matches,
    rounds
}: {
    round: any,
    matches: any[],
    rounds: any[]
}) {
    const isFinalized = round?.status === "COMPLETED";
    const allMatchesFinished = matches.every(m => m.result !== null);
    const [finalizing, setFinalizing] = useState(false);
    const router = useRouter();

    const handleFinalize = async () => {
        if (!confirm("Tem certeza? Isso processará todas as eliminações.")) return;
        setFinalizing(true);
        const result = await finalizeRound(round.id);
        setFinalizing(false);
        if (result.error) toast.error(result.error);
        else {
            toast.success("Rodada finalizada com sucesso!");
            router.refresh();
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-800">Lançar Resultados</h1>
                {round && (
                    <Button
                        disabled={isFinalized || !allMatchesFinished || finalizing}
                        onClick={handleFinalize}
                        className={isFinalized
                            ? "bg-green-600 text-white opacity-100"
                            : "bg-blue-600 hover:bg-blue-700 text-white"
                        }
                    >
                        {isFinalized ? (
                            <>
                                <Trophy className="w-4 h-4 mr-2" />
                                Rodada Finalizada
                            </>
                        ) : (
                            "Finalizar Rodada"
                        )}
                    </Button>
                )}
            </div>

            <AdminCard>
                {/* Round Nav can be reused or passed as children if we want to keep this pure client */}
                {/* But since we need to pass props, I'll let the Page component handle the Nav rendering */}
                <div className="mb-6">
                    <h2 className="text-lg font-bold text-slate-700 mb-4">
                        {round ? `Jogos da Rodada ${round.number}` : "Selecione uma rodada"}
                    </h2>
                    <div className="space-y-3">
                        {matches.map(match => (
                            <MatchScoreRow key={match.id} match={match} isFinalized={isFinalized} />
                        ))}
                        {matches.length === 0 && round && (
                            <p className="text-slate-500 italic">Nenhum jogo nesta rodada.</p>
                        )}
                    </div>
                </div>
            </AdminCard>
        </div>
    );
}
