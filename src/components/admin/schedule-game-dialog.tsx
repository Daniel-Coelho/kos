"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Calendar } from "lucide-react";
import { format } from "date-fns";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { scheduleMatch } from "@/app/admin/(protected)/games/actions";

const MatchSchema = z.object({
    homeClubId: z.string().min(1, "Mandante obrigatório"),
    awayClubId: z.string().min(1, "Visitante obrigatório"),
    startTime: z.string().min(1, "Data obrigatória"),
    stadium: z.string().optional(),
});

interface ScheduleGameDialogProps {
    roundId: string;
    clubs: { id: string; name: string }[];
}

export function ScheduleGameDialog({ roundId, clubs }: ScheduleGameDialogProps) {
    const [open, setOpen] = useState(false);
    const form = useForm<z.infer<typeof MatchSchema>>({
        resolver: zodResolver(MatchSchema),
    });

    const onSubmit = async (data: z.infer<typeof MatchSchema>) => {
        const result = await scheduleMatch({
            roundId,
            homeClubId: data.homeClubId,
            awayClubId: data.awayClubId,
            startTime: new Date(data.startTime),
            stadium: data.stadium,
        });

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Jogo agendado!");
            setOpen(false);
            form.reset();
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                    <Calendar className="mr-2 h-4 w-4" />
                    Agendar Jogo
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-white text-slate-900">
                <DialogHeader>
                    <DialogTitle>Agendar Novo Jogo</DialogTitle>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Mandante</Label>
                            <Select onValueChange={(val) => form.setValue("homeClubId", val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                    {clubs.map((club) => (
                                        <SelectItem key={club.id} value={club.id}>
                                            {club.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {form.formState.errors.homeClubId && <p className="text-red-500 text-xs">{form.formState.errors.homeClubId.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label>Visitante</Label>
                            <Select onValueChange={(val) => form.setValue("awayClubId", val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                    {clubs.map((club) => (
                                        <SelectItem key={club.id} value={club.id}>
                                            {club.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {form.formState.errors.awayClubId && <p className="text-red-500 text-xs">{form.formState.errors.awayClubId.message}</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Data e Hora</Label>
                        <Input type="datetime-local" {...form.register("startTime")} className="bg-white text-slate-900" />
                        {form.formState.errors.startTime && <p className="text-red-500 text-xs">{form.formState.errors.startTime.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label>Estádio (Opcional)</Label>
                        <Input {...form.register("stadium")} className="bg-white text-slate-900" placeholder="Ex: Maracanã" />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} className="bg-white">Cancelar</Button>
                        <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700">Confirmar Agendamento</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
