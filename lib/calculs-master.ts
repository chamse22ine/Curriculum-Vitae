import { M1, NIVEAUX } from "@/constants/master-data"
import type { Objectif, Simulation } from "@/lib/calculs"
import type { Champ, Formule, MasterEC, MasterState, MasterUE, NiveauCode, Saisies, Valeurs, Variable } from "@/types/master.types"

export type Notes = Map<MasterEC, number | null>

const UES = M1.flatMap((sem) => sem.ues)
const TOUS_LES_EC = UES.flatMap((ue) => ue.elements)
const NIVEAU_CODES = Object.keys(NIVEAUX) as NiveauCode[]

function elementsDuNiveau(code: NiveauCode): MasterEC[] {
    return UES.filter((ue) => ue.niveau === code).flatMap((ue) => ue.elements)
}

// --- Notes des EC ---

/** Champs à saisir pour une formule, hors SAESR (note de la SAÉ déjà saisie) et champs déjà saisis */
export function champsASaisir(formule: Formule, dejaSaisis: Variable[] = []): Champ[] {
    return formule.variables.filter((v): v is Champ => v !== "SAESR" && !dejaSaisis.includes(v))
}

export function evaluer(formule: Formule, ec: MasterEC, saisies: Saisies): number | null {
    const valeurs = {} as Valeurs
    for (const variable of formule.variables) {
        const valeur = variable === "SAESR" ? saisies.SAESR?.CC : saisies[ec.id]?.[variable]
        if (valeur == null) return null
        valeurs[variable] = valeur
    }
    return formule.calcul(valeurs)
}

export function notesSession1(saisies: Saisies): Notes {
    return new Map(TOUS_LES_EC.map((ec) => [ec, evaluer(ec.session1, ec, saisies)]))
}

// --- Moyennes pondérées par ECTS ---

function bilan(elements: MasterEC[], notes: Notes) {
    let somme = 0, ectsNotes = 0, ectsTotal = 0
    for (const ec of elements) {
        const note = notes.get(ec)
        ectsTotal += ec.ects
        if (note != null) {
            somme += note * ec.ects
            ectsNotes += ec.ects
        }
    }
    return { somme, ectsNotes, ectsTotal, moyenne: ectsNotes > 0 ? somme / ectsNotes : null }
}

export function moyenneMaster(elements: MasterEC[], notes: Notes): number | null {
    return bilan(elements, notes).moyenne
}

// --- Validation annuelle ---

export type Statut = "acquis" | "compense" | "non-acquis"

export interface ResultatNiveau {
    code: NiveauCode
    ects: number
    moyenne: number | null
    statut: Statut
}

export interface ResultatMaster {
    moyenne: number | null
    complet: boolean
    validee: boolean
    compensation: boolean
    mention?: string
    raisons: string[]
    niveaux: ResultatNiveau[]
    ues: Map<MasterUE, { moyenne: number | null; statut: Statut }>
}

function statut(moyenne: number | null, compense: boolean): Statut {
    if (moyenne != null && moyenne >= 10) return "acquis"
    return compense ? "compense" : "non-acquis"
}

export function analyserMaster(notes: Notes): ResultatMaster {
    const global = bilan(TOUS_LES_EC, notes)
    const moyenne = global.moyenne
    const bilans = NIVEAU_CODES.map((code) => ({ code, ...bilan(elementsDuNiveau(code), notes) }))
    const renseignes = bilans.filter((n) => n.moyenne != null)
    const faibles = renseignes.filter((n) => n.moyenne! < 8)

    // Validation directe (tous les niveaux ≥ 10) ou par compensation (moyenne ≥ 10 et niveaux ≥ 8)
    const validee = moyenne != null && moyenne >= 10 && faibles.length === 0
    const compensation = validee && renseignes.some((n) => n.moyenne! < 10)

    const niveaux = bilans.map(({ code, ectsTotal, moyenne }) => ({ code, ects: ectsTotal, moyenne, statut: statut(moyenne, validee) }))
    const ues = new Map(UES.map((ue) => {
        const { moyenne } = bilan(ue.elements, notes)
        const niveau = niveaux.find((n) => n.code === ue.niveau)!
        return [ue, { moyenne, statut: statut(moyenne, niveau.statut !== "non-acquis") }]
    }))

    const raisons: string[] = []
    if (moyenne != null && !validee) {
        if (moyenne < 10) raisons.push(`Moyenne annuelle insuffisante (${moyenne.toFixed(2)}/20 < 10/20)`)
        if (faibles.length > 0) {
            raisons.push(`Niveau(x) de compétences < 8/20 : ${faibles.map((n) => `${n.code} (${n.moyenne!.toFixed(2)}/20)`).join(", ")}`)
            if (moyenne >= 10) raisons.push("Aucune note de niveau < 10/20 ne sera conservée l'année suivante : seules les UE validées sont capitalisées")
        }
    }

    const mention = validee ? (moyenne >= 16 ? "Très bien" : moyenne >= 14 ? "Bien" : moyenne >= 12 ? "Assez bien" : "Passable") : undefined

    return { moyenne, complet: global.ectsNotes === global.ectsTotal, validee, compensation, mention, raisons, niveaux, ues }
}

// --- Seconde session ---

export type EtatRattrapage = "acquis" | "rattrapage" | "sans-rattrapage" | "en-attente"

/** Un EC est acquis si son UE est validée (directement ou par compensation) ou si sa note est ≥ 10 */
export function etatRattrapage(ec: MasterEC, ue: MasterUE, resultat1: ResultatMaster, notes1: Notes): EtatRattrapage {
    const note = notes1.get(ec)
    if (note == null) return "en-attente"
    if (resultat1.ues.get(ue)!.statut !== "non-acquis" || note >= 10) return "acquis"
    return ec.session2 ? "rattrapage" : "sans-rattrapage"
}

export function peutReporter(note: number | null | undefined): boolean {
    return note != null && note >= 8 && note < 10
}

export function notesSession2(state: MasterState, notes1: Notes, resultat1: ResultatMaster): Notes {
    return new Map(UES.flatMap((ue) => ue.elements.map((ec): [MasterEC, number | null] => {
        const note1 = notes1.get(ec) ?? null
        const etat = etatRattrapage(ec, ue, resultat1, notes1)
        if (etat === "acquis" || !ec.session2) return [ec, note1]
        // Report demandé hors de [8, 10[ : l'étudiant est considéré absent
        if (etat === "rattrapage" && state.reports[ec.id]) return [ec, peutReporter(note1) ? note1 : 0]
        // À rattraper, ou note de session 1 manquante : pronostic de session 2
        return [ec, evaluer(ec.session2, ec, state.saisies)]
    })))
}

// --- Simulation : objectifs pour valider ---

function objectif(code: string, label: string, elements: MasterEC[], notes: Notes, seuil: number): Objectif {
    const { somme, ectsNotes, ectsTotal } = bilan(elements, notes)
    const ectsRestants = ectsTotal - ectsNotes
    const moyenneActuelle = ectsNotes > 0 ? somme / ectsNotes : 0
    const base = { code, label, moyenneActuelle, moyenneRequise: 0, ectsRemplis: ectsNotes, ectsRestants }

    if (ectsNotes === 0) return { ...base, status: "aucune-note" }
    if (ectsRestants === 0) return { ...base, status: moyenneActuelle >= seuil ? "ok" : "impossible" }

    const moyenneRequise = (seuil * ectsTotal - somme) / ectsRestants
    if (moyenneRequise <= 0) return { ...base, status: "ok" }
    return { ...base, status: moyenneRequise > 20 ? "impossible" : "besoin", moyenneRequise }
}

/** Notes nécessaires sur les EC restants : moyenne ≥ 10 et chaque niveau ≥ 8 */
export function simulerMaster(notes: Notes, resultat: ResultatMaster): Simulation {
    return {
        global: objectif("Global", "Moyenne générale", TOUS_LES_EC, notes, 10),
        objectifs: NIVEAU_CODES.map((code) => objectif(code, NIVEAUX[code].name, elementsDuNiveau(code), notes, 8)),
        visible: resultat.moyenne != null && !resultat.validee,
    }
}
