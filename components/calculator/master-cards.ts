import { NIVEAUX } from "@/constants/master-data"
import { champsASaisir, etatRattrapage, peutReporter, type Notes, type ResultatMaster } from "@/lib/calculs-master"
import { fmt2 } from "@/lib/format"
import { cibleUe } from "@/components/calculator/cible"
import type { Bloc, Note, Statut, UeCardData } from "@/components/calculator/ue-card"
import type { Champ, MasterEC, MasterSemestre, MasterState, MasterUE, NiveauCode } from "@/types/master.types"

export type MasterContexte = {
    state: MasterState
    notes1: Notes
    resultat1: ResultatMaster
    notes2: Notes
    resultat2: ResultatMaster
}

const BLOC: Record<NiveauCode, Bloc> = { C1: "c1", C2: "c2", C3: "c3", C4: "c4" }
const CHAMP_LABEL: Record<Champ, string> = { CC: "CC", EX1: "EX1", EX2: "EX2", ORAL: "Oral", STG1: "STG1" }

/** Identifiant de ligne « UE1.1:GP:CC » : unique même pour le stage, présent dans quatre UE */
function ligneId(ue: MasterUE, ec: MasterEC, suffixe: string): string {
    return `${ue.code.replace(/\s+/g, "")}:${ec.id}:${suffixe}`
}

export function champDeLigne(id: string): { ecId: string; champ: Champ } {
    const [, ecId, champ] = id.split(":")
    return { ecId, champ: champ as Champ }
}

// Ordre de saisie : le contrôle continu est connu avant l'examen
const ORDRE_CHAMPS: Champ[] = ["CC", "EX1", "STG1", "EX2", "ORAL"]

function lignesSession1(ue: MasterUE, ec: MasterEC, { state, notes1 }: MasterContexte, partage: boolean): Note[] {
    const champs = champsASaisir(ec.session1).sort((a, b) => ORDRE_CHAMPS.indexOf(a) - ORDRE_CHAMPS.indexOf(b))
    const note = notes1.get(ec) ?? null
    const formule = champs.length === 1 && ec.session1.texte === champs[0] ? "" : ` · ${ec.session1.texte}`
    const resultat = note != null && formule ? ` = ${fmt2(note)}` : ""

    return champs.map((champ, i) => ({
        id: ligneId(ue, ec, champ),
        label: champs.length > 1 ? `${ec.name} · ${CHAMP_LABEL[champ]}` : ec.name,
        meta: i === 0 ? `${ec.code}${ec.sae ? " · SAÉ" : ""}${formule}${resultat}${partage ? " · note commune" : ""}` : undefined,
        coef: i === 0 ? ec.ects : undefined,
        value: state.saisies[ec.id]?.[champ] ?? null,
    }))
}

function ligneSession2(ue: MasterUE, ec: MasterEC, { state, notes1, resultat1, notes2 }: MasterContexte): Note {
    const note1 = notes1.get(ec) ?? null
    const etat = etatRattrapage(ec, ue, resultat1, notes1)

    if (!ec.session2 || etat === "acquis") {
        return {
            id: ligneId(ue, ec, "report"),
            label: ec.name,
            meta: `${ec.code} · ${ec.session2 ? "note reportée" : "SAÉ sans rattrapage · note reportée"}`,
            coef: ec.ects,
            value: note1,
            locked: true,
        }
    }

    const champ = champsASaisir(ec.session2, ec.session1.variables)[0]
    const reporte = etat === "rattrapage" && !!state.reports[ec.id]
    const reportable = peutReporter(note1)
    const note2 = notes2.get(ec) ?? null

    let hint = "report possible entre 8 et 10"
    if (reportable) hint = `reporter la note de session 1 (${fmt2(note1)})`
    else if (reporte) hint = "report hors de 8–10 : compté 0"

    return {
        id: ligneId(ue, ec, champ),
        label: `${ec.name} · ${CHAMP_LABEL[champ]}`,
        meta: `${ec.code} · S1 ${fmt2(note1)} · ${ec.session2.texte}${note2 != null ? ` = ${fmt2(note2)}` : ""}`,
        coef: ec.ects,
        value: state.saisies[ec.id]?.[champ] ?? null,
        hypothese: true,
        locked: reporte,
        report: etat === "rattrapage" ? { checked: reporte, enabled: reportable || reporte, hint } : undefined,
    }
}

export function masterCards(semestre: MasterSemestre, session: 1 | 2, ctx: MasterContexte): UeCardData[] {
    const notes = session === 1 ? ctx.notes1 : ctx.notes2
    const resultat = session === 1 ? ctx.resultat1 : ctx.resultat2

    const occurrences = new Map<string, number>()
    for (const ec of semestre.ues.flatMap((ue) => ue.elements)) occurrences.set(ec.id, (occurrences.get(ec.id) ?? 0) + 1)

    return semestre.ues.map((ue) => {
        const { moyenne, statut: statutUe } = resultat.ues.get(ue)!
        const complet = ue.elements.every((ec) => notes.get(ec) != null)
        const statut: Statut = moyenne == null || !complet ? "attente" : statutUe
        const niveau = resultat.niveaux.find((n) => n.code === ue.niveau)!

        let compensation: string | undefined
        if (statut === "compense") {
            compensation = niveau.moyenne != null && niveau.moyenne >= 10
                ? `compensé par ${ue.niveau} (${fmt2(niveau.moyenne)})`
                : `compensé par l'année (${fmt2(resultat.moyenne)})`
        }

        let cible = cibleUe(ue.elements.map((ec) => ({ ects: ec.ects, note: notes.get(ec) ?? null })), moyenne, statut)
        if (!cible && statut === "non-acquis") cible = session === 1 ? "EC sous 10 au rattrapage" : "UE non acquise après rattrapage"

        return {
            bloc: BLOC[ue.niveau],
            code: ue.code,
            titre: NIVEAUX[ue.niveau].name,
            moyenne,
            coef: ue.ects,
            statut,
            compensation,
            cible,
            notes: session === 1
                ? ue.elements.flatMap((ec) => lignesSession1(ue, ec, ctx, (occurrences.get(ec.id) ?? 0) > 1))
                : ue.elements.map((ec) => ligneSession2(ue, ec, ctx)),
        }
    })
}
