import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, XCircle, Trophy, PlusCircle } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default async function DashboardPage(props: { searchParams: Promise<{ success?: string; groupId?: string }> }) {
    const searchParams = await props.searchParams;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        redirect("/login");
    }

    // @ts-ignore
    const userId = session.user.id;

    // --- TEMPORARY: Auto-activate participation on return from Stripe ---
    // In production, this MUST be done via Webhooks to be secure.
    if (searchParams.success === 'true' && searchParams.groupId) {
        const groupId = searchParams.groupId;

        // Check if already participating
        const existing = await prisma.participation.findFirst({
            where: { userId, groupId }
        });

        if (!existing) {
            const group = await prisma.group.findUnique({ where: { id: groupId } });
            if (group) {
                await prisma.participation.create({
                    data: {
                        userId,
                        groupId,
                        status: 'ALIVE',
                        // Create a transaction record too
                        // transactions: { create: { amount: group.entryFee, type: 'ENTRY', status: 'COMPLETED' } } 
                        // Check schema for transaction relation. It is separate.
                    }
                });

                // Create Transaction separately
                await prisma.transaction.create({
                    data: {
                        userId,
                        amount: group.entryFee,
                        type: 'ENTRY',
                        status: 'COMPLETED',
                        stripeId: 'mock_stripe_id_' + Date.now()
                    }
                });
            }
        }
    }
    // ------------------------------------------------------------------

    // Fetch User Participations

    // Fetch User Participations
    const participations = await prisma.participation.findMany({
        where: { userId },
        include: {
            group: true,
            // picks: { orderBy: { round: { number: 'desc' } }, take: 1 } // Get last pick if needed
        }
    });

    // Fetch Next Round (Open or Scheduled)
    const nextRound = await prisma.round.findFirst({
        where: {
            status: { in: ['OPEN', 'SCHEDULED'] },
            deadline: { gt: new Date() }
        },
        orderBy: { number: 'asc' }
    });

    // Fetch Available Groups (to show if user has no games or to offer new ones)
    // For now getting all groups to show a "Join" section
    const allGroups = await prisma.group.findMany({
        orderBy: { entryFee: 'asc' }
    });

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">Meus Jogos</h1>
                    <p className="text-white/70">Bem-vindo, {session.user.name} ({session.user.image}).</p>
                </div>
                <Button className="bg-green-600 hover:bg-green-700 text-white shadow-[0_0_15px_rgba(34,197,94,0.2)]" asChild>
                    <Link href="/dashboard/join">
                        <PlusCircle className="mr-2 h-4 w-4" /> Entrar em Novo Grupo
                    </Link>
                </Button>
            </div>

            {participations.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-white/20 rounded-lg">
                    <Trophy className="mx-auto h-12 w-12 text-white/30 mb-4" />
                    <h3 className="text-lg font-medium text-white">Você ainda não está participando de nenhum jogo.</h3>
                    <p className="text-white/60 mb-6">Escolha um grupo e prove que você é o Rei da Sobrevivência!</p>
                    <Button asChild>
                        <Link href="/dashboard/join">Começar Agora</Link>
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {participations.map((part) => (
                        <Card key={part.id} className={`bg-background/60 backdrop-blur-md border border-white/10 hover:border-green-500/30 transition-all duration-300 border-l-4 text-white ${part.status === 'ALIVE' ? 'border-l-green-500' : 'border-l-red-500'}`}>
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-white">{part.group.name}</CardTitle>
                                        <CardDescription className="flex items-center gap-2 mt-1 text-white/60">
                                            Erros: <span className="font-bold text-white">{part.errors}/2</span>
                                        </CardDescription>
                                    </div>
                                    <Badge variant={part.status === 'ALIVE' ? 'default' : 'destructive'} className={part.status === 'ALIVE' ? 'bg-green-500 hover:bg-green-600' : ''}>
                                        {part.status === 'ALIVE' ? 'VIVO' : 'ELIMINADO'}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 text-sm">
                                        {nextRound ? (
                                            <span className="text-white/80 font-medium">
                                                Rodada {nextRound.number} ({nextRound.status === 'OPEN' ? 'Aberta' : 'Agendada'})
                                            </span>
                                        ) : (
                                            <span className="text-white/50 italic">Aguardando rodada...</span>
                                        )}
                                    </div>

                                    {part.status === 'ALIVE' && nextRound && (
                                        <div className="p-3 bg-white/5 rounded-lg text-sm border border-white/10">
                                            <span className="text-white/40 block text-xs uppercase font-bold mb-1">Próximo Prazo</span>
                                            <span className="font-medium flex items-center gap-2 text-white">
                                                <AlertCircle size={14} className="text-yellow-500" />
                                                {format(new Date(nextRound.deadline), "EEEE, HH:mm", { locale: ptBR })}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button className={`w-full ${part.status === 'ALIVE' ? 'bg-green-600 hover:bg-green-700' : ''}`} variant={part.status === 'ALIVE' ? "default" : "secondary"} asChild>
                                    <Link href={`/dashboard/game/${part.id}`}>
                                        {part.status === 'ALIVE' ? 'Fazer Palpite' : 'Ver Histórico'}
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}

                    {allGroups.length > participations.length && (
                        <Card className="border-dashed border-2 border-white/20 bg-transparent flex flex-col justify-center items-center p-8 text-center text-white/60 hover:bg-white/5 hover:border-white/40 transition-all cursor-pointer group">
                            <Link href="/dashboard/join" className="w-full h-full flex flex-col items-center justify-center">
                                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <PlusCircle className="w-6 h-6 opacity-50" />
                                </div>
                                <h3 className="font-medium text-lg text-white/80">Entrar em outro grupo</h3>
                            </Link>
                        </Card>
                    )}
                </div>
            )}
        </div>
    );
}
