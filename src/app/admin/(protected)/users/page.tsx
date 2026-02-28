import { prisma } from "@/lib/prisma";
import { AdminCard } from "@/components/admin/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default async function UsersPage() {
    const users = await prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 50, // Limit for now
        include: {
            _count: {
                select: { participations: true },
            },
        },
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-800">Gestão de Usuários</h1>
            </div>

            <AdminCard className="p-0 overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                Usuário / Nickname
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                Email
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                                Função
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                                Grupos
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                                Criado em
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                                Ações
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="font-medium text-slate-900">{user.name}</div>
                                    <div className="text-xs text-slate-500">{user.nickname || "-"}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                                    {user.email}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <Badge variant="secondary" className={user.role === "ADMIN" ? "bg-red-100 text-red-800" : "bg-slate-100 text-slate-700"}>
                                        {user.role}
                                    </Badge>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center text-slate-600">
                                    {user._count.participations}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-slate-500">
                                    {format(user.createdAt, "dd/MM/yyyy", { locale: ptBR })}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <UserHistoryDialog userId={user.id} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </AdminCard>
        </div>
    );
}

// Inline component for history dialog (Server Component wrapper around Client Dialog Content? No, Dialog Trigger needs client usually. 
// I'll create a separate client component for the dialog content or full dialog.)
import { UserHistoryDialog } from "@/components/admin/user-history-dialog";
