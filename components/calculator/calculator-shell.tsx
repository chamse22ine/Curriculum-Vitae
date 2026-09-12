"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { fmt2 } from "@/lib/format"
import { TON_GLYPHE, TON_TEXTE, VerdictPanel } from "@/components/calculator/verdict-panel"
import type { Verdict } from "@/components/calculator/verdict"

export type NavItem = { id: string; label: string; court?: string; valeur?: number | null }
export type NavGroupe = { titre?: string; items: NavItem[] }

/** Entrée au bout d'un semestre : on ouvre le semestre voisin et on donne le focus à sa première (ou dernière) note */
export function useNavigationBords(ids: string[], courant: string, onSelect: (id: string) => void) {
    const focusApres = useRef<"premier" | "dernier" | null>(null)

    useEffect(() => {
        const cible = focusApres.current
        if (!cible) return
        focusApres.current = null
        const champs = document.querySelectorAll<HTMLInputElement>("input[data-note-input]:not(:disabled)")
        const champ = cible === "premier" ? champs[0] : champs[champs.length - 1]
        champ?.focus()
        champ?.select()
    }, [courant])

    return (sens: 1 | -1) => {
        const index = ids.indexOf(courant) + sens
        if (index < 0 || index >= ids.length) return
        focusApres.current = sens === 1 ? "premier" : "dernier"
        onSelect(ids[index])
    }
}

function VerdictMobile({ verdict, action }: { verdict: Verdict; action?: ReactNode }) {
    const [ouvert, setOuvert] = useState(false)

    // La feuille n'existe que sous 1024 px : on la referme si l'écran s'élargit
    useEffect(() => {
        const media = window.matchMedia("(min-width: 1024px)")
        const fermer = () => {
            if (media.matches) setOuvert(false)
        }
        media.addEventListener("change", fermer)
        return () => media.removeEventListener("change", fermer)
    }, [])

    const glyphe = TON_GLYPHE[verdict.ton]

    return (
        <Dialog.Root open={ouvert} onOpenChange={setOuvert}>
            <div className="fixed inset-x-0 bottom-0 z-40 border-t border-hairline bg-surface pb-[env(safe-area-inset-bottom)] lg:hidden">
                <Dialog.Trigger asChild>
                    <button type="button" className="flex h-14 w-full items-center gap-3 px-4 text-left">
                        <span className={cn("num", glyphe.cls)} aria-hidden>{glyphe.glyph}</span>
                        <span className={cn("min-w-0 flex-1 truncate font-display text-xl leading-none", TON_TEXTE[verdict.ton])}>{verdict.phrase}</span>
                        <span className="num text-xl font-medium text-ink">{fmt2(verdict.moyenne)}</span>
                        <ChevronUp className="size-4 shrink-0 text-ink-muted" aria-hidden />
                        <span className="sr-only">Afficher le détail du verdict</span>
                    </button>
                </Dialog.Trigger>
            </div>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/30 duration-220 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 lg:hidden" />
                <Dialog.Content
                    aria-describedby={undefined}
                    className="fixed inset-x-0 bottom-0 z-50 max-h-[85dvh] overflow-y-auto rounded-t-xl border-t border-hairline bg-paper px-4 pt-3 pb-[calc(1rem+env(safe-area-inset-bottom))] duration-220 ease-enter data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom lg:hidden"
                >
                    <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-hairline-strong" aria-hidden />
                    <Dialog.Title className="sr-only">Verdict</Dialog.Title>
                    <VerdictPanel verdict={verdict} action={action} />
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    )
}

function NavBouton({ item, actif, compact, onSelect }: { item: NavItem; actif: boolean; compact?: boolean; onSelect: (id: string) => void }) {
    return (
        <button
            type="button"
            onClick={() => onSelect(item.id)}
            aria-current={actif ? "true" : undefined}
            className={cn(
                "flex items-center gap-3 rounded-md text-ui transition-colors duration-100 ease-out-ui",
                compact ? "h-9 shrink-0 whitespace-nowrap px-3" : "w-full justify-between px-3 py-2 text-left",
                actif ? "bg-surface text-ink shadow-raise ring-1 ring-hairline" : "text-ink-soft hover:bg-surface-sunk hover:text-ink"
            )}
        >
            <span className="truncate">{compact ? item.court ?? item.label : item.label}</span>
            {item.valeur !== undefined && <span className="num text-caption text-ink-muted">{fmt2(item.valeur)}</span>}
        </button>
    )
}

/**
 * Trois zones sur grand écran : semestres à gauche (240 px), saisie au centre (720 px max),
 * verdict collant à droite (320 px). Sur mobile : onglets glissants et barre de verdict en bas.
 */
export function CalculatorShell({ groupes, courant, onSelect, barre, verdict, action, children }: {
    groupes: NavGroupe[]
    courant: string
    onSelect: (id: string) => void
    barre?: ReactNode
    verdict: Verdict
    action?: ReactNode
    children: ReactNode
}) {
    const items = groupes.flatMap((groupe) => groupe.items)

    return (
        <div className="mx-auto w-full max-w-[1400px] px-4 pb-28 sm:px-6 lg:pb-16">
            <nav aria-label="Semestres" className="sticky top-14 z-30 -mx-4 border-b border-hairline bg-paper sm:-mx-6 xl:hidden">
                <ul className="flex snap-x gap-1 overflow-x-auto px-4 py-2 [scrollbar-width:none] sm:px-6 [&::-webkit-scrollbar]:hidden">
                    {items.map((item) => (
                        <li key={item.id} className="snap-start">
                            <NavBouton item={item} actif={item.id === courant} compact onSelect={onSelect} />
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="pt-6 lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start lg:gap-8 xl:grid-cols-[240px_minmax(0,720px)_320px] xl:justify-center">
                <aside className="hidden xl:block">
                    <nav aria-label="Semestres" className="sticky top-20 space-y-6">
                        {groupes.map((groupe, i) => (
                            <div key={groupe.titre ?? `groupe-${i}`}>
                                {groupe.titre && (
                                    <p className="num mb-2 px-3 text-caption uppercase tracking-[0.14em] text-ink-muted">{groupe.titre}</p>
                                )}
                                <ul className="space-y-0.5">
                                    {groupe.items.map((item) => (
                                        <li key={item.id}>
                                            <NavBouton item={item} actif={item.id === courant} onSelect={onSelect} />
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </nav>
                </aside>

                <div className="mx-auto w-full min-w-0 max-w-[720px] lg:mx-0">
                    {barre && <div className="mb-6">{barre}</div>}
                    {children}
                </div>

                <aside className="hidden lg:block">
                    <div className="sticky top-20 max-h-[calc(100dvh-6rem)] overflow-y-auto">
                        <VerdictPanel verdict={verdict} action={action} />
                    </div>
                </aside>
            </div>

            <VerdictMobile verdict={verdict} action={action} />
        </div>
    )
}
