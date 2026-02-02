"use client";

import { useState } from "react";
import { Club } from "@prisma/client";
import { createClub, updateClub, deleteClub } from "@/lib/actions/club";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Pencil, Trash2, Plus } from "lucide-react";

export default function ClubManager({ initialClubs }: { initialClubs: Club[] }) {
    const [clubs, setClubs] = useState(initialClubs); // Actually rely on server revalidation? 
    // If we use revalidatePath in action, the page prop will update if we refresh? 
    // Next.js with Server Actions and revalidatePath causes the server component to re-render and send new payload.
    // So we don't strictly need local state for clubs if the parent re-renders.
    // But for instant feedback we might want it. However, the parent page will pass new props.
    // Let's rely on props.

    // Actually, local state is not updated automatically unless we receive new props.
    // And to receive new props the parent must re-render. 
    // Since we are in a client component, we might need `useRouter().refresh()` if we want to trigger a pull.
    // But `revalidatePath` on server usually handles it if we are using forms.

    // For simplicity, let's assume `initialClubs` is enough and we trust the refresh. 
    // But we need `router.refresh()` in client probably?
    // Let's add router.

    // Update: We are receiving `initialClubs` from the Server Component. 
    // When an action completes and calls revalidatePath, Next.js should update the RSC payload.

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingClub, setEditingClub] = useState<Club | null>(null);

    async function handleCreate(formData: FormData) {
        try {
            await createClub(formData);
            toast.success("Clube criado com sucesso!");
            setIsCreateOpen(false);
        } catch (error) {
            toast.error("Erro ao criar clube");
        }
    }

    async function handleUpdate(formData: FormData) {
        if (!editingClub) return;
        try {
            await updateClub(editingClub.id, formData);
            toast.success("Clube atualizado!");
            setEditingClub(null);
        } catch (error) {
            toast.error("Erro ao atualizar clube");
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Tem certeza que deseja excluir este clube?")) return;
        try {
            await deleteClub(id);
            toast.success("Clube excluído.");
        } catch (error) {
            toast.error("Erro ao excluir. Pode estar em uso.");
        }
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Gerenciar Clubes</h2>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-green-600 hover:bg-green-700 text-white">
                            <Plus className="w-4 h-4 mr-2" /> Novo Clube
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Adicionar Novo Clube</DialogTitle>
                            <DialogDescription>Preencha os dados do clube.</DialogDescription>
                        </DialogHeader>
                        <form action={handleCreate}>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Nome</Label>
                                    <Input id="name" name="name" required placeholder="Ex: Flamengo" />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="shortName">Sigla / Nome Curto</Label>
                                    <Input id="shortName" name="shortName" placeholder="Ex: FLA" />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="logoUrl">URL do Escudo</Label>
                                    <Input id="logoUrl" name="logoUrl" placeholder="https://..." />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit">Salvar</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Escudo</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sigla</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {initialClubs.map((club) => (
                            <tr key={club.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {club.logoUrl ? (
                                        <img src={club.logoUrl} alt={club.name} className="h-8 w-8 object-contain" />
                                    ) : (
                                        <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-500">
                                            {club.shortName?.[0] || club.name[0]}
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{club.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{club.shortName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setEditingClub(club)}
                                        className="text-blue-600 hover:text-blue-900 mr-2"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDelete(club.id)}
                                        className="text-red-600 hover:text-red-900"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Dialog open={!!editingClub} onOpenChange={(open) => !open && setEditingClub(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Clube</DialogTitle>
                    </DialogHeader>
                    {editingClub && (
                        <form action={handleUpdate}>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-name">Nome</Label>
                                    <Input id="edit-name" name="name" defaultValue={editingClub.name} required />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-shortName">Sigla</Label>
                                    <Input id="edit-shortName" name="shortName" defaultValue={editingClub.shortName || ""} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-logoUrl">URL do Escudo</Label>
                                    <Input id="edit-logoUrl" name="logoUrl" defaultValue={editingClub.logoUrl || ""} />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit">Atualizar</Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
