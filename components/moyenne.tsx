"use client"

import { useState } from "react"
import { Award, CheckCircle, Keyboard, Scale, Trash2, Undo2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePersistedState } from "@/components/calculator-ui"
import { BlocsResume, type BlocResume } from "@/components/calculator/blocs-resume"
import { CalculatorShell, useNavigationBords, type NavGroupe } from "@/components/calculator/calculator-shell"
import { licenceCards, positionDeLigne } from "@/components/calculator/licence-cards"
import { RulesList, type Regle } from "@/components/calculator/rules-list"
import { UeCard, type Bloc, type Statut } from "@/components/calculator/ue-card"
import { useHistory, useUndoShortcut } from "@/components/calculator/use-history"
import { licenceVerdict, moyenneSemestreLicence } from "@/components/calculator/verdict"
import { TON_TEXTE } from "@/components/calculator/verdict-panel"
import { createInitialData } from "@/constants/curriculum-data"
import { analyserValidation, moyenneCompetenceAnnee, UE_NAMES } from "@/lib/calculs"
import { fmt2 } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { Annee } from "@/types/curriculum.types"

const STORAGE_KEY = "lcer-notes"
const SEMESTRE = /^(\d+)-(\d+)$/

const REGLES: Regle[] = [
    { icon: CheckCircle, texte: <>Année validée si la moyenne annuelle est <strong>≥ 10/20</strong> et chaque compétence <strong>≥ 8/20</strong>.</> },
    { icon: Scale, texte: <>Les compétences <strong>se compensent entre semestres</strong>, pondérées par les ECTS.</> },
    { icon: Award, texte: <>Mentions : <strong>AB</strong> 12, <strong>B</strong> 14, <strong>TB</strong> 16.</> },
    { icon: Keyboard, texte: <><strong>Entrée</strong> passe à la note suivante, <strong>↑ ↓</strong> ajustent de 0,25 (<strong>Maj</strong> : 1), <strong>Ctrl+Z</strong> annule. Sauvegarde automatique dans le navigateur.</> },
]

const LEGENDE = Object.entries(UE_NAMES).map(([code, label]) => ({ code, label, bloc: `c${code.slice(2)}` as Bloc }))

/** Moyenne annuelle de chaque compétence présente dans l'année */
function blocsLicence(annee: Annee): BlocResume[] {
    const { validated } = analyserValidation(annee)

    return Object.entries(UE_NAMES).flatMap(([code, label]) => {
        const elements = annee.semestres.flatMap((s) => s.competences.filter((c) => c.code.startsWith(code)).flatMap((c) => c.ues.flatMap((u) => u.elements)))
        if (elements.length === 0) return []

        const renseignes = elements.filter((ec) => ec.note != null).length
        const moyenne = renseignes > 0 ? moyenneCompetenceAnnee(annee, code) : null
        let statut: Statut = "attente"
        if (moyenne != null && renseignes === elements.length) {
            if (moyenne >= 10) statut = "acquis"
            else statut = moyenne >= 8 && validated ? "compense" : "non-acquis"
        }
        return [{ code, bloc: `c${code.slice(2)}` as Bloc, label, moyenne, statut }]
    })
}

function ResumeAnnees({ data, onOuvrir }: { data: Annee[]; onOuvrir: (id: string) => void }) {
    return (
        <section aria-labelledby="resume-titre" className="overflow-hidden rounded-lg border border-hairline bg-surface shadow-raise">
            <header className="border-b border-hairline bg-paper/60 px-5 py-4">
                <p className="num text-caption uppercase tracking-[0.14em] text-ink-muted">Résumé</p>
                <h2 id="resume-titre" className="mt-1 font-display text-h3 text-ink">Tes trois années de licence</h2>
            </header>
            <ul className="divide-y divide-hairline">
                {data.map((annee, a) => {
                    const verdict = licenceVerdict(data, a)
                    return (
                        <li key={annee.numero}>
                            <button
                                type="button"
                                onClick={() => onOuvrir(`${a}-0`)}
                                className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors duration-100 ease-out-ui hover:bg-surface-sunk"
                            >
                                <span className="num w-8 shrink-0 text-caption font-semibold text-primary">L{annee.numero}</span>
                                <span className="min-w-0 flex-1">
                                    <span className={cn("block truncate font-display text-xl", TON_TEXTE[verdict.ton])}>{verdict.phrase}</span>
                                    <span className="num block truncate text-caption text-ink-muted">
                                        {verdict.detail}
                                        {verdict.mention ? ` · mention ${verdict.mention}` : ""}
                                    </span>
                                </span>
                                <span className="num text-xl text-ink">{fmt2(verdict.moyenne)}</span>
                            </button>
                        </li>
                    )
                })}
            </ul>
        </section>
    )
}

export default function LCeRCalculator() {
    const [data, setData] = usePersistedState(STORAGE_KEY, createInitialData)
    const { commit, undo, canUndo } = useHistory(data, setData)
    const [vue, setVue] = useState("0-0")
    const [anneeIdx, setAnneeIdx] = useState(0)
    // Remonte les champs après une remise à zéro (efface aussi les saisies invalides en cours)
    const [generation, setGeneration] = useState(0)
    useUndoShortcut(undo)

    const selectionner = (id: string) => {
        setVue(id)
        const position = SEMESTRE.exec(id)
        if (position) setAnneeIdx(Number(position[1]))
    }

    const semestres = data.flatMap((annee, a) => annee.semestres.map((_, s) => `${a}-${s}`))
    const onEdge = useNavigationBords(semestres, vue, selectionner)

    const setNote = (id: string, value: number | null) => {
        const [a, s, c, u, e] = positionDeLigne(id)
        const next = structuredClone(data)
        const ec = next[a].semestres[s].competences[c].ues[u].elements[e]
        if (value == null) delete ec.note
        else ec.note = value
        commit(next, id)
    }

    const resetAll = () => {
        if (confirm("Effacer toutes les notes de licence ?")) {
            commit(createInitialData())
            setGeneration((g) => g + 1)
        }
    }

    const groupes: NavGroupe[] = [
        ...data.map((annee, a) => ({
            titre: `Licence ${annee.numero}`,
            items: annee.semestres.map((s, si) => ({
                id: `${a}-${si}`,
                label: `Semestre ${s.numero}`,
                court: `S${s.numero}`,
                valeur: moyenneSemestreLicence(s),
            })),
        })),
        { items: [{ id: "resume", label: "Résumé des années", court: "Résumé" }, { id: "regles", label: "Règles", court: "Règles" }] },
    ]

    const position = SEMESTRE.exec(vue)

    const barre = (
        <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="num text-caption uppercase tracking-[0.14em] text-ink-muted">Verdict : Licence {data[anneeIdx].numero}</p>
            <div className="flex flex-wrap items-center gap-1">
                <Button variant="ghost" size="sm" onClick={undo} disabled={!canUndo} className="gap-1.5 text-ink-soft">
                    <Undo2 className="size-4" aria-hidden />
                    Annuler
                </Button>
                <Button variant="ghost" size="sm" onClick={resetAll} className="gap-1.5 text-ink-muted hover:text-danger">
                    <Trash2 className="size-4" aria-hidden />
                    Réinitialiser
                </Button>
            </div>
        </div>
    )

    let contenu
    if (position) {
        const a = Number(position[1])
        const s = Number(position[2])
        const annee = data[a]
        const semestre = annee.semestres[s]
        const dense = annee.semestres.reduce((n, sem) => n + sem.competences.length, 0) > 8

        contenu = (
            <div className="space-y-4">
                <div className="flex items-baseline justify-between gap-3">
                    <h2 className="font-display text-h3 text-ink">
                        Semestre {semestre.numero} <span className="num text-caption text-ink-muted">· Licence {annee.numero}</span>
                    </h2>
                    <p className="num text-ui text-ink-muted">{fmt2(moyenneSemestreLicence(semestre))}</p>
                </div>
                <BlocsResume titre="Compétences sur l'année" blocs={blocsLicence(annee)} />
                {licenceCards(annee, a, s).map((card) => (
                    <UeCard key={`${generation}-${card.code}`} {...card} dense={dense} onNoteChange={setNote} onEdge={onEdge} />
                ))}
            </div>
        )
    } else if (vue === "resume") {
        contenu = <ResumeAnnees data={data} onOuvrir={selectionner} />
    } else {
        contenu = <RulesList titre="Licence Informatique" regles={REGLES} legende={LEGENDE} />
    }

    return (
        <CalculatorShell groupes={groupes} courant={vue} onSelect={selectionner} barre={barre} verdict={licenceVerdict(data, anneeIdx)}>
            {contenu}
        </CalculatorShell>
    )
}
