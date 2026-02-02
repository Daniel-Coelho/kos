import { getClubs } from "@/lib/actions/club";
import ClubManager from "./club-manager";

export default async function ClubsPage() {
    const clubs = await getClubs();

    return (
        <div className="max-w-4xl mx-auto">
            <ClubManager initialClubs={clubs} />
        </div>
    );
}
