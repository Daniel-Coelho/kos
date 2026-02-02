import { prisma } from "@/lib/prisma";
import { format } from "date-fns";

export default async function AdminLogsPage() {
    const logs = await prisma.adminLog.findMany({
        include: {
            admin: true
        },
        orderBy: { createdAt: "desc" },
        take: 100
    });

    return (
        <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Logs e Auditoria</h2>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data/Hora</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Admin</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ação</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Detalhes</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">IP</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {logs.map((log) => (
                            <tr key={log.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {format(new Date(log.createdAt), "dd/MM/yyyy HH:mm:ss")}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {log.admin.name} ({log.admin.email})
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-700">
                                    {log.action}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500 break-words max-w-xs">
                                    {log.details}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-400">
                                    {log.ipAddress}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
