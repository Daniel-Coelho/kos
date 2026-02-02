"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Round, Match, Club } from "@prisma/client";
import { createGame, updateGame, deleteGame, createRound, updateRoundStatus } from "@/lib/actions/game";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Calendar, Clock, Plus, Trash2, Pencil } from "lucide-react";

type MatchWithClubs = Match & { homeClub: Club | null, awayClub: Club | null };

export default function GameManager({
    rounds,
    games,
    clubs,
    currentRoundId
}: {
    rounds: Round[],
    games: MatchWithClubs[],
    clubs: Club[],
    currentRoundId: string
}) {
    const router = useRouter();
    const [isCreateGameOpen, setIsCreateGameOpen] = useState(false);
    const [editingGame, setEditingGame] = useState<MatchWithClubs | null>(null);

    // Round Management
    const [isCreateRoundOpen, setIsCreateRoundOpen] = useState(false);

    function handleRoundChange(roundId: string) {
        router.push(`/admin/jogos?roundId=${roundId}`);
    }

    async function handleCreateGame(formData: FormData) {
        formData.append("roundId", currentRoundId);
        try {
            await createGame(formData);
            toast.success("Jogo agendado!");
            setIsCreateGameOpen(false);
        } catch (error: any) {
            toast.error(error.message || "Erro ao criar jogo");
        }
    }

    async function handleUpdateGame(formData: FormData) {
        if (!editingGame) return;
        try {
            await updateGame(editingGame.id, formData);
            toast.success("Jogo atualizado!");
            setEditingGame(null);
        } catch (error: any) {
            toast.error(error.message || "Erro ao atualizar jogo");
        }
    }

    async function handleDeleteGame(id: string) {
        if (!confirm("Excluir este jogo?")) return;
        try {
            await deleteGame(id);
            toast.success("Jogo excluído.");
        } catch (error) {
            toast.error("Erro ao excluir jogo.");
        }
    }

    async function handleCreateRound(formData: FormData) {
        const number = parseInt(formData.get("number") as string);
        const deadline = formData.get("deadline") as string;
        try {
            await createRound(number, deadline);
            toast.success("Rodada criada!");
            setIsCreateRoundOpen(false);
        } catch (error) {
            toast.error("Erro ao criar rodada.");
        }
    }

    async function handleLockRound(roundId: string, status: string) {
        try {
            await updateRoundStatus(roundId, status);
            toast.success(`Rodada ${status === 'LOCKED' ? 'Bloqueada' : 'Aberta'}!`);
        } catch (error) {
            toast.error("Erro ao atualizar status da rodada");
        }
    }

    const currentRound = rounds.find(r => r.id === currentRoundId);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold">Gerenciar Jogos e Rodadas</h2>
                    <p className="text-gray-500">Agende os jogos de cada rodada.</p>
                </div>
                <div className="flex gap-2">
                    <Dialog open={isCreateRoundOpen} onOpenChange={setIsCreateRoundOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline"><Plus className="w-4 h-4 mr-2" /> Nova Rodada</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Criar Nova Rodada</DialogTitle>
                            </DialogHeader>
                            <form action={handleCreateRound}>
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="round-number">Número da Rodada</Label>
                                        <Input id="round-number" name="number" type="number" required min={1} max={38} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="round-deadline">Deadline (Limite Palpites)</Label>
                                        <Input id="round-deadline" name="deadline" type="datetime-local" required />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="submit">Criar Rodada</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Round Selector */}
            <div className="flex overflow-x-auto pb-4 gap-2">
                {rounds.map((round) => (
                    <button
                        key={round.id}
                        onClick={() => handleRoundChange(round.id)}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${currentRoundId === round.id
                            ? "bg-blue-600 text-white"
                            : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                            }`}
                    >
                        Rodada {round.number}
                        <span className={`ml-2 text-xs opacity-75`}>
                            ({round.status})
                        </span>
                    </button>
                ))}
            </div>

            {currentRoundId ? (
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex justify-between items-center mb-6 border-b pb-4">
                        <div>
                            <h3 className="text-lg font-bold">Rodada {currentRound?.number}</h3>
                            <p className="text-sm text-gray-500">
                                Deadline: {currentRound?.deadline ? format(new Date(currentRound.deadline), "dd/MM/yyyy HH:mm", { locale: ptBR }) : '-'}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            {currentRound?.status === 'OPEN' && (
                                <Button size="sm" variant="destructive" onClick={() => handleLockRound(currentRoundId, 'LOCKED')}>
                                    Bloquear Palpites
                                </Button>
                            )}
                            {currentRound?.status === 'LOCKED' && (
                                <Button size="sm" variant="outline" onClick={() => handleLockRound(currentRoundId, 'OPEN')}>
                                    Reabrir Palpites
                                </Button>
                            )}

                            <Dialog open={isCreateGameOpen} onOpenChange={setIsCreateGameOpen}>
                                <DialogTrigger asChild>
                                    <Button className="bg-green-600 hover:bg-green-700 text-white">
                                        <Plus className="w-4 h-4 mr-2" /> Agendar Jogo
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Agendar Jogo - R{currentRound?.number}</DialogTitle>
                                    </DialogHeader>
                                    <form action={handleCreateGame}>
                                        <div className="grid gap-4 py-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="grid gap-2">
                                                    <Label>Mandante</Label>
                                                    <Select name="homeClubId" required>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Selecione..." />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {clubs.map(c => (
                                                                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label>Visitante</Label>
                                                    <Select name="awayClubId" required>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Selecione..." />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {clubs.map(c => (
                                                                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                            <div className="grid gap-2">
                                                <Label>Data e Hora</Label>
                                                <Input name="startTime" type="datetime-local" required />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label>Estádio (Opcional)</Label>
                                                <Input name="stadium" placeholder="Ex: Maracanã" />
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button type="submit">Agendar</Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {games.length === 0 ? (
                            <p className="text-center text-gray-500 py-8">Nenhum jogo agendado para esta rodada.</p>
                        ) : (
                            games.map((game) => (
                                <div key={game.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                                    <div className="flex-1 flex items-center justify-end gap-3 text-right">
                                        <span className="font-bold text-gray-900">{game.homeTeam}</span>
                                        {game.homeClub?.logoUrl && <img src={game.homeClub.logoUrl} className="w-8 h-8 object-contain" alt="" />}
                                    </div>
                                    <div className="px-6 flex flex-col items-center">
                                        <span className="text-xs text-gray-500 font-bold uppercase">X</span>
                                        <span className="text-xs text-gray-400 mt-1">
                                            {format(new Date(game.startTime), "dd/MM HH:mm", { locale: ptBR })}
                                        </span>
                                    </div>
                                    <div className="flex-1 flex items-center justify-start gap-3 text-left">
                                        {game.awayClub?.logoUrl && <img src={game.awayClub.logoUrl} className="w-8 h-8 object-contain" alt="" />}
                                        <span className="font-bold text-gray-900">{game.awayTeam}</span>
                                    </div>
                                    <div className="ml-6 flex gap-2">
                                        <Button variant="ghost" size="icon" onClick={() => setEditingGame(game)}>
                                            <Pencil className="w-4 h-4 text-gray-500" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDeleteGame(game.id)}>
                                            <Trash2 className="w-4 h-4 text-red-500" />
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            ) : (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                    <p className="text-gray-500">Selecione ou crie uma rodada para gerenciar os jogos.</p>
                    <Button className="mt-4" variant="outline" onClick={() => setIsCreateRoundOpen(true)}>
                        Criar Primeira Rodada
                    </Button>
                </div>
            )}

            {/* Edit Modal (Reusing structure, could be abstracted) */}
            <Dialog open={!!editingGame} onOpenChange={(open) => !open && setEditingGame(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Jogo</DialogTitle>
                    </DialogHeader>
                    {editingGame && (
                        <form action={handleUpdateGame}>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label>Mandante</Label>
                                        <Select name="homeClubId" defaultValue={editingGame.homeClubId || ""} required>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {clubs.map(c => (
                                                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Visitante</Label>
                                        <Select name="awayClubId" defaultValue={editingGame.awayClubId || ""} required>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {clubs.map(c => (
                                                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Data e Hora</Label>
                                    <Input
                                        name="startTime"
                                        type="datetime-local"
                                        defaultValue={new Date(editingGame.startTime).toISOString().slice(0, 16)}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Estádio (Opcional)</Label>
                                    <Input
                                        name="stadium"
                                        placeholder="Ex: Maracanã"
                                        defaultValue={editingGame.stadium || ""}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit">Salvar Alterações</Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
