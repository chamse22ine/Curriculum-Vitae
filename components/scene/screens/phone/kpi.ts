import { PH, PW } from "../dims"
import { ease, rr, tx } from "../shared"
import type { ScreenApp } from "../types"
import { pbar, pstat } from "./chrome"

// 2 — Data : tableau de bord du chiffre d'affaires du jour
const BARS: [string, number, string][] = [
  ["Run", 0.82, "#ffb300"],
  ["Bike", 0.64, "#ff5e3a"],
  ["Team", 0.95, "#ff2d87"],
  ["Swim", 0.4, "#ff9a1f"],
]

export const pKpi: ScreenApp = (x, t, { fonts: { sans: SANS, mono: MONO }, bare }) => {
  x.fillStyle = "#1a0f0a"
  x.fillRect(0, 0, PW, PH)
  pstat(x, "#ffffff", SANS, bare)
  tx(x, "Revenue · today", 24, 96, `500 15px ${SANS}`, "#d6b8a8")
  tx(x, `€${(128400 + Math.floor(t * 37)).toLocaleString("en-US")}`, 24, 146, `600 40px ${SANS}`, "#ffffff")
  rr(x, 24, 166, 92, 30, 15, "rgba(255,179,0,.18)")
  tx(x, "+12.4 %", 70, 186, `500 14px ${MONO}`, "#ffb300", "center")
  const q = ease(t / 1.6)
  x.beginPath()
  for (let i = 0; i <= 40; i++) {
    const px = 24 + (i / 40) * 312 * q
    const py = 380 - (0.3 + 0.5 * (i / 40) + 0.12 * Math.sin(i * 0.7) + 0.06 * Math.sin(i * 1.9 + t)) * 150
    if (i) x.lineTo(px, py)
    else x.moveTo(px, py)
  }
  x.strokeStyle = "#ffb300"
  x.lineWidth = 3
  x.lineJoin = "round"
  x.stroke()
  x.lineTo(24 + 312 * q, 400)
  x.lineTo(24, 400)
  x.closePath()
  x.fillStyle = "rgba(255,94,58,.2)"
  x.fill()
  BARS.forEach((r, i) => {
    const y = 452 + i * 66
    tx(x, r[0], 24, y, `500 15px ${SANS}`, "#ffffff")
    tx(x, `${Math.round(r[1] * 60)}k`, 336, y, `400 14px ${MONO}`, "#d6b8a8", "right")
    rr(x, 24, y + 12, 312, 10, 5, "#2e1b12")
    rr(x, 24, y + 12, Math.max(10, 312 * r[1] * ease((t - 0.3 - i * 0.15) / 0.8)), 10, 5, r[2])
  })
  pbar(x, "#ffffff", bare)
}
