import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function GroupDetailPage(props: PageProps) {
    const params = await props.params; // Await params in Next.js 15
    const group = await prisma.group.findUnique({
        where: { id: params.id },
        include: {
            participations: {
                include: {
                    user: true
                },
                orderBy: { joinedAt: "desc" }
            }
        }
    });

    if (!group) return notFound();

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded-lg shadow flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                    <h2 className="text-2xl font-bold">{group.name}</h2>
                    <p className="text-gray-500">Detalhes do Grupo</p>
                </div>
                <div className="mt-4 md:mt-0 flex gap-4 text-right">
                    <div>
                        <p className="text-xs text-gray-500 uppercase">Premiação</p>
                        <p className="text-2xl font-bold text-green-600">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(group.prizePool))}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase">Taxa</p>
                        <p className="text-xl font-bold text-gray-800">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(group.entryFee))}
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="font-semibold text-lg">Participantes ({group.participations.length})</h3>
                </div>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuário</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Erros</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Repescagem</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Entrou em</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {group.participations.map((p) => (
                            <tr key={p.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{p.user.name}</div>
                                    <div className="text-sm text-gray-500">{p.user.nickname}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.user.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <Badge variant={p.status === 'ALIVE' ? "default" : "destructive"}>
                                        {p.status}
                                    </Badge>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold">
                                    {p.errors}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                                    {p.repescagemUsed ? "Sim" : "Não"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                                    {format(new Date(p.joinedAt), "dd/MM/yyyy")}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
