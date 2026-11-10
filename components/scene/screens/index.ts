import { MOBILE_MAX } from "@/hooks/use-scroll-progress"
import { mkCanvas, srgbTexture } from "../geometry"

/** Espace de dessin du portable (px) ; la texture vaut 1216×786 sur ordinateur, 1024 de large sur mobile */
export const LW = 1216
export const LH = 786
/** Espace de dessin du téléphone (px), rendu à ×1,25 */
export const PW = 360
export const PH = 760
export const KP = 1.25

function screen(w: number, h: number, scale: number, anisotropy: number) {
  const canvas = mkCanvas(Math.round(w * scale), Math.round(h * scale))
  const ctx = canvas.getContext("2d")!
  ctx.fillStyle = "#000"
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  const texture = srgbTexture(canvas, anisotropy)
  return { canvas, ctx, texture, scale }
}

export function createScreens(anisotropy: number) {
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
