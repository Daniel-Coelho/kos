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
        // Try to find open or scheduled round closest to now? 
        // Or just the first one. 
        // For results, maybe we want the most recent 'LOCKED' round or active round.
        const openRound = rounds.find(r => r.status === "OPEN" || r.status === "LOCKED");
        if (openRound) {
            currentRoundId = openRound.id;
        } else {
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
