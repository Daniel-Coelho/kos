import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, Search } from "lucide-react";
import { redirect } from "next/navigation";

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function UsersPage(props: PageProps) {
    const searchParams = await props.searchParams;
    const q = searchParams.q as string || "";

    const users = await prisma.user.findMany({
        where: {
            OR: [
                { name: { contains: q, mode: "insensitive" } },
                { email: { contains: q, mode: "insensitive" } },
                { nickname: { contains: q, mode: "insensitive" } }
            ]
        },
        orderBy: { createdAt: "desc" },
        take: 20
    });

    return (
        <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Gestão de Usuários</h2>

            <div className="mb-6 bg-white p-4 rounded-lg shadow">
                <form className="flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                            name="q"
                            defaultValue={q}
                            placeholder="Buscar por nome, email ou apelido..."
                            className="pl-8"
                        />
                    </div>
                    <Button type="submit">Buscar</Button>
                </form>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome / Nick</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Role</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                    <div className="text-sm text-gray-500">{user.nickname}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm">{user.role}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <Link href={`/admin/usuarios/${user.id}`}>
                                        <Button variant="ghost" size="sm">
                                            <Eye className="w-4 h-4 mr-2" /> Histórico
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
