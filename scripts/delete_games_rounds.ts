import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('--- STARTING DELETION ---')

    await prisma.$transaction(async (tx) => {
        // Delete Picks first (they depend on Rounds and Participations)
        // Actually, user only asked for games and rounds. 
        // Matches and Rounds are what we'll delete.
        // Picks refer to Round and Participation. If we delete Round, we must delete Picks first.

        console.log('Deleting all Picks...')
        const picksCount = await tx.pick.deleteMany({})
        console.log(`Deleted ${picksCount.count} picks.`)

        console.log('Deleting all Matches...')
        const matchesCount = await tx.match.deleteMany({})
        console.log(`Deleted ${matchesCount.count} matches.`)

        console.log('Deleting all Rounds...')
        const roundsCount = await tx.round.deleteMany({})
        console.log(`Deleted ${roundsCount.count} rounds.`)
    })

    console.log('--- DELETION COMPLETED ---')
}

main()
    .catch((e) => {
        console.error('Error during deletion:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
