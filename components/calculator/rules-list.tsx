"use client"

import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { BLOC_TEXT, type Bloc } from "@/components/calculator/ue-card"

export type Regle = { icon: LucideIcon; texte: ReactNode }

export function RulesList({ titre, regles, legende, note }: {
    titre: string
    regles: Regle[]
    legende: { code: string; label: string; bloc: Bloc }[]
    note?: string
}) {
    return (
        <section aria-labelledby="regles-titre" className="overflow-hidden rounded-lg border border-hairline bg-surface shadow-raise">
            <header className="border-b border-hairline bg-paper/60 px-5 py-4">
                <p className="num text-caption uppercase tracking-[0.14em] text-ink-muted">Règles</p>
                <h2 id="regles-titre" className="mt-1 font-display text-h3 text-ink">{titre}</h2>
            </header>
            <ul className="divide-y divide-hairline/60">
                {regles.map((regle, i) => (
                    <li key={i} className="flex gap-3 px-5 py-3.5">
                        <regle.icon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                        <p className="text-body text-ink-soft [&_strong]:font-medium [&_strong]:text-ink">{regle.texte}</p>
                    </li>
                ))}
            </ul>
            <div className="border-t border-hairline px-5 py-4">
                <p className="num mb-3 text-caption uppercase tracking-[0.14em] text-ink-muted">Blocs de compétences</p>
                <ul className="space-y-1.5">
                    {legende.map((entree) => (
                        <li key={entree.code} className="flex items-baseline gap-3 text-ui text-ink-soft">
                            <span className={cn("num w-10 shrink-0 font-semibold", BLOC_TEXT[entree.bloc])}>{entree.code}</span>
                            {entree.label}
                        </li>
                    ))}
                </ul>
                {note && <p className="mt-4 text-caption text-ink-muted">{note}</p>}
            </div>
        </section>
    )
}
