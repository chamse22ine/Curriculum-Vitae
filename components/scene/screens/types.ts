import type { Lang, Palette } from "@/content/types"
import type { HomeFonts } from "@/lib/home-fonts"

/** Contexte transmis à chaque app d'écran (aucune dépendance à React) */
export interface ScreenEnv {
  lang: Lang
  /** Palettes des huit sections, dans l'ordre de la page */
  palettes: readonly Palette[]
  /** Familles réelles de next/font (noms hachés + repli) */
  fonts: HomeFonts
}

/** Une app : dessine l'image à l'instant t (secondes depuis son apparition) */
export type ScreenApp = (ctx: CanvasRenderingContext2D, t: number, env: ScreenEnv) => void
