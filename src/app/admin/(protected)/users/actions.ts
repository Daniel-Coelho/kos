"use server";

import { prisma } from "@/lib/prisma";

export async function getUserDetails(userId: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                participations: {
                    include: { group: true },
                    orderBy: { joinedAt: "desc" },
                },
            },
        });

        // Don't return password or sensitive tokens
        if (user) {
            const { password, resetToken, ...safeUser } = user;
            return safeUser;
        }
        return null;
    } catch (error) {
        console.error(error);
        return null;
    }
}
