
import { prisma } from "./src/lib/prisma";

async function main() {
    console.log("Checking DB Stats...");

    const userCount = await prisma.user.count();
    const partCount = await prisma.participation.count();
    const pickCount = await prisma.pick.count();

    console.log(`Users: ${userCount}`);
    console.log(`Participations: ${partCount}`);
    console.log(`Picks: ${pickCount}`);

    const distinctPartStatus = await prisma.participation.groupBy({
        by: ['status'],
        _count: true
    });
    console.log("Participation Statuses:", distinctPartStatus);

    const distinctPickStatus = await prisma.pick.groupBy({
        by: ['status'],
        _count: true
    });
    console.log("Pick Statuses:", distinctPickStatus);

    // Check for users who have a DIED pick
    const diedPicks = await prisma.pick.findMany({
        where: { status: 'DIED' },
        include: { participation: true }
    });

    console.log(`Found ${diedPicks.length} DIED picks.`);

    for (const p of diedPicks) {
        console.log(`Pick ${p.id} (DIED) -> Participation ${p.participationId} Status: ${p.participation.status}, Errors: ${p.participation.errors}`);
        if (p.participation.status === 'ALIVE') {
            console.error("  !!! INCONSISTENCY FOUND: DIED Pick but ALIVE Participation !!!");
        }
    }

    // Check for users with errors >= 1 but ALIVE
    const errorAlive = await prisma.participation.findMany({
        where: {
            status: 'ALIVE',
            errors: { gte: 1 }
        }
    });
    console.log(`Found ${errorAlive.length} participations ALIVE with errors >= 1.`);
    for (const p of errorAlive) {
        console.log(`  Part ${p.id}: Errors ${p.errors}, Repescagem: ${p.repescagemUsed}`);
    }

}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
