"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { logAdminAction } from "@/lib/admin-logger";

const RoundSchema = z.object({
    number: z.coerce.number().min(1, "Número da rodada inválido"),
    deadline: z
        .union([z.string(), z.date()])
        .transform((val) => new Date(val))
        .refine((date) => !isNaN(date.getTime()), {
            message: "Deadline é obrigatório",
        }),
});

const MatchSchema = z.object({
    roundId: z.string().min(1, "Rodada é obrigatória"),
    homeClubId: z.string().min(1, "Mandante é obrigatório"),
    awayClubId: z.string().min(1, "Visitante é obrigatório"),
    startTime: z.coerce
        .date()
        .refine((date) => !isNaN(date.getTime()), {
            message: "Data do jogo é obrigatória",
        }),
    stadium: z.string().optional(),
});

export async function createRound(
    data: z.input<typeof RoundSchema>
) {
    const result = RoundSchema.safeParse(data);

    if (!result.success) {
        return {
            error:
                result.error.issues?.[0]?.message ??
                "Erro de validação",
        };
    }

    const validatedData = result.data;

    // Check if round number already exists
    const existing = await prisma.round.findFirst({
        where: { number: validatedData.number },
    });

    if (existing) {
        return {
            error: `Rodada ${validatedData.number} já existe.`,
        };
    }

    try {
        await prisma.round.create({
            data: {
                number: validatedData.number,
                deadline: validatedData.deadline,
                status: "SCHEDULED",
            },
        });

        await logAdminAction(
            "CREATE_ROUND",
            `Created round: ${validatedData.number}`
        );

        revalidatePath("/admin/games");

        return { success: true };
    } catch (error) {
        return { error: "Erro ao criar rodada" };
    }
}

export async function scheduleMatch(data: z.infer<typeof MatchSchema>) {
    const result = MatchSchema.safeParse(data);
    if (!result.success) {
        return { error: result.error.issues?.[0]?.message ?? "Erro de validação" };
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
