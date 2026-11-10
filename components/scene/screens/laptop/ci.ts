import { LW, LH } from "../dims"
import { rr, tx } from "../shared"
import type { ScreenApp } from "../types"
import { chrome } from "./chrome"

// 4 — DevOps : un run CI/CD à côté de la supervision en direct
const JOBS = ["lint", "test", "build image", "push", "deploy"]
const LOGS: [number, string][] = [
  [0.6, "$ npm run lint"],
  [1.6, "✓ no problems found"],
  [2.4, "$ npm test -- --ci"],
  [3.8, "✓ 148 tests passed (12.4 s)"],
  [4.2, "$ docker build -t app:482 ."],
  [5, " => exporting layers 3.1s"],
  [5.8, "✓ image built · 214 MB"],
  [6.1, "$ docker push registry/app:482"],
  [7.5, "✓ pushed"],
  [7.9, "$ gcloud run deploy app --image app:482"],
  [8.7, " routing traffic…"],
  [9.4, "✓ revision app-00482 is serving 100 % of traffic"],
]

/** Latence p95 simulée ; elle baisse après le déploiement (cycle de 13 s) */
function latency(u: number) {
  const w = ((u % 13) + 13) % 13
  return (w > 9.4 ? 92 : 128) + 12 * Math.sin(u * 1.7) + 6 * Math.sin(u * 4.3)
}

export const appCI: ScreenApp = (x, t, { fonts: { sans: SANS, mono: MONO } }) => {
  const tt = t % 13
  let i: number
  x.fillStyle = "#0b1412"
  x.fillRect(0, 0, LW, LH)
  chrome(x, "deploy.yml · run #482", SANS)
  tx(x, "Deploy to production", 40, 98, `600 26px ${SANS}`, "#ffffff")
  tx(x, "main · a9f3c21 · pushed by chams", 40, 126, `400 15px ${MONO}`, "#8fa39b")
  for (i = 0; i < 5; i++) {
    const X = 40 + i * 236
    const st = tt < 0.5 + i * 1.8 ? 0 : tt < 2.3 + i * 1.8 ? 1 : 2
    const col = ["#2c3f39", "#ffb300", "#3dff9e"][st]
    const cx = X + 32
    const cy = 192
    if (i < 4) {
      x.strokeStyle = st === 2 ? "#3dff9e" : "#2c3f39"
      x.lineWidth = 2
      x.beginPath()
      x.moveTo(X + 190, 192)
      x.lineTo(X + 236, 192)
      x.stroke()
    }
    rr(x, X, 160, 190, 64, 14, "#13211d", col, 2)
    if (st === 2) {
      x.beginPath()
      x.arc(cx, cy, 11, 0, 7)
      x.fillStyle = col
      x.fill()
      x.strokeStyle = "#07130f"
      x.lineWidth = 2.5
      x.beginPath()
      x.moveTo(cx - 5, cy)
      x.lineTo(cx - 1, cy + 4)
      x.lineTo(cx + 6, cy - 4)
      x.stroke()
    } else {
      x.strokeStyle = col
      x.lineWidth = 3
      x.beginPath()
      if (st) x.arc(cx, cy, 10, t * 6, t * 6 + 4.2)
      else x.arc(cx, cy, 10, 0, 7)
      x.stroke()
    }
    tx(x, JOBS[i], X + 54, 198, `500 16px ${SANS}`, "#ffffff")
    if (st === 2) tx(x, `${[8, 12, 31, 9, 14][i]}s`, X + 176, 198, `400 13px ${MONO}`, "#8fa39b", "right")
  }
  rr(x, 40, 256, 690, 500, 16, "#070d0b", "#1d2e29")
  let y = 296
  LOGS.forEach(([at, line]) => {
    if (tt < at) return
    const c = line.charAt(0)
    tx(x, line, 64, y, `400 16px ${MONO}`, c === "$" ? "#ffffff" : c === "✓" ? "#3dff9e" : "#8fa39b")
    y += 34
  })
  if (Math.floor(t * 2) % 2) {
    x.fillStyle = "#3dff9e"
    x.fillRect(64, y - 16, 10, 20)
  }
  rr(x, 754, 256, 422, 500, 16, "#0e1a17", "#1d2e29")
  tx(x, "Monitoring · p95 latency", 778, 292, `500 15px ${SANS}`, "#8fa39b")
  tx(x, `${Math.round(latency(t))} ms`, 778, 346, `500 40px ${MONO}`, "#ffffff")
  x.beginPath()
  for (i = 0; i <= 60; i++) {
    const px = 778 + (i / 60) * 374
    const py = 520 - ((latency(t - (60 - i) * 0.12) - 60) / 100) * 130
    if (i) x.lineTo(px, py)
    else x.moveTo(px, py)
  }
  x.strokeStyle = "#d4ff3d"
  x.lineWidth = 3
  x.lineJoin = "round"
  x.stroke()
  x.lineTo(1152, 540)
  x.lineTo(778, 540)
  x.closePath()
  x.fillStyle = "rgba(212,255,61,.12)"
  x.fill()
  ;[
    ["uptime", "99.98 %"],
    ["error rate", "0.02 %"],
    ["instances", "3 / 3"],
  ].forEach((r, j) => {
    x.beginPath()
    x.arc(786, 594 + j * 52, 6, 0, 7)
    x.fillStyle = "#3dff9e"
    x.fill()
    tx(x, r[0], 806, 600 + j * 52, `400 16px ${SANS}`, "#b8c9c2")
    tx(x, r[1], 1152, 600 + j * 52, `500 16px ${MONO}`, "#ffffff", "right")
  })
}
