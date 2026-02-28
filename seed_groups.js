const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const groups = [
    {
        name: "Jogo Bronze",
        entryFee: 10.00,
        stripePriceId: "price_mock_bronze", // Placeholder
        status: "OPEN"
    },
    {
        name: "Jogo Prata",
        entryFee: 25.00,
        stripePriceId: "price_mock_prata",
        status: "OPEN"
    },
    {
        name: "Jogo Ouro",
        entryFee: 50.00,
        stripePriceId: "price_mock_ouro",
        status: "OPEN"
    },
];

async function main() {
    console.log('Seeding groups...');
    for (const group of groups) {
        const existing = await prisma.group.findFirst({
            where: { name: group.name }
        });

        if (!existing) {
            const created = await prisma.group.create({
                data: group
            });
            console.log(`Created group: ${created.name}`);
        } else {
            console.log(`Group already exists: ${existing.name}`);
            // Update price/stripeId if needed
            await prisma.group.update({
                where: { id: existing.id },
                data: {
                    entryFee: group.entryFee,
                    stripePriceId: group.stripePriceId
                }
            });
        }
    }
    console.log('Seeding completed.');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
