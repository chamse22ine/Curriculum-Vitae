"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CheckCircle, Trash2, AlertTriangle, BookOpen, Award, Info, Save } from "lucide-react"
import { MoyenneIndicator, SimulationCard, ValidationStatus, usePersistedState } from "@/components/calculator-ui"
import { createInitialData } from "@/constants/curriculum-data"
import type { Annee, Competence } from "@/types/curriculum.types"
import { moyenneUE, moyenneCompetence, moyenneSemestre, moyenneAnnee, analyserValidation, simulerObjectifs, UE_NAMES } from "@/lib/calculs"

// --- Constants ---

const STORAGE_KEY = "lcer-notes"
const TAB_LABELS = ["L1", "L2", "L3", "Résumé"]

const RULES = [
    { icon: CheckCircle, color: "text-primary", bg: "bg-surface-sunk", border: "border-hairline", text: <>Moyenne annuelle <strong className="text-primary">≥ 10/20</strong> ET compétences <strong className="text-primary">≥ 8/20</strong></> },
    { icon: Award, color: "text-amber-500", bg: "bg-amber-50/60", border: "border-amber-100", text: <>Mentions : <strong className="text-amber-700">AB</strong> (12), <strong className="text-amber-700">B</strong> (14), <strong className="text-amber-700">TB</strong> (16)</> },
    { icon: AlertTriangle, color: "text-violet-500", bg: "bg-violet-50/60", border: "border-violet-100", text: <>Les compétences <strong className="text-violet-600">se compensent entre semestres</strong> par ECTS</> },
    { icon: Save, color: "text-emerald-500", bg: "bg-emerald-50/60", border: "border-emerald-100", text: <><strong className="text-emerald-600">Sauvegarde automatique</strong> dans le navigateur</> },
]

const UE_DOTS: Record<string, string> = { UE1: "bg-blue-400", UE2: "bg-emerald-400", UE3: "bg-purple-400", UE4: "bg-orange-400", UE5: "bg-pink-400" }
const UE_LEGEND = Object.entries(UE_NAMES).map(([code, label]) => ({ code, label, dot: UE_DOTS[code] }))

// --- Section components ---

function CompetenceCard({ competence, onNoteChange }: {
    competence: Competence
    onNoteChange: (ueIdx: number, ecIdx: number, note: number) => void
}) {
    return (
        <div className={`rounded-xl border overflow-hidden ${competence.color} transition-shadow duration-300 hover:shadow-md`}>
            <div className={`px-4 py-3 ${competence.bgGradient}`}>
                <div className="flex items-center justify-between">
                    <div className="min-w-0">
                        <span className="text-xs font-bold tracking-wide">{competence.code}</span>
                        <p className="text-[11px] opacity-70 truncate">{competence.name}</p>
                    </div>
                    <MoyenneIndicator value={moyenneCompetence(competence)} size="sm" />
                </div>
            </div>
            <div className="p-3 space-y-3">
                {competence.ues.map((ue, ueIdx) => (
                    <div key={ue.code} className="space-y-1.5">
                        {competence.ues.length > 1 && (
                            <div className="flex items-center justify-between px-1">
                                <span className="text-[11px] font-semibold text-foreground/60">{ue.name}</span>
                                <MoyenneIndicator value={moyenneUE(ue)} size="sm" />
                            </div>
                        )}
                        {ue.elements.map((ec, ecIdx) => (
                            <div key={ec.name} className="flex items-center gap-2 bg-white/80 rounded-lg px-3 py-2 border border-white">
                                <span className="text-xs text-foreground/70 flex-1 min-w-0 truncate">{ec.name}</span>
                                <span className="text-[10px] text-muted-foreground whitespace-nowrap tabular-nums">{ec.ects} ECTS</span>
                                <Input
                                    type="number"
                                    min="0"
                                    max="20"
                                    step="0.1"
                                    value={ec.note || ""}
                                    onChange={(e) => onNoteChange(ueIdx, ecIdx, Number.parseFloat(e.target.value) || 0)}
                                    className="w-[70px] h-8 text-center text-sm font-medium text-foreground bg-white border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-lg shadow-sm"
                                    placeholder="—"
                                />
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    )
}

function YearOverview({ annee }: { annee: Annee }) {
    const { validated, mention, raisons, competencesAnnuelles } = analyserValidation(annee)
    const moy = moyenneAnnee(annee)
    const hasErrors = !validated && raisons.length > 0 && raisons[0] !== "Aucune note saisie"

    return (
        <>
            <div className="bg-surface border border-hairline shadow-raise rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shrink-0">
                        <span className="text-on-primary font-bold text-lg">L{annee.numero}</span>
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-lg font-bold text-foreground">Année {annee.numero}</h2>
                            <MoyenneIndicator value={moy} size="md" />
                        </div>
                        {competencesAnnuelles.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                {competencesAnnuelles.map((c) => <MoyenneIndicator key={c.code} value={c.moyenne} size="sm" />)}
                            </div>
                        )}
                    </div>
                </div>
                <ValidationStatus validated={validated} mention={mention} />
            </div>
            {hasErrors && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50/80 border border-red-200">
                    <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                    <div className="text-sm text-red-700">
                        <p className="font-semibold mb-1">Conditions non remplies</p>
                        <ul className="space-y-0.5">
                            {raisons.map((r, i) => <li key={i} className="text-xs">• {r}</li>)}
                        </ul>
                    </div>
                </div>
            )}
            <SimulationCard sim={simulerObjectifs(annee)} />
        </>
    )
}

function ResumeTab({ data }: { data: Annee[] }) {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {data.map((annee) => {
                    const { validated, mention, competencesAnnuelles } = analyserValidation(annee)
                    const moy = moyenneAnnee(annee)
                    return (
                        <div key={annee.numero} className="bg-surface border border-hairline shadow-raise rounded-2xl p-5 space-y-4 hover:shadow-lg transition-shadow duration-300">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                                        <span className="text-on-primary font-bold">L{annee.numero}</span>
                                    </div>
                                    <div>
                                        <p className="font-bold text-foreground text-sm">Année {annee.numero}</p>
                                        <p className="text-xs text-muted-foreground">S{annee.numero * 2 - 1} & S{annee.numero * 2}</p>
                                    </div>
                                </div>
                                <MoyenneIndicator value={moy} size="lg" />
                            </div>
                            <ValidationStatus validated={validated} mention={mention} />
                            {competencesAnnuelles.length > 0 && (
                                <div className="grid grid-cols-2 gap-1.5">
                                    {competencesAnnuelles.map((c) => (
                                        <div key={c.code} className="flex items-center justify-between bg-slate-50 rounded-lg px-2.5 py-1.5">
                                            <span className="text-xs font-medium text-muted-foreground">{c.code}</span>
                                            <MoyenneIndicator value={c.moyenne} size="sm" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Rules */}
            <div className="bg-surface border border-hairline shadow-raise rounded-2xl overflow-hidden">
                <div className="px-5 py-4 bg-surface-sunk border-b border-border/50">
                    <h3 className="font-bold text-foreground flex items-center gap-2">
                        <Info className="h-4 w-4 text-primary" />
                        Règles de validation
                    </h3>
                </div>
                <div className="p-5 space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {RULES.map((rule, i) => (
                            <div key={i} className={`flex items-start gap-2.5 p-3 rounded-xl ${rule.bg} border ${rule.border}`}>
                                <rule.icon className={`h-4 w-4 ${rule.color} mt-0.5 shrink-0`} />
                                <p className="text-xs text-foreground/80 leading-relaxed">{rule.text}</p>
                            </div>
                        ))}
                    </div>
                    <div>
                        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-2.5">Compétences</p>
                        <div className="flex flex-wrap gap-2">
                            {UE_LEGEND.map((ue) => (
                                <span key={ue.code} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-slate-50 border border-slate-100 rounded-full px-3 py-1">
                                    <span className={`w-2 h-2 rounded-full ${ue.dot}`} />
                                    <strong className="text-foreground/70">{ue.code}</strong>
                                    <span className="hidden sm:inline">{ue.label}</span>
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

// --- Main component ---

export default function LCeRCalculator() {
    const [data, setData] = usePersistedState(STORAGE_KEY, createInitialData)

    const updateNote = (anneeIdx: number, semIdx: number, compIdx: number, ueIdx: number, ecIdx: number, note: number) => {
        const next = [...data]
        next[anneeIdx].semestres[semIdx].competences[compIdx].ues[ueIdx].elements[ecIdx].note = note
        setData(next)
    }

    const resetData = () => {
        if (confirm("Êtes-vous sûr de vouloir effacer toutes les données ?")) {
            setData(createInitialData())
        }
    }

    return (
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-6">
            <Tabs defaultValue="annee1" className="w-full">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                    <TabsList className="bg-surface border border-hairline shadow-raise p-1 h-auto inline-flex w-auto">
                        {TAB_LABELS.map((label, i) => (
                            <TabsTrigger
                                key={label}
                                value={i < 3 ? `annee${i + 1}` : "resume"}
                                className="text-sm px-5 py-2 data-[state=active]:bg-primary data-[state=active]:text-on-primary data-[state=active]:shadow-md rounded-lg transition-all duration-300"
                            >
                                {label}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                    <Button variant="ghost" size="sm" onClick={resetData} className="text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors">
                        <Trash2 className="w-4 h-4 mr-1.5" />
                        Réinitialiser
                    </Button>
                </div>

                {data.map((annee, anneeIdx) => (
                    <TabsContent key={annee.numero} value={`annee${annee.numero}`} className="space-y-6">
                        <YearOverview annee={annee} />
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                            {annee.semestres.map((semestre, semIdx) => (
                                <div key={semestre.numero} className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <BookOpen className="h-4 w-4 text-primary" />
                                            <h3 className="font-semibold text-foreground">Semestre {semestre.numero}</h3>
                                        </div>
                                        <MoyenneIndicator value={moyenneSemestre(semestre)} size="md" />
                                    </div>
                                    <div className="space-y-3">
                                        {semestre.competences.map((comp, compIdx) => (
                                            <CompetenceCard
                                                key={comp.code}
                                                competence={comp}
                                                onNoteChange={(ueIdx, ecIdx, note) => updateNote(anneeIdx, semIdx, compIdx, ueIdx, ecIdx, note)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </TabsContent>
                ))}

                <TabsContent value="resume">
                    <ResumeTab data={data} />
                </TabsContent>
            </Tabs>
        </div>
    )
}
