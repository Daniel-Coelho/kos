import { prisma } from "@/lib/prisma";
import { AdminCard } from "@/components/admin/ui/card";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default async function LogsPage() {
    const logs = await prisma.adminLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 100,
        include: {
            admin: {
                select: { email: true, name: true },
            },
        },
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-800">Logs e Auditoria</h1>
            </div>

            <AdminCard className="p-0 overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                Data/Hora
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                Admin
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                Ação
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                Detalhes
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                                IP
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100">
                        {logs.map((log) => (
                            <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                                    {format(log.createdAt, "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900">
                                    {log.admin.email}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10 mb-1">
                                        {log.action}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-slate-600 max-w-md truncate">
                                    {log.details || "-"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-slate-400 font-mono text-xs">
                                    {log.ipAddress}
                                </td>
                            </tr>
                        ))}
                        {logs.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                                    Nenhum registro de auditoria encontrado.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </AdminCard>
        </div>
    );
}
