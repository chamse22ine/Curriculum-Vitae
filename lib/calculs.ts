import type { Annee, Semestre, Competence, UE } from "@/types/curriculum.types"

// --- Moyennes pondérées par ECTS ---

export function moyenneUE(ue: UE): number {
    const valides = ue.elements.filter((ec) => ec.note != null)
    if (valides.length === 0) return 0
    const somme = valides.reduce((s, ec) => s + ec.note! * ec.ects, 0)
    const ects = valides.reduce((s, ec) => s + ec.ects, 0)
    return ects > 0 ? somme / ects : 0
}

export function moyenneCompetence(comp: Competence): number {
    return moyennePonderee(comp.ues, moyenneUE, (ue) => ue.ects)
}

export function moyenneSemestre(sem: Semestre): number {
    return moyennePonderee(sem.competences, moyenneCompetence, (c) => c.ues.reduce((s, ue) => s + ue.ects, 0))
}

export function moyenneAnnee(annee: Annee): number {
    const [m1, m2] = annee.semestres.map(moyenneSemestre)
    if (m1 === 0 && m2 === 0) return 0
    if (m1 === 0) return m2
    if (m2 === 0) return m1
    return (m1 + m2) / 2
}

export function moyenneCompetenceAnnee(annee: Annee, codePrefix: string): number {
    let somme = 0, ects = 0
    for (const sem of annee.semestres) {
        const comp = sem.competences.find((c) => c.code.startsWith(codePrefix))
        if (!comp) continue
        for (const ue of comp.ues) {
            for (const ec of ue.elements) {
                if (ec.note != null) {
                    somme += ec.note * ec.ects
                    ects += ec.ects
                }
            }
        }
    }
    return ects > 0 ? somme / ects : 0
}

// --- Validation annuelle ---

export interface ValidationResult {
    validated: boolean
    mention?: string
    raisons: string[]
    competencesAnnuelles: { code: string; moyenne: number }[]
}

const UE_CODES = ["UE1", "UE2", "UE3", "UE4", "UE5"]

export function analyserValidation(annee: Annee): ValidationResult {
    const moy = moyenneAnnee(annee)
    if (moy === 0) return { validated: false, raisons: ["Aucune note saisie"], competencesAnnuelles: [] }

    const competencesAnnuelles = UE_CODES
        .map((code) => ({ code, moyenne: moyenneCompetenceAnnee(annee, code) }))
        .filter((c) => c.moyenne > 0)

    const raisons: string[] = []
    if (moy < 10) raisons.push(`Moyenne générale insuffisante (${moy.toFixed(2)}/20 < 10/20)`)

    const faibles = competencesAnnuelles.filter((c) => c.moyenne < 8)
    if (faibles.length > 0) {
        raisons.push(`Compétence(s) annuelle(s) < 8/20 : ${faibles.map((c) => `${c.code} (${c.moyenne.toFixed(2)}/20)`).join(", ")}`)
    }

    const validated = moy >= 10 && faibles.length === 0
    const mention = validated ? (moy >= 16 ? "Très bien" : moy >= 14 ? "Bien" : moy >= 12 ? "Assez bien" : undefined) : undefined

    return { validated, mention, raisons, competencesAnnuelles }
}

// --- Simulation : objectifs pour valider ---

export interface Objectif {
    code: string
    label: string
    status: "ok" | "besoin" | "impossible" | "aucune-note"
    moyenneActuelle: number
    moyenneRequise: number // note moyenne nécessaire sur les ECs restants
    ectsRemplis: number
    ectsRestants: number
}

export interface Simulation {
    objectifs: Objectif[]
    global: Objectif
    visible: boolean // au moins 1 note + au moins 1 EC restant + pas encore validé
}

/** Calcule les notes nécessaires sur les matières restantes pour valider l'année */
export function simulerObjectifs(annee: Annee): Simulation {
    const validation = analyserValidation(annee)

    // Collecter toutes les ECs de l'année
    let totalFilledSum = 0, totalFilledEcts = 0, totalRemainingEcts = 0
    for (const sem of annee.semestres) {
        for (const comp of sem.competences) {
            for (const ue of comp.ues) {
                for (const ec of ue.elements) {
                    if (ec.note != null) {
                        totalFilledSum += ec.note * ec.ects
                        totalFilledEcts += ec.ects
                    } else {
                        totalRemainingEcts += ec.ects
                    }
                }
            }
        }
    }

    const hasNotes = totalFilledEcts > 0
    const hasRemaining = totalRemainingEcts > 0
    const visible = hasNotes && !validation.validated

    // Par compétence
    const objectifs: Objectif[] = UE_CODES.map((code) => {
        let filledSum = 0, filledEcts = 0, remainingEcts = 0
        for (const sem of annee.semestres) {
            const comp = sem.competences.find((c) => c.code.startsWith(code))
            if (!comp) continue
            for (const ue of comp.ues) {
                for (const ec of ue.elements) {
                    if (ec.note != null) {
                        filledSum += ec.note * ec.ects
                        filledEcts += ec.ects
                    } else {
                        remainingEcts += ec.ects
                    }
                }
            }
        }

        const totalEcts = filledEcts + remainingEcts
        const moyenneActuelle = filledEcts > 0 ? filledSum / filledEcts : 0

        if (filledEcts === 0) {
            return { code, label: ueName(code), status: "aucune-note" as const, moyenneActuelle: 0, moyenneRequise: 0, ectsRemplis: 0, ectsRestants: remainingEcts }
        }
        if (remainingEcts === 0) {
            return { code, label: ueName(code), status: moyenneActuelle >= 8 ? "ok" as const : "impossible" as const, moyenneActuelle, moyenneRequise: 0, ectsRemplis: filledEcts, ectsRestants: 0 }
        }

        const needed = (8 * totalEcts - filledSum) / remainingEcts

        if (needed <= 0) return { code, label: ueName(code), status: "ok" as const, moyenneActuelle, moyenneRequise: 0, ectsRemplis: filledEcts, ectsRestants: remainingEcts }
        if (needed > 20) return { code, label: ueName(code), status: "impossible" as const, moyenneActuelle, moyenneRequise: needed, ectsRemplis: filledEcts, ectsRestants: remainingEcts }
        return { code, label: ueName(code), status: "besoin" as const, moyenneActuelle, moyenneRequise: needed, ectsRemplis: filledEcts, ectsRestants: remainingEcts }
    })

    // Global
    const totalEcts = totalFilledEcts + totalRemainingEcts
    let globalStatus: Objectif["status"] = "aucune-note"
    let globalNeeded = 0

    if (totalFilledEcts > 0 && totalRemainingEcts > 0) {
        globalNeeded = (10 * totalEcts - totalFilledSum) / totalRemainingEcts
        if (globalNeeded <= 0) globalStatus = "ok"
        else if (globalNeeded > 20) globalStatus = "impossible"
        else globalStatus = "besoin"
    } else if (totalFilledEcts > 0) {
        const moy = totalFilledSum / totalFilledEcts
        globalStatus = moy >= 10 ? "ok" : "impossible"
    }

    const global: Objectif = {
        code: "Global",
        label: "Moyenne générale",
        status: globalStatus,
        moyenneActuelle: totalFilledEcts > 0 ? totalFilledSum / totalFilledEcts : 0,
        moyenneRequise: globalNeeded,
        ectsRemplis: totalFilledEcts,
        ectsRestants: totalRemainingEcts,
    }

    return { objectifs, global, visible }
}

export const UE_NAMES: Record<string, string> = {
    UE1: "Modélisation numérique",
    UE2: "Solutions informatiques",
    UE3: "Gestion solution",
    UE4: "Projet informatique",
    UE5: "Projet professionnel",
}
function ueName(code: string): string { return UE_NAMES[code] ?? code }

// --- Utilitaire générique ---

function moyennePonderee<T>(items: T[], getMoyenne: (item: T) => number, getEcts: (item: T) => number): number {
    const avecNotes = items.filter((item) => getMoyenne(item) > 0)
    if (avecNotes.length === 0) return 0
    const somme = avecNotes.reduce((s, item) => s + getMoyenne(item) * getEcts(item), 0)
    const ects = avecNotes.reduce((s, item) => s + getEcts(item), 0)
    return ects > 0 ? somme / ects : 0
}
