"use client"

import type { ReactNode } from "react"
import { CalendarDays } from "lucide-react"
import { cn } from "@/lib/utils"
import { CATEGORIES, ORDRE_CATEGORIES, fmtHeures, type Bilan, type Ton, type lireBilan } from "@/lib/heures"

export const LABEL = "text-caption font-medium uppercase tracking-[0.08em] text-ink-muted"

const TON: Record<Ton, { texte: string; bandeau: string; glyphe: string }> = {
    success: { texte: "text-success", bandeau: "border-success-line bg-success-wash", glyphe: "●" },
    warning: { texte: "text-warning", bandeau: "border-warning-line bg-warning-wash", glyphe: "◐" },
    danger: { texte: "text-danger", bandeau: "border-danger-line bg-danger-wash", glyphe: "○" },
}

const arrondi2 = (n: number) => Math.round(n * 100) / 100

/**
 * Barre empilée par catégorie, à l'échelle du plus grand de l'objectif et du total.
 * Segments animés en transform (jamais width), comme la jauge du calculateur de moyenne.
 */
function BarreEmpilee({ bilan, attendu = 0, label, className }: { bilan: Bilan; attendu?: number; label: string; className?: string }) {
    const { totaux, total, objectif } = bilan
    const echelle = Math.max(objectif, total) || 1

    return (
        <div
            role="progressbar"
            aria-label={label}
            aria-valuemin={0}
            aria-valuemax={arrondi2(objectif)}
            aria-valuenow={arrondi2(Math.min(total, objectif))}
            aria-valuetext={`${fmtHeures(total)} sur ${fmtHeures(objectif)}`}
            className={cn("relative", className)}
        >
            <div className="absolute inset-0 overflow-hidden rounded-full bg-surface-sunk">
                {ORDRE_CATEGORIES.map((categorie, i) => {
                    const debut = ORDRE_CATEGORIES.slice(0, i).reduce((somme, c) => somme + totaux[c], 0)
                    return (
                        <div
                            key={categorie}
                            className={cn("absolute inset-0 origin-left transition-transform duration-220 ease-out-ui", CATEGORIES[categorie].couleur)}
                            style={{ transform: `translateX(${(debut / echelle) * 100}%) scaleX(${totaux[categorie] / echelle})` }}
                        />
                    )
                })}
            </div>
            {total > objectif && objectif > 0 && <Repere position={objectif / echelle} className="bg-ink" />}
            {attendu > 0 && total < attendu && <Repere position={attendu / echelle} className="bg-ink-muted" />}
        </div>
    )
}

function Repere({ position, className }: { position: number; className: string }) {
    return <div className={cn("absolute -inset-y-1 w-0.5 -translate-x-1/2 rounded-full", className)} style={{ left: `${position * 100}%` }} aria-hidden />
}

function LegendeRepere({ className, children }: { className: string; children: ReactNode }) {
    return (
        <span className="inline-flex items-center gap-1.5">
            <span className={cn("h-3 w-0.5 rounded-full", className)} aria-hidden />
            {children}
        </span>
    )
}

/** Bilan du mois affiché : le message sur la BU, le total, l'objectif lissé et la répartition */
export function ResumeMois({ bilan, lecture, attendu, joursTravailles, normeJournaliere, libelle, active, onAfficher }: {
    bilan: Bilan
    lecture: ReturnType<typeof lireBilan>
    attendu: number
    joursTravailles: number
    normeJournaliere: number
    libelle: string
    active: boolean
    /** Absent sur téléphone, où le calendrier reste en vue jour */
    onAfficher?: () => void
}) {
    const { objectif, total, totaux } = bilan
    const ton = TON[lecture.ton]
    const pourcentage = objectif > 0 ? Math.round((total / objectif) * 100) : 0

    return (
        <section aria-label={`Bilan de ${libelle}`} className="overflow-hidden rounded-lg border border-hairline bg-surface shadow-raise">
            <div className={cn("border-b px-5 py-4", ton.bandeau)}>
                <div className="flex items-center justify-between gap-3">
                    <p className={cn(LABEL, "first-letter:uppercase")}>Mois · {libelle}</p>
                    {!active && onAfficher && (
                        <button type="button" onClick={onAfficher} className="inline-flex items-center gap-1.5 text-caption text-accent underline-offset-2 hover:underline">
                            <CalendarDays className="size-3.5" aria-hidden />
                            Voir le mois
                        </button>
                    )}
                </div>
                <p aria-live="polite" className={cn("mt-2 flex gap-2.5 font-display text-[1.75rem] leading-tight sm:text-h3", ton.texte)}>
                    <span className="num mt-1.5 text-base leading-none" aria-hidden>{ton.glyphe}</span>
                    <span>{lecture.titre}</span>
                </p>
                {lecture.detail && <p className="mt-1.5 text-ui text-ink-soft">{lecture.detail}</p>}
            </div>

            <div className="space-y-5 p-5">
                <dl className="grid grid-cols-2 gap-4">
                    <div>
                        <dt className={LABEL}>Total fait</dt>
                        <dd className="num mt-1.5 text-[2rem] leading-none font-medium text-ink sm:text-[2.75rem]">{fmtHeures(total)}</dd>
                    </div>
                    <div className="text-right">
                        <dt className={LABEL}>Objectif du mois</dt>
                        <dd className="num mt-1.5 text-[2rem] leading-none text-ink-soft sm:text-[2.75rem]">{fmtHeures(objectif)}</dd>
                        <dd className="num mt-1.5 text-caption text-ink-muted">{joursTravailles} j × {fmtHeures(normeJournaliere)}</dd>
                    </div>
                </dl>

                <div>
                    <BarreEmpilee bilan={bilan} attendu={attendu} label="Heures du mois sur l'objectif" className="h-3" />
                    <div className="num mt-2 flex flex-wrap justify-between gap-x-3 gap-y-1 text-caption text-ink-muted">
                        <span>{pourcentage} % de l&apos;objectif</span>
                        {total > objectif && objectif > 0 && <LegendeRepere className="bg-ink">objectif</LegendeRepere>}
                        {attendu > 0 && total < attendu && <LegendeRepere className="bg-ink-muted">rythme attendu à ce jour</LegendeRepere>}
                    </div>
                </div>

                <ul aria-label="Répartition du mois" className="grid grid-cols-3 gap-px overflow-hidden rounded-md border border-hairline bg-hairline">
                    {ORDRE_CATEGORIES.map((categorie) => (
                        <li key={categorie} className="bg-surface px-3 py-2.5">
                            <p className="flex items-center gap-1.5 text-caption text-ink-muted">
                                <span className={cn("size-2 shrink-0 rounded-full", CATEGORIES[categorie].couleur)} aria-hidden />
                                {CATEGORIES[categorie].label}
                            </p>
                            <p className="num mt-0.5 text-lg leading-tight text-ink">{fmtHeures(totaux[categorie])}</p>
                            <p className="num text-caption text-ink-muted">{total > 0 ? Math.round((totaux[categorie] / total) * 100) : 0} %</p>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    )
}

function etatPeriode({ objectif, solde, restant }: Bilan): { texte: string; cls: string } {
    if (objectif === 0) return { texte: "Repos", cls: "text-ink-muted" }
    if (solde > 0) return { texte: `+${fmtHeures(solde)}`, cls: "text-success" }
    if (restant === 0) return { texte: "Atteint", cls: "text-success" }
    return { texte: `Reste ${fmtHeures(restant)}`, cls: "text-ink-soft" }
}

/** Jour ou semaine affichés : fait sur objectif, barre empilée. Cliquer bascule le calendrier sur cette vue */
export function CartePeriode({ titre, sousTitre, bilan, active, onClick }: {
    titre: string
    sousTitre: string
    bilan: Bilan
    active: boolean
    /** Absent sur téléphone : la carte n'est alors qu'un bilan */
    onClick?: () => void
}) {
    const etat = etatPeriode(bilan)
    const cadre = "flex w-full min-w-0 flex-col rounded-lg border bg-surface p-4 text-left shadow-raise"

    const contenu = (
        <>
            <span className="flex items-center justify-between gap-2">
                <span className={LABEL}>{titre}</span>
                <span className={cn("num text-caption whitespace-nowrap", etat.cls)}>{etat.texte}</span>
            </span>
            <span className="mt-1 truncate text-ui text-ink-soft first-letter:uppercase">{sousTitre}</span>
            <span className="mt-3 flex flex-wrap items-baseline gap-x-1.5">
                <span className="num text-2xl leading-none font-medium text-ink">{fmtHeures(bilan.total)}</span>
                <span className="num text-caption text-ink-muted">/ {fmtHeures(bilan.objectif)}</span>
            </span>
            <BarreEmpilee bilan={bilan} label={`Heures ${titre.toLowerCase()} sur l'objectif`} className="mt-3 h-2" />
        </>
    )

    if (!onClick) return <div className={cn(cadre, "border-hairline")}>{contenu}</div>
    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={active}
            className={cn(cadre, "transition-colors duration-100 ease-out-ui hover:border-primary", active ? "border-primary ring-1 ring-primary" : "border-hairline")}
        >
            {contenu}
        </button>
    )
}
