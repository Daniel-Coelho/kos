import { prisma } from "@/lib/prisma";
import { AdminCard } from "@/components/admin/ui/card";
import { ClubDialog } from "@/components/admin/club-dialog";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { deleteClub } from "@/app/admin/(protected)/clubs/actions";
import { DeleteClubButton } from "@/components/admin/club-actions";

// Delete button logic moved to @/components/admin/club-actions.tsx

export default async function ClubsPage() {
    const clubs = await prisma.club.findMany({
        orderBy: { name: "asc" },
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-800">Gerenciar Clubes</h1>
                <ClubDialog />
            </div>

            <AdminCard className="p-0 overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                Escudo
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                Nome
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                Sigla
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                                Ações
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100">
                        {clubs.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-4 text-center text-slate-500">
                                    Nenhum clube cadastrado.
                                </td>
                            </tr>
                        ) : (
                            clubs.map((club) => (
                                <tr key={club.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {club.logoUrl ? (
                                            <div className="h-10 w-10 relative">
                                                <img src={club.logoUrl} alt={club.name} className="h-10 w-10 object-contain" />
                                            </div>
                                        ) : (
                                            <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 text-xs">
                                                N/A
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900">
                                        {club.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                                        {club.shortName || "-"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end gap-2">
                                            <ClubDialog
                                                club={club}
                                                trigger={
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                }
                                            />
                                            <DeleteClubButton id={club.id} />
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </AdminCard>
        </div>
    );
}
