import { parseICal } from "@svar-ui/calendar-ical"
import { ajouterJours, debutJour, debutSemaine, estSemaineType, isoJour, isoMinute, type Categorie, type Creneau } from "@/lib/heures"

/** Calendrier importé : ses créneaux portent son id dans `source` */
export interface CalendrierIcs {
    id: string
    nom: string
    categorie: Categorie
    /** Lien d'abonnement ; absent pour un fichier, qui ne peut pas être actualisé */
    url?: string
    /** Les jours qui reçoivent ce calendrier perdent la semaine type */
    remplacerSemaineType: boolean
    /** Date ISO du dernier import */
    importeLe: string
}

export interface LectureIcs {
    creneaux: Creneau[]
    /** X-WR-CALNAME, quand le calendrier en déclare un */
    nom: string | null
    /** Événements sans dates exploitables ou récurrences non gérées (mensuelles, annuelles) */
    ignores: number
}

const JOURS_ICS = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"]
const TOURS_MAX = 1000
/** Une règle sans fin s'arrête dix-huit mois après son début */
const HORIZON_JOURS = 548

/** UNTIL : « 20261231T225959Z » en UTC, sinon heure locale */
function dateIcs(valeur: string): Date | null {
    const m = /^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})?(Z)?)?$/.exec(valeur)
    if (!m) return null
    const [, a, mo, j, h = "0", mi = "0", s = "0", utc] = m
    return utc ? new Date(Date.UTC(+a, +mo - 1, +j, +h, +mi, +s)) : new Date(+a, +mo - 1, +j, +h, +mi, +s)
}

const memeHeure = (jour: Date, modele: Date) =>
    new Date(jour.getFullYear(), jour.getMonth(), jour.getDate(), modele.getHours(), modele.getMinutes(), modele.getSeconds())

/**
 * Débuts des occurrences d'une règle DAILY ou WEEKLY (INTERVAL, COUNT, UNTIL, BYDAY), null pour les autres fréquences.
 * Les dates sont construites jour par jour en heure locale : le passage à l'heure d'été ne décale rien.
 */
function occurrences(debut: Date, rrule: string, exclues: Set<number>): Date[] | null {
    const regle: Record<string, string> = Object.fromEntries(rrule.split(";").map((partie) => partie.split("=")))
    if (regle.FREQ !== "DAILY" && regle.FREQ !== "WEEKLY") return null

    const hebdo = regle.FREQ === "WEEKLY"
    const pas = Math.max(1, Number(regle.INTERVAL ?? 1)) * (hebdo ? 7 : 1)
    const nombre = regle.COUNT ? Number(regle.COUNT) : Infinity
    const fin = (regle.UNTIL && dateIcs(regle.UNTIL)) || ajouterJours(debut, HORIZON_JOURS)
    // Semaine du lundi au dimanche (WKST=MO par défaut)
    const decalages = hebdo
        ? (regle.BYDAY ? regle.BYDAY.split(",").map((jour) => JOURS_ICS.indexOf(jour.slice(-2))) : [debut.getDay()])
              .filter((jour) => jour >= 0)
              .map((jour) => (jour + 6) % 7)
              .sort((a, b) => a - b)
        : [0]
    const origine = hebdo ? debutSemaine(debut) : debutJour(debut)

    const debuts: Date[] = []
    let comptees = 0
    for (let tour = 0; tour < TOURS_MAX; tour++) {
        for (const decalage of decalages) {
            const occurrence = memeHeure(ajouterJours(origine, tour * pas + decalage), debut)
            if (occurrence < debut) continue
            if (occurrence > fin || comptees >= nombre) return debuts
            // COUNT compte aussi les occurrences retirées par EXDATE
            comptees++
            if (!exclues.has(occurrence.getTime())) debuts.push(occurrence)
        }
    }
    return debuts
}

export function lireIcs(texte: string, calendrier: Pick<CalendrierIcs, "id" | "categorie">): LectureIcs {
    if (!texte.includes("BEGIN:VCALENDAR")) throw new Error("Ce fichier n'est pas un calendrier ICS.")
    let evenements: ReturnType<typeof parseICal>
    try {
        evenements = parseICal(texte)
    } catch {
        throw new Error("Calendrier ICS illisible.")
    }

    // Exception d'une série (RECURRENCE-ID) : elle remplace l'occurrence d'origine
    const remplacees = new Map<string, Set<number>>()
    for (const ev of evenements) {
        if (ev.masterEventId == null || !(ev.originalDate instanceof Date)) continue
        const cle = String(ev.masterEventId)
        remplacees.set(cle, (remplacees.get(cle) ?? new Set()).add(ev.originalDate.getTime()))
    }

    const creneaux: Creneau[] = []
    const vus = new Map<string, number>()
    let ignores = 0

    const ajouter = (base: string, start: Date, end: Date, allDay: boolean | undefined, text: unknown) => {
        const fin = end > start ? end : allDay ? ajouterJours(start, 1) : null
        if (!fin) return
        // Un même UID peut revenir : l'id doit rester unique dans le calendrier SVAR
        const rang = vus.get(base) ?? 0
        vus.set(base, rang + 1)
        creneaux.push({
            id: `${calendrier.id}:${base}${rang ? `#${rang}` : ""}`,
            categorie: calendrier.categorie,
            start,
            end: fin,
            allDay: allDay || undefined,
            text: typeof text === "string" && text.trim() ? text.trim() : undefined,
            source: calendrier.id,
        })
    }

    for (const ev of evenements) {
        if (!(ev.start instanceof Date) || !(ev.end instanceof Date) || Number.isNaN(ev.start.getTime())) {
            ignores++
            continue
        }
        if (!ev.rrule) {
            ajouter(String(ev.id), ev.start, ev.end, ev.allDay, ev.text)
            continue
        }
        const exclues = new Set([...(ev.exdates ?? []).map((d) => d.getTime()), ...(remplacees.get(String(ev.id)) ?? [])])
        const debuts = occurrences(ev.start, ev.rrule, exclues)
        if (!debuts) {
            ignores++
            continue
        }
        const duree = ev.end.getTime() - ev.start.getTime()
        for (const debut of debuts) ajouter(`${ev.id}@${isoMinute(debut)}`, debut, new Date(debut.getTime() + duree), ev.allDay, ev.text)
    }

    return { creneaux, nom: /^X-WR-CALNAME:(.+)$/m.exec(texte)?.[1]?.trim() || null, ignores }
}

/**
 * Remplace les créneaux d'un calendrier par sa nouvelle lecture. Si demandé, les jours qui reçoivent
 * des créneaux importés perdent la semaine type : l'emploi du temps réel prime.
 */
export function appliquerImport(existants: Creneau[], importes: Creneau[], calendrier: Pick<CalendrierIcs, "id" | "remplacerSemaineType">) {
    const joursImportes = new Set(importes.map((c) => isoJour(c.start)))
    const joursRemplaces = new Set<string>()
    const conserves = existants.filter((c) => {
        if (c.source === calendrier.id) return false
        const jour = isoJour(c.start)
        if (calendrier.remplacerSemaineType && joursImportes.has(jour) && estSemaineType(c)) {
            joursRemplaces.add(jour)
            return false
        }
        return true
    })
    return { liste: [...conserves, ...importes], joursRemplaces: joursRemplaces.size }
}
