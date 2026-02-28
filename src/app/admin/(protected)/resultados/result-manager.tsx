"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Round, Match, Club } from "@prisma/client";
import { updateScore, confirmResult, completeRound } from "@/lib/actions/result";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { CheckCircle, Save, AlertTriangle, Flag } from "lucide-react";

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
            router.refresh();
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
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || "Erro ao confirmar");
        } finally {
            setLoadingMap(prev => ({ ...prev, [gameId]: false }));
        }
    }

    async function handleCompleteRound() {
        if (!currentRound) return;
        if (!confirm(`Finalizar a Rodada ${currentRound.number}? Isso impedirá novos ajustes e fará o sistema avançar para a próxima rodada no painel dos jogadores.`)) return;

        setLoadingMap(prev => ({ ...prev, ["complete"]: true }));
        try {
            await completeRound(currentRound.id);
            toast.success("Rodada finalizada com sucesso!");
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || "Erro ao finalizar rodada");
        } finally {
            setLoadingMap(prev => ({ ...prev, ["complete"]: false }));
        }
    }

    const currentRound = rounds.find(r => r.id === currentRoundId);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-3xl font-extrabold text-slate-900 mb-1">Lançamento de Resultados</h2>
                    <p className="text-slate-400 text-sm">Informe os placares e confirme para processar o jogo.</p>
                </div>
                {currentRound && currentRound.status !== "COMPLETED" && (
                    <Button
                        onClick={handleCompleteRound}
                        disabled={loadingMap["complete"]}
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8 flex items-center gap-2 h-12 transition-all shadow-md font-bold"
                    >
                        <Flag className="w-4 h-4" />
                        {loadingMap["complete"] ? "Finalizando..." : `Finalizar Rodada ${currentRound.number}`}
                    </Button>
                )}
            </div>

            {/* Round Selector - Now below the Title */}
            <div className="flex overflow-x-auto pb-2 gap-3 scrollbar-none">
                {rounds.map((round) => (
                    <button
                        key={round.id}
                        onClick={() => handleRoundChange(round.id)}
                        className={`px-6 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${currentRoundId === round.id
                            ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                            : "bg-gray-100 text-slate-500 hover:bg-white border-transparent hover:border-slate-200"
                            }`}
                    >
                        Rodada {round.number}
                    </button>
                ))}
            </div>

            {currentRoundId ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    <h3 className="text-xl font-bold text-slate-800 mb-8 border-b border-gray-50 pb-4">Jogos da Rodada {currentRound?.number}</h3>

                    <div className="space-y-6">
                        {games.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                                <AlertTriangle className="w-12 h-12 mb-2 opacity-20" />
                                <p>Nenhum jogo nesta rodada.</p>
                            </div>
                        ) : (
                            games.map((game) => (
                                <div key={game.id} className="flex items-center justify-between p-7 rounded-2xl border border-gray-100 bg-white hover:border-gray-200 hover:shadow-md transition-all group">
                                    {/* Game Content */}
                                    <div className="flex-1 flex items-center gap-8">
                                        {/* Home Team */}
                                        <div className="flex items-center gap-5 flex-1 justify-end">
                                            <span className="font-extrabold text-slate-800 text-lg md:text-xl text-right">{game.homeTeam}</span>
                                            {game.homeClub?.logoUrl ? (
                                                <img src={game.homeClub.logoUrl} className="w-12 h-12 object-contain" alt="" />
                                            ) : (
                                                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-[10px] text-slate-300">LOGO</div>
                                            )}
                                        </div>

                                        {/* Scores */}
                                        <div className="flex items-center gap-4">
                                            {game.result ? (
                                                <div className="flex items-center gap-4 px-8 py-3 bg-gray-50 rounded-xl text-2xl font-black text-slate-400 min-w-[140px] justify-center border border-gray-100">
                                                    <span>{game.homeScore}</span>
                                                    <span className="text-slate-300 text-lg font-normal">x</span>
                                                    <span>{game.awayScore}</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-3">
                                                    <Input
                                                        type="number"
                                                        value={game.homeScore ?? ""}
                                                        onChange={async (e) => {
                                                            const val = parseInt(e.target.value);
                                                            if (!isNaN(val)) {
                                                                await updateScore(game.id, val, game.awayScore ?? 0);
                                                                router.refresh();
                                                            }
                                                        }}
                                                        className="w-16 h-12 text-center text-xl font-black border-gray-200 rounded-xl focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                                                        min={0}
                                                    />
                                                    <span className="text-slate-300 font-bold text-xl">x</span>
                                                    <Input
                                                        type="number"
                                                        value={game.awayScore ?? ""}
                                                        onChange={async (e) => {
                                                            const val = parseInt(e.target.value);
                                                            if (!isNaN(val)) {
                                                                await updateScore(game.id, game.homeScore ?? 0, val);
                                                                router.refresh();
                                                            }
                                                        }}
                                                        className="w-16 h-12 text-center text-xl font-black border-gray-200 rounded-xl focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                                                        min={0}
                                                    />
                                                    <Button
                                                        onClick={() => toast.success("Mudanças salvas automaticamente")}
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-10 w-10 text-blue-400 hover:bg-blue-50 transition-colors"
                                                    >
                                                        <Save className="w-5 h-5" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Away Team */}
                                        <div className="flex items-center gap-5 flex-1 justify-start">
                                            {game.awayClub?.logoUrl ? (
                                                <img src={game.awayClub.logoUrl} className="w-12 h-12 object-contain" alt="" />
                                            ) : (
                                                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-[10px] text-slate-300">LOGO</div>
                                            )}
                                            <span className="font-extrabold text-slate-800 text-lg md:text-xl text-left">{game.awayTeam}</span>
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    <div className="ml-10 flex-shrink-0">
                                        {game.result ? (
                                            <div className="flex items-center text-green-600 gap-2 px-6 py-3 bg-green-50 rounded-xl text-sm font-black border border-green-100 uppercase tracking-tight">
                                                <CheckCircle className="w-4 h-4" />
                                                Confirmado
                                            </div>
                                        ) : (
                                            <Button
                                                onClick={() => {
                                                    if (game.homeScore === null || game.awayScore === null) {
                                                        toast.error("Por favor, preencha o placar antes de confirmar.");
                                                        return;
                                                    }
                                                    handleConfirm(game.id);
                                                }}
                                                disabled={loadingMap[game.id]}
                                                className="bg-[#10B981] hover:bg-emerald-600 text-white rounded-xl font-black px-8 h-12 shadow-sm transition-all text-sm uppercase tracking-wide"
                                            >
                                                {loadingMap[game.id] ? "..." : "Confirmar Final"}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-dashed border-gray-200 text-slate-400">
                    <p className="font-medium text-lg">Selecione uma rodada para gerenciar os resultados.</p>
                </div>
            )}
        </div>
    );

}
