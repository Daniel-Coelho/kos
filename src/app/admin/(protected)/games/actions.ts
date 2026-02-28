"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { logAdminAction } from "@/lib/admin-logger";

const RoundSchema = z.object({
    number: z.coerce.number().min(1, "Número da rodada inválido"),
    deadline: z.coerce.date({ required_error: "Deadline é obrigatório" }),
});

const MatchSchema = z.object({
    roundId: z.string().min(1, "Rodada é obrigatória"),
    homeClubId: z.string().min(1, "Mandante é obrigatório"),
    awayClubId: z.string().min(1, "Visitante é obrigatório"),
    startTime: z.coerce.date({ required_error: "Data do jogo é obrigatória" }),
    stadium: z.string().optional(),
});

export async function createRound(data: z.infer<typeof RoundSchema>) {
    const result = RoundSchema.safeParse(data);
    if (!result.success) {
        return { error: result.error.errors[0].message };
    }

    // Check if round number already exists
    const existing = await prisma.round.findFirst({
        where: { number: result.data.number },
    });

    if (existing) {
        return { error: `Rodada ${result.data.number} já existe.` };
    }

    try {
        await prisma.round.create({
            data: {
                number: result.data.number,
                deadline: result.data.deadline,
                status: "SCHEDULED",
            },
        });
        await logAdminAction("CREATE_ROUND", `Created round: ${result.data.number}`);
        revalidatePath("/admin/games");
        return { success: true };
    } catch (error) {
        return { error: "Erro ao criar rodada" };
    }
}

export async function scheduleMatch(data: z.infer<typeof MatchSchema>) {
    const result = MatchSchema.safeParse(data);
    if (!result.success) {
        return { error: result.error.errors[0].message };
    }

    try {
        // Fetch club names to populate legacy string fields if needed, 
        // or just rely on relations. The schema has both strings and relations.
        // I'll populate both to be safe based on schema.
        const homeClub = await prisma.club.findUnique({ where: { id: result.data.homeClubId } });
        const awayClub = await prisma.club.findUnique({ where: { id: result.data.awayClubId } });

        if (!homeClub || !awayClub) return { error: "Clubes não encontrados" };

        await prisma.match.create({
            data: {
                roundId: result.data.roundId,
                homeClubId: result.data.homeClubId,
                awayClubId: result.data.awayClubId,
                homeTeam: homeClub.name,
                awayTeam: awayClub.name,
                startTime: result.data.startTime,
                stadium: result.data.stadium || "",
            },
        });
        await logAdminAction("SCHEDULE_MATCH", `Scheduled match in round ${result.data.roundId}: ${homeClub.name} vs ${awayClub.name}`);
        revalidatePath("/admin/games");
        return { success: true };
    } catch (error) {
        console.error(error);
        return { error: "Erro ao agendar jogo" };
    }
}

export async function deleteMatch(id: string) {
    try {
        await prisma.match.delete({ where: { id } });
        revalidatePath("/admin/games");
        return { success: true };
    } catch (error) {
        return { error: "Erro ao excluir jogo" };
    }
}
