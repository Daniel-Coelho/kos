import { hashPassword } from "@/lib/hash";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const password = searchParams.get("p") || "123456";
    const hash = await hashPassword(password);

    return NextResponse.json({
        password,
        hash,
        instruction: "Copy the 'hash' value and paste it into the 'password' field in Prisma Studio."
    });
}
