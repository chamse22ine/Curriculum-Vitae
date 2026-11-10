import { CULTUREX_QUIZ as QUIZ } from "@/content/phone"
import { PH, PW } from "../dims"
import { rr, tx, wrap } from "../shared"
import type { ScreenApp } from "../types"
import { pbar, pstat } from "./chrome"

// 5 — Projets : une question de CultureX, minuteur puis bonne réponse
export const pQuiz: ScreenApp = (x, t, { lang, fonts: { sans: SANS, mono: MONO, display: DISP } }) => {
  const tt = t % 6
  const ok = tt > 2.4
  x.fillStyle = "#1d0d12"
  x.fillRect(0, 0, PW, PH)
  pstat(x, "#ffffff", SANS)
  tx(x, "CultureX", 24, 92, `800 20px ${DISP}`, "#ffffff")
  tx(x, ok ? "+100" : "", 336, 92, `600 17px ${MONO}`, "#ffd23d", "right")
  tx(x, "Question 3 / 10", 24, 132, `400 14px ${MONO}`, "#d9b3bd")
  rr(x, 24, 144, 312, 8, 4, "#3a1c26")
  rr(x, 24, 144, 94, 8, 4, "#ff6a3d")
  rr(x, 24, 176, 312, 150, 20, "#2b141c")
  x.font = `600 21px ${SANS}`
  wrap(x, QUIZ.question[lang], 270).forEach((l, i) => tx(x, l, 44, 226 + i * 30, `600 21px ${SANS}`, "#ffffff"))
  x.strokeStyle = "#ffd23d"
  x.lineWidth = 4
  x.beginPath()
  x.arc(300, 300, 12, -1.57, -1.57 + 6.283 * (1 - Math.min(1, tt / 2.4)))
  x.stroke()
  QUIZ.answers.forEach((a, i) => {
    const good = ok && i === QUIZ.correct
    const y = 352 + i * 76
    rr(x, 24, y, 312, 62, 18, good ? "#19c37d" : "#2b141c", good ? "#19c37d" : "#4d2733", 1.5)
    tx(x, "ABCD".charAt(i), 50, y + 38, `600 15px ${MONO}`, good ? "#ffffff" : "#ff6a3d")
    tx(x, a, 82, y + 38, `500 17px ${SANS}`, "#ffffff")
    if (good) {
      x.strokeStyle = "#ffffff"
      x.lineWidth = 3
      x.beginPath()
      x.moveTo(296, y + 31)
      x.lineTo(303, y + 38)
      x.lineTo(316, y + 24)
      x.stroke()
    }
  })
  pbar(x, "#ffffff")
}
