import { prisma } from "@/lib/prisma";
import { AdminCard } from "@/components/admin/ui/card";
import { RoundNav } from "@/components/admin/round-nav";
import { CreateRoundDialog } from "@/components/admin/create-round-dialog";
import { ScheduleGameDialog } from "@/components/admin/schedule-game-dialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface GamesPageProps {
    searchParams: {
        roundId?: string;
    };
}

export default async function GamesPage({ searchParams }: GamesPageProps) {
    // Await searchParams as required in Next.js 15+ (though version is 16.1.5 here, which is standard)
    const { roundId } = await searchParams; // Explicitly awaiting dynamic params

    const rounds = await prisma.round.findMany({
        orderBy: { number: "asc" },
    });

    const clubs = await prisma.club.findMany({
        orderBy: { name: "asc" },
        select: { id: true, name: true },
    });

    const selectedRound = roundId
        ? rounds.find((r) => r.id === roundId)
        : rounds[0]; // Default to first (or logic to find current)

    const matches = selectedRound
        ? await prisma.match.findMany({
            where: { roundId: selectedRound.id },
            orderBy: { startTime: "asc" },
            include: {
                homeClub: true,
                awayClub: true,
            },
        })
        : [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-800">Gerenciar Jogos e Rodadas</h1>
                <CreateRoundDialog />
            </div>

            <AdminCard>
                <div className="space-y-6">
                    <RoundNav rounds={rounds} />

                    {selectedRound ? (
                        <div className="space-y-6 animate-in fade-in duration-500">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">Rodada {selectedRound.number}</h2>
                                    <p className="text-sm text-slate-500">
                                        Deadline: {format(selectedRound.deadline, "dd/MM/yyyy HH:mm", { locale: ptBR })}
                                    </p>
                                </div>
                                <ScheduleGameDialog roundId={selectedRound.id} clubs={clubs} />
                            </div>

                            {matches.length === 0 ? (
                                <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-lg">
                                    Nenhum jogo agendado para esta rodada.
                                </div>
                            ) : (
                                <div className="overflow-hidden rounded-lg border border-slate-200">
                                    <table className="w-full text-sm">
                                        <thead className="bg-slate-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Mandante</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Visitante</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Data/Hora</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Estádio</th>
                                                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-slate-100">
                                            {matches.map(match => (
                                                <tr key={match.id} className="hover:bg-slate-50">
                                                    <td className="px-4 py-3 font-medium text-slate-900">{match.homeClub?.name || match.homeTeam}</td>
                                                    <td className="px-4 py-3 font-medium text-slate-900">{match.awayClub?.name || match.awayTeam}</td>
                                                    <td className="px-4 py-3 text-slate-600">
                                                        {format(match.startTime, "dd/MM/yyyy HH:mm", { locale: ptBR })}
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-600">{match.stadium || "-"}</td>
                                                    <td className="px-4 py-3 text-right text-slate-500">
                                                        -
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-slate-500">
                            Selecione ou crie uma rodada para começar.
                        </div>
                    )}
                </div>
            </AdminCard>
        </div>
    );
}
