"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { logAdminAction } from "@/lib/log";

export async function updateScore(gameId: string, homeScore: number, awayScore: number) {
    await prisma.match.update({
        where: { id: gameId },
        data: {
            homeScore,
            awayScore
        }
    });
    revalidatePath("/admin/resultados");
}

export async function confirmResult(gameId: string) {
    const game = await prisma.match.findUnique({
        where: { id: gameId },
        include: { round: true }
    });

    if (!game) throw new Error("Jogo não encontrado");
    if (game.homeScore === null || game.awayScore === null) throw new Error("Placar incompleto. Salve o placar primeiro.");
    if (game.result) throw new Error("Resultado já confirmado");

    let result = "DRAW";
    if (game.homeScore > game.awayScore) result = "HOME_WIN";
    if (game.awayScore > game.homeScore) result = "AWAY_WIN";

    // Wrap everything in a transaction to ensure atomicity
    await prisma.$transaction(async (tx) => {
        // 1. Update Match Result
        await tx.match.update({
            where: { id: gameId },
            data: { result }
        });

        // 2. Process Picks
        const picks = await tx.pick.findMany({
            where: {
                roundId: game.roundId,
                team: { in: [game.homeTeam, game.awayTeam] }
            },
            include: { participation: true }
        });

        for (const pick of picks) {
            let status = "PENDING";

            if (pick.team === game.homeTeam) {
                status = result === "HOME_WIN" ? "SURVIVED" : "DIED";
            } else if (pick.team === game.awayTeam) {
                status = result === "AWAY_WIN" ? "SURVIVED" : "DIED";
            }

            if (status !== "PENDING") {
                // Update Pick
                await tx.pick.update({
                    where: { id: pick.id },
                    data: { status }
                });

                // Update Participation if DIED
                if (status === "DIED") {
                    const newErrors = pick.participation.errors + 1;
                    let participationStatus = pick.participation.status;

                    // Check for Elimination with Repescagem Logic
                    const maxErrors = pick.participation.repescagemUsed ? 2 : 1;

                    if (newErrors >= maxErrors) {
                        participationStatus = "ELIMINATED";
                    }

                    await tx.participation.update({
                        where: { id: pick.participationId },
                        data: {
                            errors: newErrors,
                            status: participationStatus
                        }
                    });
                }
            }
        }

        // 3. Log action
        // We use the non-transactional logAdminAction here, 
        // but ideally we would do it inside if it supported the tx client.
        // For now, keeping it here as it was, but inside the action.
    });

    await logAdminAction("CONFIRM_RESULT", `Confirmed game ${gameId} result: ${result}`);
    revalidatePath("/admin/resultados");
}

export async function reverseResult(gameId: string) {
    // Dangerous action. Only for corrections.
    // Would need to revert picks/errors.
    // Leaving unimplemented or simple reset for now.
    // Prompt says "Exceto por ação administrativa especial".
}

export async function completeRound(roundId: string) {
    const round = await prisma.round.findUnique({
        where: { id: roundId },
        include: { matches: true }
    });

    if (!round) throw new Error("Rodada não encontrada");

    // 1. Check if all games are confirmed
    const unconfirmed = round.matches.filter(m => !m.result);
    if (unconfirmed.length > 0) {
        throw new Error(`Existem ${unconfirmed.length} jogos sem resultado confirmado nesta rodada.`);
    }

    await prisma.$transaction(async (tx) => {
        // 2. Process any remaining PENDING picks (Safety Catch)
        // Matches store results like 'HOME_WIN', 'AWAY_WIN', 'DRAW'
        // We need to map which teams won/lost in this round.
        const winningTeams = new Set<string>();
        for (const m of round.matches) {
            if (m.result === "HOME_WIN") winningTeams.add(m.homeTeam);
            if (m.result === "AWAY_WIN") winningTeams.add(m.awayTeam);
        }

        const pendingPicks = await tx.pick.findMany({
            where: {
                roundId,
                status: "PENDING"
            },
            include: { participation: true }
        });

        for (const pick of pendingPicks) {
            const survived = winningTeams.has(pick.team);
            const status = survived ? "SURVIVED" : "DIED";

            await tx.pick.update({
                where: { id: pick.id },
                data: { status }
            });

            if (status === "DIED") {
                const newErrors = pick.participation.errors + 1;
                let participationStatus = pick.participation.status;
                const maxErrors = pick.participation.repescagemUsed ? 2 : 1;

                if (newErrors >= maxErrors) {
                    participationStatus = "ELIMINATED";
                }

                await tx.participation.update({
                    where: { id: pick.participationId },
                    data: {
                        errors: newErrors,
                        status: participationStatus
                    }
                });
            }
        }

        // 3. Mark Round as Completed
        await tx.round.update({
            where: { id: roundId },
            data: { status: "COMPLETED" }
        });
    });

    await logAdminAction("COMPLETE_ROUND", `Round ${round.number} completed and picks processed.`);
    revalidatePath("/admin/resultados");
    revalidatePath("/admin/results"); // Revalidate both paths
    revalidatePath("/dashboard", "layout");
}
