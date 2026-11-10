import { FLIGHTBOT_CHAT as CHAT } from "@/content/phone"
import { PH, PW } from "../dims"
import { rr, tx, wrap } from "../shared"
import type { ScreenApp } from "../types"
import { pbar, pstat } from "./chrome"

// 3 — IA : conversation avec FlightBot (bilingue)
export const pChat: ScreenApp = (x, t, { lang, fonts: { sans: SANS, display: DISP } }) => {
  const tt = t % 12
  const en = lang === "en"
  let y = 128
  x.fillStyle = "#120a22"
  x.fillRect(0, 0, PW, PH)
  pstat(x, "#ffffff", SANS)
  x.beginPath()
  x.arc(44, 84, 18, 0, 7)
  x.fillStyle = "#e05bff"
  x.fill()
  tx(x, "F", 44, 90, `800 16px ${DISP}`, "#ffffff", "center")
  tx(x, "FlightBot", 72, 82, `600 17px ${SANS}`, "#ffffff")
  tx(x, "● online", 72, 100, `400 12px ${SANS}`, "#3dff9e")
  x.fillStyle = "#241a44"
  x.fillRect(0, 112, PW, 1)
  CHAT.forEach(([user, at, fr, enText]) => {
    // Les réponses du bot sont précédées d'une seconde de « • • • »
    if (tt < at - (user ? 0 : 1)) return
    x.font = `400 15px ${SANS}`
    const typing = !user && tt < at
    const ls = typing ? ["• • •"] : wrap(x, en ? enText : fr, 220)
    let w = 0
    ls.forEach((l) => {
      w = Math.max(w, x.measureText(l).width)
    })
    const bw = w + 28
    const bh = ls.length * 21 + 20
    const X = user ? PW - 16 - bw : 16
    rr(x, X, y, bw, bh, 16, user ? "#e05bff" : "#241a44")
    ls.forEach((l, i) => tx(x, l, X + 14, y + 27 + i * 21, `400 15px ${SANS}`, "#ffffff"))
    y += bh + 12
  })
  rr(x, 16, 670, 328, 50, 25, "#1c1436", "#35285f")
  tx(x, "Message…", 36, 701, `400 15px ${SANS}`, "#8f86b8")
  x.beginPath()
  x.arc(316, 695, 17, 0, 7)
  x.fillStyle = "#e05bff"
  x.fill()
  pbar(x, "#ffffff")
}
