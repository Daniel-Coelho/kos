import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const groups = [
        { name: 'Jogo Bronze', entryFee: 10.00, stripePriceId: 'price_1SnKOk9maI1fl5PRkHBIoVaI' },
        { name: 'Jogo Prata', entryFee: 25.00, stripePriceId: 'price_1SnKPS9maI1fl5PR2smOJ5oq' },
        { name: 'Jogo Ouro', entryFee: 50.00, stripePriceId: 'price_1SnKQB9maI1fl5PRULfTPeiT' },
        { name: 'Jogo Diamante', entryFee: 100.00, stripePriceId: 'price_1Sto419maI1fl5PRLvYjorG6' },
        { name: 'Jogo Elite', entryFee: 500.00, stripePriceId: 'price_1Sto4s9maI1fl5PRJb8rgUgI' },
        { name: 'Jogo Lendário', entryFee: 1000.00, stripePriceId: 'price_1Sto5L9maI1fl5PRUNvXyrai' },
    ]

    console.log('Seeding groups with Stripe Price IDs...')

    for (const group of groups) {
        // Upsert to update existing groups with new price IDs
        const existing = await prisma.group.findFirst({
            where: { name: group.name }
        })

        if (!existing) {
            await prisma.group.create({
                data: {
                    name: group.name,
                    entryFee: group.entryFee,
                    stripePriceId: group.stripePriceId,
                    status: 'OPEN'
                }
            })
            console.log(`Created ${group.name}`)
        } else {
            await prisma.group.update({
                where: { id: existing.id },
                data: {
                    stripePriceId: group.stripePriceId,
                    entryFee: group.entryFee // Ensure price matches
                }
            })
            console.log(`Updated ${group.name} with Price ID`)
        }
    }
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
