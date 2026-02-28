import { prisma } from "@/lib/prisma";
import { DollarSign, Users, Trophy, AlertTriangle } from "lucide-react";

async function getDashboardStats() {
    const activeRound = await prisma.round.findFirst({
        where: { status: { in: ["OPEN", "LOCKED"] } },
        orderBy: { number: "asc" }
    });

    const activePlayers = await prisma.participation.count({
        where: { status: "ALIVE" }
    });

    const groups = await prisma.group.findMany({
        include: {
            _count: {
                select: { participations: true }
            }
        }
    });

    const groupsWithCollection = groups.map(group => {
        const collection = Number(group.entryFee) * group._count.participations;
        return {
            ...group,
            collection
        };
    });

    const totalPrize = groupsWithCollection.reduce((acc, group) => acc + group.collection, 0);

    return {
        roundNumber: activeRound?.number || "Pré-Temporada",
        activePlayers,
        totalPrize,
        groups: groupsWithCollection
    };
}

export default async function AdminDashboard() {
    const stats = await getDashboardStats();

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6 text-slate-800">Dashboard Central</h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-500 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500 uppercase font-semibold">Rodada Atual</p>
                        <p className="text-3xl font-bold text-gray-800">{stats.roundNumber}</p>
                    </div>
                    <Trophy className="text-blue-500 h-8 w-8" />
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-500 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500 uppercase font-semibold">Jogadores Vivos</p>
                        <p className="text-3xl font-bold text-gray-800">{stats.activePlayers}</p>
                    </div>
                    <Users className="text-green-500 h-8 w-8" />
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-yellow-500 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500 uppercase font-semibold">Arrecadação Total</p>
                        <p className="text-3xl font-bold text-gray-800">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.totalPrize)}
                        </p>
                    </div>
                    <DollarSign className="text-yellow-500 h-8 w-8" />
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-red-500 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500 uppercase font-semibold">Avisos</p>
                        <p className="text-sm font-bold text-gray-800">Verificar Logs</p>
                    </div>
                    <AlertTriangle className="text-red-500 h-8 w-8" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4 border-b pb-2 text-slate-800">Status dos Grupos</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grupo</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Participantes</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Arrecadação</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {stats.groups.map((group) => (
                                    <tr key={group.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{group.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{group._count.participations}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(group.collection)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${group.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                {group.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4 border-b pb-2">Ações Rápidas</h3>
                    <ul className="space-y-3">
                        <li>
                            <a href="/admin/clubes" className="block p-3 bg-gray-50 hover:bg-gray-100 rounded-md transition duration-150 ease-in-out border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <span className="font-medium text-gray-700">Gerenciar Clubes</span>
                                    <span className="text-gray-400">&rarr;</span>
                                </div>
                            </a>
                        </li>
                        <li>
                            <a href="/admin/jogos" className="block p-3 bg-gray-50 hover:bg-gray-100 rounded-md transition duration-150 ease-in-out border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <span className="font-medium text-gray-700">Gerenciar Jogos e Rodadas</span>
                                    <span className="text-gray-400">&rarr;</span>
                                </div>
                            </a>
                        </li>
                        <li>
                            <a href="/admin/resultados" className="block p-3 bg-gray-50 hover:bg-gray-100 rounded-md transition duration-150 ease-in-out border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <span className="font-medium text-gray-700">Lançar Resultados</span>
                                    <span className="text-gray-400">&rarr;</span>
                                </div>
                            </a>
                        </li>
                        <li>
                            <a href="/admin/grupos" className="block p-3 bg-gray-50 hover:bg-gray-100 rounded-md transition duration-150 ease-in-out border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <span className="font-medium text-gray-700">Gestão de Grupos</span>
                                    <span className="text-gray-400">&rarr;</span>
                                </div>
                            </a>
                        </li>
                        <li>
                            <a href="/admin/usuarios" className="block p-3 bg-gray-50 hover:bg-gray-100 rounded-md transition duration-150 ease-in-out border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <span className="font-medium text-gray-700">Gestão de Usuários</span>
                                    <span className="text-gray-400">&rarr;</span>
                                </div>
                            </a>
                        </li>
                        <li>
                            <a href="/admin/logs" className="block p-3 bg-gray-50 hover:bg-gray-100 rounded-md transition duration-150 ease-in-out border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <span className="font-medium text-gray-700">Logs e Auditoria</span>
                                    <span className="text-gray-400">&rarr;</span>
                                </div>
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
