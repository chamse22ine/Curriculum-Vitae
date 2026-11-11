import type { Palette, Text } from "./types"

export type SectionId = "top" | "web" | "data" | "ia" | "devops" | "systemes" | "projets" | "parcours" | "contact"

export interface SectionMeta {
  id: SectionId
  /** Nom affiché dans le HUD */
  hud: Text
  /** Libellé du menu (absent : pas dans le menu) */
  nav?: Text
  /** 1 : texte à gauche, scène à droite. -1 (« alt ») : texte à droite, scène à gauche */
  side: 1 | -1
  palette: Palette
}

/** Les neuf sections, dans l'ordre de la page */
export const SECTIONS: readonly SectionMeta[] = [
  { id: "top", hud: { fr: "ORIGINE", en: "ORIGIN" }, side: 1, palette: ["#ff3d81", "#7a5cff", "#00d4ff"] },
  { id: "web", hud: "WEB", nav: "Web", side: -1, palette: ["#00e0ff", "#2b6bff", "#9a6bff"] },
  { id: "data", hud: "DATA", nav: "Data", side: 1, palette: ["#ffb300", "#ff5e3a", "#ff2d87"] },
  { id: "ia", hud: { fr: "IA / MLOPS", en: "AI / MLOPS" }, nav: { fr: "IA", en: "AI" }, side: -1, palette: ["#e05bff", "#ff3db5", "#6b6bff"] },
  { id: "devops", hud: "DEVOPS", nav: "DevOps", side: 1, palette: ["#3dff9e", "#00c2a8", "#d4ff3d"] },
  { id: "systemes", hud: { fr: "SYSTÈMES", en: "SYSTEMS" }, nav: { fr: "Systèmes", en: "Systems" }, side: -1, palette: ["#ff4438", "#3584e4", "#8fd0ff"] },
  { id: "projets", hud: { fr: "PROJETS", en: "PROJECTS" }, nav: { fr: "Projets", en: "Projects" }, side: 1, palette: ["#ff6a3d", "#ffd23d", "#ff3d81"] },
  { id: "parcours", hud: { fr: "PARCOURS", en: "JOURNEY" }, nav: { fr: "Parcours", en: "Journey" }, side: -1, palette: ["#3da5ff", "#7a5cff", "#7dffd0"] },
  { id: "contact", hud: "CONTACT", nav: "Contact", side: 1, palette: ["#ff3d81", "#ffb300", "#7a5cff"] },
]

export const PALETTES: readonly Palette[] = SECTIONS.map((s) => s.palette)

export function sectionMeta(id: SectionId): SectionMeta {
  const s = SECTIONS.find((x) => x.id === id)
  if (!s) throw new Error(`Section inconnue : ${id}`)
  return s
}
