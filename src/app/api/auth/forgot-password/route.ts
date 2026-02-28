import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: "Email é obrigatório" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            // We return success even if user not found for security (don't leak emails)
            return NextResponse.json({ message: "Se o email existir, um link de recuperação será enviado." });
        }

        const token = crypto.randomBytes(32).toString("hex");
        const expiry = new Date(Date.now() + 3600000); // 1 hour from now

        await prisma.user.update({
            where: { id: user.id },
            data: {
                resetToken: token,
                resetTokenExpiry: expiry,
            },
        });

        const resetLink = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/reset-password?token=${token}`;

        // Simulating email sending by logging to console
        console.log("-----------------------------------------");
        console.log(`RESET PASSWORD LINK FOR: ${email}`);
        console.log(resetLink);
        console.log("-----------------------------------------");

        return NextResponse.json({ message: "Se o email existir, um link de recuperação será enviado." });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
