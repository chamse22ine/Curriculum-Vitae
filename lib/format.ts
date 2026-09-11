const DEUX_DECIMALES = new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const UNE_DECIMALE = new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })
const SAISIE = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 })

export function fmt2(n: number | null | undefined): string {
    return n == null ? "—" : DEUX_DECIMALES.format(n)
}

export function fmt1(n: number | null | undefined): string {
    return n == null ? "—" : UNE_DECIMALE.format(n)
}

export function fmtSaisie(n: number | null | undefined): string {
    return n == null ? "" : SAISIE.format(n)
}

/**
 * Saisie tolérante d'une note sur 20 : « 12,5 », « 12.5 » et « 125 » donnent 12,5.
 * Un champ vide vaut null (note exclue du calcul), une saisie hors bornes est invalide.
 */
export function parseNote(raw: string): { value: number | null; valid: boolean } {
    const texte = raw.trim().replace(",", ".")
    if (texte === "") return { value: null, valid: true }
    if (!/^\d+(\.\d*)?$/.test(texte)) return { value: null, valid: false }

    let note = Number(texte)
    // Virgule oubliée : 125 → 12,5 et 1275 → 12,75
    if (!texte.includes(".") && note > 20) {
        if (texte.length === 3) note /= 10
        else if (texte.length === 4) note /= 100
    }
    return note <= 20 ? { value: note, valid: true } : { value: null, valid: false }
}
