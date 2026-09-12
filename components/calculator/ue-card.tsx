"use client"

import { Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { fmt2 } from "@/lib/format"
import { NoteField } from "@/components/calculator/note-field"

export type Bloc = "c1" | "c2" | "c3" | "c4" | "c5"
export type Statut = "acquis" | "compense" | "non-acquis" | "attente"

export type Note = {
    id: string
    label: string
    meta?: string
    coef?: number
    value: number | null
    locked?: boolean
    /** Note de session 2 pronostiquée */
    hypothese?: boolean
    report?: { checked: boolean; enabled: boolean; hint: string }
}

export type UeCardData = {
    bloc: Bloc
    code: string
    titre: string
    moyenne: number | null
    coef: number
    statut: Statut
    notes: Note[]
    cible?: string
    /** Par quoi un statut compensé est compensé, en une ligne */
    compensation?: string
}

const BLOC_LINE: Record<Bloc, string> = {
    c1: "border-l-c1", c2: "border-l-c2", c3: "border-l-c3",
    c4: "border-l-c4", c5: "border-l-c5",
}
export const BLOC_TEXT: Record<Bloc, string> = {
    c1: "text-c1", c2: "text-c2", c3: "text-c3", c4: "text-c4", c5: "text-c5",
}
export const STATUT: Record<Statut, { glyph: string; label: string; cls: string }> = {
    acquis: { glyph: "●", label: "acquis", cls: "text-success" },
    compense: { glyph: "◐", label: "compensé", cls: "text-warning" },
    "non-acquis": { glyph: "○", label: "non acquis", cls: "text-danger" },
    attente: { glyph: "—", label: "en attente", cls: "text-ink-muted" },
}

/** Les quatre libellés sont empilés : le fondu croisé ne change jamais la largeur de la ligne */
export function StatutLabel({ statut, align = "end" }: { statut: Statut; align?: "start" | "end" }) {
    return (
        <span className={cn("inline-grid align-bottom", align === "end" ? "justify-items-end" : "justify-items-start")}>
            {(Object.keys(STATUT) as Statut[]).map((cle) => (
                <span
                    key={cle}
                    aria-hidden={cle !== statut}
                    className={cn(
                        "col-start-1 row-start-1 whitespace-nowrap transition-opacity duration-140 ease-out-ui",
                        STATUT[cle].cls,
                        cle === statut ? "opacity-100" : "opacity-0"
                    )}
                >
                    {STATUT[cle].glyph} {STATUT[cle].label}
                </span>
            ))}
        </span>
    )
}

export function UeCard({
    bloc, code, titre, moyenne, coef, statut, notes, cible, compensation, dense,
    onNoteChange, onReportChange, onAddNote, onEdge,
}: UeCardData & {
    dense?: boolean
    onNoteChange: (id: string, value: number | null) => void
    onReportChange?: (id: string, checked: boolean) => void
    onAddNote?: () => void
    onEdge?: (sens: 1 | -1) => void
}) {
    const titreId = `ue-${code.replace(/\s+/g, "")}`

    return (
        <section
            aria-labelledby={titreId}
            className={cn(
                "overflow-hidden rounded-lg border border-hairline border-l-[3px] bg-surface shadow-raise",
                BLOC_LINE[bloc]
            )}
        >
            <header className="flex items-center justify-between gap-3 border-b border-hairline/70 bg-paper/60 px-3 py-3 sm:px-4">
                <div className="min-w-0">
                    <p className={cn("font-mono text-caption font-semibold uppercase", BLOC_TEXT[bloc])}>
                        {bloc.toUpperCase()} · {code}
                    </p>
                    <h3 id={titreId} className="truncate text-[0.9375rem] font-medium text-ink" title={titre}>{titre}</h3>
                </div>
                <div className="shrink-0 text-right">
                    <p className="num text-[1.375rem] font-medium leading-none text-ink">{fmt2(moyenne)}</p>
                    <p className="num mt-1 text-caption">
                        <StatutLabel statut={statut} /> <span className="text-ink-muted">· coef {coef}</span>
                    </p>
                </div>
            </header>

            <ul className="divide-y divide-hairline/50">
                {notes.map((n) => (
                    <li
                        key={n.id}
                        className={cn(
                            "grid grid-cols-[minmax(0,1fr)_2.25rem_4.75rem] items-center gap-2 px-3 sm:grid-cols-[minmax(0,1fr)_3.5rem_5.5rem] sm:gap-3 sm:px-4",
                            dense ? "py-2" : "py-3"
                        )}
                    >
                        <div className="min-w-0">
                            <label htmlFor={`n-${n.id}`} className="line-clamp-2 text-ui text-ink">{n.label}</label>
                            {n.meta ? <span className="num block truncate text-caption text-ink-muted" title={n.meta}>{n.meta}</span> : null}
                            {n.report ? (
                                <label className={cn("mt-1 flex items-center gap-1.5 text-caption", n.report.enabled ? "cursor-pointer text-ink-soft" : "text-ink-muted")}>
                                    <input
                                        type="checkbox"
                                        checked={n.report.checked}
                                        disabled={!n.report.enabled}
                                        onChange={(e) => onReportChange?.(n.id, e.target.checked)}
                                        className="size-3.5 accent-primary"
                                    />
                                    {n.report.hint}
                                </label>
                            ) : null}
                        </div>
                        <span className="num text-right text-caption text-ink-muted">{n.coef != null ? `×${n.coef}` : ""}</span>
                        <NoteField
                            id={n.id}
                            label={n.label}
                            value={n.value}
                            disabled={n.locked}
                            hypothese={n.hypothese}
                            onCommit={(value) => onNoteChange(n.id, value)}
                            onEdge={onEdge}
                        />
                    </li>
                ))}
            </ul>

            {onAddNote || cible || compensation ? (
                <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-hairline/50 bg-paper/60 px-3 py-3 sm:px-4">
                    {onAddNote ? (
                        <button
                            type="button"
                            onClick={onAddNote}
                            className="num flex items-center gap-1.5 rounded-sm border border-dashed border-hairline-strong px-2.5 py-1.5 text-caption text-primary transition-colors duration-100 hover:border-primary"
                        >
                            <Plus className="size-3.5" aria-hidden /> ajouter une note
                        </button>
                    ) : null}
                    {compensation ? <p className="num text-caption text-warning">◐ {compensation}</p> : null}
                    {cible ? <p className="num text-caption text-ink-muted">{cible}</p> : null}
                </footer>
            ) : null}
        </section>
    )
}
