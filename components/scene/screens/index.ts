import type { Texture } from "three"
import { MOBILE_MAX } from "@/hooks/use-scroll-progress"
import { mkCanvas, srgbTexture } from "../geometry"
import { KP, LH, LW, PH, PW } from "./dims"
import type { ScreenApp, ScreenEnv } from "./types"

export { LH, LW, PH, PW, KP } from "./dims"

export interface Screen {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  texture: Texture
  /** Facteur entre l'espace de dessin (LW×LH ou PW×PH) et le canvas réel */
  scale: number
}

function screen(w: number, h: number, scale: number, anisotropy: number): Screen {
  const canvas = mkCanvas(Math.round(w * scale), Math.round(h * scale))
  const ctx = canvas.getContext("2d")!
  ctx.fillStyle = "#000"
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  return { canvas, ctx, texture: srgbTexture(canvas, anisotropy), scale }
}

export function createScreens(anisotropy: number) {
  // Texture du portable : 1216×786 sur ordinateur, 1024 de large sur mobile (fixé au chargement)
  const kl = window.innerWidth > MOBILE_MAX ? 1 : 1024 / LW
  const laptop = screen(LW, LH, kl, anisotropy)
  const phone = screen(PW, PH, KP, anisotropy)
  return {
    laptop,
    phone,
    dispose() {
      laptop.texture.dispose()
      phone.texture.dispose()
    },
  }
}

export type Screens = ReturnType<typeof createScreens>

/**
 * État partagé par les deux écrans : app courante, app précédente (pour le fondu de 0,4 s)
 * et instant d'apparition de chaque app. Reprise de onActive() / paint() du prototype.
 */
export function createPainter(count: number, reduce: boolean) {
  let cur = 0
  let prev = 0
  let fadeT = -9
  const startT = new Array<number>(count).fill(0)
  // Mouvement réduit : chaque app est figée sur une image « aboutie » (t = 30 s)
  const appTime = (i: number, clock: number) => (reduce ? 30 : clock - startT[i])

  return {
    setActive(i: number, clock: number) {
      if (i === cur) return
      prev = cur
      cur = i
      startT[i] = clock
      fadeT = clock
    },
    paint(s: Screen, apps: readonly ScreenApp[], clock: number, env: ScreenEnv) {
      const f = Math.min(1, (clock - fadeT) / 0.4)
      const x = s.ctx
      x.setTransform(s.scale, 0, 0, s.scale, 0, 0)
      x.globalAlpha = 1
      x.textBaseline = "alphabetic"
      if (f < 1) apps[prev](x, appTime(prev, clock), env)
      x.globalAlpha = f
      apps[cur](x, appTime(cur, clock), env)
      x.globalAlpha = 1
      s.texture.needsUpdate = true
    },
  }
}
