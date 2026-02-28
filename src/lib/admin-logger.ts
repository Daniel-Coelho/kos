import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

export async function logAdminAction(action: string, details?: string) {
    try {
        const session = await getServerSession(authOptions);
        const headersList = await headers();
        const ip = headersList.get("x-forwarded-for") || "unknown";

        if (!session?.user?.email) return;

        // Find admin user id
        const admin = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true }
        });

        if (!admin) return;

        await prisma.adminLog.create({
            data: {
                adminId: admin.id,
                action,
                details,
                ipAddress: ip,
                userAgent: headersList.get("user-agent"),
            },
        });
    } catch (error) {
        console.error("Failed to log admin action:", error);
        // Don't throw, logging failure shouldn't block the action
    }
}
