import { PH, PW } from "../dims"
import { ease, hhmm, rr, tx } from "../shared"
import type { ScreenApp } from "../types"
import { pbar, pstat } from "./chrome"

// 4 — DevOps : notifications du pipeline sur l'écran verrouillé (synchronisées avec appCI)
const NOTIF: [number, string, string][] = [
  [1.6, "CI · deploy.yml", "Tests passed · 148 / 148"],
  [5.8, "Registry", "Image app:482 pushed"],
  [9.4, "Deploy", "Live in production ✓"],
  [10.6, "Monitoring", "p95 latency back to 92 ms"],
]

export const pNotif: ScreenApp = (x, t, { palettes, fonts: { sans: SANS } }) => {
  const tt = t % 13
  const p = palettes[4]
  const g = x.createLinearGradient(0, 0, PW, PH)
  g.addColorStop(0, "#06302a")
  g.addColorStop(1, "#0b1412")
  x.fillStyle = g
  x.fillRect(0, 0, PW, PH)
  pstat(x, "#ffffff", SANS)
  tx(x, hhmm(), 180, 180, `600 72px ${SANS}`, "#ffffff", "center")
  let y = 250
  for (let i = NOTIF.length - 1; i >= 0; i--) {
    const n = NOTIF[i]
    const s = ease((tt - n[0]) / 0.45)
    if (s <= 0) continue
    const dy = (1 - s) * 20
    rr(x, 16, y - dy, 328, 76, 20, `rgba(255,255,255,${0.14 * s})`)
    x.beginPath()
    x.arc(46, y + 38 - dy, 10, 0, 7)
    x.fillStyle = p[0]
    x.fill()
    tx(x, n[1], 68, y + 32 - dy, `600 14px ${SANS}`, `rgba(255,255,255,${s})`)
    tx(x, n[2], 68, y + 54 - dy, `400 14px ${SANS}`, `rgba(255,255,255,${0.85 * s})`)
    y += 86 * s
  }
  pbar(x, "#ffffff")
}
