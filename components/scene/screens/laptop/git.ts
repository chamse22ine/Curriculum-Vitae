import { LW, LH } from "../dims"
import { tx } from "../shared"
import type { ScreenApp } from "../types"
import { chrome, prompt } from "./chrome"

// 6 — Parcours : la carrière sous forme d'historique git. [graphe, hash, refs, message, date]
// Dates alignées sur content/journey.ts (confirmées le 2026-11-10).
const GIT: [string, string, string, string, string][] = [
  ["* ", "a9f3c21", "(HEAD -> main) ", "feat: apprenticeship @ Decathlon Digital, MyClub platform", "09.2026"],
  ["* ", "7be1d04", "", "feat: start MSc Computer Science, Univ. Artois", "09.2026"],
  ["* ", "4c2e8aa", "", "feat: Software Engineer internship @ Decathlon Digital", "03.2026"],
  ["|\\", "", "", "", ""],
  ["| * ", "e41b7f9", "(certs) ", "chore: AZ-400, Next.js Mastery, TypeScript", "2024"],
  ["|/", "", "", "", ""],
  ["* ", "1d0a5c3", "", "init: BSc Computer Science, Univ. Artois", "2022"],
]

export const appGit: ScreenApp = (x, t, { fonts: { sans: SANS, mono: MONO } }) => {
  const tt = t % 15
  const f = `400 19px ${MONO}`
  const cmd = "git log --graph --oneline --decorate"
  let y = 110
  x.fillStyle = "#0b0f1e"
  x.fillRect(0, 0, LW, LH)
  chrome(x, "chams@dev: ~/career", SANS)
  const px = prompt(x, 40, y, f, "~/career")
  const typed = cmd.slice(0, Math.floor(tt * 24))
  tx(x, typed, px, y, f, "#ffffff")
  const cw = x.measureText("M").width
  let cx = px + typed.length * cw
  let cy = y
  const n = Math.floor((tt - 1.8) / 0.45)
  if (n > 0) {
    for (let i = 0; i < GIT.length && i < n; i++) {
      y += 44
      const g = GIT[i]
      let X = 40
      x.font = f
      x.fillStyle = "#7a5cff"
      x.fillText(g[0], X, y)
      X += g[0].length * cw
      x.fillStyle = "#ffb300"
      x.fillText(g[1], X, y)
      X += (g[1].length + (g[1] ? 1 : 0)) * cw
      x.fillStyle = "#7dffd0"
      x.fillText(g[2], X, y)
      X += g[2].length * cw
      x.fillStyle = "#ffffff"
      x.fillText(g[3], X, y)
      tx(x, g[4], 1176, y, f, "#6f7aa8", "right")
    }
    if (n > GIT.length) {
      y += 56
      cx = prompt(x, 40, y, f, "~/career")
      cy = y
    } else cx = -99
  }
  if (Math.floor(t * 2) % 2 && cx > 0) {
    x.fillStyle = "#ffffff"
    x.fillRect(cx + 1, cy - 18, 11, 23)
  }
}
