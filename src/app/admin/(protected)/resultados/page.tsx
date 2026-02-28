import { getRounds, getGamesByRound } from "@/lib/actions/game";
import ResultManager from "./result-manager";

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function ResultsPage(props: PageProps) {
    const searchParams = await props.searchParams;
    const rounds = await getRounds();

    let currentRoundId = searchParams.roundId as string;

    // Default to first round if none selected
    if (!currentRoundId && rounds.length > 0) {
        // Try to find open or locked round (next to be processed)
        // Or just the first one that is NOT completed.
        const activeRound = rounds.find(r => r.status === "OPEN" || r.status === "LOCKED");
        if (activeRound) {
            currentRoundId = activeRound.id;
        } else {
            // If all completed, maybe show the last one? 
            // The prompt says "proxima rodada para eu lançar os resultados".
            // If all are completed, we default to the first one available.
            currentRoundId = rounds[0].id;
        }
    }

    const games = currentRoundId ? await getGamesByRound(currentRoundId) : [];

    return (
        <div className="max-w-5xl mx-auto">
            <ResultManager
                rounds={rounds}
                games={games}
                currentRoundId={currentRoundId}
            />
        </div>
    );
}
