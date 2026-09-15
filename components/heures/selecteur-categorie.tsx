"use client"

import { useId } from "react"
import { LABEL } from "@/components/heures/bilan-heures"
import { cn } from "@/lib/utils"
import { CATEGORIES, ORDRE_CATEGORIES, type Categorie } from "@/lib/heures"

/** Trois pastilles Entreprise, Cours, BU en boutons radio */
export function SelecteurCategorie({ legende, valeur, onChange }: { legende: string; valeur: Categorie; onChange: (categorie: Categorie) => void }) {
    const nom = useId()

    return (
        <fieldset className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <legend className={cn(LABEL, "float-left mr-1")}>{legende}</legend>
            <div className="grid h-10 grid-cols-3 gap-1 rounded-md bg-surface-sunk p-1">
                {ORDRE_CATEGORIES.map((c) => (
                    <label key={c} className="relative">
                        <input type="radio" name={nom} value={c} checked={valeur === c} onChange={() => onChange(c)} className="peer sr-only" />
                        <span className="flex h-full cursor-pointer items-center justify-center gap-1.5 rounded-sm px-3 text-ui text-ink-muted transition-colors duration-100 ease-out-ui peer-checked:bg-surface peer-checked:text-ink peer-checked:shadow-raise peer-focus-visible:outline-2 peer-focus-visible:outline-offset-1 peer-focus-visible:outline-accent hover:text-ink">
                            <span className={cn("size-2.5 shrink-0 rounded-full", CATEGORIES[c].couleur)} aria-hidden />
                            {CATEGORIES[c].label}
                        </span>
                    </label>
                ))}
            </div>
        </fieldset>
    )
}
