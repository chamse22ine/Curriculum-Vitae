import { HOURS_WEEK as H } from "@/content/phone"
import { PH, PW } from "../dims"
import { ease, rr, tx } from "../shared"
import type { ScreenApp } from "../types"
import { pbar, pstat } from "./chrome"

// 6 — Parcours : le suivi d'heures d'alternance (calendrier du mois + répartition)
const COLS = ["#3da5ff", "#7a5cff", "#22c7a0"]

export const pHours: ScreenApp = (x, t, { lang, fonts: { sans: SANS, mono: MONO } }) => {
  let i: number
  x.fillStyle = "#f6f7fc"
  x.fillRect(0, 0, PW, PH)
  pstat(x, "#11131c", SANS)
  tx(x, H.month[lang], 24, 96, `600 23px ${SANS}`, "#11131c")
  "MTWTFSS".split("").forEach((d, j) => tx(x, d, 46 + j * 45, 134, `500 13px ${MONO}`, "#8a8fa5", "center"))
  for (i = 0; i < 30; i++) {
    const c = (i + 6) % 7
    const r = Math.floor((i + 6) / 7)
    const X = 26 + c * 45
    const Y = 148 + r * 50
    const we = c > 4
    const col = we ? "#e6e8f1" : COLS[c < 3 ? 0 : c < 4 ? 2 : 1]
    const s = ease((t - 0.2 - i * 0.03) / 0.4)
    rr(x, X, Y, 40, 42, 10, we ? col : "rgba(0,0,0,0)")
    if (!we) {
      x.save()
      x.translate(X + 20, Y + 21)
      x.scale(s, s)
      rr(x, -20, -21, 40, 42, 10, col)
      x.restore()
    }
    tx(x, String(i + 1), X + 20, Y + 27, `500 14px ${SANS}`, we ? "#8a8fa5" : "#ffffff", "center")
    if (i === 9) rr(x, X - 3, Y - 3, 46, 48, 12, null, "#11131c", 2.5)
  }
  tx(x, `${H.total} h`, 24, 470, `600 40px ${SANS}`, "#11131c")
  tx(x, H.perWeek[lang], 118, 470, `400 16px ${SANS}`, "#6a6f85")
  let X0 = 24
  H.parts.forEach((part, j) => {
    rr(x, X0, 492, 312 * part.share - 4, 16, 8, COLS[j])
    X0 += 312 * part.share
  })
  H.parts.forEach((part, j) => {
    x.beginPath()
    x.arc(32, 548 + j * 40, 7, 0, 7)
    x.fillStyle = COLS[j]
    x.fill()
    tx(x, part[lang], 52, 554 + j * 40, `500 16px ${SANS}`, "#11131c")
  })
  pbar(x, "#11131c")
}
