import type { Text } from "./types"

/** Couleur d'accent de la carte (bordure haute et tags) */
export type ProjectKind = "web" | "ai" | "c" | "sys"

export const PROJECT_KIND_COLOR: Record<ProjectKind, string> = {
  web: "#00e0ff",
  ai: "#e05bff",
  c: "#ffb300",
  sys: "#ff6a5e",
}

export interface Project {
  name: Text
  tags: Text
  description: Text
  kind: ProjectKind
  /** Lien interne (next/link, même onglet) ou externe. Absent : pas de lien connu */
  href?: { internal: string } | { external: string }
}

export const PROJECTS: readonly Project[] = [
  {
    name: "CultureX",
    tags: "Next.js · Quiz",
    kind: "web",
    description: { fr: "Jeu de culture générale avec un système de quiz dynamique.", en: "General-knowledge game with a dynamic quiz system." },
  },
  {
    name: "FlightBot",
    tags: "GCP · MLOps · Chatbot",
    kind: "ai",
    description: { fr: "Chatbot hébergé sur GCP, avec une chaîne MLOps.", en: "Chatbot hosted on GCP, with an MLOps pipeline." },
  },
  {
    name: { fr: "Jeu de Siam", en: "Siam" },
    tags: { fr: "IA · Jeu de stratégie", en: "AI · Strategy game" },
    kind: "ai",
    description: { fr: "Projet universitaire d'IA stratégique.", en: "University project: a strategy-game AI." },
  },
  {
    name: { fr: "Site JPO", en: "Open-day site" },
    tags: { fr: "Web · Université", en: "Web · University" },
    kind: "web",
    description: { fr: "Plateforme web des journées portes ouvertes de l'université.", en: "Web platform for the university's open days." },
  },
  {
    name: { fr: "Calculatrice de notes", en: "Grade calculator" },
    tags: { fr: "Outil en ligne", en: "Online tool" },
    kind: "web",
    href: { internal: "/calculator" },
    description: {
      fr: "Pour les étudiants en info d'Artois, L1 à M1 : règles officielles, prévisions de session 2, sauvegarde locale.",
      en: "For Artois CS students, first year to Master's: official rules, resit forecasts, local save.",
    },
  },
  {
    name: { fr: "Suivi d'heures d'alternance", en: "Apprenticeship hours tracker" },
    tags: { fr: "Outil en ligne", en: "Online tool" },
    kind: "web",
    href: { internal: "/hours" },
    description: { fr: "Calendrier, import ICS et bilan mensuel.", en: "Calendar, ICS import and monthly summary." },
  },
  {
    name: "Space Invaders",
    tags: { fr: "C · Jeu", en: "C · Game" },
    kind: "c",
    description: { fr: "Jeu complet codé en C.", en: "A complete game written in C." },
  },
  {
    name: "chams.dev",
    tags: "Next.js · Tailwind",
    kind: "web",
    href: { external: "https://chams.dev" },
    description: { fr: "Ce site.", en: "This site." },
  },
]

/** Apps natives, présentées dans la section Systèmes (pas dans la grille des projets) */
export const SYSTEM_PROJECTS: readonly Project[] = [
  {
    name: "Vigie",
    tags: "Rust · GTK4 · libadwaita",
    kind: "sys",
    // Dépôt privé : pas de lien
    description: {
      fr: "Application GNOME native pour Fedora : batterie, stockage, paquets de toutes les sources et nettoyage avec aperçu exact.",
      en: "Native GNOME app for Fedora: battery, storage, packages from all sources and cleanup with an exact preview.",
    },
  },
  {
    name: "Fedora Link ↗",
    tags: "Rust · GTK4 · KDE Connect",
    kind: "sys",
    href: { external: "https://github.com/chamse22ine/fedora-link" },
    description: {
      fr: "Un téléphone Android intégré au bureau Fedora, via le protocole KDE Connect.",
      en: "An Android phone integrated into the Fedora desktop, over the KDE Connect protocol.",
    },
  },
]
