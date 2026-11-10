import type { Lang } from "./types"

/** Conversation FlightBot (section IA). [utilisateur ?, instant d'apparition en s, FR, EN] */
export const FLIGHTBOT_CHAT: readonly [boolean, number, string, string][] = [
  [true, 0.5, "Un vol Lille → Lisbonne vendredi ?", "A flight Lille → Lisbon on Friday?"],
  [false, 2.4, "3 vols trouvés. Le moins cher part à 07:40, 89 €.", "3 flights found. The cheapest leaves at 07:40, €89."],
  [true, 5.2, "Réserve celui-là.", "Book that one."],
  [false, 7, "C’est réservé. Bon voyage !", "Booked. Have a good trip!"],
]

/** Question du quiz CultureX (section Projets) */
export const CULTUREX_QUIZ = {
  question: { fr: "Quelle est la capitale de l’Australie ?", en: "What is the capital of Australia?" } as Record<Lang, string>,
  answers: ["Sydney", "Canberra", "Melbourne", "Perth"],
  correct: 1,
}

/**
 * Répartition hebdomadaire affichée sur le suivi d'heures (section Parcours).
 * EXEMPLE du prototype, à confirmer : 21 h entreprise, 10,5 h cours, 3,5 h BU.
 */
export const HOURS_WEEK = {
  total: 35,
  parts: [
    { share: 0.6, fr: "Entreprise · 21 h", en: "Company · 21 h" },
    { share: 0.3, fr: "Cours · 10,5 h", en: "School · 10.5 h" },
    { share: 0.1, fr: "BU · 3,5 h", en: "Library · 3.5 h" },
  ],
  month: { fr: "Novembre 2026", en: "November 2026" } as Record<Lang, string>,
  perWeek: { fr: "/ semaine", en: "/ week" } as Record<Lang, string>,
}
