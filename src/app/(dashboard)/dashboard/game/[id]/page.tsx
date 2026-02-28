
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Skull, Trophy, Users, Shield } from "lucide-react";
import { GameInterface } from "./game-interface";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default async function GamePage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        redirect("/login");
    }

    // 1. Fetch Participation
    const participation = await prisma.participation.findUnique({
        where: { id: params.id },
        include: {
            group: true,
            user: true,
            picks: {
                orderBy: { round: { number: "asc" } },
                include: { round: true }
            }
        }
    });

    if (!participation || participation.userId !== (session.user as any).id) {
        return notFound();
    }

    // 2. Fetch Group Stats
    // We need to count ALIVE participants in this group
    const aliveCount = await prisma.participation.count({
        where: {
            groupId: participation.groupId,
            status: 'ALIVE'
        }
    });

    // 3. Calc Prize Pool (using the rule we implemented)
    // We need ALL participations to calc prize pool correctly
    const allParticipations = await prisma.participation.findMany({
        where: { groupId: participation.groupId },
        select: { repescagemUsed: true }
    });

    const totalEntries = allParticipations.length;
    const totalRepescagens = allParticipations.filter(p => p.repescagemUsed).length;
    const prizePool = (totalEntries + totalRepescagens) * Number(participation.group.entryFee) * 0.875;


    // 4. Fetch Current Round (Global)
    // Optimized: Only show LOCKED round if user HAS a pick in it. 
    // Otherwise, show the next OPEN/SCHEDULED round.
    const allActiveRounds = await prisma.round.findMany({
        where: {
            status: { in: ['OPEN', 'SCHEDULED', 'LOCKED'] },
        },
        orderBy: { number: 'asc' }
    });

    let currentRound = allActiveRounds[0] || null;

    if (currentRound?.status === 'LOCKED') {
        const hasPickInLocked = participation.picks.some(p => p.roundId === currentRound!.id);
        if (!hasPickInLocked) {
            // New user or missed deadline? Check if there's a next one
            const nextRound = allActiveRounds.find(r => r.status === 'OPEN' || r.status === 'SCHEDULED');
            if (nextRound) {
                currentRound = nextRound;
            }
        }
    }

    // 5. Fetch Matches for Current Round
    let matches: any[] = [];
    if (currentRound) {
        matches = await prisma.match.findMany({
            where: { roundId: currentRound.id },
            include: {
                homeClub: true,
                awayClub: true
            },
            orderBy: { startTime: 'asc' }
        });
    }

    // 6. Check if user already picked current round
    const currentPick = currentRound
        ? participation.picks.find(p => p.roundId === currentRound.id)
        : undefined;

    const isPastDeadline = currentRound ? new Date() > new Date(currentRound.deadline) : false;

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
            {participation.status === "ELIMINATED" && (
                <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-8 text-center space-y-4 backdrop-blur-md">
                    <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                        <Skull className="w-10 h-10 text-red-500" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold text-white tracking-tight">Você foi Eliminado</h2>
                        <p className="text-white/70 max-w-md mx-auto leading-relaxed">
                            {participation.picks.some(p => p.team === "PRAZO ENCERRADO")
                                ? "Você perdeu o prazo para aposta em uma das rodadas e foi automaticamente removido do jogo."
                                : "Infelizmente seu palpite não foi vencedor e você atingiu o limite de erros permitido."}
                        </p>
                    </div>
                </div>
            )}

            {/* Header Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-background/40 backdrop-blur-md border-white/5">
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm font-medium text-white/70">Sobreviventes</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-2xl font-bold flex items-center gap-2 text-white">
                            <Users className="text-green-400" /> {aliveCount}
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-background/40 backdrop-blur-md border-white/5">
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm font-medium text-white/70">
                            Prêmio Atual
                            <div className="text-[10px] text-white/40 font-normal">Prêmio de valor fictício</div>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-2xl font-bold flex items-center gap-2 text-white">
                            <Trophy className="text-yellow-500" /> {new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(prizePool)}
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-background/40 backdrop-blur-md border-white/5">
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm font-medium text-white/70">Status</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-2xl font-bold flex items-center gap-2 text-white">
                            {participation.status === "ALIVE" ? <CheckCircle className="text-green-500" /> : <Skull className="text-red-500" />}
                            {participation.status === "ALIVE" ? "VIVO" : "ELIMINADO"}
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-background/40 backdrop-blur-md border-white/5">
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm font-medium text-white/70">Repescagem</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-2xl font-bold flex items-center gap-2 text-white">
                            {/* Logic for repescagem availability - simplifying for now assuming logic is elsewhere or user has 1 error */}
                            {participation.repescagemUsed
                                ? <Badge variant="destructive">Usada</Badge>
                                : <Badge variant="outline" className="text-green-500 border-green-500">Disponível</Badge>
                            }
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Picking Section */}
                <div className="lg:col-span-2 space-y-6">
                    {currentRound ? (
                        <>
                            {isPastDeadline && (
                                <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-4 mb-4 text-yellow-200 text-sm text-center">
                                    ⚠️ O prazo para palpites nesta rodada já encerrou ({format(new Date(currentRound.deadline), "dd/MM 'às' HH:mm")}).
                                    <br />
                                    Aguarde os resultados dos jogos.
                                </div>
                            )}
                            <GameInterface
                                participationId={participation.id}
                                roundNumber={currentRound.number}
                                roundId={currentRound.id}
                                deadline={format(new Date(currentRound.deadline), "EEEE, HH:mm", { locale: ptBR })}
                                matches={matches}
                                pickHistory={participation.picks.map(p => ({ roundId: p.roundId, team: p.team, status: p.status }))}
                                currentPick={currentPick?.team}
                                // Disable if round locked OR user eliminated OR deadline passed
                                disabled={currentRound.status === 'LOCKED' || participation.status !== 'ALIVE' || isPastDeadline}
                            />
                        </>

                    ) : (
                        <Card className="border-white/10 bg-background/40 backdrop-blur-md">
                            <CardContent className="py-10 text-center text-white/60">
                                Nenhuma rodada aberta no momento.
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* History Section */}
                <div>
                    <Card className="bg-background/40 backdrop-blur-md border-white/5">
                        <CardHeader>
                            <CardTitle className="text-white">Histórico</CardTitle>
                            <CardDescription className="text-white/70">Sua jornada até aqui</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4 relative pl-4 border-l-2 border-border ml-2">
                                {participation.picks.length === 0 && (
                                    <p className="text-sm text-white/50 italic">Nenhum palpite ainda.</p>
                                )}
                                {participation.picks.map((pick) => (
                                    <div key={pick.id} className="relative mb-6 last:mb-0">
                                        <div className={`absolute -left-[21px] top-1 w-4 h-4 rounded-full border-2 ${pick.status === 'SURVIVED' ? 'bg-green-500 border-green-500' :
                                            pick.status === 'DIED' ? 'bg-red-500 border-red-500' :
                                                'bg-yellow-500 border-yellow-500' // Pending
                                            }`} />
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-sm font-bold text-white">Rodada {pick.round.number}</span>
                                            <Badge variant={
                                                pick.status === 'SURVIVED' ? "default" :
                                                    pick.status === 'DIED' ? "destructive" : "secondary"
                                            } className="text-xs">
                                                {pick.status === 'SURVIVED' ? "VIVO" :
                                                    pick.status === 'DIED' ? "ERRO" : "PENDENTE"}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-2 p-2 rounded bg-white/10 text-sm text-white">
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
