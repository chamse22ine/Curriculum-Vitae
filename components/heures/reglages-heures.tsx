"use client"

import { useId, useState, type ReactNode } from "react"
import { ChevronDown, SlidersHorizontal } from "lucide-react"
import { LABEL } from "@/components/heures/bilan-heures"
import { fmtSaisie } from "@/lib/format"
import { cn } from "@/lib/utils"
import { fmtHeures, parseDuree, type Reglages } from "@/lib/heures"

const CHAMP = cn(
    "num mt-1.5 h-10 w-full rounded-sm border border-hairline bg-surface-sunk px-2.5 text-base text-ink transition-colors duration-100 ease-out-ui",
    "focus:border-accent focus:bg-surface focus:outline-none focus:ring-2 focus:ring-accent/25",
    "aria-invalid:border-danger aria-invalid:ring-2 aria-invalid:ring-danger/30"
)

type Lecture = { valide: true; valeur: number | null } | { valide: false }

/** Champ numérique qui garde la frappe en cours et ne remonte que les valeurs valides */
function ChampNombre({ label, aide, valeur, placeholder, min, max, entier = false, onCommit, onVider }: {
    label: string
    aide?: ReactNode
    valeur: number | null
    placeholder?: string
    min: number
    max: number
    entier?: boolean
    onCommit: (valeur: number) => void
    /** Fourni si le champ peut rester vide */
    onVider?: () => void
}) {
    const id = useId()
    const [texte, setTexte] = useState(() => fmtSaisie(valeur))
    const [invalide, setInvalide] = useState(false)
    const [valeurVue, setValeurVue] = useState(valeur)

    const lire = (brut: string): Lecture => {
        if (brut.trim() === "") return onVider ? { valide: true, valeur: null } : { valide: false }
        const nombre = parseDuree(brut)
        if (nombre === null || nombre < min || nombre > max || (entier && !Number.isInteger(nombre))) return { valide: false }
        return { valide: true, valeur: nombre }
    }

    // Valeur changée ailleurs (autre mois, retour à la suggestion) : on réaligne le texte sans écraser une frappe équivalente
    if (valeur !== valeurVue) {
        setValeurVue(valeur)
        const lecture = lire(texte)
        if (!lecture.valide || lecture.valeur !== valeur) {
            setTexte(fmtSaisie(valeur))
            setInvalide(false)
        }
    }

    return (
        <div>
            <label htmlFor={id} className={LABEL}>{label}</label>
            <input
                id={id}
                inputMode={entier ? "numeric" : "decimal"}
                autoComplete="off"
                value={texte}
                placeholder={placeholder}
                aria-invalid={invalide || undefined}
                aria-describedby={aide ? `${id}-aide` : undefined}
                onChange={(e) => {
                    const brut = e.target.value
                    const lecture = lire(brut)
                    setTexte(brut)
                    setInvalide(!lecture.valide)
                    if (!lecture.valide) return
                    if (lecture.valeur === null) onVider?.()
                    else onCommit(lecture.valeur)
                }}
                onBlur={() => {
                    const lecture = lire(texte)
                    setTexte(fmtSaisie(lecture.valide ? lecture.valeur : valeur))
                    setInvalide(false)
                }}
                className={CHAMP}
            />
            {aide && <p id={`${id}-aide`} className="mt-1.5 text-caption text-ink-muted">{aide}</p>}
        </div>
    )
}

export function ReglagesHeures({ reglages, mois, libelleMois, joursSuggeres, normeJournaliere, onChange }: {
    reglages: Reglages
    /** YYYY-MM du mois affiché */
    mois: string
    libelleMois: string
    joursSuggeres: number
    normeJournaliere: number
    onChange: (maj: (r: Reglages) => Reglages) => void
}) {
    const override = reglages.joursTravailles[mois] ?? null
    const joursTravailles = override ?? joursSuggeres

    const suivreSuggestion = () =>
        onChange((r) => {
            const { [mois]: _retire, ...autres } = r.joursTravailles
            return { ...r, joursTravailles: autres }
        })

    return (
        <details className="group rounded-lg border border-hairline bg-surface shadow-raise">
            <summary className="flex h-12 cursor-pointer list-none items-center gap-3 rounded-lg px-4 text-ui text-ink-soft transition-colors duration-100 ease-out-ui hover:text-ink [&::-webkit-details-marker]:hidden">
                <SlidersHorizontal className="size-4 shrink-0" aria-hidden />
                <span className="flex-1">Réglages</span>
                <span className="num truncate text-caption text-ink-muted">
                    {fmtHeures(reglages.heuresHebdo)}/sem. · {joursTravailles} j × {fmtHeures(normeJournaliere)}
                </span>
                <ChevronDown className="size-4 shrink-0 transition-transform duration-100 ease-out-ui group-open:rotate-180" aria-hidden />
            </summary>
            <div className="grid gap-4 border-t border-hairline p-4 sm:grid-cols-3">
                <ChampNombre
                    label="Heures / semaine"
                    valeur={reglages.heuresHebdo}
                    min={1}
                    max={60}
                    onCommit={(heuresHebdo) => onChange((r) => ({ ...r, heuresHebdo }))}
                />
                <ChampNombre
                    label="Jours / semaine"
                    valeur={reglages.joursParSemaine}
                    min={1}
                    max={7}
                    entier
                    aide={`Soit ${fmtHeures(normeJournaliere)} par jour.`}
                    onCommit={(joursParSemaine) => onChange((r) => ({ ...r, joursParSemaine }))}
                />
                <ChampNombre
                    key={mois}
                    label={`Jours travaillés (${libelleMois})`}
                    valeur={override}
                    placeholder={String(joursSuggeres)}
                    min={1}
                    max={31}
                    entier
                    aide={
                        override === null ? (
                            `Suggestion : ${joursSuggeres} jours ouvrés, week-ends exclus. Retire fériés et congés à la main.`
                        ) : (
                            <>
                                Corrigé à la main.{" "}
                                <button type="button" onClick={suivreSuggestion} className="text-accent underline-offset-2 hover:underline">
                                    Revenir à {joursSuggeres}
                                </button>
                            </>
                        )
                    }
                    onCommit={(jours) => onChange((r) => ({ ...r, joursTravailles: { ...r.joursTravailles, [mois]: jours } }))}
                    onVider={suivreSuggestion}
                />
            </div>
        </details>
    )
}
