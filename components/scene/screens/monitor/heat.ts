import { ease, rr, tx } from "../shared"
import type { ScreenApp } from "../types"

// Matrice de corrélation (600×600), appHeat du prototype
const HM = ["price", "demand", "stock", "visits", "promo", "rating"]

export const appHeat: ScreenApp = (x, t, { fonts: { sans: SANS, mono: MONO } }) => {
  const tt = t % 12
  x.fillStyle = "#160d0a"
  x.fillRect(0, 0, 600, 600)
  tx(x, "correlation matrix", 30, 48, `600 22px ${SANS}`, "#ffffff")
  tx(x, "df.corr()", 570, 48, `400 16px ${MONO}`, "#d6b8a8", "right")
  for (let i = 0; i < 6; i++) {
    tx(x, HM[i], 102, 124 + i * 78, `400 14px ${MONO}`, "#d6b8a8", "right")
    tx(x, HM[i].slice(0, 3), 146 + i * 78, 574, `400 14px ${MONO}`, "#d6b8a8", "center")
    for (let j = 0; j < 6; j++) {
      const v = i === j ? 1 : Math.sin((i + 1) * (j + 1) * 1.7) * 0.85
      const a = ease((tt - 0.2 - (i + j) * 0.08) / 0.5)
      const al = (0.15 + 0.85 * Math.abs(v)) * a
      rr(x, 110 + j * 78, 80 + i * 78, 72, 72, 10, v > 0 ? `rgba(255,94,58,${al})` : `rgba(61,165,255,${al})`)
      if (a > 0.6) tx(x, v.toFixed(2), 146 + j * 78, 121 + i * 78, `500 15px ${MONO}`, "#ffffff", "center")
    }
  }
}
