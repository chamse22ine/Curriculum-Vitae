import type { Lang, Palette } from "@/content/types"
import type { HomeFonts } from "@/lib/home-fonts"

/** Contexte transmis à chaque app d'écran (aucune dépendance à React) */
export interface ScreenEnv {
  lang: Lang
  /** Palettes des neuf sections, dans l'ordre de la page */
  palettes: readonly Palette[]
  /** Familles réelles de next/font (noms hachés + repli) */
  fonts: HomeFonts
  /** Sans barre d'état ni barre d'accueil (app de téléphone incrustée dans un autre écran) */
  bare?: boolean
}

/** Une app : dessine l'image à l'instant t (secondes depuis son apparition) */
export type ScreenApp = (ctx: CanvasRenderingContext2D, t: number, env: ScreenEnv) => void
