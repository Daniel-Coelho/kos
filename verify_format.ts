import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const rawCpf = "98765432109";
    const formattedCpf = "987.654.321-09";

    console.log("Cleaning up previous test user...");
    await prisma.user.deleteMany({
        where: {
            OR: [
                { email: "format_test@example.com" },
                { cpf: formattedCpf }
            ]
        }
    });

    console.log("Simulating API call with raw CPF:", rawCpf);

    let cpfToSave = rawCpf;
    const cleanCpf = rawCpf.replace(/\D/g, "");
    if (cleanCpf.length === 11) {
        cpfToSave = cleanCpf.replace(
            /(\d{3})(\d{3})(\d{3})(\d{2})/,
            "$1.$2.$3-$4"
        );
    }

    console.log("CPF to be saved:", cpfToSave);

    try {
        const user = await prisma.user.create({
            data: {
                name: "Format Test User",
                email: "format_test@example.com",
                cpf: cpfToSave,
                nickname: "format_test",
                phone: "11999999997",
                password: "hashed_password"
            }
        });

        if (user.cpf === formattedCpf) {
            console.log("✅ CPF stored correctly in formatted style:", user.cpf);
        } else {
            console.log("❌ CPF stored incorrectly:", user.cpf);
        }
    } catch (e) {
        if (e instanceof Error) {
            console.error("❌ Registration failed:", e.message);
        } else {
            console.error("❌ Registration failed:", e);
        }
    } finally {
        await prisma.$disconnect();
    }
}

main();