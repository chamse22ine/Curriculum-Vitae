"use client"

import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { fmt2 } from "@/lib/format"
import type { Ton, Verdict } from "@/components/calculator/verdict"

export const TON_TEXTE: Record<Ton, string> = {
    success: "text-success",
    warning: "text-warning",
    danger: "text-danger",
    neutral: "text-ink",
}
const TON_FOND: Record<Ton, string> = {
    success: "bg-success",
    warning: "bg-warning",
    danger: "bg-danger",
    neutral: "bg-ink-muted",
}
export const TON_GLYPHE: Record<Ton, { glyph: string; cls: string }> = {
    success: { glyph: "●", cls: "text-success" },
    warning: { glyph: "◐", cls: "text-warning" },
    danger: { glyph: "○", cls: "text-danger" },
    neutral: { glyph: "—", cls: "text-ink-muted" },
}

/** Jauge sur 20 ; le repère du seuil 10 est fixe */
export function Jauge({ valeur, ton }: { valeur: number | null; ton: Ton }) {
    const ratio = valeur == null ? 0 : Math.min(1, Math.max(0, valeur / 20))

    return (
        <div>
            <div
                role="meter"
                aria-label="Moyenne sur 20"
                aria-valuemin={0}
                aria-valuemax={20}
                aria-valuenow={valeur ?? 0}
                className="relative h-2"
            >
                <div className="absolute inset-0 overflow-hidden rounded-full bg-surface-sunk">
                    <div className={cn("h-full w-full origin-left rounded-full", TON_FOND[ton])} style={{ transform: `scaleX(${ratio})` }} />
                </div>
                <div className="absolute -inset-y-1 left-1/2 w-0.5 -translate-x-1/2 rounded-full bg-ink" aria-hidden />
            </div>
            <div className="num mt-1.5 grid grid-cols-3 text-caption text-ink-muted" aria-hidden>
                <span>0</span>
                <span className="text-center">10</span>
                <span className="text-right">20</span>
            </div>
        </div>
    )
}

const LARGEUR = 280
const HAUTEUR = 72
const MARGE = 6

export function CourbeSemestres({ points }: { points: Verdict["courbe"] }) {
    const x = (i: number) => (points.length === 1 ? LARGEUR / 2 : MARGE + (i * (LARGEUR - 2 * MARGE)) / (points.length - 1))
    const y = (v: number) => MARGE + (1 - v / 20) * (HAUTEUR - 2 * MARGE)
    const renseignes = points.flatMap((p, i) => (p.valeur == null ? [] : [{ ...p, valeur: p.valeur, i }]))
    const trace = renseignes.map((p, k) => `${k === 0 ? "M" : "L"}${x(p.i).toFixed(1)} ${y(p.valeur).toFixed(1)}`).join(" ")
    const dernier = renseignes.at(-1)

    return (
        <figure>
            <figcaption className="num text-caption uppercase tracking-[0.14em] text-ink-muted">Moyennes par semestre</figcaption>
            <svg
                viewBox={`0 0 ${LARGEUR} ${HAUTEUR}`}
                className="mt-3 h-auto w-full overflow-visible"
                role="img"
                aria-label={points.map((p) => `${p.label} : ${fmt2(p.valeur)}`).join(", ")}
            >
                <line x1={0} x2={LARGEUR} y1={y(10)} y2={y(10)} className="stroke-hairline-strong" strokeDasharray="3 3" vectorEffect="non-scaling-stroke" />
                {renseignes.length > 1 && (
                    <path
                        d={trace}
                        pathLength={1}
                        fill="none"
                        className="stroke-primary"
                        strokeWidth={1.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        vectorEffect="non-scaling-stroke"
                    />
                )}
                {renseignes.slice(0, -1).map((p) => (
                    <circle key={p.label} cx={x(p.i)} cy={y(p.valeur)} r={2.5} className="fill-surface stroke-primary" strokeWidth={1.25} vectorEffect="non-scaling-stroke" />
                ))}
                {dernier && <circle cx={x(dernier.i)} cy={y(dernier.valeur)} r={3.5} className="fill-accent" />}
            </svg>
            <div className="num relative mt-1 h-4 text-caption text-ink-muted" aria-hidden>
                {points.map((p, i) => (
                    <span key={p.label} className="absolute -translate-x-1/2" style={{ left: `${(x(i) / LARGEUR) * 100}%` }}>
                        {p.label}
                    </span>
                ))}
            </div>
        </figure>
    )
}

export function VerdictPanel({ verdict, action, className }: { verdict: Verdict; action?: ReactNode; className?: string }) {
    const { phrase, ton, moyenne, detail, mention, reelle, vigilance, courbe } = verdict

    return (
        <section aria-label="Verdict" className={cn("overflow-hidden rounded-lg border border-hairline bg-surface shadow-raise", className)}>
            <div className="space-y-4 p-5">
                <div>
                    <p className="num text-caption uppercase tracking-[0.14em] text-ink-muted">Verdict</p>
                    <p aria-live="polite" className={cn("mt-2 font-display text-h3", TON_TEXTE[ton])}>{phrase}</p>
                </div>

                <div className="flex items-end justify-between gap-4">
                    <div>
                        {reelle !== undefined && <p className="num text-caption text-ink-muted">projetée</p>}
                        <p className="num text-num-lg font-medium text-ink">{fmt2(moyenne)}</p>
                    </div>
                    {reelle !== undefined && (
                        <div className="pb-1 text-right">
                            <p className="num text-caption text-ink-muted">session 1 réelle</p>
                            <p className="num text-h3 text-ink-soft">{fmt2(reelle)}</p>
                        </div>
                    )}
                </div>

                <p className="num text-caption text-ink-muted">
                    {detail}
                    {mention ? ` · mention ${mention}` : ""}
                </p>

                <Jauge valeur={moyenne} ton={ton} />

                {vigilance.length > 0 && (
                    <ul className="space-y-2 border-t border-hairline pt-4">
                        {vigilance.map((point) => (
                            <li key={point.texte} className="flex gap-2 text-ui text-ink-soft">
                                <span className={cn("num shrink-0", TON_GLYPHE[point.ton].cls)} aria-hidden>{TON_GLYPHE[point.ton].glyph}</span>
                                <span>{point.texte}</span>
                            </li>
                        ))}
                    </ul>
                )}

                {action}
            </div>

            <div className="border-t border-hairline bg-paper/60 px-5 py-4">
                <CourbeSemestres points={courbe} />
            </div>
        </section>
    )
}
