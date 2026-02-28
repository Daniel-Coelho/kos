import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import z from "zod";
import { hashPassword } from "@/lib/hash";

const registerSchema = z.object({
    name: z.string().min(3),
    email: z.string().email(),
    cpf: z.string().regex(/^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/, "CPF inválido"),
    nickname: z.string().min(3),
    phone: z.string().min(10),
    favoriteTeam: z.string().optional(), // Mapping to a field or just storing it if we add it to schema
    password: z.string().min(6), // Note: We need to hash this!
});

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Format CPF if it's just numbers
        if (body.cpf && typeof body.cpf === 'string') {
            const cleanCpf = body.cpf.replace(/\D/g, "");
            if (cleanCpf.length === 11) {
                body.cpf = cleanCpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
            }
        }

        // --- ROUND 9 LIMIT ---
        const round9 = await prisma.round.findFirst({ where: { number: 9 } });
        if (round9 && (round9.status === "LOCKED" || round9.status === "COMPLETED")) {
            return NextResponse.json(
                { error: "As inscrições para este campeonato estão encerradas (Prazo: Rodada 9)." },
                { status: 403 }
            );
        }
        // ---------------------

        const result = registerSchema.safeParse(body);

        if (!result.success) {
            // Use flatten().fieldErrors for cleaner error object structure
            return NextResponse.json(
                { error: "Dados inválidos", details: result.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const { name, email, cpf, nickname, phone, password } = result.data;

        // Check if user exists
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [{ email }, { cpf }, { nickname }],
            },
        });

        if (existingUser) {
            let field = "";
            if (existingUser.email === email) field = "Email";
            if (existingUser.cpf === cpf) field = "CPF";
            if (existingUser.nickname === nickname) field = "Apelido";
            return NextResponse.json({ error: `${field} já cadastrado.` }, { status: 409 });
        }

        // Create user
        const hashedPassword = await hashPassword(password);
        const user = await prisma.user.create({
            data: {
                name,
                email,
                cpf,
                nickname,
                phone,
                password: hashedPassword,
            }
        });

        return NextResponse.json({ message: "Usuário criado com sucesso!" }, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Erro interno no servidor" },
            { status: 500 }
        );
    }
}
