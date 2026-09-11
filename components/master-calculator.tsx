"use client"

import { useState, type ReactNode } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlertTriangle, ArrowRight, Award, BookOpen, CheckCircle, GraduationCap, History, Info, RotateCcw, Save, Scale, Trash2 } from "lucide-react"
import { MoyenneIndicator, SimulationCard, ValidationStatus, usePersistedState } from "@/components/calculator-ui"
import { M1, NIVEAUX } from "@/constants/master-data"
import { analyserMaster, champsASaisir, etatRattrapage, moyenneMaster, notesSession1, notesSession2, peutReporter, simulerMaster, type EtatRattrapage, type Notes, type ResultatMaster, type Statut } from "@/lib/calculs-master"
import type { Champ, MasterEC, MasterState, MasterUE, NiveauCode } from "@/types/master.types"

// --- Constants ---

const STORAGE_KEY = "master-info-notes"

const TABS = [
    { value: "session1", label: "Session 1" },
    { value: "session2", label: "Session 2" },
    { value: "regles", label: "Règles" },
]

const CHAMP_LABELS: Record<Champ, string> = { CC: "CC", EX1: "EX1", EX2: "EX2", ORAL: "Oral", STG1: "STG1" }

const STATUTS: Record<Statut, { label: string; className: string }> = {
    acquis: { label: "Acquis", className: "text-emerald-600 bg-emerald-50 border-emerald-200" },
    compense: { label: "Compensé", className: "text-blue-600 bg-blue-50 border-blue-200" },
    "non-acquis": { label: "Non acquis", className: "text-red-500 bg-red-50 border-red-200" },
}

const ETATS: Record<EtatRattrapage, { label: string; className: string }> = {
    acquis: { label: "Acquis en S1", className: "text-emerald-600 bg-emerald-50 border-emerald-200" },
    rattrapage: { label: "À rattraper", className: "text-amber-600 bg-amber-50 border-amber-200" },
    "sans-rattrapage": { label: "Pas de rattrapage", className: "text-slate-500 bg-slate-50 border-slate-200" },
    "en-attente": { label: "Note S1 manquante", className: "text-sky-600 bg-sky-50 border-sky-200" },
}

const RULES = [
    { icon: CheckCircle, color: "text-indigo-500", bg: "bg-indigo-50/60", border: "border-indigo-100", text: <>Année validée si <strong className="text-indigo-600">tous les niveaux ≥ 10/20</strong>, ou moyenne <strong className="text-indigo-600">≥ 10/20</strong> avec chaque niveau <strong className="text-indigo-600">≥ 8/20</strong></> },
    { icon: Scale, color: "text-blue-500", bg: "bg-blue-50/60", border: "border-blue-100", text: <>Les EC se compensent dans l&apos;UE, les UE dans le niveau : acquis dès <strong className="text-blue-600">10/20</strong> de moyenne pondérée par les ECTS. Valider un niveau ou l&apos;année <strong className="text-blue-600">valide tout ce qui le compose</strong></> },
    { icon: RotateCcw, color: "text-violet-500", bg: "bg-violet-50/60", border: "border-violet-100", text: <>Session 2 : rattrapage des <strong className="text-violet-600">EC &lt; 10/20</strong> des UE non validées. <strong className="text-violet-600">SAÉ et stage</strong> : pas de rattrapage</> },
    { icon: History, color: "text-sky-500", bg: "bg-sky-50/60", border: "border-sky-100", text: <>EC entre <strong className="text-sky-600">8 et 10/20</strong> : note de session 1 conservable en émargeant « Demande de report »</> },
    { icon: Award, color: "text-amber-500", bg: "bg-amber-50/60", border: "border-amber-100", text: <>Mentions : <strong className="text-amber-700">P</strong> (10), <strong className="text-amber-700">AB</strong> (12), <strong className="text-amber-700">B</strong> (14), <strong className="text-amber-700">TB</strong> (16)</> },
    { icon: AlertTriangle, color: "text-red-500", bg: "bg-red-50/60", border: "border-red-100", text: <>Absence à un examen ou absence injustifiée en CC : <strong className="text-red-600">0/20</strong></> },
    { icon: GraduationCap, color: "text-pink-500", bg: "bg-pink-50/60", border: "border-pink-100", text: <>Redoublement sur autorisation si moyenne <strong className="text-pink-600">≥ 8/20</strong>, pas de triplement</> },
    { icon: Save, color: "text-emerald-500", bg: "bg-emerald-50/60", border: "border-emerald-100", text: <><strong className="text-emerald-600">Sauvegarde automatique</strong> dans le navigateur</> },
]

const createInitialState = (): MasterState => ({ saisies: {}, reports: {} })

type SetSaisie = (id: string, champ: Champ, valeur: number | undefined) => void
type SetReport = (id: string, reporte: boolean) => void

function parseNote(raw: string): number | undefined {
    const note = Number.parseFloat(raw)
    return Number.isNaN(note) ? undefined : Math.min(20, Math.max(0, note))
}

// --- Small UI components ---

function StatutBadge({ statut, moyenne }: { statut: Statut; moyenne: number | null }) {
    if (moyenne == null) return null
    const { label, className } = STATUTS[statut]
    return <span className={`text-[10px] font-medium rounded-full px-2 py-0.5 border whitespace-nowrap ${className}`}>{label}</span>
}

function NoteInput({ label, value, disabled, onChange }: {
    label: string
    value?: number
    disabled?: boolean
    onChange: (value: number | undefined) => void
}) {
    return (
        <label className="flex flex-col items-center gap-0.5">
            <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
            <Input
                type="number"
                min="0"
                max="20"
                step="0.1"
                value={value ?? ""}
                disabled={disabled}
                onChange={(e) => onChange(parseNote(e.target.value))}
                className="w-15.5 h-8 text-center text-sm font-medium text-foreground bg-white border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-lg shadow-sm"
                placeholder="—"
            />
        </label>
    )
}

function ECHeader({ ec }: { ec: MasterEC }) {
    return (
        <div className="flex items-center gap-2">
            <span className="text-xs text-foreground/70 flex-1 min-w-0 truncate">{ec.code} - {ec.name}</span>
            {ec.sae && <span className="text-[9px] font-bold uppercase tracking-wider text-foreground/50 bg-slate-100 rounded px-1.5 py-0.5">SAÉ</span>}
            <span className="text-[10px] text-muted-foreground whitespace-nowrap tabular-nums">{ec.ects} ECTS</span>
        </div>
    )
}

function SemestreHeader({ numero, moyenne }: { numero: number; moyenne?: number | null }) {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-foreground">Semestre {numero}</h3>
            </div>
            {moyenne !== undefined && <MoyenneIndicator value={moyenne} size="md" />}
        </div>
    )
}

// --- Section components ---

function UECard({ ue, resultat, children }: { ue: MasterUE; resultat: ResultatMaster; children: ReactNode }) {
    const niveau = NIVEAUX[ue.niveau]
    const { moyenne, statut } = resultat.ues.get(ue)!

    return (
        <div className={`rounded-xl border overflow-hidden ${niveau.color} transition-shadow duration-300 hover:shadow-md`}>
            <div className={`px-4 py-3 ${niveau.bgGradient}`}>
                <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                        <span className="text-xs font-bold tracking-wide">{ue.code}</span>
                        <span className="text-[10px] opacity-60 ml-1.5">{ue.ects} ECTS</span>
                        <p className="text-[11px] opacity-70 truncate">{ue.niveau} · {niveau.name}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                        <StatutBadge statut={statut} moyenne={moyenne} />
                        <MoyenneIndicator value={moyenne} size="sm" />
                    </div>
                </div>
            </div>
            <div className="p-3 space-y-1.5">{children}</div>
        </div>
    )
}

function ECRow({ ec, note, state, onSaisie }: { ec: MasterEC; note: number | null; state: MasterState; onSaisie: SetSaisie }) {
    return (
        <div className="bg-white/80 rounded-lg px-3 py-2 border border-white space-y-1.5">
            <ECHeader ec={ec} />
            <div className="flex items-end gap-2">
                <code className="flex-1 min-w-0 text-[10px] text-muted-foreground truncate pb-2" title={ec.session1.texte}>{ec.session1.texte}</code>
                {champsASaisir(ec.session1).map((champ) => (
                    <NoteInput
                        key={champ}
                        label={CHAMP_LABELS[champ]}
                        value={state.saisies[ec.id]?.[champ]}
                        onChange={(valeur) => onSaisie(ec.id, champ, valeur)}
                    />
                ))}
                <div className="pb-1">
                    <MoyenneIndicator value={note} size="sm" />
                </div>
            </div>
        </div>
    )
}

function Session2Row({ ec, etat, note1, note2, state, onSaisie, onReport }: {
    ec: MasterEC
    etat: EtatRattrapage
    note1: number | null
    note2: number | null
    state: MasterState
    onSaisie: SetSaisie
    onReport: SetReport
}) {
    // SAÉ et stage : pas de seconde session, la note saisie vaut pour les deux sessions
    const formule = ec.session2 ?? ec.session1
    let champs: Champ[] = []
    if (!ec.session2) champs = champsASaisir(ec.session1)
    else if (etat !== "acquis") champs = champsASaisir(ec.session2, ec.session1.variables)

    const reporte = etat === "rattrapage" && !!state.reports[ec.id]
    const reportable = peutReporter(note1)

    return (
        <div className="bg-white/80 rounded-lg px-3 py-2 border border-white space-y-1.5">
            <ECHeader ec={ec} />
            <div className="flex items-end gap-2">
                <div className="flex-1 min-w-0 flex flex-col items-start gap-1 pb-1.5">
                    <span className={`text-[9px] font-semibold rounded px-1.5 py-0.5 border whitespace-nowrap ${ETATS[etat].className}`}>
                        {ETATS[etat].label}
                    </span>
                    <code className="max-w-full text-[10px] text-muted-foreground truncate" title={formule.texte}>
                        {etat === "acquis" && ec.session2 ? "Note de session 1 conservée" : formule.texte}
                    </code>
                </div>
                {ec.session2 && (
                    <span className="pb-2 text-[10px] text-muted-foreground whitespace-nowrap">
                        S1 <span className="tabular-nums font-medium text-foreground/70">{note1 != null ? note1.toFixed(2) : "—"}</span>
                    </span>
                )}
                {champs.map((champ) => (
                    <NoteInput
                        key={champ}
                        label={CHAMP_LABELS[champ]}
                        value={state.saisies[ec.id]?.[champ]}
                        disabled={reporte}
                        onChange={(valeur) => onSaisie(ec.id, champ, valeur)}
                    />
                ))}
                <div className="pb-1">
                    <MoyenneIndicator value={note2} size="sm" />
                </div>
            </div>
            {etat === "rattrapage" && (
                <label className={`flex items-center gap-2 text-[10px] ${reportable || reporte ? "text-foreground/70 cursor-pointer" : "text-muted-foreground/60"}`}>
                    <input
                        type="checkbox"
                        checked={reporte}
                        disabled={!reportable && !reporte}
                        onChange={(e) => onReport(ec.id, e.target.checked)}
                        className="h-3.5 w-3.5 accent-primary"
                    />
                    {reportable
                        ? "Reporter la note de session 1"
                        : reporte
                            ? "Report hors de 8–10/20 : compté absent (0/20)"
                            : "Report possible uniquement entre 8 et 10/20"}
                </label>
            )}
        </div>
    )
}

function NiveauxGrid({ resultat }: { resultat: ResultatMaster }) {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {resultat.niveaux.map((n) => (
                <div key={n.code} className={`rounded-xl border p-3 space-y-2 ${NIVEAUX[n.code].color}`}>
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold">
                            {n.code} <span className="font-normal opacity-60">· {n.ects} ECTS</span>
                        </span>
                        <MoyenneIndicator value={n.moyenne} size="sm" />
                    </div>
                    <p className="text-[11px] opacity-70 leading-snug line-clamp-2">{NIVEAUX[n.code].name}</p>
                    <StatutBadge statut={n.statut} moyenne={n.moyenne} />
                </div>
            ))}
        </div>
    )
}

function YearOverview({ session, notes, resultat, action }: { session: 1 | 2; notes: Notes; resultat: ResultatMaster; action?: ReactNode }) {
    const { moyenne, validee, compensation, mention, raisons, complet } = resultat
    const detail = moyenne == null
        ? "Aucune note saisie"
        : !complet
            ? "Résultat provisoire — notes incomplètes"
            : compensation
                ? "Validée par compensation"
                : validee
                    ? "Tous les niveaux de compétences sont acquis"
                    : "Toutes les notes sont saisies"

    return (
        <>
            <div className="glass-card rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-linear-to-br from-primary to-accent flex items-center justify-center shrink-0">
                        <span className="text-white font-bold text-lg">M1</span>
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-lg font-bold text-foreground">Session {session}</h2>
                            <MoyenneIndicator value={moyenne} size="md" />
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{detail}</p>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    {moyenne != null && <ValidationStatus validated={validee} mention={mention} />}
                    {action}
                </div>
            </div>
            {raisons.length > 0 && (
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
            {(session === 1 || !complet) && <SimulationCard sim={simulerMaster(notes, resultat)} />}
        </>
    )
}

function Session1Tab({ state, notes, resultat, onSaisie, onSession2 }: {
    state: MasterState
    notes: Notes
    resultat: ResultatMaster
    onSaisie: SetSaisie
    onSession2: () => void
}) {
    const action = resultat.moyenne != null && !resultat.validee && (
        <Button variant="outline" size="sm" onClick={onSession2} className="gap-1.5">
            Simuler la session 2
            <ArrowRight className="h-4 w-4" />
        </Button>
    )

    return (
        <div className="space-y-6">
            <YearOverview session={1} notes={notes} resultat={resultat} action={action} />
            <NiveauxGrid resultat={resultat} />
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {M1.map((semestre) => (
                    <div key={semestre.numero} className="space-y-4">
                        <SemestreHeader numero={semestre.numero} moyenne={moyenneMaster(semestre.ues.flatMap((ue) => ue.elements), notes)} />
                        <div className="space-y-3">
                            {semestre.ues.map((ue) => (
                                <UECard key={ue.code} ue={ue} resultat={resultat}>
                                    {ue.elements.map((ec) => (
                                        <ECRow key={ec.id} ec={ec} note={notes.get(ec) ?? null} state={state} onSaisie={onSaisie} />
                                    ))}
                                </UECard>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

function Session2Tab({ state, notes1, resultat1, notes2, resultat2, onSaisie, onReport }: {
    state: MasterState
    notes1: Notes
    resultat1: ResultatMaster
    notes2: Notes
    resultat2: ResultatMaster
    onSaisie: SetSaisie
    onReport: SetReport
}) {
    const reussite = resultat2.moyenne ?? 0

    return (
        <div className="space-y-6">
            <YearOverview session={2} notes={notes2} resultat={resultat2} />
            {resultat1.complet && resultat1.validee && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-50/80 border border-emerald-200">
                    <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                    <p className="text-sm text-emerald-800">
                        <span className="font-semibold">Année validée dès la session 1</span> : aucun EC à rattraper, toutes les notes sont conservées.
                    </p>
                </div>
            )}
            {resultat2.complet && !resultat2.validee && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50/80 border border-amber-200">
                    <Info className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                    <div className="text-sm text-amber-800">
                        <p className="font-semibold mb-1">Redoublement</p>
                        <p className="text-xs">
                            {reussite >= 8
                                ? "Moyenne ≥ 8/20 : le redoublement est possible, sur autorisation de la commission pédagogique."
                                : "Moyenne < 8/20 : le redoublement ne peut être accordé qu'à titre exceptionnel."}
                            {" "}Aucun triplement de la M1 n&apos;est autorisé.
                        </p>
                    </div>
                </div>
            )}
            <NiveauxGrid resultat={resultat2} />
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {M1.map((semestre) => (
                    <div key={semestre.numero} className="space-y-4">
                        <SemestreHeader numero={semestre.numero} moyenne={moyenneMaster(semestre.ues.flatMap((ue) => ue.elements), notes2)} />
                        <div className="space-y-3">
                            {semestre.ues.map((ue) => (
                                <UECard key={ue.code} ue={ue} resultat={resultat2}>
                                    {ue.elements.map((ec) => (
                                        <Session2Row
                                            key={ec.id}
                                            ec={ec}
                                            etat={etatRattrapage(ec, ue, resultat1, notes1)}
                                            note1={notes1.get(ec) ?? null}
                                            note2={notes2.get(ec) ?? null}
                                            state={state}
                                            onSaisie={onSaisie}
                                            onReport={onReport}
                                        />
                                    ))}
                                </UECard>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

function RulesTab() {
    return (
        <div className="glass-card rounded-2xl overflow-hidden">
            <div className="px-5 py-4 bg-linear-to-r from-primary/5 to-accent/5 border-b border-border/50">
                <h3 className="font-bold text-foreground flex items-center gap-2">
                    <Info className="h-4 w-4 text-primary" />
                    Règles de validation — M3C 2026-2027
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
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-2.5">Blocs de compétences</p>
                    <div className="flex flex-wrap gap-2">
                        {(Object.keys(NIVEAUX) as NiveauCode[]).map((code) => (
                            <span key={code} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-slate-50 border border-slate-100 rounded-full px-3 py-1">
                                <span className={`w-2 h-2 rounded-full ${NIVEAUX[code].dot}`} />
                                <strong className="text-foreground/70">{code}</strong>
                                <span className="hidden sm:inline">{NIVEAUX[code].name}</span>
                            </span>
                        ))}
                    </div>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Seule la M1 (parcours ILI et ILJ) bascule vers la maquette par compétences en 2026-2027. Le diplôme est délivré une fois les deux années validées (120 ECTS).
                </p>
            </div>
        </div>
    )
}

// --- Main component ---

export default function MasterCalculator() {
    const [state, setState] = usePersistedState(STORAGE_KEY, createInitialState)
    const [tab, setTab] = useState("session1")

    const notes1 = notesSession1(state.saisies)
    const resultat1 = analyserMaster(notes1)
    const notes2 = notesSession2(state, notes1, resultat1)
    const resultat2 = analyserMaster(notes2)

    const setSaisie: SetSaisie = (id, champ, valeur) => setState((prev) => ({
        ...prev,
        saisies: { ...prev.saisies, [id]: { ...prev.saisies[id], [champ]: valeur } },
    }))

    const setReport: SetReport = (id, reporte) => setState((prev) => ({
        ...prev,
        reports: { ...prev.reports, [id]: reporte },
    }))

    const resetData = () => {
        if (confirm("Êtes-vous sûr de vouloir effacer toutes les données ?")) {
            setState(createInitialState())
        }
    }

    return (
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-6">
            <Tabs value={tab} onValueChange={setTab} className="w-full">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                    <TabsList className="glass-card p-1 h-auto inline-flex w-auto">
                        {TABS.map((tab) => (
                            <TabsTrigger
                                key={tab.value}
                                value={tab.value}
                                className="text-sm px-5 py-2 data-[state=active]:bg-linear-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg transition-all duration-300"
                            >
                                {tab.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                    <Button variant="ghost" size="sm" onClick={resetData} className="text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors">
                        <Trash2 className="w-4 h-4 mr-1.5" />
                        Réinitialiser
                    </Button>
                </div>

                <TabsContent value="session1">
                    <Session1Tab state={state} notes={notes1} resultat={resultat1} onSaisie={setSaisie} onSession2={() => setTab("session2")} />
                </TabsContent>
                <TabsContent value="session2">
                    <Session2Tab
                        state={state}
                        notes1={notes1}
                        resultat1={resultat1}
                        notes2={notes2}
                        resultat2={resultat2}
                        onSaisie={setSaisie}
                        onReport={setReport}
                    />
                </TabsContent>
                <TabsContent value="regles">
                    <RulesTab />
                </TabsContent>
            </Tabs>
        </div>
    )
}
