"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Plus, Pencil } from "lucide-react";

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
import { createClub, updateClub } from "@/app/admin/(protected)/clubs/actions";

const ClubSchema = z.object({
    name: z.string().min(1, "Nome é obrigatório"),
    shortName: z.string().optional(),
    logoUrl: z.string().url("URL inválida").optional().or(z.literal("")),
});

type ClubFormValues = z.infer<typeof ClubSchema>;

interface ClubDialogProps {
    club?: {
        id: string;
        name: string;
        shortName: string | null;
        logoUrl: string | null;
    };
    trigger?: React.ReactNode;
}

export function ClubDialog({ club, trigger }: ClubDialogProps) {
    const [open, setOpen] = useState(false);
    const isEditing = !!club;

    const form = useForm<ClubFormValues>({
        resolver: zodResolver(ClubSchema),
        defaultValues: {
            name: club?.name || "",
            shortName: club?.shortName || "",
            logoUrl: club?.logoUrl || "",
        },
    });

    const onSubmit = async (data: ClubFormValues) => {
        try {
            if (isEditing) {
                const result = await updateClub(club!.id, data);
                if (result.error) {
                    toast.error(result.error);
                    return;
                }
                toast.success("Clube atualizado com sucesso!");
            } else {
                const result = await createClub(data);
                if (result.error) {
                    toast.error(result.error);
                    return;
                }
                toast.success("Clube criado com sucesso!");
                form.reset();
            }
            setOpen(false);
        } catch (error) {
            toast.error("Ocorreu um erro inesperado.");
        }
    };

    // Reset form when dialog opens/closes or club changes
    useEffect(() => {
        if (open) {
            form.reset({
                name: club?.name || "",
                shortName: club?.shortName || "",
                logoUrl: club?.logoUrl || "",
            });
        }
    }, [open, club, form]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                        <Plus className="mr-2 h-4 w-4" />
                        Novo Clube
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-white text-slate-900 border-slate-200">
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Editar Clube" : "Novo Clube"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-right">
                            Nome do Clube
                        </Label>
                        <Input
                            id="name"
                            {...form.register("name")}
                            className="col-span-3 bg-white border-slate-300 text-slate-900"
                            placeholder="Ex: Flamengo"
                        />
                        {form.formState.errors.name && (
                            <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="shortName" className="text-right">
                            Sigla
                        </Label>
                        <Input
                            id="shortName"
                            {...form.register("shortName")}
                            className="col-span-3 bg-white border-slate-300 text-slate-900"
                            placeholder="Ex: FLA"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="logoUrl" className="text-right">
                            URL do Escudo
                        </Label>
                        <Input
                            id="logoUrl"
                            {...form.register("logoUrl")}
                            className="col-span-3 bg-white border-slate-300 text-slate-900"
                            placeholder="https://..."
                        />
                        {form.formState.errors.logoUrl && (
                            <p className="text-sm text-red-500">{form.formState.errors.logoUrl.message}</p>
                        )}
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            className="border-slate-300 text-slate-700 hover:bg-slate-50 bg-white"
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                            Salvar
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
