import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const rounds = await prisma.round.findMany({
        orderBy: { number: 'asc' }
    })
    console.log(`Found ${rounds.length} rounds.`)
    rounds.forEach(r => console.log(`ID: ${r.id}, Number: ${r.number}, Status: ${r.status}`))
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
