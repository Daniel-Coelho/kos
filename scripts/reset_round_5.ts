import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log("--- Resetting Round 5 ---")

    // 1. Find Round 5
    const round = await prisma.round.findFirst({
        where: { number: 5 }
    })

    if (!round) {
        console.error("Round 5 not found")
        process.exit(1)
    }

    console.log(`Found Round 5 (ID: ${round.id}, Status: ${round.status})`)

    // 2. Find all picks for this round
    const picks = await prisma.pick.findMany({
        where: { roundId: round.id },
        include: { participation: true }
    })

    console.log(`Processing ${picks.length} picks...`)

    // 3. Revert participation errors and status ONLY if they were caused by this round's DIED status
    // Optimization: Since we want to reset the WHOLE round to a "pre-calculation" state, 
    // we should subtract 1 point from errors for every user who has status = DIED in this round.
    // If status becomes ALIVE again, we update it.

    for (const pick of picks) {
        if (pick.status === "DIED") {
            const currentErrors = pick.participation.errors;
            const newErrors = Math.max(0, currentErrors - 1);

            // If they were eliminated and we remove an error, check if they should be alive
            let newStatus = pick.participation.status;
            if (pick.participation.status === "ELIMINATED") {
                const maxErrors = pick.participation.repescagemUsed ? 2 : 1;
                if (newErrors < maxErrors) {
                    newStatus = "ALIVE";
                }
            }

            console.log(`Reverting User ${pick.participation.userId}: Errors ${currentErrors} -> ${newErrors}, Status ${pick.participation.status} -> ${newStatus}`)

            await prisma.participation.update({
                where: { id: pick.participationId },
                data: {
                    errors: newErrors,
                    status: newStatus
                }
            })
        }

        // Reset the Pick itself
        await prisma.pick.update({
            where: { id: pick.id },
            data: { status: "PENDING" }
        })
    }

    // 4. Reset Match scores and results
    const matchUpdate = await prisma.match.updateMany({
        where: { roundId: round.id },
        data: {
            homeScore: null,
            awayScore: null,
            result: null
        }
    })
    console.log(`Reset ${matchUpdate.count} matches.`)

    // 5. Reset Round status
    await prisma.round.update({
        where: { id: round.id },
        data: { status: "LOCKED" } // or OPEN if deadline hasn't passed, but LOCKED is safer to allow results to be entered again
    })
    console.log("Round 5 status reset to LOCKED.")

    console.log("--- Reset Complete ---")
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
