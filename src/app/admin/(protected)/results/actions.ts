"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { logAdminAction } from "@/lib/admin-logger";
import { completeRound } from "@/lib/actions/result";

const ScoreSchema = z.object({
    matchId: z.string(),
    homeScore: z.number().min(0),
    awayScore: z.number().min(0),
});

export async function updateMatchScore(data: z.infer<typeof ScoreSchema>) {
    const result = ScoreSchema.safeParse(data);
    if (!result.success) {
        return { error: "Dados inválidos" };
    }

    const { matchId, homeScore, awayScore } = result.data;

    let matchResult = "DRAW";
    if (homeScore > awayScore) matchResult = "HOME_WIN";
    if (awayScore > homeScore) matchResult = "AWAY_WIN";

    try {
        await prisma.match.update({
            where: { id: matchId },
            data: {
                homeScore,
                awayScore,
                result: matchResult,
            },
        });
        await logAdminAction("UPDATE_SCORE", `Match ${matchId}: ${homeScore}-${awayScore}`);
        revalidatePath("/admin/results");
        return { success: true };
    } catch (error) {
        return { error: "Erro ao atualizar placar" };
    }
}

export async function finalizeRound(roundId: string) {
    try {
        await completeRound(roundId);
        return { success: true };
    } catch (error: any) {
        console.error(error);
        return { error: error.message || "Erro crítico ao finalizar rodada" };
    }
}
