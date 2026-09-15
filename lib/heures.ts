/* Heures d'alternance : 35 h par semaine, contrôlées au mois (lissage) */

export type Categorie = "entreprise" | "cours" | "bu"
export type Periode = "jour" | "semaine" | "mois"
export type Ton = "success" | "warning" | "danger"

export const CATEGORIES: Record<Categorie, { label: string; couleur: string }> = {
    entreprise: { label: "Entreprise", couleur: "bg-c1" },
    cours: { label: "Cours", couleur: "bg-c2" },
    bu: { label: "BU", couleur: "bg-c5" },
}
export const ORDRE_CATEGORIES = Object.keys(CATEGORIES) as Categorie[]

export function estCategorie(valeur: unknown): valeur is Categorie {
    return ORDRE_CATEGORIES.includes(valeur as Categorie)
}

/** Créneau du calendrier, avec les noms de champs attendus par SVAR */
export interface Creneau {
    id: string | number
    categorie: Categorie
    start: Date
    end: Date
    /** Journée entière : compte pour la norme journalière de chaque jour ouvré couvert */
    allDay?: boolean
    text?: string
    /** « type » pour la semaine type, id du calendrier ICS importé, absent pour un créneau posé à la main */
    source?: string
}

export interface Reglages {
    heuresHebdo: number
    joursParSemaine: number
    /** Jours travaillés corrigés à la main, par mois (YYYY-MM) */
    joursTravailles: Record<string, number>
}

export const REGLAGES_PAR_DEFAUT: Reglages = { heuresHebdo: 35, joursParSemaine: 5, joursTravailles: {} }

/* ---------- Durées ---------- */

const HEURE = 3_600_000

export const arrondiMinute = (heures: number) => Math.round(heures * 60) / 60

/** 7,5 → « 7h30 », 35 → « 35h » */
export function fmtHeures(heures: number): string {
    const minutes = Math.round(Math.abs(heures) * 60)
    const reste = minutes % 60
    return `${Math.floor(minutes / 60)}h${reste === 0 ? "" : deuxChiffres(reste)}`
}

/** Saisie tolérante : « 7,5 », « 7.5 », « 7h30 », « 7:30 » et « 7h ». null si illisible */
export function parseDuree(brut: string): number | null {
    const texte = brut.trim().toLowerCase().replace(/\s+/g, "")
    const horaire = /^(\d{1,3})[h:](\d{2})?$/.exec(texte)
    if (horaire) {
        const minutes = Number(horaire[2] ?? 0)
        return minutes < 60 ? Number(horaire[1]) + minutes / 60 : null
    }
    return /^\d+([.,]\d+)?$/.test(texte) ? Number(texte.replace(",", ".")) : null
}

/* ---------- Dates (toujours en heure locale) ---------- */

export const deuxChiffres = (n: number) => String(n).padStart(2, "0")
export const isoJour = (d: Date) => `${d.getFullYear()}-${deuxChiffres(d.getMonth() + 1)}-${deuxChiffres(d.getDate())}`
export const isoMinute = (d: Date) => `${isoJour(d)}T${deuxChiffres(d.getHours())}:${deuxChiffres(d.getMinutes())}`
export const cleMois = (d: Date) => isoJour(d).slice(0, 7)

/** « 2026-09-14T09:30 », « 2026-09-14 » ou « 2026-09 » en date locale : new Date("2026-09-14") serait minuit UTC */
export function dateLocale(iso: string): Date {
    const [jour, heure = "00:00"] = iso.split("T")
    const [annee, mois, date = 1] = jour.split("-").map(Number)
    const [h, min] = heure.split(":").map(Number)
    return new Date(annee, mois - 1, date, h, min)
}

export const debutJour = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
export const ajouterJours = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
export const debutMois = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1)
export const moisSuivant = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 1)
export const estOuvre = (d: Date) => d.getDay() !== 0 && d.getDay() !== 6

/** Lundi de la semaine */
export function debutSemaine(d: Date): Date {
    const jour = debutJour(d)
    return ajouterJours(jour, -((jour.getDay() + 6) % 7))
}

/** Jours du lundi au vendredi dans [debut, fin[. Les fériés ne sont pas déduits */
export function joursOuvres(debut: Date, fin: Date): number {
    let total = 0
    for (let jour = debutJour(debut); jour < fin; jour = ajouterJours(jour, 1)) {
        if (estOuvre(jour)) total++
    }
    return total
}

/** randomUUID n'existe qu'en contexte sécurisé : le serveur de dev ouvert en http depuis un téléphone n'y a pas droit */
export const nouvelId = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`

/* ---------- Semaine type ---------- */

/** Emploi du temps posé sur chaque nouveau mois, par jour de la semaine (index de getDay) */
export const SEMAINE_TYPE: Partial<Record<number, Categorie>> = { 1: "cours", 2: "cours", 3: "cours", 4: "entreprise", 5: "entreprise" }

/** 9h–12h et 14h–18h : 7 h par jour, 35 h par semaine */
export const PLAGES_TYPE: readonly (readonly [number, number])[] = [
    [9, 12],
    [14, 18],
]

const aHeure = (jour: Date, heure: number) => new Date(jour.getFullYear(), jour.getMonth(), jour.getDate(), heure)

/** Jours de [debut, fin[ prévus dans la semaine type et qui n'ont encore aucun créneau */
export function joursSansCreneau(debut: Date, fin: Date, existants: Creneau[]): Date[] {
    const occupes = new Set(existants.map((c) => isoJour(c.start)))
    const jours: Date[] = []
    for (let jour = debutJour(debut); jour < fin; jour = ajouterJours(jour, 1)) {
        if (SEMAINE_TYPE[jour.getDay()] && !occupes.has(isoJour(jour))) jours.push(jour)
    }
    return jours
}

/** Créneaux de la semaine type pour ces jours */
export function creneauxTypes(jours: Date[]): Creneau[] {
    return jours.flatMap((jour) => {
        const categorie = SEMAINE_TYPE[jour.getDay()]
        if (!categorie) return []
        return PLAGES_TYPE.map(([de, a]) => ({ id: nouvelId(), categorie, start: aHeure(jour, de), end: aHeure(jour, a), source: "type" }))
    })
}

/** Créneau posé par la semaine type. Les premiers n'avaient pas de source : on les reconnaît à leur plage exacte */
export function estSemaineType(c: Creneau): boolean {
    if (c.source !== undefined) return c.source === "type"
    return (
        !c.allDay &&
        SEMAINE_TYPE[c.start.getDay()] === c.categorie &&
        isoJour(c.start) === isoJour(c.end) &&
        c.start.getMinutes() === 0 &&
        c.end.getMinutes() === 0 &&
        PLAGES_TYPE.some(([de, a]) => c.start.getHours() === de && c.end.getHours() === a)
    )
}

const FORMAT_MOIS = new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" })
const FORMAT_JOUR = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long" })
const FORMAT_JOUR_COURT = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" })
const FORMAT_JOUR_ABREGE = new Intl.DateTimeFormat("fr-FR", { weekday: "short", day: "numeric", month: "short" })

export const libelleMois = (d: Date) => FORMAT_MOIS.format(d)
export const libelleJour = (d: Date) => FORMAT_JOUR.format(d)
/** « mar. 15 sept. », pour les cartes étroites du téléphone */
export const libelleJourAbrege = (d: Date) => FORMAT_JOUR_ABREGE.format(d)
export const libelleSemaine = (d: Date) => FORMAT_JOUR_COURT.formatRange(debutSemaine(d), ajouterJours(debutSemaine(d), 6))

/* ---------- Calculs ---------- */

/** Heures d'un créneau comprises dans [debut, fin[ */
export function heuresDansPeriode(creneau: Creneau, debut: Date, fin: Date, normeJournaliere: number): number {
    if (creneau.allDay) {
        // Fin exclusive ; un créneau d'un seul jour peut aussi arriver avec fin = début
        const finJournee = creneau.end > creneau.start ? creneau.end : ajouterJours(debutJour(creneau.start), 1)
        const de = Math.max(debutJour(creneau.start).getTime(), debut.getTime())
        const a = Math.min(finJournee.getTime(), fin.getTime())
        return de < a ? joursOuvres(new Date(de), new Date(a)) * normeJournaliere : 0
    }
    const de = Math.max(creneau.start.getTime(), debut.getTime())
    const a = Math.min(creneau.end.getTime(), fin.getTime())
    return a > de ? (a - de) / HEURE : 0
}

export interface Bilan {
    totaux: Record<Categorie, number>
    total: number
    objectif: number
    /** total − objectif, arrondi à la minute */
    solde: number
    /** Heures encore à poser (à la BU pour le mois) */
    restant: number
}

export function bilanPeriode(creneaux: Creneau[], debut: Date, fin: Date, objectif: number, normeJournaliere: number): Bilan {
    const totaux: Record<Categorie, number> = { entreprise: 0, cours: 0, bu: 0 }
    for (const creneau of creneaux) {
        totaux[creneau.categorie] += heuresDansPeriode(creneau, debut, fin, normeJournaliere)
    }
    const { entreprise, cours, bu } = totaux
    const total = entreprise + cours + bu

    // Arrondi à la minute : des décimales flottantes ne doivent pas laisser « 0h à faire »
    return {
        totaux,
        total,
        objectif,
        solde: arrondiMinute(total - objectif),
        restant: Math.max(0, arrondiMinute(objectif - (entreprise + cours + bu))),
    }
}

/** Bilans du jour, de la semaine et du mois qui contiennent la date affichée */
export function suivrePeriodes(creneaux: Creneau[], reference: Date, reglages: Reglages) {
    const normeJournaliere = reglages.heuresHebdo / reglages.joursParSemaine
    const jour = debutJour(reference)
    const semaine = debutSemaine(reference)
    const mois = debutMois(reference)
    const finMois = moisSuivant(reference)
    const joursSuggeres = joursOuvres(mois, finMois)
    const joursTravailles = reglages.joursTravailles[cleMois(reference)] ?? joursSuggeres

    return {
        normeJournaliere,
        joursSuggeres,
        joursTravailles,
        jour: bilanPeriode(creneaux, jour, ajouterJours(jour, 1), estOuvre(jour) ? normeJournaliere : 0, normeJournaliere),
        semaine: bilanPeriode(creneaux, semaine, ajouterJours(semaine, 7), reglages.heuresHebdo, normeJournaliere),
        mois: bilanPeriode(creneaux, mois, finMois, normeJournaliere * joursTravailles, normeJournaliere),
    }
}

/**
 * Objectif du mois au prorata des jours ouvrés terminés (la journée en cours ne compte pas encore).
 * Un mois passé est attendu en entier, un mois futur pas du tout.
 */
export function rythmeMois(reference: Date, aujourdhui: Date, objectif: number) {
    const debut = debutMois(reference)
    const fin = moisSuivant(reference)
    const borne = new Date(Math.min(Math.max(debutJour(aujourdhui).getTime(), debut.getTime()), fin.getTime()))
    const total = joursOuvres(debut, fin)
    const ecoules = joursOuvres(debut, borne)
    return { attendu: arrondiMinute((objectif * ecoules) / total), joursRestants: total - ecoules }
}

/**
 * Vert dès l'objectif atteint. En dessous, ambre si le total suit le rythme attendu,
 * rouge s'il est en retard.
 */
export function lireBilan(bilan: Bilan, attendu: number, joursRestants: number): { ton: Ton; titre: string; detail: string } {
    const { solde, restant, objectif, total } = bilan

    if (solde > 0) {
        return { ton: "success", titre: `Tu as dépassé de ${fmtHeures(solde)} ce mois-ci`, detail: `Objectif de ${fmtHeures(objectif)} atteint, plus besoin de passer à la BU.` }
    }
    if (restant === 0) {
        return { ton: "success", titre: "Objectif du mois atteint", detail: `${fmtHeures(objectif)} pile, rien à ajouter à la BU.` }
    }

    const titre = `Il te reste ${fmtHeures(restant)} à faire à la BU`
    const parJour = joursRestants > 0 ? `Soit ${fmtHeures(restant / joursRestants)} par jour ouvré restant.` : ""

    if (total < attendu) {
        return {
            ton: "danger",
            titre,
            detail: joursRestants > 0 ? `En retard sur le rythme : ${fmtHeures(attendu)} attendues à ce jour. ${parJour}` : "Mois terminé sous l'objectif.",
        }
    }
    return { ton: "warning", titre, detail: attendu > 0 ? `Dans les temps : ${fmtHeures(attendu)} attendues à ce jour. ${parJour}` : parJour }
}
