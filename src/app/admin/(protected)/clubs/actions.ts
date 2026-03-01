"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { logAdminAction } from "@/lib/admin-logger";

const ClubSchema = z.object({
    name: z.string().min(1, "Nome é obrigatório"),
    shortName: z.string().optional(),
    logoUrl: z.string().url("URL do escudo inválida").optional().or(z.literal("")),
});

export async function createClub(data: z.infer<typeof ClubSchema>) {
    const result = ClubSchema.safeParse(data);
    if (!result.success) {
        return { error: result.error.issues?.[0]?.message ?? "Erro de validação" };
    }

    try {
        await prisma.club.create({
            data: {
                name: result.data.name,
                shortName: result.data.shortName,
                logoUrl: result.data.logoUrl,
            },
        });
        await logAdminAction("CREATE_CLUB", `Created club: ${result.data.name}`);
        revalidatePath("/admin/clubs");
        return { success: true };
    } catch (error) {
        return { error: "Erro ao criar clube" };
    }
}

export async function updateClub(id: string, data: z.infer<typeof ClubSchema>) {
    const result = ClubSchema.safeParse(data);
    if (!result.success) {
        return { error: result.error.issues?.[0]?.message ?? "Erro de validação" };
    }

    try {
        await prisma.club.update({
            where: { id },
            data: {
                name: result.data.name,
                shortName: result.data.shortName,
                logoUrl: result.data.logoUrl,
            },
        });
        await logAdminAction("UPDATE_CLUB", `Updated club ID: ${id}`);
        revalidatePath("/admin/clubs");
        return { success: true };
    } catch (error) {
        return { error: "Erro ao atualizar clube" };
    }
}

export async function deleteClub(id: string) {
    try {
        await prisma.club.delete({
            where: { id },
        });
        await logAdminAction("DELETE_CLUB", `Deleted club ID: ${id}`);
        revalidatePath("/admin/clubs");
        return { success: true };
    } catch (error) {
        return { error: "Erro ao excluir clube. Verifique se existem jogos vinculados." };
    }
}
