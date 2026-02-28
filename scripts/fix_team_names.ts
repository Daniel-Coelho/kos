
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Starting team name fix...')

    // Fix homeTeam
    const homeUpdates = await prisma.match.updateMany({
        where: { homeTeam: 'Iternacional' },
        data: { homeTeam: 'Internacional' }
    })
    console.log(`Updated ${homeUpdates.count} matches where homeTeam was "Iternacional"`)

    // Fix awayTeam
    const awayUpdates = await prisma.match.updateMany({
        where: { awayTeam: 'Iternacional' },
        data: { awayTeam: 'Internacional' }
    })
    console.log(`Updated ${awayUpdates.count} matches where awayTeam was "Iternacional"`)

    // Fix Club name
    const clubUpdates = await prisma.club.updateMany({
        where: { name: 'Iternacional' },
        data: { name: 'Internacional' }
    })
    console.log(`Updated ${clubUpdates.count} clubs where name was "Iternacional"`)

    // Fix picks if any (just in case users already picked the typo version)
    const pickUpdates = await prisma.pick.updateMany({
        where: { team: 'Iternacional' },
        data: { team: 'Internacional' }
    })
    console.log(`Updated ${pickUpdates.count} picks where team was "Iternacional"`)

    console.log('Fix complete.')
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
