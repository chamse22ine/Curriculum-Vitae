// Les paquets de traductions SVAR ne publient pas de types
declare module "@svar-ui/calendar-locales" {
    type Mots = Record<string, Record<string, string>>
    export const fr: Mots
    export const en: Mots
}

declare module "@svar-ui/core-locales" {
    type Mots = Record<string, Record<string, unknown>>
    export const fr: Mots
    export const en: Mots
}
