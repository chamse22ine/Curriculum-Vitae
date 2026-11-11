import { LW, LH } from "../dims"
import { rr, tx } from "../shared"
import type { ScreenApp } from "../types"
import { chrome } from "./chrome"

// 6 — Projets : les huit vrais projets. [nom, sous-titre, vignette, couleur]
const PROJ: [string, string, string, string][] = [
  ["CultureX", "Next.js · Quiz", "Q?", "#00c8f0"],
  ["FlightBot", "GCP · MLOps · Chatbot", "BOT", "#e05bff"],
  ["Jeu de Siam", "AI · Strategy game", "SIAM", "#e05bff"],
  ["Site JPO", "Web · University", "JPO", "#00c8f0"],
  ["Calculatrice de notes", "chams.dev/calculator", "16/20", "#00c8f0"],
  ["Suivi d'heures", "chams.dev/hours", "35h", "#00c8f0"],
  ["Space Invaders", "C · Game", "", "#ffb300"],
  ["chams.dev", "Next.js · Tailwind", "C.", "#00c8f0"],
]
/** Envahisseur en pixels pour la vignette de Space Invaders */
const INV = ["00100000100", "00010001000", "00111111100", "01101110110", "11111111111", "10111111101", "10100000101", "00011011000"]

export const appProjects: ScreenApp = (x, t, { fonts: { sans: SANS, mono: MONO, display: DISP } }) => {
  const sel = Math.floor(t / 1.4) % 8
  x.fillStyle = "#160b12"
  x.fillRect(0, 0, LW, LH)
  chrome(x, "~/projects", SANS)
  tx(x, "Projects", 40, 104, `800 28px ${DISP}`, "#ffffff")
  tx(x, "8 repositories", 1176, 102, `400 15px ${MONO}`, "#b9a3ad", "right")
  PROJ.forEach((p, i) => {
    const X = 40 + (i % 4) * 288
    const Y = 126 + Math.floor(i / 4) * 322
    const on = i === sel
    const up = on ? 6 : 0
    rr(x, X, Y - up, 272, 306, 16, "#221320", on ? "#ffffff" : "#3a2433", on ? 2.5 : 1)
    const g = x.createLinearGradient(X, Y, X + 272, Y + 170)
    g.addColorStop(0, p[3])
    g.addColorStop(1, "#ff3d81")
    rr(x, X + 12, Y + 12 - up, 248, 170, 10, g)
    if (p[2]) tx(x, p[2], X + 136, Y + 118 - up, `800 44px ${DISP}`, "rgba(255,255,255,.95)", "center")
    else {
      x.fillStyle = "#ffffff"
      for (let r = 0; r < 8; r++) for (let c = 0; c < 11; c++) if (INV[r].charAt(c) === "1") x.fillRect(X + 70 + c * 12, Y + 50 + r * 12 - up, 12, 12)
    }
    tx(x, p[0], X + 16, Y + 222 - up, `600 19px ${SANS}`, "#ffffff")
    tx(x, p[1], X + 16, Y + 250 - up, `400 13px ${MONO}`, p[3])
    rr(x, X + 16, Y + 270 - up, 60, 6, 3, on ? "#ffffff" : "#3a2433")
  })
}
