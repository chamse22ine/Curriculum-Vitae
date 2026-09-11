"use client"

import { useState, type KeyboardEvent } from "react"
import { cn } from "@/lib/utils"
import { fmtSaisie, parseNote } from "@/lib/format"

const PAS = 0.25

/** Donne le focus au champ de note voisin, dans l'ordre du document */
function focusVoisin(depuis: HTMLInputElement, sens: 1 | -1): boolean {
    const champs = Array.from(document.querySelectorAll<HTMLInputElement>("input[data-note-input]:not(:disabled)"))
    const voisin = champs[champs.indexOf(depuis) + sens]
    if (!voisin) return false
    voisin.focus()
    voisin.select()
    return true
}

export function NoteField({ id, label, value, disabled, hypothese, onCommit, onEdge }: {
    id: string
    label: string
    value: number | null
    disabled?: boolean
    hypothese?: boolean
    onCommit: (value: number | null) => void
    /** Entrée sur le premier ou le dernier champ de la vue */
    onEdge?: (sens: 1 | -1) => void
}) {
    const [texte, setTexte] = useState(() => fmtSaisie(value))
    const [invalide, setInvalide] = useState(false)
    const [valeurVue, setValeurVue] = useState(value)

    // Valeur changée de l'extérieur (annulation, report) : on réaligne le texte sans écraser une frappe équivalente
    if (value !== valeurVue) {
        setValeurVue(value)
        if (value !== parseNote(texte).value) {
            setTexte(fmtSaisie(value))
            setInvalide(false)
        }
    }

    const valider = (brut: string) => {
        const { value: note, valid } = parseNote(brut)
        setInvalide(!valid)
        onCommit(note)
    }

    const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault()
            const sens = e.shiftKey ? -1 : 1
            if (!focusVoisin(e.currentTarget, sens)) onEdge?.(sens)
        } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
            e.preventDefault()
            const pas = (e.shiftKey ? 1 : PAS) * (e.key === "ArrowUp" ? 1 : -1)
            const base = parseNote(texte).value ?? value ?? 0
            const note = Math.min(20, Math.max(0, Math.round((base + pas) * 100) / 100))
            setTexte(fmtSaisie(note))
            setInvalide(false)
            onCommit(note)
        }
    }

    return (
        <input
            id={`n-${id}`}
            data-note-input=""
            inputMode="decimal"
            enterKeyHint="next"
            autoComplete="off"
            value={texte}
            disabled={disabled}
            placeholder="—"
            aria-label={`${label} sur 20`}
            aria-invalid={invalide || undefined}
            onChange={(e) => {
                setTexte(e.target.value)
                valider(e.target.value)
            }}
            onBlur={() => {
                const { value: note, valid } = parseNote(texte)
                if (valid) setTexte(fmtSaisie(note))
            }}
            onKeyDown={onKeyDown}
            className={cn(
                "num w-full rounded-sm border border-hairline bg-surface-sunk px-2.5 py-2",
                "text-right text-base text-ink transition-colors duration-100 ease-out-ui",
                "focus:border-accent focus:bg-surface focus:outline-none focus:ring-2 focus:ring-accent/25",
                "disabled:cursor-not-allowed disabled:text-ink-muted disabled:opacity-70",
                hypothese && "italic",
                invalide && "border-danger ring-2 ring-danger/30 focus:border-danger focus:ring-danger/30"
            )}
        />
    )
}
