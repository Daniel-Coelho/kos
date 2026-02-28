"use server";

import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/hash";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getUserProfile() {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    if (!session?.user?.id) {
        throw new Error("Não autorizado");
    }

    const user = await prisma.user.findUnique({
        // @ts-ignore
        where: { id: session.user.id },
        select: {
            id: true,
            name: true,
            email: true,
            cpf: true,
            nickname: true,
            phone: true,
            role: true,
        }
    });

    return user;
}

export async function updateUserProfile(formData: {
    name: string;
    nickname: string;
    phone: string;
    password?: string;
}) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        throw new Error("Não autorizado");
    }

    const updateData: any = {
        name: formData.name,
        nickname: formData.nickname,
        phone: formData.phone,
    };

    if (formData.password && formData.password.trim() !== "") {
        updateData.password = await hashPassword(formData.password);
    }

    const updatedUser = await prisma.user.update({
        // @ts-ignore
        where: { id: session.user.id },
        data: updateData,
    });

    revalidatePath("/profile");
    revalidatePath("/dashboard");

    return { success: true, user: updatedUser };
}
