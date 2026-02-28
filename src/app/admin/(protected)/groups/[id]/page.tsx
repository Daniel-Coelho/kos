import { prisma } from "@/lib/prisma";
import { AdminCard, StatCard } from "@/components/admin/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { ArrowLeft, User, DollarSign } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface GroupDetailsProps {
    params: {
        id: string;
    }
}

export default async function GroupDetailsPage({ params }: GroupDetailsProps) {
    const { id } = await params;
    const group = await prisma.group.findUnique({
        where: { id },
        include: {
            participations: {
                include: { user: true },
                orderBy: { joinedAt: "desc" }
            }
        }
    });

    if (!group) notFound();

    const participantsCount = group.participations.length;
    const entryFee = Number(group.entryFee);
    // Use the 0.875 rule for consistency with index page, or use group.prizePool if stored
    const prizePool = entryFee * participantsCount * 0.875;
    const tax = entryFee * participantsCount * 0.125; // 12.5% tax? If 87.5% is prize.

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button asChild variant="outline" size="icon" className="bg-white">
                    <Link href="/admin/groups">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">{group.name}</h1>
                    <p className="text-sm text-slate-500">Detalhes do Grupo</p>
                </div>
                <div className="ml-auto flex gap-6 text-right">
                    <div>
                        <p className="text-xs text-slate-500 uppercase">Premiação</p>
                        <p className="text-xl font-bold text-green-600">R$ {prizePool.toFixed(2).replace(".", ",")}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 uppercase">Taxa</p>
                        <p className="text-xl font-bold text-slate-800">R$ {tax.toFixed(2).replace(".", ",")}</p>
                    </div>
                </div>
            </div>

            <AdminCard title={`Participantes (${participantsCount})`}>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-left uppercase text-xs font-medium text-slate-500">Usuário</th>
                                <th className="px-4 py-3 text-left uppercase text-xs font-medium text-slate-500">Email</th>
                                <th className="px-4 py-3 text-center uppercase text-xs font-medium text-slate-500">Status</th>
                                <th className="px-4 py-3 text-center uppercase text-xs font-medium text-slate-500">Erros</th>
                                <th className="px-4 py-3 text-center uppercase text-xs font-medium text-slate-500">Repescagem</th>
                                <th className="px-4 py-3 text-right uppercase text-xs font-medium text-slate-500">Entrou em</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {group.participations.map(p => (
                                <tr key={p.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3">
                                        <div className="font-medium text-slate-900">{p.user.name}</div>
                                        <div className="text-xs text-slate-500">{p.user.nickname}</div>
                                    </td>
                                    <td className="px-4 py-3 text-slate-600">{p.user.email}</td>
                                    <td className="px-4 py-3 text-center">
                                        <BadgeStatus status={p.status} />
                                    </td>
                                    <td className="px-4 py-3 text-center font-bold text-slate-900">{p.errors}</td>
                                    <td className="px-4 py-3 text-center text-slate-600">
                                        {p.repescagemUsed ? "Sim" : "Não"}
                                    </td>
                                    <td className="px-4 py-3 text-right text-slate-600">
                                        {format(p.joinedAt, "dd/MM/yyyy", { locale: ptBR })}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </AdminCard>
        </div>
    );
}

function BadgeStatus({ status }: { status: string }) {
    const isAlive = status === "ALIVE";
    return (
        <span className={cn(
            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold",
            isAlive
                ? "bg-green-600 text-white"
                : "bg-red-600 text-white"
        )}>
            {status}
        </span>
    );
}
