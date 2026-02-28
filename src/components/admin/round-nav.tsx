"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface RoundNavProps {
    rounds: { id: string; number: number; status: string }[];
    baseUrl?: string;
}

export function RoundNav({ rounds, baseUrl = "/admin/games" }: RoundNavProps) {
    const searchParams = useSearchParams();
    const currentRoundId = searchParams.get("roundId");

    return (
        <div className="flex items-center space-x-2 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-200">
            {rounds.length === 0 && (
                <span className="text-sm text-slate-500 italic">Nenhuma rodada criada.</span>
            )}
            {rounds.map((round) => {
                const isActive = currentRoundId === round.id || (!currentRoundId && round === rounds[0]); // Default to first if none selected
                return (
                    <Link
                        key={round.id}
                        href={`${baseUrl}?roundId=${round.id}`}
                        className={cn(
                            "px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap border",
                            isActive
                                ? "bg-blue-600 text-white border-blue-600"
                                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900"
                        )}
                    >
                        Rodada {round.number}
                    </Link>
                );
            })}
        </div>
    );
}
