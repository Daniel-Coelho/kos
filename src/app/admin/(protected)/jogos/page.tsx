import { getRounds, getGamesByRound } from "@/lib/actions/game";
import { getClubs } from "@/lib/actions/club";
import GameManager from "./game-manager";

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function GamesPage(props: PageProps) {
    const searchParams = await props.searchParams;
    const rounds = await getRounds();
    const clubs = await getClubs();

    let currentRoundId = searchParams.roundId as string;

    // If no round selected, try to find the first OPEN round, or just the first round.
    if (!currentRoundId && rounds.length > 0) {
        const openRound = rounds.find(r => r.status === "OPEN" || r.status === "SCHEDULED");
        if (openRound) {
            currentRoundId = openRound.id;
        } else {
            currentRoundId = rounds[0].id;
        }
    }

    const games = currentRoundId ? await getGamesByRound(currentRoundId) : [];

    return (
        <div className="max-w-5xl mx-auto px-4 pb-20">
            <GameManager
                rounds={rounds}
                games={games}
                clubs={clubs}
                currentRoundId={currentRoundId}
            />
        </div>
    );
}
