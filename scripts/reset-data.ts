import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("Starting system data reset...");

    const adminEmail = "daniel.acoelho@outlook.com";

    // 1. Verify admin exists
    const admin = await prisma.user.findUnique({
        where: { email: adminEmail }
    });

    if (!admin) {
        console.error(`CRITICAL ERROR: Admin user with email ${adminEmail} not found. Aborting reset to prevent data loss.`);
        process.exit(1);
    }

    console.log(`Found admin: ${admin.name} (${admin.email})`);

    try {
        // 2. Clear dependent tables in order
        console.log("Cleaning up dependent tables...");

        const picksDeleted = await prisma.pick.deleteMany({});
        console.log(`- Deleted ${picksDeleted.count} picks.`);

        const adminLogsDeleted = await prisma.adminLog.deleteMany({
            where: {
                adminId: { not: admin.id }
            }
        });
        console.log(`- Deleted ${adminLogsDeleted.count} admin logs (excluding current admin actions).`);

        const transactionsDeleted = await prisma.transaction.deleteMany({});
        console.log(`- Deleted ${transactionsDeleted.count} transactions.`);

        const participationsDeleted = await prisma.participation.deleteMany({});
        console.log(`- Deleted ${participationsDeleted.count} participations.`);

        const matchesDeleted = await prisma.match.deleteMany({});
        console.log(`- Deleted ${matchesDeleted.count} matches.`);

        const roundsDeleted = await prisma.round.deleteMany({});
        console.log(`- Deleted ${roundsDeleted.count} rounds.`);

        // 3. Delete non-admin users
        const usersDeleted = await prisma.user.deleteMany({
            where: {
                email: { not: adminEmail }
            }
        });
        console.log(`- Deleted ${usersDeleted.count} users (keeping ${adminEmail}).`);

        // 4. Reset group data (prizePool)
        const groupsReset = await prisma.group.updateMany({
            data: {
                prizePool: 0
            }
        });
        console.log(`- Reset ${groupsReset.count} groups (prizePool set to 0).`);

        console.log("\nSystem data reset completed successfully!");
    } catch (error) {
        console.error("An error occurred during the reset process:", error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

main();
