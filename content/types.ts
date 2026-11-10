export type Lang = "fr" | "en"

/** Texte identique dans les deux langues, ou une version par langue */
export type Localized<T> = T | { fr: T; en: T }

/** Texte riche minimal : du texte, des passages en dégradé (em) ou en gras (strong) */
export type RichSegment = string | { em: string } | { strong: string }
export type Rich = readonly RichSegment[]

export type Text = Localized<string>
export type RichText = Localized<Rich>

/** Palette de trois couleurs d'une section : pilote --p1, --p2, --p3 */
export type Palette = readonly [string, string, string]

export function isLocalized<T>(v: Localized<T>): v is { fr: T; en: T } {
  return typeof v === "object" && v !== null && !Array.isArray(v) && "fr" in v && "en" in v
}

export function pick<T>(v: Localized<T>, lang: Lang): T {
  return isLocalized(v) ? v[lang] : v
}
