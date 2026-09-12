"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import { animate as animer } from "animejs"
import { animate, useReducedMotion } from "framer-motion"
import { cn } from "@/lib/utils"
import { fmt2 } from "@/lib/format"
import { DUREE } from "@/lib/motion"
import { AnimatedNumber } from "@/components/calculator/motion"
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

/**
 * Jauge sur 20 : remplissage et couleur en 220 ms (transform, jamais width),
 * balayage clair une seule fois quand la moyenne se fige. Le repère du seuil 10 ne bouge pas.
 */
export function Jauge({ valeur, ton, balayage = 0 }: { valeur: number | null; ton: Ton; balayage?: number }) {
    const ratio = valeur == null ? 0 : Math.min(1, Math.max(0, valeur / 20))
    const reflet = useRef<HTMLDivElement>(null)
    const reduire = useReducedMotion()

    useEffect(() => {
        if (!balayage || reduire || !reflet.current) return
        const controles = animate(reflet.current, { x: ["-100%", "400%"], opacity: [0, 1, 0] }, { duration: 0.7, ease: "linear" })
        return () => controles.stop()
    }, [balayage, reduire])

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
                    <div
                        className={cn("h-full w-full origin-left rounded-full transition-[transform,background-color] duration-220 ease-out-ui", TON_FOND[ton])}
                        style={{ transform: `scaleX(${ratio})` }}
                    />
                    <div ref={reflet} className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-linear-to-r from-transparent via-paper/70 to-transparent opacity-0" aria-hidden />
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

/** Courbe des moyennes : tracé par stroke-dashoffset en 1 100 ms quand la série de semestres change, point final en accent */
export function CourbeSemestres({ points }: { points: Verdict["courbe"] }) {
    const trace = useRef<SVGPathElement>(null)
    const pointFinal = useRef<SVGCircleElement>(null)
    const reduire = useReducedMotion()

    const x = (i: number) => (points.length === 1 ? LARGEUR / 2 : MARGE + (i * (LARGEUR - 2 * MARGE)) / (points.length - 1))
    const y = (v: number) => MARGE + (1 - v / 20) * (HAUTEUR - 2 * MARGE)
    const renseignes = points.flatMap((p, i) => (p.valeur == null ? [] : [{ ...p, valeur: p.valeur, i }]))
    const chemin = renseignes.map((p, k) => `${k === 0 ? "M" : "L"}${x(p.i).toFixed(1)} ${y(p.valeur).toFixed(1)}`).join(" ")
    const dernier = renseignes.at(-1)
    const tracable = renseignes.length > 1
    // Les notes qui changent ne relancent pas le tracé : seulement une autre série de semestres
    const serie = `${points.map((p) => p.label).join("|")}:${tracable}`

    useEffect(() => {
        if (reduire || !trace.current) return
        const dessin = animer(trace.current, { strokeDashoffset: [1, 0], duration: DUREE.courbe * 1000, ease: "outQuart" })
        const fin = pointFinal.current
            ? animer(pointFinal.current, { opacity: [0, 1], duration: DUREE.entree * 1000, delay: (DUREE.courbe - 0.15) * 1000, ease: "outQuad" })
            : null
        return () => {
            dessin.revert()
            fin?.revert()
        }
    }, [serie, reduire])

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
                {tracable && (
                    <path
                        ref={trace}
                        d={chemin}
                        pathLength={1}
                        strokeDasharray={1}
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
                {dernier && <circle ref={pointFinal} cx={x(dernier.i)} cy={y(dernier.valeur)} r={3.5} className="fill-accent" />}
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
    const [balayage, setBalayage] = useState(0)

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
                        <AnimatedNumber value={moyenne} onSettled={() => setBalayage((n) => n + 1)} className="num block text-num-lg font-medium text-ink" />
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

                <Jauge valeur={moyenne} ton={ton} balayage={balayage} />

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
