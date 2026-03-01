"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Plus } from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createRound } from "@/app/admin/(protected)/games/actions";

const RoundSchema = z.object({
    number: z.coerce.number().min(1, "Número deve ser maior que 0"),
    deadline: z.string().min(1, "Deadline é obrigatório"),
});

export function CreateRoundDialog() {
    const [open, setOpen] = useState(false);

    const form = useForm<z.input<typeof RoundSchema>>({
        resolver: zodResolver(RoundSchema),
        defaultValues: {
            number: 0,
            deadline: "",
        },
    });

    const onSubmit = async (data: z.input<typeof RoundSchema>) => {
        const result = await createRound({
            number: data.number,
            deadline: new Date(data.deadline),
        });

        if (result?.error) {
            toast.error(result.error);
            return;
        }

        toast.success("Rodada criada com sucesso!");
        form.reset();
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Rodada
                </Button>
            </DialogTrigger>

            <DialogContent className="bg-slate-950 text-white border-slate-800">
                <DialogHeader>
                    <DialogTitle>Criar Nova Rodada</DialogTitle>
                </DialogHeader>

                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4 py-4"
                >
                    {/* Número */}
                    <div className="space-y-2">
                        <Label htmlFor="number" className="text-slate-300">
                            Número da Rodada
                        </Label>

                        <Input
                            id="number"
                            type="number"
                            {...form.register("number", {
                                valueAsNumber: true,
                            })}
                            className="bg-slate-900 border-green-800 text-white focus:ring-green-600"
                        />

                        {form.formState.errors.number && (
                            <p className="text-red-500 text-sm">
                                {form.formState.errors.number.message}
                            </p>
                        )}
                    </div>

                    {/* Deadline */}
                    <div className="space-y-2">
                        <Label htmlFor="deadline" className="text-slate-300">
                            Deadline (Limite Palpites)
                        </Label>

                        <Input
                            id="deadline"
                            type="datetime-local"
                            {...form.register("deadline")}
                            className="bg-slate-900 border-green-800 text-white focus:ring-green-600"
                        />

                        {form.formState.errors.deadline && (
                            <p className="text-red-500 text-sm">
                                {form.formState.errors.deadline.message}
                            </p>
                        )}
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold mt-4"
                    >
                        Criar Rodada
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}