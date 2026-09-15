import { ajouterJours, debutJour, debutMois, isoJour, isoMinute, moisSuivant, type Creneau } from "@/lib/heures"

/* Horaires conseillés pour la BU : des plages libres pour rattraper les heures qui manquent au mois */

/** Lundi, mardi, mercredi (index de getDay) */
export const JOURS_BU: readonly number[] = [1, 2, 3]
export const OUVERTURE_BU = 8
/** La BU ferme à 19 h */
export const FERMETURE_BU = 19
/** Aucune proposition pendant la pause déjeuner */
const PAUSE_DEJEUNER: readonly [number, number] = [12, 13]
const DUREE_MIN = 60
const DUREE_MAX = 120
/** Au plus deux propositions par jour */
const TOURS = 2
/** Les propositions tombent sur la demi-heure */
const PAS = 30

export interface PropositionBu {
    id: string
    start: Date
    end: Date
}

/** Préfixe des propositions dans le calendrier : elles n'y sont jamais enregistrées */
export const PREFIXE_PROPOSITION = "suggestion-"

/** En minutes depuis minuit */
type Plage = [number, number]

const versMinutes = (d: Date) => d.getHours() * 60 + d.getMinutes()
const aMinute = (jour: Date, minutes: number) => new Date(jour.getFullYear(), jour.getMonth(), jour.getDate(), 0, minutes)

/** Plages libres d'un jour pendant l'ouverture de la BU, calées sur la demi-heure et d'au moins une heure */
function plagesLibres(jour: Date, creneaux: Creneau[], maintenant: Date): Plage[] {
    const debut = debutJour(jour)
    const fin = ajouterJours(debut, 1)
    const occupees: Plage[] = [[PAUSE_DEJEUNER[0] * 60, PAUSE_DEJEUNER[1] * 60]]
    for (const c of creneaux) {
        if (c.end <= debut || c.start >= fin) continue
        if (c.allDay) return []
        occupees.push([c.start < debut ? 0 : versMinutes(c.start), c.end >= fin ? 24 * 60 : versMinutes(c.end)])
    }
    occupees.sort((a, b) => a[0] - b[0])

    // Aujourd'hui, rien avant la prochaine demi-heure
    const plancher = isoJour(jour) === isoJour(maintenant) ? Math.ceil(versMinutes(maintenant) / PAS) * PAS : 0
    const libres: Plage[] = []
    let curseur = Math.max(OUVERTURE_BU * 60, plancher)
    for (const [de, a] of occupees) {
        if (de > curseur) libres.push([curseur, Math.min(de, FERMETURE_BU * 60)])
        curseur = Math.max(curseur, a)
    }
    if (curseur < FERMETURE_BU * 60) libres.push([curseur, FERMETURE_BU * 60])

    return libres.map(([de, a]): Plage => [Math.ceil(de / PAS) * PAS, Math.floor(a / PAS) * PAS]).filter(([de, a]) => a - de >= DUREE_MIN)
}

/**
 * Propositions pour couvrir `heuresAFaire` d'ici la fin du mois : on parcourt les lundis, mardis et mercredis
 * à venir en prenant la plus longue plage libre de chaque jour (2 h au plus), puis un second tour si besoin.
 */
export function proposerBu(creneaux: Creneau[], mois: Date, maintenant: Date, heuresAFaire: number): PropositionBu[] {
    let reste = Math.round(heuresAFaire * 60)
    const fin = moisSuivant(mois)
    const jours: { jour: Date; plages: Plage[] }[] = []
    for (let jour = new Date(Math.max(debutMois(mois).getTime(), debutJour(maintenant).getTime())); jour < fin; jour = ajouterJours(jour, 1)) {
        if (JOURS_BU.includes(jour.getDay())) jours.push({ jour, plages: plagesLibres(jour, creneaux, maintenant) })
    }

    const propositions: PropositionBu[] = []
    for (let tour = 0; tour < TOURS && reste > 0; tour++) {
        for (const j of jours) {
            if (reste <= 0) break
            if (j.plages.length === 0) continue
            // La plus longue plage, la plus tôt à égalité
            const indice = j.plages.reduce((meilleur, [de, a], i) => (a - de > j.plages[meilleur][1] - j.plages[meilleur][0] ? i : meilleur), 0)
            const [de, a] = j.plages[indice]
            const duree = Math.min(DUREE_MAX, a - de, Math.max(DUREE_MIN, Math.ceil(reste / PAS) * PAS))
            const start = aMinute(j.jour, de)
            propositions.push({ id: `${PREFIXE_PROPOSITION}${isoMinute(start)}`, start, end: aMinute(j.jour, de + duree) })
            reste -= duree
            j.plages = j.plages.map((plage, i): Plage => (i === indice ? [de + duree, a] : plage)).filter(([x, y]) => y - x >= DUREE_MIN)
        }
    }
    return propositions.sort((p, q) => p.start.getTime() - q.start.getTime())
}
