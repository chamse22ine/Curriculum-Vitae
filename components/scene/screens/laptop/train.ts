import { LW, LH } from "../dims"
import { rng, rr, tx } from "../shared"
import type { ScreenApp } from "../types"
import { chrome } from "./chrome"

// 3 — IA : un entraînement, de la première epoch à la mise en production
const LOSS: [number[], number[]] = (() => {
  const r = rng(11)
  const a: number[] = []
  const b: number[] = []
  for (let e = 0; e <= 50; e++) {
    a.push(0.08 + 0.95 * Math.exp(-e / 9) + (r() - 0.5) * 0.03)
    b.push(0.17 + 0.9 * Math.exp(-e / 10) + (r() - 0.5) * 0.05)
  }
  return [a, b]
})()

export const appTrain: ScreenApp = (x, t, { fonts: { sans: SANS, mono: MONO } }) => {
  const tt = t % 16
  const prog = Math.min(1, tt / 11)
  const ef = prog * 50
  const e = Math.floor(ef)
  const done = prog >= 1
  let i: number
  let k: number
  x.fillStyle = "#0f0b1e"
  x.fillRect(0, 0, LW, LH)
  chrome(x, "Experiments · flightbot-intent-v3", SANS)
  tx(x, "flightbot-intent-v3", 40, 98, `600 26px ${SANS}`, "#ffffff")
  rr(x, 300, 74, done ? 250 : 130, 32, 16, done ? "rgba(61,255,158,.16)" : "rgba(255,179,0,.16)")
  tx(x, done ? "● Registered · Production" : "● Training…", 318, 96, `500 15px ${SANS}`, done ? "#3dff9e" : "#ffb300")
  rr(x, 40, 120, 760, 420, 16, "#171230", "#2a2350")
  tx(x, "loss", 64, 152, `500 15px ${SANS}`, "#b9b5d6")
  tx(x, "— train", 680, 152, `500 14px ${MONO}`, "#ff3db5", "right")
  tx(x, "— validation", 776, 152, `500 14px ${MONO}`, "#8f8bff", "right")
  for (i = 0; i < 5; i++) {
    x.strokeStyle = "#241d47"
    x.lineWidth = 1
    x.beginPath()
    x.moveTo(90, 500 - i * 80)
    x.lineTo(770, 500 - i * 80)
    x.stroke()
    tx(x, (i * 0.275).toFixed(2), 82, 505 - i * 80, `400 12px ${MONO}`, "#6d6996", "right")
  }
  tx(x, "epoch 0", 90, 524, `400 12px ${MONO}`, "#6d6996")
  tx(x, "50", 770, 524, `400 12px ${MONO}`, "#6d6996", "right")
  for (k = 1; k >= 0; k--) {
    const a = LOSS[k]
    let lx = 90
    let ly = 0
    x.strokeStyle = k ? "#8f8bff" : "#ff3db5"
    x.lineWidth = 3
    x.lineJoin = "round"
    x.beginPath()
    for (i = 0; i <= e; i++) {
      lx = 90 + (i / 50) * 680
      ly = 500 - (a[i] / 1.1) * 320
      if (i) x.lineTo(lx, ly)
      else x.moveTo(lx, ly)
    }
    if (e < 50) {
      const f = ef - e
      lx = 90 + (ef / 50) * 680
      ly = 500 - ((a[e] + (a[e + 1] - a[e]) * f) / 1.1) * 320
      x.lineTo(lx, ly)
    }
    x.stroke()
    x.beginPath()
    x.arc(lx, ly, 6, 0, 7)
    x.fillStyle = k ? "#8f8bff" : "#ff3db5"
    x.fill()
  }
  const acc = 0.52 + 0.42 * (1 - Math.exp(-ef / 9))
  const cards: [string, string][] = [
    ["accuracy", acc.toFixed(3)],
    ["F1 score", (acc - 0.03).toFixed(3)],
    ["epoch", `${e} / 50`],
    ["learning rate", "3e-4"],
  ]
  cards.forEach((c, j) => {
    rr(x, 824, 120 + j * 107, 352, 93, 16, "#171230", "#2a2350")
    tx(x, c[0], 846, 150 + j * 107, `500 14px ${SANS}`, "#b9b5d6")
    tx(x, c[1], 846, 192 + j * 107, `500 30px ${MONO}`, "#ffffff")
    if (j === 2) {
      rr(x, 1010, 172 + j * 107, 144, 8, 4, "#2a2350")
      rr(x, 1010, 172 + j * 107, Math.max(8, 144 * prog), 8, 4, "#e05bff")
    }
  })
  rr(x, 40, 560, 1136, 196, 16, "#0a0716", "#2a2350")
  for (i = 0; i < 5; i++) {
    k = e - 4 + i
    if (k < 1) continue
    const line = `epoch ${String(k).padStart(2, "0")}/50   loss ${LOSS[0][k].toFixed(4)}   val_loss ${LOSS[1][k].toFixed(4)}   val_acc ${(0.52 + 0.42 * (1 - Math.exp(-k / 9))).toFixed(3)}   ·  1.8 s`
    tx(x, line, 64, 594 + i * 30, `400 15px ${MONO}`, i === 4 && !done ? "#ffffff" : "#b9b5d6")
  }
  if (done) tx(x, "✓ model registered → deployed to the production endpoint", 64, 744, `500 15px ${MONO}`, "#3dff9e")
}
