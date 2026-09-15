import { analyserValidation, moyenneAnnee, moyenneCompetenceAnnee } from "@/lib/calculs"
import { fmt2 } from "@/lib/format"
import { cibleUe } from "@/components/calculator/cible"
import type { Bloc, Statut, UeCardData } from "@/components/calculator/ue-card"
import type { Annee } from "@/types/curriculum.types"

/** Identifiant de ligne « année:semestre:compétence:UE:EC » (index dans les données) */
export function positionDeLigne(id: string): [number, number, number, number, number] {
    const [a, s, c, u, e] = id.split(":").map(Number)
    return [a, s, c, u, e]
}

export function licenceCards(annee: Annee, anneeIdx: number, semIdx: number): UeCardData[] {
    const { validated } = analyserValidation(annee)

    return annee.semestres[semIdx].competences.map((comp, compIdx) => {
        const prefixe = comp.code.replace(/\.\d+$/, "")
        const elements = comp.ues.flatMap((ue, ueIdx) => ue.elements.map((ec, ecIdx) => ({ ec, ueIdx, ecIdx })))

        let somme = 0, ectsNotes = 0, ects = 0
        for (const { ec } of elements) {
            ects += ec.ects
            if (ec.note != null) {
                somme += ec.note * ec.ects
                ectsNotes += ec.ects
            }
        }
        const moyenne = ectsNotes > 0 ? somme / ectsNotes : null
        const complet = ectsNotes === ects
        const annuelle = moyenneCompetenceAnnee(annee, prefixe)

        let statut: Statut = "non-acquis"
        let compensation: string | undefined
        if (moyenne == null || !complet) statut = "attente"
        else if (moyenne >= 10) statut = "acquis"
        else if (annuelle >= 10) {
            statut = "compense"
            compensation = `compensé par ${prefixe} sur l'année (${fmt2(annuelle)})`
        } else if (validated) {
            statut = "compense"
            compensation = `compensé par l'année (${fmt2(moyenneAnnee(annee))})`
        }

        const cible = cibleUe(elements.map(({ ec }) => ({ ects: ec.ects, note: ec.note ?? null })), moyenne, statut)
            ?? (statut === "non-acquis" ? "sous 10 : à compenser sur l'année" : undefined)

        return {
            bloc: `c${prefixe.slice(2)}` as Bloc,
            code: comp.code,
            titre: comp.name,
            moyenne,
            coef: ects,
            statut,
            compensation,
            cible,
            notes: elements.map(({ ec, ueIdx, ecIdx }) => {
                const id = `${anneeIdx}:${semIdx}:${compIdx}:${ueIdx}:${ecIdx}`
                return { id, label: ec.name, coef: ec.ects, champs: [{ id, value: ec.note ?? null }] }
            }),
        }
    })
}
