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
import { Plus, Trash2, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

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

    const currentRound = rounds.find(r => r.id === currentRoundId);

    return (
        <div className="space-y-10 max-w-4xl mx-auto py-4">
            {/* Header Section */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Gerenciar Jogos e Rodadas</h1>
                    <p className="text-slate-500 text-sm mt-1">Agende os jogos de cada rodada.</p>
                </div>
                <Dialog open={isCreateRoundOpen} onOpenChange={setIsCreateRoundOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-[#15803d] hover:bg-[#166534] text-white rounded-lg px-6 font-semibold shadow-sm transition-all hover:scale-[1.02]">
                            <Plus className="w-4 h-4 mr-2" /> Nova Rodada
                        </Button>
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

            {/* Round Pills Navigation */}
            <div className="flex flex-wrap gap-3">
                {rounds.map((round) => (
                    <button
                        key={round.id}
                        onClick={() => handleRoundChange(round.id)}
                        className={cn(
                            "px-5 py-2.5 rounded-full text-xs font-bold transition-all border shadow-sm flex items-center gap-2",
                            currentRoundId === round.id
                                ? "bg-[#2563eb] text-white border-[#2563eb]"
                                : "bg-white text-slate-400 border-slate-100 hover:border-slate-300"
                        )}
                    >
                        Rodada {round.number}
                        <span className="opacity-60 font-medium">({round.status})</span>
                    </button>
                ))}
            </div>

            {currentRoundId ? (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    {/* Interior Card Header */}
                    <div className="p-8 pb-6 flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">Rodada {currentRound?.number}</h2>
                            <p className="text-xs text-slate-400 font-medium mt-1 uppercase tracking-wider">
                                Deadline: {currentRound?.deadline ? format(new Date(currentRound.deadline), "dd/MM/yyyy HH:mm", { locale: ptBR }) : '-'}
                            </p>
                        </div>
                        <Dialog open={isCreateGameOpen} onOpenChange={setIsCreateGameOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-[#15803d] hover:bg-[#166534] text-white rounded-lg px-6 font-semibold shadow-sm text-sm">
                                    <Plus className="w-4 h-4 mr-2" /> Agendar Jogo
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Agendar Jogo - Rodada {currentRound?.number}</DialogTitle>
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

                    {/* Matches List */}
                    <div className="px-4 pb-8 space-y-1">
                        {games.length === 0 ? (
                            <div className="text-center py-12 text-slate-400 bg-slate-50/50 rounded-xl mx-4">
                                <p className="text-sm font-medium">Nenhum jogo agendado para esta rodada.</p>
                            </div>
                        ) : (
                            games.map((game) => (
                                <div key={game.id} className="group relative flex items-center py-4 px-6 hover:bg-slate-50/50 transition-all rounded-xl border border-transparent hover:border-slate-100">
                                    <div className="flex-1 flex items-center justify-end gap-5">
                                        <span className="font-bold text-slate-700 text-sm whitespace-nowrap">{game.homeTeam}</span>
                                        <div className="w-10 h-10 flex items-center justify-center p-1 bg-white rounded-full shadow-sm border border-slate-100">
                                            {game.homeClub?.logoUrl ? (
                                                <img src={game.homeClub.logoUrl} className="w-7 h-7 object-contain" alt="" />
                                            ) : (
                                                <div className="w-7 h-7 bg-slate-100 rounded-full" />
                                            )}
                                        </div>
                                    </div>

                                    <div className="w-32 flex flex-col items-center">
                                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-tighter">X</span>
                                        <span className="text-[10px] text-slate-400 font-bold mt-1">
                                            {format(new Date(game.startTime), "dd/MM HH:mm", { locale: ptBR })}
                                        </span>
                                    </div>

                                    <div className="flex-1 flex items-center justify-start gap-5">
                                        <div className="w-10 h-10 flex items-center justify-center p-1 bg-white rounded-full shadow-sm border border-slate-100">
                                            {game.awayClub?.logoUrl ? (
                                                <img src={game.awayClub.logoUrl} className="w-7 h-7 object-contain" alt="" />
                                            ) : (
                                                <div className="w-7 h-7 bg-slate-100 rounded-full" />
                                            )}
                                        </div>
                                        <span className="font-bold text-slate-700 text-sm whitespace-nowrap">{game.awayTeam}</span>
                                    </div>

                                    {/* Action Buttons Overlay */}
                                    <div className="flex gap-1 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white" onClick={() => setEditingGame(game)}>
                                            <Pencil className="w-3.5 h-3.5 text-slate-400" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-red-50" onClick={() => handleDeleteGame(game.id)}>
                                            <Trash2 className="w-3.5 h-3.5 text-red-400" />
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            ) : (
                <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-slate-100">
                    <p className="text-slate-500 font-medium">Crie sua primeira rodada para começar a agendar jogos.</p>
                </div>
            )}

            {/* Edit Game Modal */}
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
                                            <SelectTrigger><SelectValue /></SelectTrigger>
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
                                            <SelectTrigger><SelectValue /></SelectTrigger>
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
                                    <Input name="stadium" defaultValue={editingGame.stadium || ""} />
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

