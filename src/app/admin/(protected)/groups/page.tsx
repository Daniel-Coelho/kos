import { prisma } from "@/lib/prisma";
import { AdminCard } from "@/components/admin/ui/card";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default async function GroupsPage() {
    const groups = await prisma.group.findMany({
        where: {
            name: {
                in: ["Jogo Bronze", "Jogo Prata", "Jogo Ouro"]
            }
        },
        include: {
            _count: {
                select: { participations: true },
            },
        },
        orderBy: { entryFee: "asc" },
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-800">Gestão de Grupos</h1>
            </div>

            <AdminCard className="p-0 overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                Nome
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                                Participantes
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                                Entrada
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                                Premiação Estimada
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                                Ações
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100">
                        {groups.map((group) => {
                            const participants = group._count.participations;
                            const entryFee = Number(group.entryFee);
                            const prizePool = entryFee * participants * 0.875;

                            return (
                                <tr key={group.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900">
                                        {group.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={cn(
                                            "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset",
                                            group.status === "OPEN"
                                                ? "bg-green-50 text-green-700 ring-green-600/20"
                                                : "bg-red-50 text-red-700 ring-red-600/20"
                                        )}>
                                            {group.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-slate-600">
                                        {participants}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-slate-600">
                                        R$ {entryFee.toFixed(2).replace(".", ",")}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right font-medium text-green-600">
                                        R$ {prizePool.toFixed(2).replace(".", ",")}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <Button asChild variant="ghost" size="sm" className="bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700">
                                            <Link href={`/admin/groups/${group.id}`}>
                                                <Eye className="w-4 h-4 mr-2" />
                                                Detalhes
                                            </Link>
                                        </Button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </AdminCard>
        </div>
    );
}
