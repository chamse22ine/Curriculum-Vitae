import { LH, LW } from "../dims"
import { rr, tx } from "../shared"
import type { ScreenApp } from "../types"
import { chrome } from "./chrome"

// 0 — Accueil : éditeur de code qui tape le portrait de Chams en TypeScript
const CODE = [
  "// chams.dev — du pixel au pipeline",
  "export const chams: Engineer = {",
  '  name: "Chamseddine Adaadour",',
  '  role: "Software Engineer @ Decathlon Digital",',
  '  based: "Lille, France",',
  "  stack: {",
  '    web: ["Next.js", "React", "TypeScript"],',
  '    data: ["Python", "SQL", "Pandas"],',
  '    ai: ["Scikit-learn", "MLOps", "Databricks"],',
  '    devops: ["Docker", "GitHub Actions", "GCP"],',
  "  },",
  "};",
  "",
  'await chams.build(idea).test().ship("production");',
]
const TCOL = ["#5d6285", "#ffd166", "#ff5fa2", "#5fd4ff", "#c9b8ff", "#7dffb0"]

// Coloration syntaxique : commentaire, chaîne, mot-clé, type, clé, méthode
let CODELEN = 0
const TOK: [string, string][][] = CODE.map((line) => {
  const out: [string, string][] = []
  const re = /(\/\/.*$)|("[^"]*")|\b(export|const|await)\b|\b(Engineer)\b|(\w+)(?=:)|(\.\w+)(?=\()/g
  let m: RegExpExecArray | null
  let last = 0
  while ((m = re.exec(line))) {
    if (m.index > last) out.push([line.slice(last, m.index), "#d7daf0"])
    for (let c = 1; c <= 6; c++)
      if (m[c] != null) {
        out.push([m[0], TCOL[c - 1]])
        break
      }
    last = re.lastIndex
  }
  if (last < line.length) out.push([line.slice(last), "#d7daf0"])
  CODELEN += line.length + 1
  return out
})

export const appCode: ScreenApp = (x, t, { fonts: { sans: SANS, mono: MONO } }) => {
  x.fillStyle = "#11121b"
  x.fillRect(0, 0, LW, LH)
  chrome(x, "page.tsx — chams.dev", SANS)
  x.fillStyle = "#0c0d14"
  x.fillRect(0, 46, 58, LH)
  for (let i = 0; i < 5; i++) rr(x, 17, 66 + i * 48, 24, 24, 6, i ? "#2a2c3d" : "#ff3d81")
  x.fillStyle = "#151621"
  x.fillRect(58, 46, 210, LH)
  tx(x, "EXPLORER", 78, 78, `500 12px ${SANS}`, "#7d82a0")
  ;["app/", "  page.tsx", "  Scene.tsx", "api/", "  model.py", "infra/", "  Dockerfile", "  deploy.yml", "README.md"].forEach((f, i) => {
    if (i === 1) rr(x, 66, 91 + i * 28, 194, 26, 5, "#262840")
    tx(x, f, 78, 110 + i * 28, `400 14px ${MONO}`, i === 1 ? "#ffffff" : "#a3a8c4")
  })
  x.fillStyle = "#0c0d14"
  x.fillRect(268, 46, LW, 38)
  x.fillStyle = "#11121b"
  x.fillRect(268, 46, 150, 38)
  x.fillStyle = "#ff3d81"
  x.fillRect(268, 46, 150, 2)
  tx(x, "page.tsx", 290, 71, `400 14px ${MONO}`, "#ffffff")
  tx(x, "model.py", 440, 71, `400 14px ${MONO}`, "#7d82a0")
  tx(x, "deploy.yml", 560, 71, `400 14px ${MONO}`, "#7d82a0")

  let n = Math.floor((t % (CODELEN / 38 + 4)) * 38)
  let y = 124
  let cx = 340
  let cy = y
  x.font = `400 19px ${MONO}`
  const cw = x.measureText("M").width
  for (let l = 0; l < TOK.length; l++) {
    tx(x, String(l + 1), 318, y, `400 19px ${MONO}`, "#4b4f6b", "right")
    x.textAlign = "left"
    let px = 340
    for (let s = 0; s < TOK[l].length && n > 0; s++) {
      const str = TOK[l][s][0].slice(0, n)
      x.fillStyle = TOK[l][s][1]
      x.fillText(str, px, y)
      px += str.length * cw
      n -= str.length
    }
    cx = px
    cy = y
    if (n > 0) n--
    if (n <= 0) break
    y += 34
  }
  if (Math.floor(t * 2) % 2) {
    x.fillStyle = "#ff3d81"
    x.fillRect(cx + 2, cy - 18, 10, 23)
  }
  x.fillStyle = "#7a5cff"
  x.fillRect(0, LH - 28, LW, 28)
  tx(x, "main    ✓ 0  ⚠ 0", 16, LH - 9, `500 13px ${MONO}`, "#ffffff")
  tx(x, "TypeScript React    UTF-8    LF", LW - 16, LH - 9, `500 13px ${MONO}`, "#ffffff", "right")
}
