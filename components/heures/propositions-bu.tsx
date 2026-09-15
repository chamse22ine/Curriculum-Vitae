"use client"

import { useEffect, useRef } from "react"
import { BookOpen, Check, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { fmtHeures, fmtHoraire, libelleJourAbrege } from "@/lib/heures"
import type { PropositionBu } from "@/lib/bu"

const BOUTON = "inline-flex h-8 items-center gap-1.5 rounded-md border px-2.5 text-caption font-medium transition-colors duration-100 ease-out-ui"

/** Liste des horaires conseillés pour la BU, en regard des pointillés du calendrier */
export function PropositionsBu({ propositions, message, selection, onAccepter, onRefuser, onVoir, onFermer }: {
    propositions: PropositionBu[]
    message: string
    /** Proposition touchée dans le calendrier */
    selection: string | null
    onAccepter: (ids: string[]) => void
    onRefuser: (ids: string[]) => void
    onVoir: (date: Date) => void
    onFermer: () => void
}) {
    const liste = useRef<HTMLUListElement>(null)
    const tous = propositions.map((p) => p.id)

    useEffect(() => {
        if (!selection) return
        liste.current?.querySelector<HTMLElement>(`[data-proposition="${CSS.escape(selection)}"]`)?.scrollIntoView({ block: "nearest", behavior: "smooth" })
    }, [selection])

    return (
        <section aria-label="Horaires conseillés pour la BU" className="rounded-lg border border-dashed border-c5 bg-surface p-3 shadow-raise sm:p-4">
            <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
                <div className="min-w-0">
                    <p className="flex items-center gap-2 text-ui font-medium text-ink">
                        <BookOpen className="size-4 shrink-0 text-c5" aria-hidden />
                        Horaires conseillés pour la BU
                    </p>
                    <p aria-live="polite" className="mt-0.5 text-caption text-ink-muted">{message}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                    {propositions.length > 1 && (
                        <button type="button" onClick={() => onAccepter(tous)} className={cn(BOUTON, "border-success-line bg-success-wash text-success hover:border-success")}>
                            <Check className="size-3.5" aria-hidden />
                            Tout accepter
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={propositions.length > 0 ? () => onRefuser(tous) : onFermer}
                        className={cn(BOUTON, "border-hairline text-ink-soft hover:bg-surface-sunk hover:text-ink")}
                    >
                        <X className="size-3.5" aria-hidden />
                        {propositions.length > 1 ? "Tout refuser" : "Fermer"}
                    </button>
                </div>
            </div>

            {propositions.length > 0 && (
                <ul ref={liste} className="mt-3 max-h-64 divide-y divide-hairline overflow-y-auto rounded-md border border-hairline">
                    {propositions.map((p) => {
                        const duree = fmtHeures((p.end.getTime() - p.start.getTime()) / 3_600_000)
                        return (
                            <li
                                key={p.id}
                                data-proposition={p.id}
                                className={cn("flex flex-wrap items-center gap-x-3 gap-y-1.5 px-3 py-2 transition-colors duration-220 ease-out-ui", selection === p.id && "bg-accent-wash")}
                            >
                                <span className="size-3 shrink-0 rounded-sm border-2 border-dashed border-c5" aria-hidden />
                                <button type="button" onClick={() => onVoir(p.start)} className="text-ui text-ink underline-offset-2 first-letter:uppercase hover:underline">
                                    {libelleJourAbrege(p.start)}
                                </button>
                                <span className="num text-ui text-ink-soft">
                                    {fmtHoraire(p.start)}–{fmtHoraire(p.end)} · {duree}
                                </span>
                                <span className="ml-auto flex gap-1.5">
                                    <button
                                        type="button"
                                        onClick={() => onAccepter([p.id])}
                                        aria-label={`Accepter ${libelleJourAbrege(p.start)} ${fmtHoraire(p.start)}–${fmtHoraire(p.end)}`}
                                        className={cn(BOUTON, "border-success-line bg-success-wash text-success hover:border-success")}
                                    >
                                        <Check className="size-3.5" aria-hidden />
                                        Accepter
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onRefuser([p.id])}
                                        aria-label={`Refuser ${libelleJourAbrege(p.start)} ${fmtHoraire(p.start)}–${fmtHoraire(p.end)}`}
                                        className={cn(BOUTON, "border-hairline text-ink-soft hover:bg-surface-sunk hover:text-ink")}
                                    >
                                        <X className="size-3.5" aria-hidden />
                                        Refuser
                                    </button>
                                </span>
                            </li>
                        )
                    })}
                </ul>
            )}
        </section>
    )
}
