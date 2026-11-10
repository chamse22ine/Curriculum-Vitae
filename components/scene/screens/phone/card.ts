import { CONTACT } from "@/content/contact"
import { PH, PW } from "../dims"
import { ease, rr, tx } from "../shared"
import type { ScreenApp } from "../types"
import { pbar, pstat } from "./chrome"

// 7 — Contact : carte de visite aux couleurs de la section
const LINES = [CONTACT.email, CONTACT.links[0].handle, CONTACT.links[1].handle]

export const pCard: ScreenApp = (x, t, { palettes, fonts: { sans: SANS, mono: MONO, display: DISP } }) => {
  const p = palettes[7]
  const g = x.createLinearGradient(0, 0, PW, PH)
  g.addColorStop(0, p[0])
  g.addColorStop(1, p[2])
  x.fillStyle = g
  x.fillRect(0, 0, PW, PH)
  pstat(x, "#ffffff", SANS)
  x.beginPath()
  x.arc(180, 190, 62, 0, 7)
  x.fillStyle = "#ffffff"
  x.fill()
  tx(x, "C.", 180, 210, `800 48px ${DISP}`, p[0], "center")
  tx(x, CONTACT.name, 180, 300, `600 23px ${SANS}`, "#ffffff", "center")
  tx(x, "Software Engineer", 180, 330, `400 16px ${SANS}`, "rgba(255,255,255,.9)", "center")
  LINES.forEach((l, i) => {
    const s = ease((t - 0.4 - i * 0.25) / 0.5)
    rr(x, 24, 390 + i * 76 + (1 - s) * 20, 312, 60, 18, `rgba(255,255,255,${0.22 * s})`)
    tx(x, l, 180, 426 + i * 76 + (1 - s) * 20, `500 14px ${MONO}`, `rgba(255,255,255,${s})`, "center")
  })
  pbar(x, "#ffffff")
}
