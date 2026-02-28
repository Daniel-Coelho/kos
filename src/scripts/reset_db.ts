
import { prisma } from "../lib/prisma";

async function main() {
    console.log("⚠️ STARTING DATABASE RESET...");
    console.log("This will delete all game data but PRESERVE Admins.");

    try {
        // 1. Delete Picks (Most dependent)
        console.log("Deleting Picks...");
        await prisma.pick.deleteMany({});

        // 2. Delete Matches
        console.log("Deleting Matches...");
        await prisma.match.deleteMany({});

        // 3. Delete Rounds
        console.log("Deleting Rounds...");
        await prisma.round.deleteMany({});

        // 4. Delete Participations
        console.log("Deleting Participations...");
        await prisma.participation.deleteMany({});

        // 5. Delete Transactions
        console.log("Deleting Transactions...");
        await prisma.transaction.deleteMany({});

        // 6. Delete Groups
        console.log("Deleting Groups...");
        await prisma.group.deleteMany({});

        // 7. Delete Non-Admin Users
        console.log("Deleting Non-Admin Users...");
        const deletedUsers = await prisma.user.deleteMany({
            where: {
                role: {
                    not: "ADMIN"
                }
            }
        });
        console.log(`Deleted ${deletedUsers.count} users.`);

        // 8. Delete Clubs (Optional, but maybe good to keep? User prompt said "start tests from zero", usually implies logic data. Clubs are static data.)
        // Decision: Keep Clubs as they are setup data, not game-flow data usually.
        // If specific request to delete clubs, uncomment:
        // await prisma.club.deleteMany({}); 

        console.log("✅ DATABASE RESET COMPLETE. Admins preserved.");

    } catch (error) {
        console.error("❌ Error resetting database:", error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
