"use client";

import { deleteClub } from "@/app/admin/(protected)/clubs/actions";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useTransition } from "react";

export function DeleteClubButton({ id }: { id: string }) {
    const [isPending, startTransition] = useTransition();

    const handleDelete = () => {
        if (confirm("Tem certeza que deseja excluir este clube? Esta ação não pode ser desfeita.")) {
            startTransition(async () => {
                const result = await deleteClub(id);
                if (result.error) {
                    toast.error(result.error);
                } else {
                    toast.success("Clube excluído com sucesso!");
                }
            });
        }
    };

    return (
        <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={handleDelete}
            disabled={isPending}
        >
            <Trash2 className="h-4 w-4" />
        </Button>
    );
}
