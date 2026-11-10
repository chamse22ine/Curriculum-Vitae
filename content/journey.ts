import type { Text } from "./types"

export interface JourneyItem {
  /** Période affichée dans la colonne de gauche */
  when: Text
  title: Text
  detail: Text
}

// Dates confirmées le 2026-11-10, sauf la fin du Master (voir ci-dessous).
export const JOURNEY: readonly JourneyItem[] = [
  {
    when: { fr: "Sept. 2026 → sept. 2028", en: "Sep 2026 → Sep 2028" },
    title: { fr: "Software Engineer en alternance, Decathlon Digital", en: "Software Engineer apprentice, Decathlon Digital" },
    detail: {
      fr: "Plateforme e-commerce MyClub. En parallèle du Master 1 Informatique.",
      en: "MyClub e-commerce platform. Alongside the first year of my CS Master's.",
    },
  },
  {
    // À CONFIRMER : la date de fin donnée était « 2026 → 2026 ». Affichée ouverte en attendant.
    when: "2026 →",
    title: { fr: "Université d'Artois, Master Informatique", en: "University of Artois, CS Master's" },
    detail: { fr: "En alternance chez Decathlon Digital.", en: "As an apprentice at Decathlon Digital." },
  },
  {
    when: { fr: "Mars → sept. 2026", en: "Mar → Sep 2026" },
    title: { fr: "Stage Software Engineer, Decathlon Digital", en: "Software Engineer intern, Decathlon Digital" },
    detail: "Villeneuve-d'Ascq.",
  },
  {
    when: "2024",
    title: "Certifications",
    detail: {
      fr: "AZ-400 Enterprise DevOps Development · Next.js Mastery · TypeScript for Beginners · Engaged for the Climate, niveau 1.",
      en: "AZ-400 Enterprise DevOps Development · Next.js Mastery · TypeScript for Beginners · Engaged for the Climate, level 1.",
    },
  },
  {
    when: "2022 → 2026",
    title: { fr: "Université d'Artois, Licence Informatique", en: "University of Artois, CS Bachelor's" },
    detail: { fr: "Java, C, algorithmique, bases de données.", en: "Java, C, algorithms, databases." },
  },
]
