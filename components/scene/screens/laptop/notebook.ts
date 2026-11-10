import { LW, LH } from "../dims"
import { ease, rng, rr, tx } from "../shared"
import type { ScreenApp } from "../types"
import { chrome } from "./chrome"

// 2 — Data : notebook avec un histogramme et une régression
const SC: [number, number][] = (() => {
  const r = rng(7)
  const a: [number, number][] = []
  for (let i = 0; i < 64; i++) {
    const px = 0.04 + r() * 0.92
    a.push([px, Math.min(0.97, Math.max(0.03, 0.85 - 0.6 * px + (r() - 0.5) * 0.22))])
  }
  return a
})()

export const appNotebook: ScreenApp = (x, t, { fonts: { sans: SANS, mono: MONO } }) => {
  const tt = t % 11
  let i: number
  x.fillStyle = "#ffffff"
  x.fillRect(0, 0, LW, LH)
  chrome(x, "analysis.ipynb — JupyterLab", SANS, true)
  x.fillStyle = "#f4f5f9"
  x.fillRect(0, 46, LW, 38)
  for (i = 0; i < 6; i++) rr(x, 40 + i * 34, 56, 20, 20, 4, "#d5d8e4")
  tx(x, "Python 3 (ipykernel)  ●", LW - 40, 71, `400 14px ${SANS}`, "#555a6e", "right")
  tx(x, "[1]:", 84, 128, `400 15px ${MONO}`, "#3d6ad6", "right")
  rr(x, 96, 100, 1080, 68, 6, "#f6f7fb", "#e0e2ec")
  tx(x, 'df = pd.read_csv("orders.csv", parse_dates=["date"])', 112, 126, `400 16px ${MONO}`, "#2b2d42")
  tx(x, 'df.groupby("category")["revenue"].sum().plot.bar();  sns.regplot(data=df, x="price", y="demand")', 112, 152, `400 16px ${MONO}`, "#2b2d42")

  // Histogramme
  tx(x, "revenue by category", 120, 206, `500 15px ${SANS}`, "#555a6e")
  x.strokeStyle = "#c5c8d6"
  x.lineWidth = 1.5
  x.beginPath()
  x.moveTo(120, 230)
  x.lineTo(120, 560)
  x.lineTo(590, 560)
  x.stroke()
  for (i = 0; i < 4; i++) {
    tx(x, i ? `${i * 20}k` : "0", 112, 565 - i * 100, `400 13px ${MONO}`, "#8a8fa5", "right")
    if (i) {
      x.strokeStyle = "#eceef5"
      x.beginPath()
      x.moveTo(121, 560 - i * 100)
      x.lineTo(590, 560 - i * 100)
      x.stroke()
    }
  }
  const vals = [0.62, 0.85, 0.4, 0.7, 0.95, 0.55]
  const bc = ["#ffb300", "#ff9a1f", "#ff7a3a", "#ff5e3a", "#ff4560", "#ff2d87"]
  const names = ["Run", "Bike", "Swim", "Hike", "Team", "Gym"]
  for (i = 0; i < 6; i++) {
    const h = 320 * vals[i] * ease((tt - 0.3 - i * 0.12) / 0.8)
    rr(x, 146 + i * 74, 560 - h, 50, h + 0.01, h > 8 ? 6 : 0, bc[i])
    tx(x, names[i], 171 + i * 74, 582, `400 13px ${MONO}`, "#555a6e", "center")
  }

  // Nuage de points + droite de régression
  tx(x, "price vs demand", 680, 206, `500 15px ${SANS}`, "#555a6e")
  x.strokeStyle = "#c5c8d6"
  x.beginPath()
  x.moveTo(680, 230)
  x.lineTo(680, 560)
  x.lineTo(1160, 560)
  x.stroke()
  const n = Math.floor(ease((tt - 1) / 2) * SC.length)
  for (i = 0; i < n; i++) {
    x.beginPath()
    x.arc(680 + SC[i][0] * 470, 560 - SC[i][1] * 320, 5, 0, 7)
    x.fillStyle = "rgba(255,94,58,.75)"
    x.fill()
  }
  const q = ease((tt - 3.2) / 1)
  if (q > 0) {
    x.strokeStyle = "#ff2d87"
    x.lineWidth = 3.5
    x.beginPath()
    x.moveTo(690, 560 - 0.83 * 320)
    x.lineTo(690 + 460 * q, 560 - (0.83 - 0.58 * q) * 320)
    x.stroke()
  }
  if (tt > 4.2) tx(x, "r² = 0.91", 1160, 206, `500 15px ${MONO}`, "#ff2d87", "right")
  tx(x, "price", 920, 582, `400 13px ${MONO}`, "#555a6e", "center")
  tx(x, "[2]:", 84, 636, `400 15px ${MONO}`, "#3d6ad6", "right")
  rr(x, 96, 612, 1080, 40, 6, "#f6f7fb", "#e0e2ec")
  tx(x, "model = LinearRegression().fit(X_train, y_train);  model.score(X_test, y_test)", 112, 638, `400 16px ${MONO}`, "#2b2d42")
  if (tt > 5) {
    tx(x, "[2]:", 84, 686, `400 15px ${MONO}`, "#c2410c", "right")
    tx(x, "0.912", 112, 686, `400 17px ${MONO}`, "#2b2d42")
  }
  tx(x, "[ ]:", 84, 736, `400 15px ${MONO}`, "#3d6ad6", "right")
  rr(x, 96, 712, 1080, 40, 6, "#ffffff", "#3d6ad6")
  if (Math.floor(t * 2) % 2) {
    x.fillStyle = "#2b2d42"
    x.fillRect(112, 722, 2, 20)
  }
}
