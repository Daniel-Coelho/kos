"use server";

import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/hash";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

type SessionUser = {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
};

export async function getUserProfile() {
    const session = await getServerSession(authOptions);

    const userId = (session?.user as SessionUser | undefined)?.id;

    if (!userId) {
        throw new Error("Não autorizado");
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            name: true,
            email: true,
            cpf: true,
            nickname: true,
            phone: true,
            role: true,
        },
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

    const userId = (session?.user as SessionUser | undefined)?.id;

    if (!userId) {
        throw new Error("Não autorizado");
    }

    const updateData: {
        name: string;
        nickname: string;
        phone: string;
        password?: string;
    } = {
        name: formData.name,
        nickname: formData.nickname,
        phone: formData.phone,
    };

    if (formData.password && formData.password.trim() !== "") {
        updateData.password = await hashPassword(formData.password);
    }

    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData,
    });

    revalidatePath("/profile");
    revalidatePath("/dashboard");

    return { success: true, user: updatedUser };
}