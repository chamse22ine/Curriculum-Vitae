import { M1 } from "@/constants/master-data"
import { etatRattrapage, moyenneMaster, simulerMaster } from "@/lib/calculs-master"
import { analyserValidation, moyenneAnnee, moyenneSemestre, simulerObjectifs, type Objectif } from "@/lib/calculs"
import { fmt1, fmt2 } from "@/lib/format"
import type { MasterContexte } from "@/components/calculator/master-cards"
import type { Annee, Semestre } from "@/types/curriculum.types"

export type Ton = "success" | "warning" | "danger" | "neutral"

export type PointVigilance = { texte: string; ton: Ton; impact: number }

export type Verdict = {
    phrase: string
    ton: Ton
    moyenne: number | null
    detail: string
    mention?: string
    /** Session 2 : moyenne réelle de session 1, affichée à côté de la moyenne projetée */
    reelle?: number | null
    vigilance: PointVigilance[]
    courbe: { label: string; valeur: number | null }[]
}

const MAX_POINTS = 3

function ecart(moyenne: number): string {
    return fmt1(Math.ceil((10 - moyenne) * 10) / 10)
}

function phraseVerdict(moyenne: number | null, validee: boolean, complet: boolean, faibles: string[]): { phrase: string; ton: Ton } {
    if (moyenne == null) return { phrase: "Saisis tes premières notes", ton: "neutral" }
    if (validee) return { phrase: complet ? "Année validée" : "En passe de valider", ton: "success" }
    const ton: Ton = complet ? "danger" : "warning"
    if (moyenne < 10) return { phrase: `Il te manque ${ecart(moyenne)} pt`, ton }
    return { phrase: `${faibles.join(", ")} sous 8`, ton }
}

function pointsSimulation(global: Objectif, objectifs: Objectif[]): PointVigilance[] {
    const points: PointVigilance[] = []
    if (global.status === "besoin") {
        points.push({ texte: `Au moins ${fmt1(global.moyenneRequise)} de moyenne sur les ${global.ectsRestants} ECTS restants`, ton: "warning", impact: 40 + Math.max(0, global.moyenneRequise - 10) })
    } else if (global.status === "impossible" && global.ectsRestants > 0) {
        points.push({ texte: "10 de moyenne n'est plus atteignable", ton: "danger", impact: 110 })
    }
    for (const o of objectifs) {
        if (o.status === "impossible" && o.ectsRestants > 0) {
            points.push({ texte: `${o.code} ne peut plus atteindre 8`, ton: "danger", impact: 120 })
        } else if (o.status === "besoin" && o.moyenneActuelle < 8) {
            points.push({ texte: `${o.code} : au moins ${fmt1(o.moyenneRequise)} sur les ${o.ectsRestants} ECTS restants`, ton: "warning", impact: 30 + o.moyenneRequise - 8 })
        }
    }
    return points
}

/** Trois points de vigilance au plus, du plus au moins important */
function trier(points: PointVigilance[]): PointVigilance[] {
    return [...points].sort((a, b) => b.impact - a.impact).slice(0, MAX_POINTS)
}

/** Un seul point pour tous les blocs sous 8, du plus bas au plus haut */
function pointFaibles(faibles: { code: string; moyenne: number }[]): PointVigilance[] {
    if (faibles.length === 0) return []
    const tries = [...faibles].sort((a, b) => a.moyenne - b.moyenne)
    return [{
        texte: `${tries.map((f) => `${f.code} à ${fmt2(f.moyenne)}`).join(", ")} — il faut 8 minimum`,
        ton: "danger",
        impact: 100 + 8 - tries[0].moyenne,
    }]
}

export function masterVerdict(session: 1 | 2, ctx: MasterContexte): Verdict {
    const notes = session === 1 ? ctx.notes1 : ctx.notes2
    const r = session === 1 ? ctx.resultat1 : ctx.resultat2
    const sansNote = new Set([...notes].filter(([, note]) => note == null).map(([ec]) => ec.id)).size
    const faibles = r.niveaux.filter((n) => n.moyenne != null && n.moyenne < 8)

    const points = pointFaibles(faibles.map((n) => ({ code: n.code, moyenne: n.moyenne ?? 0 })))

    let { phrase, ton } = phraseVerdict(r.moyenne, r.validee, r.complet, faibles.map((n) => n.code))

    if (session === 1 && r.complet && !r.validee) {
        phrase = `Rattrapage en ${r.niveaux.filter((n) => n.statut === "non-acquis").map((n) => n.code).join(", ")}`
        ton = "danger"
        const codes = [...new Set(M1.flatMap((s) => s.ues.flatMap((ue) =>
            ue.elements.filter((ec) => etatRattrapage(ec, ue, r, notes) === "rattrapage").map((ec) => ec.code))))]
        if (codes.length > 0) {
            points.push({ texte: `${codes.length} EC à rattraper : ${codes.slice(0, 4).join(", ")}${codes.length > 4 ? "…" : ""}`, ton: "danger", impact: 90 })
        }
    }

    if (!r.complet && r.moyenne != null) {
        const sim = simulerMaster(notes, r)
        points.push(...pointsSimulation(sim.global, sim.objectifs))
    }

    if (session === 2 && r.complet && !r.validee && r.moyenne != null) {
        points.push(r.moyenne >= 8
            ? { texte: "Redoublement possible sur autorisation (moyenne ≥ 8)", ton: "warning", impact: 130 }
            : { texte: "Redoublement accordé seulement à titre exceptionnel", ton: "danger", impact: 130 })
    }

    for (const n of r.niveaux) {
        if (n.statut === "compense" && n.moyenne != null) points.push({ texte: `${n.code} compensé par l'année (${fmt2(n.moyenne)})`, ton: "warning", impact: 10 })
    }
    if (sansNote > 0 && r.moyenne != null) points.push({ texte: `${sansNote} EC sans note`, ton: "neutral", impact: 1 })

    let detail = "Aucune note saisie"
    if (r.moyenne != null) {
        if (!r.complet) detail = `Provisoire · ${sansNote} EC sans note`
        else if (session === 2 && ctx.resultat1.complet && ctx.resultat1.validee) detail = "Validée dès la session 1"
        else if (r.validee) detail = r.compensation ? "Validée par compensation" : "Tous les niveaux acquis"
        else detail = session === 1 ? "Résultat de session 1" : "Résultat après rattrapage"
    }

    return {
        phrase,
        ton,
        moyenne: r.moyenne,
        detail,
        mention: r.mention,
        reelle: session === 2 ? ctx.resultat1.moyenne : undefined,
        vigilance: trier(points),
        courbe: M1.map((s) => ({ label: `S${s.numero}`, valeur: moyenneMaster(s.ues.flatMap((ue) => ue.elements), notes) })),
    }
}

function aDesNotes(semestre: Semestre): boolean {
    return semestre.competences.some((c) => c.ues.some((u) => u.elements.some((ec) => ec.note != null)))
}

export function moyenneSemestreLicence(semestre: Semestre): number | null {
    return aDesNotes(semestre) ? moyenneSemestre(semestre) : null
}

export function licenceVerdict(data: Annee[], anneeIdx: number): Verdict {
    const annee = data[anneeIdx]
    const { validated, mention, competencesAnnuelles } = analyserValidation(annee)
    const sansNote = annee.semestres.flatMap((s) => s.competences.flatMap((c) => c.ues.flatMap((u) => u.elements))).filter((ec) => ec.note == null).length
    const moyenne = annee.semestres.some(aDesNotes) ? moyenneAnnee(annee) : null
    const complet = sansNote === 0
    const faibles = competencesAnnuelles.filter((c) => c.moyenne < 8)
    const { phrase, ton } = phraseVerdict(moyenne, validated, complet, faibles.map((c) => c.code))

    const points = pointFaibles(faibles)
    if (!complet && moyenne != null) {
        const sim = simulerObjectifs(annee)
        points.push(...pointsSimulation(sim.global, sim.objectifs))
    }
    if (sansNote > 0 && moyenne != null) points.push({ texte: `${sansNote} EC sans note`, ton: "neutral", impact: 1 })

    let detail = "Aucune note saisie"
    if (moyenne != null) {
        if (!complet) detail = `Provisoire · ${sansNote} EC sans note`
        else detail = validated ? "Toutes les conditions sont remplies" : "Toutes les notes sont saisies"
    }

    return {
        phrase,
        ton,
        moyenne,
        detail,
        mention: validated ? mention : undefined,
        vigilance: trier(points),
        courbe: data.flatMap((a) => a.semestres.map((s) => ({ label: `S${s.numero}`, valeur: moyenneSemestreLicence(s) }))),
    }
}
