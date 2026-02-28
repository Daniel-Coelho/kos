import { AlertTriangle, ChevronRight, DollarSign, Trophy, Users } from "lucide-react";
import Link from "next/link";
import { AdminCard, StatCard } from "@/components/admin/ui/card";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

async function getDashboardStats() {
    "use server";

    // Fetch only the 3 active groups
    const dbGroups = await prisma.group.findMany({
        where: {
            name: {
                in: ["Jogo Bronze", "Jogo Prata", "Jogo Ouro"]
            }
        },
        include: {
            _count: {
                select: { participations: true }
            }
        },
        orderBy: { entryFee: "asc" }
    });

    const groups = dbGroups.map(g => ({
        name: g.name,
        participants: g._count.participations,
        revenue: Number(g.entryFee) * g._count.participations,
        status: g.status
    }));

    // Get current round (latest one)
    const currentRound = await prisma.round.findFirst({
        orderBy: { number: "desc" }
    });

    // Count alive players across these 3 groups
    const aliveCount = await prisma.participation.count({
        where: {
            status: "ALIVE",
            group: {
                name: { in: ["Jogo Bronze", "Jogo Prata", "Jogo Ouro"] }
            }
        }
    });

    const totalRevenue = groups.reduce((acc, g) => acc + g.revenue, 0);

    return {
        round: currentRound ? `Rodada ${currentRound.number}` : "Nenhuma",
        alivePlayers: aliveCount,
        totalRevenue: totalRevenue,
        groups,
    };
}

export default async function DashboardPage() {
    const stats = await getDashboardStats();

    const quickActions = [
        { label: "Gerenciar Clubes", href: "/admin/clubs" },
        { label: "Gerenciar Jogos e Rodadas", href: "/admin/games" },
        { label: "Lançar Resultados", href: "/admin/results" },
        { label: "Gestão de Grupos", href: "/admin/groups" },
        { label: "Gestão de Usuários", href: "/admin/users" },
        { label: "Logs e Auditoria", href: "/admin/logs" },
    ];

    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-bold text-slate-800">Dashboard Central</h2>

            {/* Top Stats Row */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Rodada Atual"
                    value={stats.round}
                    icon={Trophy}
                    className="border-l-4 border-l-blue-500"
                    iconColor="text-blue-500"
                />
                <StatCard
                    title="Jogadores Vivos"
                    value={stats.alivePlayers}
                    icon={Users}
                    className="border-l-4 border-l-green-500"
                    iconColor="text-green-500"
                />
                <StatCard
                    title="Arrecadação Total"
                    value={`R$ ${stats.totalRevenue.toFixed(2).replace('.', ',')}`}
                    icon={DollarSign}
                    className="border-l-4 border-l-yellow-500"
                    iconColor="text-yellow-500"
                />
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm border-l-4 border-l-red-500 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">Avisos</p>
                        <div className="font-semibold text-color-slate-900 flex items-center gap-2">
                            Verificar Logs
                        </div>
                    </div>
                    <AlertTriangle className="h-6 w-6 text-red-500" />
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Status dos Grupos */}
                <AdminCard title="Status dos Grupos">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    <th className="pb-4 pl-2 font-bold">Grupo</th>
                                    <th className="pb-4 text-center font-bold">Participantes</th>
                                    <th className="pb-4 text-right font-bold transition-all">Arrecadação</th>
                                    <th className="pb-4 text-right pr-2 font-bold">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {stats.groups.map((group) => (
                                    <tr key={group.name} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="py-3.5 pl-2 font-semibold text-slate-800">{group.name}</td>
                                        <td className="py-3.5 text-center text-slate-500 font-medium">{group.participants}</td>
                                        <td className="py-3.5 text-right text-slate-500 font-medium">
                                            R$ {group.revenue.toFixed(2).replace('.', ',')}
                                        </td>
                                        <td className="py-3.5 text-right pr-2">
                                            <span className="text-[10px] font-bold text-slate-400">
                                                {group.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </AdminCard>

                {/* Ações Rápidas */}
                <AdminCard title="Ações Rápidas">
                    <div className="divide-y divide-slate-100 border-t border-slate-100 -mt-2">
                        {quickActions.map((action) => (
                            <Link
                                key={action.href}
                                href={action.href}
                                className="flex items-center justify-between py-4 text-slate-600 transition-colors hover:text-slate-900 group"
                            >
                                <span className="font-medium text-sm">{action.label}</span>
                                <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                            </Link>
                        ))}
                    </div>
                </AdminCard>
            </div>
        </div>
    );
}
