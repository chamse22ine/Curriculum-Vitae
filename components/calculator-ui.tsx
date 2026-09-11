"use client"

import { useSyncExternalStore, useCallback } from "react"
import { AlertCircle, CheckCircle, Target, TrendingUp, X } from "lucide-react"
import type { Objectif, Simulation } from "@/lib/calculs"

// --- Persisted state hook ---

const storageEmitter = new EventTarget()

export function usePersistedState<T>(key: string, initializer: () => T) {
    const getSnapshot = useCallback(() => localStorage.getItem(key), [key])
    const getServerSnapshot = useCallback(() => null, [])
    const subscribe = useCallback((cb: () => void) => {
        storageEmitter.addEventListener("change", cb)
        return () => storageEmitter.removeEventListener("change", cb)
    }, [])

    const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
    const data: T = raw ? JSON.parse(raw) : initializer()

    const setData = useCallback((updater: T | ((prev: T) => T)) => {
        const current = localStorage.getItem(key)
        const prev: T = current ? JSON.parse(current) : initializer()
        const next = typeof updater === "function" ? (updater as (prev: T) => T)(prev) : updater
        localStorage.setItem(key, JSON.stringify(next))
        storageEmitter.dispatchEvent(new Event("change"))
    }, [key, initializer])

    return [data, setData] as const
}

// --- Small UI components ---

export function MoyenneIndicator({ value, size = "md" }: { value: number | null; size?: "sm" | "md" | "lg" }) {
    const note = value ?? 0
    const tier = note >= 14 ? "emerald" : note >= 10 ? "blue" : note >= 8 ? "amber" : note > 0 ? "red" : "slate"
    const colors: Record<string, string> = {
        emerald: "text-emerald-600 bg-emerald-50 border-emerald-200",
        blue: "text-blue-600 bg-blue-50 border-blue-200",
        amber: "text-amber-600 bg-amber-50 border-amber-200",
        red: "text-red-500 bg-red-50 border-red-200",
        slate: "text-slate-400 bg-slate-50 border-slate-200",
    }
    const sizes: Record<string, string> = {
        sm: "text-xs px-2 py-0.5",
        md: "text-sm px-2.5 py-1 font-semibold",
        lg: "text-lg px-4 py-1.5 font-bold",
    }
    return (
        <span className={`inline-flex items-center rounded-lg border tabular-nums ${colors[tier]} ${sizes[size]}`}>
            {note > 0 ? note.toFixed(2) : "—"}
        </span>
    )
}

export function ValidationStatus({ validated, mention }: { validated: boolean; mention?: string }) {
    return (
        <div className="flex items-center gap-1.5">
            <span className={`flex items-center gap-1 text-xs font-medium rounded-full px-2.5 py-1 border ${validated ? "text-emerald-600 bg-emerald-50 border-emerald-200" : "text-red-500 bg-red-50 border-red-200"}`}>
                {validated ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                {validated ? "Validée" : "Non validée"}
            </span>
            {mention && (
                <span className="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-1">
                    {mention}
                </span>
            )}
        </div>
    )
}

// --- Simulation ---

function ObjectifRow({ obj }: { obj: Objectif }) {
    if (obj.status === "aucune-note") return null
    const isGlobal = obj.code === "Global"

    return (
        <div className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl ${isGlobal ? "bg-linear-to-r from-primary/5 to-accent/5 border border-primary/10" : "bg-white/60 border border-slate-100"}`}>
            {obj.status === "ok" ? (
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
            ) : obj.status === "impossible" ? (
                <X className="w-4 h-4 text-red-400 shrink-0" />
            ) : (
                <Target className="w-4 h-4 text-amber-500 shrink-0" />
            )}
            <div className="flex-1 min-w-0">
                <span className={`text-xs font-semibold ${isGlobal ? "text-primary" : "text-foreground/80"}`}>
                    {obj.code}
                </span>
                {!isGlobal && <span className="text-[10px] text-muted-foreground ml-1.5 hidden sm:inline">{obj.label}</span>}
            </div>
            <div className="text-right shrink-0">
                {obj.status === "ok" && (
                    <span className="text-xs font-medium text-emerald-600">
                        Acquis{obj.ectsRestants === 0 && <span className="text-muted-foreground ml-1">({obj.moyenneActuelle.toFixed(2)})</span>}
                    </span>
                )}
                {obj.status === "besoin" && (
                    <span className="text-xs font-semibold tabular-nums">
                        <span className="text-amber-600">{obj.moyenneRequise.toFixed(1)}</span>
                        <span className="text-muted-foreground font-normal">/20 min</span>
                    </span>
                )}
                {obj.status === "impossible" && (
                    <span className="text-xs font-medium text-red-400">
                        {obj.ectsRestants === 0 ? <span className="tabular-nums">{obj.moyenneActuelle.toFixed(2)}/20</span> : "Impossible"}
                    </span>
                )}
            </div>
        </div>
    )
}

function buildConseil(sim: Simulation, allFilled: boolean): string {
    const globalOk = sim.global.status === "ok"
    const faibles = sim.objectifs.filter((o) => o.status === "impossible" || o.status === "besoin")
    const impossibles = sim.objectifs.filter((o) => o.status === "impossible")

    if (allFilled) {
        if (impossibles.length > 0) {
            const noms = impossibles.map((o) => `${o.code} (${o.moyenneActuelle.toFixed(1)}/20)`).join(", ")
            return `Il te manque ${impossibles.length > 1 ? "les compétences" : "la compétence"} ${noms} — il faut au moins 8/20 par compétence. Renseigne-toi sur les rattrapages.`
        }
        if (!globalOk) {
            return `Ta moyenne générale est de ${sim.global.moyenneActuelle.toFixed(2)}/20, il te faut au moins 10/20. Renseigne-toi sur les rattrapages.`
        }
        return "Tu remplis toutes les conditions !"
    }

    const parts: string[] = []
    if (!globalOk && sim.global.status === "besoin") {
        parts.push(`une moyenne générale d'au moins ${sim.global.moyenneRequise.toFixed(1)}/20 sur les matières restantes`)
    }
    if (faibles.length > 0) {
        const details = faibles.map((o) =>
            o.status === "besoin"
                ? `${o.moyenneRequise.toFixed(1)}/20 min en ${o.code}`
                : `${o.code} ne peut plus atteindre 8/20`
        )
        parts.push(details.join(", "))
    }

    if (parts.length === 0) return "Tu es sur la bonne voie, continue comme ça !"
    return `Il te faut ${parts.join(" et ")}.`
}

export function SimulationCard({ sim }: { sim: Simulation }) {
    if (!sim.visible) return null

    const compObjectifs = sim.objectifs.filter((o) => o.status !== "aucune-note")
    const hasImpossible = sim.global.status === "impossible" || sim.objectifs.some((o) => o.status === "impossible")
    const allFilled = sim.global.ectsRestants === 0

    const headerColor = hasImpossible
        ? "bg-linear-to-r from-red-50/50 to-orange-50/50"
        : allFilled
            ? "bg-linear-to-r from-red-50/50 to-amber-50/50"
            : "bg-linear-to-r from-amber-50/50 to-primary/5"
    const headerIcon = hasImpossible || allFilled ? "text-red-400" : "text-amber-500"
    const headerText = allFilled
        ? "Année non validée — Bilan"
        : hasImpossible
            ? "Validation compromise"
            : "Pour valider ton année"

    return (
        <div className="glass-card rounded-2xl overflow-hidden">
            <div className={`px-4 sm:px-5 py-3.5 flex items-center gap-2.5 border-b border-border/50 ${headerColor}`}>
                <TrendingUp className={`h-4 w-4 shrink-0 ${headerIcon}`} />
                <h3 className="font-semibold text-sm text-foreground">{headerText}</h3>
            </div>
            <div className="p-3 sm:p-4 space-y-1.5">
                {/* Global objective first */}
                <ObjectifRow obj={sim.global} />

                {/* Separator */}
                {compObjectifs.length > 0 && (
                    <div className="flex items-center gap-2 py-1">
                        <div className="flex-1 h-px bg-border/50" />
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Par compétence</span>
                        <div className="flex-1 h-px bg-border/50" />
                    </div>
                )}

                {/* Per-competence objectives */}
                {compObjectifs.map((obj) => <ObjectifRow key={obj.code} obj={obj} />)}

                {/* Conseil */}
                <p className="text-[11px] text-muted-foreground leading-relaxed pt-2 px-1">
                    {buildConseil(sim, allFilled)}
                </p>
            </div>
        </div>
    )
}
