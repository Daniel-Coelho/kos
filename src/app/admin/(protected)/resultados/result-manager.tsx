"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Round, Match, Club } from "@prisma/client";
import { updateScore, confirmResult } from "@/lib/actions/result";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { CheckCircle, Save, AlertTriangle } from "lucide-react";

type MatchWithClubs = Match & { homeClub: Club | null, awayClub: Club | null };

export default function ResultManager({
    rounds,
    games,
    currentRoundId
}: {
    rounds: Round[],
    games: MatchWithClubs[],
    currentRoundId: string
}) {
    const router = useRouter();
    const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});

    function handleRoundChange(roundId: string) {
        router.push(`/admin/resultados?roundId=${roundId}`);
    }

    async function handleSaveScore(gameId: string, formData: FormData) {
        setLoadingMap(prev => ({ ...prev, [gameId]: true }));
        try {
            const home = parseInt(formData.get("homeScore") as string);
            const away = parseInt(formData.get("awayScore") as string);

            if (isNaN(home) || isNaN(away)) throw new Error("Placar inválido");

            await updateScore(gameId, home, away);
            toast.success("Placar salvo!");
        } catch (error: any) {
            toast.error(error.message || "Erro ao salvar placar");
        } finally {
            setLoadingMap(prev => ({ ...prev, [gameId]: false }));
        }
    }

    async function handleConfirm(gameId: string) {
        if (!confirm("Confirmar resultado final? Isso irá processar as eliminações e não pode ser desfeito facilmente.")) return;

        setLoadingMap(prev => ({ ...prev, [gameId]: true }));
        try {
            await confirmResult(gameId);
            toast.success("Resultado confirmado e processado!");
        } catch (error: any) {
            toast.error(error.message || "Erro ao confirmar");
        } finally {
            setLoadingMap(prev => ({ ...prev, [gameId]: false }));
        }
    }

    const currentRound = rounds.find(r => r.id === currentRoundId);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold">Lançamento de Resultados</h2>
                <p className="text-gray-500">Informe os placares e confirme para processar o jogo.</p>
            </div>

            {/* Round Selector */}
            <div className="flex overflow-x-auto pb-4 gap-2">
                {rounds.map((round) => (
                    <button
                        key={round.id}
                        onClick={() => handleRoundChange(round.id)}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${currentRoundId === round.id
                                ? "bg-blue-600 text-white"
                                : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                            }`}
                    >
                        Rodada {round.number}
                    </button>
                ))}
            </div>

            {currentRoundId ? (
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-bold mb-6 border-b pb-2">Jogos da Rodada {currentRound?.number}</h3>

                    <div className="space-y-6">
                        {games.length === 0 ? (
                            <p className="text-center text-gray-500 py-8">Nenhum jogo nesta rodada.</p>
                        ) : (
                            games.map((game) => (
                                <div key={game.id} className={`flex flex-col md:flex-row items-center justify-between p-4 rounded-lg border ${game.result ? 'bg-gray-50 border-gray-200' : 'bg-white border-blue-100'}`}>
                                    {/* Teams and Score Input */}
                                    <div className="flex-1 flex items-center justify-center gap-4 w-full md:w-auto mb-4 md:mb-0">
                                        <div className="flex items-center gap-2 w-1/3 justify-end text-right">
                                            <span className="font-bold text-gray-900 md:text-lg">{game.homeTeam}</span>
                                            {game.homeClub?.logoUrl && <img src={game.homeClub.logoUrl} className="w-8 h-8 object-contain" alt="" />}
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {game.result ? (
                                                <div className="flex items-center gap-2 px-4 py-2 bg-gray-200 rounded text-xl font-bold font-mono">
                                                    <span>{game.homeScore}</span>
                                                    <span>x</span>
                                                    <span>{game.awayScore}</span>
                                                </div>
                                            ) : (
                                                <form action={(fd) => handleSaveScore(game.id, fd)} className="flex items-center gap-2">
                                                    <Input
                                                        type="number"
                                                        name="homeScore"
                                                        defaultValue={game.homeScore ?? ""}
                                                        className="w-16 text-center text-lg font-bold"
                                                        min={0}
                                                    />
                                                    <span className="text-gray-400 font-bold">X</span>
                                                    <Input
                                                        type="number"
                                                        name="awayScore"
                                                        defaultValue={game.awayScore ?? ""}
                                                        className="w-16 text-center text-lg font-bold"
                                                        min={0}
                                                    />
                                                    <Button type="submit" size="icon" variant="ghost" title="Salvar Placar Provisório">
                                                        <Save className="w-4 h-4 text-blue-600" />
                                                    </Button>
                                                </form>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2 w-1/3 justify-start text-left">
                                            {game.awayClub?.logoUrl && <img src={game.awayClub.logoUrl} className="w-8 h-8 object-contain" alt="" />}
                                            <span className="font-bold text-gray-900 md:text-lg">{game.awayTeam}</span>
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    <div className="ml-4 flex-shrink-0">
                                        {game.result ? (
                                            <div className="flex items-center text-green-600 gap-2 px-3 py-1 bg-green-50 rounded-full text-sm font-medium">
                                                <CheckCircle className="w-4 h-4" />
                                                Confirmado
                                            </div>
                                        ) : (
                                            <Button
                                                onClick={() => handleConfirm(game.id)}
                                                disabled={loadingMap[game.id] || game.homeScore === null || game.awayScore === null}
                                                className="bg-green-600 hover:bg-green-700 text-white"
                                            >
                                                {loadingMap[game.id] ? "Processando..." : "Confirmar Final"}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            ) : (
                <p className="text-center text-gray-500 py-12">Selecione uma rodada.</p>
            )}
        </div>
    );
}
