type Bezier = [number, number, number, number]

/** Courbes Papier & Signal (mêmes valeurs que --ease-* dans globals.css) */
export const EASE_ENTREE: Bezier = [0.16, 1, 0.3, 1]
export const EASE_UI: Bezier = [0.2, 0, 0, 1]
export const EASE_SORTIE: Bezier = [0.4, 0, 1, 1]

/** Durées en secondes */
export const DUREE = {
    survol: 0.08,
    bascule: 0.14,
    entree: 0.22,
    session: 0.32,
    chiffre: 0.9,
    courbe: 1.1,
} as const
