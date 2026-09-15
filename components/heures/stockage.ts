import { cleMois, creneauxTypes, dateLocale, debutMois, estCategorie, isoMinute, joursSansCreneau, moisSuivant, type Creneau } from "@/lib/heures"

/** Une clé par mois, d'après la date de début du créneau */
const CLE_MOIS = /^heures-alternance:(\d{4}-\d{2})$/
/** Mois qui ont déjà reçu la semaine type : elle n'y est plus reposée d'office */
const CLE_PREPARES = "heures-alternance:mois-prepares"

interface CreneauStocke {
    id: string | number
    categorie: string
    /** YYYY-MM-DDTHH:mm, heure locale */
    debut: string
    fin: string
    journee?: boolean
    note?: string
    source?: string
}

function lire(brut: unknown): Creneau | null {
    if (!brut || typeof brut !== "object") return null
    const { id, categorie, debut, fin, journee, note, source } = brut as Partial<CreneauStocke>
    if ((typeof id !== "string" && typeof id !== "number") || !estCategorie(categorie) || typeof debut !== "string" || typeof fin !== "string") {
        return null
    }
    return {
        id,
        categorie,
        start: dateLocale(debut),
        end: dateLocale(fin),
        allDay: journee || undefined,
        text: note || undefined,
        source: typeof source === "string" ? source : undefined,
    }
}

function clesDesMois(): string[] {
    return Array.from({ length: localStorage.length }, (_, i) => localStorage.key(i)).filter((cle): cle is string => cle !== null && CLE_MOIS.test(cle))
}

function moisPrepares(): Set<string> {
    const brut = localStorage.getItem(CLE_PREPARES)
    // Avant ce marqueur, la seule présence d'une clé de mois valait préparation
    if (brut === null) return new Set(clesDesMois().map((cle) => cle.slice(-7)))
    try {
        const liste: unknown = JSON.parse(brut)
        return new Set(Array.isArray(liste) ? liste.filter((mois): mois is string => typeof mois === "string") : [])
    } catch {
        return new Set()
    }
}

/** Tous les mois enregistrés. Une clé illisible est ignorée plutôt que de casser la page */
export function chargerCreneaux(): Creneau[] {
    return clesDesMois().flatMap((cle) => {
        try {
            const liste: unknown = JSON.parse(localStorage.getItem(cle) ?? "[]")
            return Array.isArray(liste) ? liste.map(lire).filter((c): c is Creneau => c !== null) : []
        } catch {
            return []
        }
    })
}

/**
 * Mois de [debut, fin[ jamais préparés : leurs jours vides reçoivent la semaine type.
 * Le mois n'est marqué qu'à l'enregistrement suivant, avec ses créneaux.
 */
export function preparerMois(existants: Creneau[], debut: Date, fin: Date): Creneau[] {
    const prepares = moisPrepares()
    const jours: Date[] = []
    for (let mois = debutMois(debut); mois < fin; mois = moisSuivant(mois)) {
        if (!prepares.has(cleMois(mois))) jours.push(...joursSansCreneau(mois, moisSuivant(mois), existants))
    }
    return creneauxTypes(jours)
}

/** Réécrit chaque mois. Un mois vidé garde sa clé, vide ; un mois qui contient la semaine type est marqué préparé */
export function enregistrerCreneaux(creneaux: Creneau[]): void {
    // Lu avant d'écrire : un calendrier importé dans un mois neuf ne doit pas le marquer comme préparé
    const prepares = moisPrepares()
    const parMois = new Map<string, CreneauStocke[]>()
    for (const c of creneaux) {
        const debut = isoMinute(c.start)
        const mois = debut.slice(0, 7)
        const stocke: CreneauStocke = {
            id: c.id,
            categorie: c.categorie,
            debut,
            fin: isoMinute(c.end),
            ...(c.allDay ? { journee: true } : {}),
            ...(c.text ? { note: c.text } : {}),
            ...(c.source ? { source: c.source } : {}),
        }
        parMois.set(mois, [...(parMois.get(mois) ?? []), stocke])
        if (c.source === "type") prepares.add(mois)
    }

    for (const cle of clesDesMois()) {
        if (!parMois.has(cle.slice(-7))) localStorage.setItem(cle, "[]")
    }
    for (const [mois, liste] of parMois) {
        localStorage.setItem(`heures-alternance:${mois}`, JSON.stringify(liste))
    }
    localStorage.setItem(CLE_PREPARES, JSON.stringify([...prepares].sort()))
}
