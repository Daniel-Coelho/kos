"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { logAdminAction } from "@/lib/log";

export async function createClub(formData: FormData) {
    const name = formData.get("name") as string;
    const shortName = formData.get("shortName") as string;
    const logoUrl = formData.get("logoUrl") as string;

    if (!name) throw new Error("Nome é obrigatório");

    await prisma.club.create({
        data: {
            name,
            shortName,
            logoUrl
        }
    });

    await logAdminAction("CREATE_CLUB", `Created club: ${name}`);
    revalidatePath("/admin/clubes");
}

export async function updateClub(id: string, formData: FormData) {
    const name = formData.get("name") as string;
    const shortName = formData.get("shortName") as string;
    const logoUrl = formData.get("logoUrl") as string;

    await prisma.club.update({
        where: { id },
        data: {
            name,
            shortName,
            logoUrl
        }
    });

    await logAdminAction("UPDATE_CLUB", `Updated club ${id}: ${name}`);
    revalidatePath("/admin/clubes");
}

export async function deleteClub(id: string) {
    // Check constraints later (if used in matches)
    await prisma.club.delete({
        where: { id }
    });
    await logAdminAction("DELETE_CLUB", `Deleted club ${id}`);
    revalidatePath("/admin/clubes");
}

export async function getClubs() {
    return await prisma.club.findMany({
        orderBy: { name: "asc" }
    });
}
