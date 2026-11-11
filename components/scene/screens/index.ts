import type { MeshStandardMaterial, Texture } from "three"
import { canvasTexture, mkCanvas } from "../geometry"
import { appNotebook } from "./laptop/notebook"
import { appShop } from "./laptop/shop"
import { pHours } from "./phone/hours"
import { pShop } from "./phone/shop"
import type { ScreenApp, ScreenEnv } from "./types"

export { KP, LH, LW, PH, PW } from "./dims"

/**
 * Un écran d'objet : un canvas redessiné en continu, la texture qui l'affiche, et le matériau
 * de la dalle (son intensité dépend de l'app). `where()` donne la station où se trouve l'objet,
 * `app(station)` l'app à y afficher.
 */
export interface Screen {
  ctx: CanvasRenderingContext2D
  /** Facteur entre l'espace de dessin (ex. 1216×786) et le canvas réel */
  scale: number
  texture: Texture
  material: MeshStandardMaterial | null
  where: () => number
  app: (station: number) => ScreenApp
}

/** Canvas d'écran (fond noir au départ) et sa texture */
export function screenCanvas(w: number, h: number, scale: number, anisotropy: number) {
  const canvas = mkCanvas(Math.round(w * scale), Math.round(h * scale))
  const ctx = canvas.getContext("2d")!
  ctx.fillStyle = "#000"
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  return { ctx, scale, texture: canvasTexture(canvas, anisotropy) }
}

/**
 * Apps dessinées sur une page blanche : rendues à 0,52 au lieu de 0,8, sinon elles éblouissent
 * dans le décor sombre (LIGHT dans le prototype).
 */
const LIGHT = new Set<ScreenApp>([appShop, appNotebook, pShop, pHours])
const GLOW_DARK = 0.8
const GLOW_LIGHT = 0.52

/**
 * Redessine les écrans : chacun une image sur deux (décalés d'un écran à l'autre), et seulement
 * si sa station est visible. Chaque app démarre quand sa station devient active (startT).
 */
export function paintScreens(
  screens: readonly Screen[],
  tick: number,
  visible: (station: number) => boolean,
  appTime: (station: number) => number,
  env: ScreenEnv,
) {
  screens.forEach((s, n) => {
    const st = s.where()
    if ((tick + n) % 2 || !visible(st)) return
    const fn = s.app(st)
    if (s.material) s.material.emissiveIntensity = LIGHT.has(fn) ? GLOW_LIGHT : GLOW_DARK
    const x = s.ctx
    x.setTransform(s.scale, 0, 0, s.scale, 0, 0)
    x.globalAlpha = 1
    x.textBaseline = "alphabetic"
    fn(x, appTime(st), env)
    s.texture.needsUpdate = true
  })
}
