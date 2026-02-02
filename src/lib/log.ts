import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { headers } from "next/headers";

export async function logAdminAction(action: string, details?: string) {
    const session = await getServerSession(authOptions);
    const headersList = await headers();

    // In local dev, IP might be ::1 or 127.0.0.1
    const ip = headersList.get("x-forwarded-for") || "unknown";
    const userAgent = headersList.get("user-agent") || "unknown";

    if (session?.user?.email) {
        // We need user ID. Session should have it.
        // @ts-ignore
        const userId = session.user.id;

        if (userId) {
            await prisma.adminLog.create({
                data: {
                    adminId: userId,
                    action,
                    details,
                    ipAddress: ip,
                    userAgent
                }
            });
        }
    }
}
