"use client"

import { useRef, useState } from "react"
import { AlertTriangle, ArrowRight, Award, CheckCircle, Eraser, GraduationCap, History, Keyboard, RotateCcw, Scale, Trash2, Undo2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePersistedState } from "@/components/calculator-ui"
import { BlocsResume, type BlocResume } from "@/components/calculator/blocs-resume"
import { CalculatorShell, useNavigationBords, type NavGroupe } from "@/components/calculator/calculator-shell"
import { BLOC_NIVEAU, champDeLigne, masterCards, type MasterContexte } from "@/components/calculator/master-cards"
import { EntreeCartes, useTransitionCle } from "@/components/calculator/motion"
import { RulesList, type Regle } from "@/components/calculator/rules-list"
import { UeCard } from "@/components/calculator/ue-card"
import { useHistory, useUndoShortcut } from "@/components/calculator/use-history"
import { masterVerdict } from "@/components/calculator/verdict"
import { M1, NIVEAUX } from "@/constants/master-data"
import { analyserMaster, moyenneMaster, notesSession1, notesSession2 } from "@/lib/calculs-master"
import { fmt2 } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { MasterState, NiveauCode } from "@/types/master.types"

const STORAGE_KEY = "master-info-notes"
const SEMESTRES = M1.map((s) => `S${s.numero}`)

const REGLES: Regle[] = [
    { icon: CheckCircle, texte: <>Année validée si <strong>tous les niveaux ≥ 10/20</strong>, ou moyenne <strong>≥ 10/20</strong> avec chaque niveau <strong>≥ 8/20</strong>.</> },
    { icon: Scale, texte: <>Les EC se compensent dans l&apos;UE, les UE dans le niveau : acquis dès <strong>10/20</strong> de moyenne pondérée par les ECTS. Valider un niveau ou l&apos;année <strong>valide tout ce qui le compose</strong>.</> },
    { icon: RotateCcw, texte: <>Session 2 : rattrapage des <strong>EC sous 10/20</strong> des UE non validées. <strong>SAÉ et stage</strong> : pas de rattrapage.</> },
    { icon: History, texte: <>EC entre <strong>8 et 10/20</strong> : note de session 1 conservable en émargeant « Demande de report ».</> },
    { icon: Award, texte: <>Mentions : <strong>P</strong> 10, <strong>AB</strong> 12, <strong>B</strong> 14, <strong>TB</strong> 16.</> },
    { icon: AlertTriangle, texte: <>Absence à un examen ou absence injustifiée en CC : <strong>0/20</strong>.</> },
    { icon: GraduationCap, texte: <>Redoublement sur autorisation si moyenne <strong>≥ 8/20</strong>, pas de triplement.</> },
    { icon: Keyboard, texte: <><strong>Entrée</strong> passe à la note suivante, <strong>↑ ↓</strong> ajustent de 0,25 (<strong>Maj</strong> : 1), <strong>Ctrl+Z</strong> annule. Sauvegarde automatique dans le navigateur.</> },
]

const LEGENDE = (Object.keys(NIVEAUX) as NiveauCode[]).map((code) => ({ code, label: NIVEAUX[code].name, bloc: BLOC_NIVEAU[code] }))

const createInitialState = (): MasterState => ({ saisies: {}, reports: {} })

export default function MasterCalculator() {
    const [state, setState] = usePersistedState(STORAGE_KEY, createInitialState)
    const { commit, undo, canUndo } = useHistory(state, setState)
    const [session, setSession] = useState<1 | 2>(1)
    const [vue, setVue] = useState(SEMESTRES[0])
    // Remonte les champs après une remise à zéro (efface aussi les saisies invalides en cours)
    const [generation, setGeneration] = useState(0)
    useUndoShortcut(undo)
    const onEdge = useNavigationBords(SEMESTRES, vue, setVue)
    const zoneSession = useRef<HTMLDivElement>(null)
    useTransitionCle(zoneSession, session)

    const notes1 = notesSession1(state.saisies)
    const resultat1 = analyserMaster(notes1)
    const notes2 = notesSession2(state, notes1, resultat1)
    const resultat2 = analyserMaster(notes2)
    const ctx: MasterContexte = { state, notes1, resultat1, notes2, resultat2 }
    const notes = session === 1 ? notes1 : notes2
    const resultat = session === 1 ? resultat1 : resultat2

    const setNote = (id: string, value: number | null) => {
        const { ecId, champ } = champDeLigne(id)
        const saisie = { ...state.saisies[ecId] }
        if (value == null) delete saisie[champ]
        else saisie[champ] = value
        commit({ ...state, saisies: { ...state.saisies, [ecId]: saisie } }, `${ecId}:${champ}`)
    }

    const setReport = (id: string, checked: boolean) => {
        const { ecId } = champDeLigne(id)
        commit({ ...state, reports: { ...state.reports, [ecId]: checked } })
    }

    const aDesHypotheses = Object.values(state.saisies).some((s) => s.EX2 != null || s.ORAL != null) || Object.values(state.reports).some(Boolean)

    const resetHypotheses = () => {
        const saisies: MasterState["saisies"] = {}
        for (const [id, saisie] of Object.entries(state.saisies)) {
            const copie = { ...saisie }
            delete copie.EX2
            delete copie.ORAL
            saisies[id] = copie
        }
        commit({ saisies, reports: {} })
        setGeneration((g) => g + 1)
    }

    const resetAll = () => {
        if (confirm("Effacer toutes les notes du master ?")) {
            commit(createInitialState())
            setGeneration((g) => g + 1)
        }
    }

    const blocs: BlocResume[] = resultat.niveaux.map((n) => {
        const complet = M1.flatMap((s) => s.ues).filter((ue) => ue.niveau === n.code).flatMap((ue) => ue.elements).every((ec) => notes.get(ec) != null)
        return {
            code: n.code,
            bloc: BLOC_NIVEAU[n.code],
            label: NIVEAUX[n.code].name,
            moyenne: n.moyenne,
            statut: n.moyenne == null || !complet ? "attente" : n.statut,
        }
    })

    const groupes: NavGroupe[] = [
        {
            titre: "Master 1",
            items: M1.map((s) => ({
                id: `S${s.numero}`,
                label: `Semestre ${s.numero}`,
                court: `S${s.numero}`,
                valeur: moyenneMaster(s.ues.flatMap((ue) => ue.elements), notes),
            })),
        },
        { items: [{ id: "regles", label: "Règles M3C", court: "Règles" }] },
    ]

    const semestre = M1.find((s) => `S${s.numero}` === vue)

    const action = session === 1 && resultat1.moyenne != null && !resultat1.validee ? (
        <Button onClick={() => setSession(2)} className="h-10 w-full gap-2 bg-accent text-accent-foreground hover:bg-accent-hover">
            Simuler la session 2
            <ArrowRight className="size-4" aria-hidden />
        </Button>
    ) : undefined

    const barre = (
        <div className="flex flex-wrap items-center justify-between gap-3">
            <div role="group" aria-label="Session" className="inline-flex rounded-md bg-surface-sunk p-1">
                {([1, 2] as const).map((s) => (
                    <button
                        key={s}
                        type="button"
                        aria-pressed={session === s}
                        onClick={() => setSession(s)}
                        className={cn(
                            "h-8 rounded-sm px-3 text-ui transition-colors duration-100 ease-out-ui",
                            session === s ? "bg-surface text-ink shadow-raise" : "text-ink-muted hover:text-ink"
                        )}
                    >
                        Session {s}
                    </button>
                ))}
            </div>
            <div className="flex flex-wrap items-center gap-1">
                <Button variant="ghost" size="sm" onClick={undo} disabled={!canUndo} className="gap-1.5 text-ink-soft">
                    <Undo2 className="size-4" aria-hidden />
                    Annuler
                </Button>
                {session === 2 && (
                    <Button variant="ghost" size="sm" onClick={resetHypotheses} disabled={!aDesHypotheses} className="gap-1.5 text-ink-soft">
                        <Eraser className="size-4" aria-hidden />
                        Hypothèses à zéro
                    </Button>
                )}
                <Button variant="ghost" size="sm" onClick={resetAll} className="gap-1.5 text-ink-muted hover:text-danger">
                    <Trash2 className="size-4" aria-hidden />
                    Réinitialiser
                </Button>
            </div>
        </div>
    )

    return (
        <CalculatorShell groupes={groupes} courant={vue} onSelect={setVue} barre={barre} verdict={masterVerdict(session, ctx)} action={action}>
            {semestre ? (
                <div ref={zoneSession} className="space-y-4">
                    <div className="flex items-baseline justify-between gap-3">
                        <h2 className="font-display text-h3 text-ink">
                            Semestre {semestre.numero} <span className="num text-caption text-ink-muted">· session {session}</span>
                        </h2>
                        <p className="num text-ui text-ink-muted">{fmt2(moyenneMaster(semestre.ues.flatMap((ue) => ue.elements), notes))}</p>
                    </div>
                    <BlocsResume titre="Niveaux de compétences" blocs={blocs} />
                    {session === 2 && resultat1.complet && resultat1.validee && (
                        <p className="rounded-md border border-success-line bg-success-wash px-4 py-3 text-ui text-success">
                            Année validée dès la session 1 : aucune note à rattraper.
                        </p>
                    )}
                    <EntreeCartes key={vue} className="space-y-4">
                        {masterCards(semestre, session, ctx).map((card) => (
                            <UeCard key={`${generation}-${card.code}`} {...card} onNoteChange={setNote} onReportChange={setReport} onEdge={onEdge} />
                        ))}
                    </EntreeCartes>
                </div>
            ) : (
                <RulesList
                    titre="M3C 2026-2027 · Master 1"
                    regles={REGLES}
                    legende={LEGENDE}
                    note="Seule la M1 (parcours ILI et ILJ) bascule vers la maquette par compétences en 2026-2027. Le diplôme est délivré une fois les deux années validées (120 ECTS)."
                />
            )}
        </CalculatorShell>
    )
}
