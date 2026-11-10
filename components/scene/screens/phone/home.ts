import { PH, PW } from "../dims"
import { ease, hhmm, rr, tx } from "../shared"
import type { ScreenApp } from "../types"
import { pbar, pstat } from "./chrome"

// 0 — Accueil : écran verrouillé aux couleurs de la section, notification de déploiement
export const pHome: ScreenApp = (x, t, { palettes, fonts: { sans: SANS, mono: MONO, display: DISP } }) => {
  const p = palettes[0]
  const g = x.createLinearGradient(0, 0, PW, PH)
  g.addColorStop(0, p[1])
  g.addColorStop(1, p[0])
  x.fillStyle = g
  x.fillRect(0, 0, PW, PH)
  pstat(x, "#ffffff", SANS)
  tx(x, hhmm(), 180, 196, `600 84px ${SANS}`, "#ffffff", "center")
  tx(x, "chams.dev", 180, 232, `500 17px ${MONO}`, "rgba(255,255,255,.85)", "center")
  const s = ease((t - 1.4) / 0.6)
  if (s > 0) {
    const y = 300 + (1 - s) * 30
    rr(x, 16, y, 328, 86, 22, `rgba(255,255,255,${0.24 * s})`)
    tx(x, "chams.dev", 36, y + 34, `600 15px ${SANS}`, `rgba(255,255,255,${s})`)
    tx(x, "Build ready · deployed in 42 s", 36, y + 60, `400 15px ${SANS}`, `rgba(255,255,255,${s})`)
  }
  tx(x, "Chams.", 180, 690, `800 34px ${DISP}`, "#ffffff", "center")
  pbar(x, "rgba(255,255,255,.85)")
}
