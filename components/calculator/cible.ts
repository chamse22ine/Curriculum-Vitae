import { fmt1 } from "@/lib/format"
import type { Statut } from "@/components/calculator/ue-card"

/** Note moyenne à viser sur les coefficients restants pour ramener une UE sous 10 à 10 */
export function cibleUe(elements: { ects: number; note: number | null }[], moyenne: number | null, statut: Statut): string | undefined {
    if (moyenne == null || moyenne >= 10 || statut === "acquis" || statut === "compense") return undefined

    let somme = 0, total = 0, restants = 0
    for (const { ects, note } of elements) {
        total += ects
        if (note == null) restants += ects
        else somme += note * ects
    }
    if (restants === 0) return undefined

    const requise = (10 * total - somme) / restants
    return requise > 20
        ? `10 hors d'atteinte sur ${restants} ECTS restants`
        : `à viser : ${fmt1(requise)} sur ${restants} ECTS restants`
}
