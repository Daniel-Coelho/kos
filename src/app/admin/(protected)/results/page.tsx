import { prisma } from "@/lib/prisma";
import { RoundNav } from "@/components/admin/round-nav";
import { ResultsView } from "./results-view";

interface ResultsPageProps {
    searchParams: {
        roundId?: string;
    };
}

export default async function ResultsPage({ searchParams }: ResultsPageProps) {
    const { roundId } = await searchParams;

    const rounds = await prisma.round.findMany({
        orderBy: { number: "asc" },
    });

    // Default to the first round that is NOT completed, or the first round if all are completed or none exist.
    const defaultRound = rounds.find(r => r.status !== "COMPLETED") || rounds[0];

    const selectedRound = roundId
        ? rounds.find((r) => r.id === roundId)
        : defaultRound;

    const matches = selectedRound
        ? await prisma.match.findMany({
            where: { roundId: selectedRound.id },
            orderBy: { startTime: "asc" },
            include: {
                homeClub: true,
                awayClub: true,
            },
        })
        : [];

    return (
        <div className="space-y-6">
            {/* Use RoundNav here to keep navigation consistent */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                <RoundNav rounds={rounds} baseUrl="/admin/results" />
            </div>

            <ResultsView
                round={selectedRound}
                matches={matches}
                rounds={rounds}
            />
        </div>
    );
}
