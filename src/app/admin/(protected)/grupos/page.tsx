import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

export default async function GroupsPage() {
    const groups = await prisma.group.findMany({
        include: {
            _count: {
                select: { participations: true }
            }
        },
        orderBy: { name: "asc" }
    });

    return (
        <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Gestão de Grupos</h2>
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Participantes</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Entrada</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Premiação</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {groups.map((group) => (
                            <tr key={group.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{group.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${group.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {group.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{group._count.participations}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(group.entryFee))}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(group.prizePool))}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <Link href={`/admin/grupos/${group.id}`}>
                                        <Button variant="ghost" size="sm">
                                            <Eye className="w-4 h-4 mr-2" /> Detalhes
                                        </Button>
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
