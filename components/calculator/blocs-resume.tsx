"use client"

import { cn } from "@/lib/utils"
import { fmt2 } from "@/lib/format"
import { BLOC_TEXT, StatutLabel, type Bloc, type Statut } from "@/components/calculator/ue-card"

export type BlocResume = { code: string; bloc: Bloc; label: string; moyenne: number | null; statut: Statut }

const COLONNES: Record<number, string> = { 3: "sm:grid-cols-3", 4: "sm:grid-cols-4", 5: "sm:grid-cols-5" }

/** Moyennes annuelles des blocs de compétences, une cellule par bloc */
export function BlocsResume({ titre, blocs }: { titre: string; blocs: BlocResume[] }) {
    return (
        <section aria-label={titre}>
            <ul
                className={cn(
                    "grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-hairline bg-hairline",
                    COLONNES[blocs.length],
                    "[&>li:last-child:nth-child(odd)]:col-span-2 sm:[&>li:last-child:nth-child(odd)]:col-span-1"
                )}
            >
                {blocs.map((b) => (
                    <li key={b.code} className="bg-surface px-3 py-2.5" title={b.label}>
                        <p className={cn("num text-caption font-semibold", BLOC_TEXT[b.bloc])}>{b.code}</p>
                        <p className="num mt-0.5 text-lg leading-tight text-ink">{fmt2(b.moyenne)}</p>
                        <p className="num text-caption">
                            <StatutLabel statut={b.statut} align="start" />
                        </p>
                    </li>
                ))}
            </ul>
        </section>
    )
}
