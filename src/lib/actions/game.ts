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
    await prisma.round.update({
        where: { id },
        data: { status }
    });
    await logAdminAction("UPDATE_ROUND_STATUS", `Round ${id} status: ${status}`);
    revalidatePath("/admin/jogos");
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

    // Get club names for legacy support/denormalization if needed, but schema uses relation too
    // Schema has homeTeam, awayTeam as string, AND relations.
    // We should populate strings with names for easy display if relation fails (but relation is safer)
    // The schema says homeTeam String, awayTeam String.

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
