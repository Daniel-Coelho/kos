"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { logAdminAction } from "@/lib/log";

// --- ROUNDS ---

export async function getRounds() {
    return await prisma.round.findMany({
        orderBy: { number: "asc" }
    });
}

export async function createRound(number: number, deadline: string) {
    await prisma.round.create({
        data: {
            number,
            deadline: new Date(deadline),
        }
    });
    await logAdminAction("CREATE_ROUND", `Created round ${number}`);
    revalidatePath("/admin/jogos");
}

export async function updateRoundStatus(id: string, status: string) {
    await prisma.$transaction(async (tx) => {
        // 1. Update status
        await tx.round.update({
            where: { id },
            data: { status }
        });

        // 2. If locking, eliminate those who didn't pick
        if (status === "LOCKED") {
            const round = await tx.round.findUnique({ where: { id } });
            if (!round) return;

            const participations = await tx.participation.findMany({
                where: {
                    status: "ALIVE",
                    joinedAt: { lt: round.deadline } // Only those who joined BEFORE the deadline
                },
                include: {
                    picks: {
                        where: { roundId: id }
                    }
                }
            });

            for (const p of participations) {
                if (p.picks.length === 0) {
                    // No pick found for this round -> Automatic elimination
                    await tx.participation.update({
                        where: { id: p.id },
                        data: {
                            status: "ELIMINATED",
                            errors: { increment: 1 }
                        }
                    });

                    // Create a "failed" pick record to show in history
                    await tx.pick.create({
                        data: {
                            participationId: p.id,
                            roundId: id,
                            team: "PRAZO ENCERRADO",
                            status: "DIED"
                        }
                    });
                }
            }
        }
    });

    await logAdminAction("UPDATE_ROUND_STATUS", `Round ${id} status: ${status}`);
    revalidatePath("/admin/jogos");
    revalidatePath("/dashboard", "layout");
}

// --- GAMES ---

export async function getGamesByRound(roundId: string) {
    return await prisma.match.findMany({
        where: { roundId },
        include: {
            homeClub: true,
            awayClub: true
        },
        orderBy: { startTime: "asc" }
    });
}

export async function createGame(formData: FormData) {
    const roundId = formData.get("roundId") as string;
    const homeClubId = formData.get("homeClubId") as string;
    const awayClubId = formData.get("awayClubId") as string;
    const startTime = formData.get("startTime") as string; // ISO string

    if (homeClubId === awayClubId) {
        throw new Error("Times devem ser diferentes");
    }

    const homeClub = await prisma.club.findUnique({ where: { id: homeClubId } });
    const awayClub = await prisma.club.findUnique({ where: { id: awayClubId } });

    if (!homeClub || !awayClub) throw new Error("Clube não encontrado");

    await prisma.match.create({
        data: {
            roundId,
            homeClubId,
            awayClubId,
            homeTeam: homeClub.name,
            awayTeam: awayClub.name,
            startTime: new Date(startTime),
        }
    });

    await logAdminAction("CREATE_GAME", `Created game ${homeClub.name} vs ${awayClub.name}`);
    revalidatePath("/admin/jogos");
}

export async function updateGame(id: string, formData: FormData) {
    const homeClubId = formData.get("homeClubId") as string;
    const awayClubId = formData.get("awayClubId") as string;
    const startTime = formData.get("startTime") as string;

    const homeClub = await prisma.club.findUnique({ where: { id: homeClubId } });
    const awayClub = await prisma.club.findUnique({ where: { id: awayClubId } });

    if (!homeClub || !awayClub) throw new Error("Clube não encontrado");

    await prisma.match.update({
        where: { id },
        data: {
            homeClubId,
            awayClubId,
            homeTeam: homeClub.name,
            awayTeam: awayClub.name,
            startTime: new Date(startTime),
        }
    });
    await logAdminAction("UPDATE_GAME", `Updated game ${id}`);
    revalidatePath("/admin/jogos");
}

export async function deleteGame(id: string) {
    await prisma.match.delete({ where: { id } });
    await logAdminAction("DELETE_GAME", `Deleted game ${id}`);
    revalidatePath("/admin/jogos");
}

// --- PLAYER ACTIONS ---

export async function makePick(participationId: string, roundId: string, team: string) {
    // 1. Verify Participation
    const participation = await prisma.participation.findUnique({
        where: { id: participationId },
        include: { picks: true }
    });

    if (!participation) throw new Error("Participação não encontrada.");

    // Check if user is ALIVE
    if (participation.status !== "ALIVE") {
        throw new Error("Você está eliminado deste jogo.");
    }

    // Double Check: Verify errors vs Repescagem
    const maxErrors = participation.repescagemUsed ? 2 : 1;
    if (participation.errors >= maxErrors) {
        throw new Error("Você não pode fazer palpites pois atingiu o limite de erros.");
    }

    // 2. Verify Round
    const round = await prisma.round.findUnique({
        where: { id: roundId }
    });

    if (!round) throw new Error("Rodada não encontrada.");

    if (round.status === "LOCKED" || round.status === "COMPLETED") {
        throw new Error("Rodada encerrada para palpites.");
    }

    if (new Date() > new Date(round.deadline)) {
        throw new Error("Prazo para palpites encerrado.");
    }

    // 3. Survivor Rule: Cannot repeat teams
    // Excluding the current pick if we are updating (though logic below handles upsert)
    // Actually, we must check if the team was picked in ANY OTHER round.
    const alreadyPicked = participation.picks.some(p => p.team === team && p.roundId !== roundId);

    if (alreadyPicked) {
        throw new Error(`Você já escolheu o time ${team} em uma rodada anterior.`);
    }

    // 4. Save Pick (Upsert)
    await prisma.pick.upsert({
        where: {
            participationId_roundId: {
                participationId,
                roundId
            }
        },
        update: {
            team: team,
            createdAt: new Date() // Update timestamp
        },
        create: {
            participationId,
            roundId,
            team,
            status: "PENDING"
        }
    });

    revalidatePath(`/dashboard/game/${participationId}`);
}
