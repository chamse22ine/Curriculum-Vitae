import { PH, PW } from "../dims"
import { ease, rr, tx } from "../shared"
import type { ScreenApp } from "../types"
import { pbar, pstat } from "./chrome"

/*
 * 5 — Systèmes : écran « Appareils liés » du téléphone relié au bureau Fedora (Fedora Link).
 * Maquette, à remplacer par la vraie interface.
 */
const EVENTS = {
  fr: ["Presse-papiers partagé", "Notifications synchronisées", "Fichier envoyé · photo.jpg"],
  en: ["Clipboard shared", "Notifications synced", "File sent · photo.jpg"],
}

export const pLink: ScreenApp = (x, t, { lang, palettes, fonts: { sans: SANS } }) => {
  const en = lang === "en"
  const p = palettes[5]
  x.fillStyle = "#1e1e22"
  x.fillRect(0, 0, PW, PH)
  pstat(x, "#ffffff", SANS)
  tx(x, en ? "Linked devices" : "Appareils liés", 24, 92, `600 22px ${SANS}`, "#ffffff")

  // Ordinateur connecté
  rr(x, 16, 112, 328, 112, 20, "#2c2c32")
  rr(x, 38, 136, 60, 40, 5, null, "#ffffff", 2.5)
  x.fillStyle = "#ffffff"
  x.fillRect(28, 182, 80, 5)
  tx(x, "fedora", 126, 158, `600 19px ${SANS}`, "#ffffff")
  x.beginPath()
  x.arc(132, 182, 5, 0, 7)
  x.fillStyle = "#33d17a"
  x.fill()
  tx(x, en ? "Connected · Wi-Fi" : "Connecté · Wi-Fi", 146, 187, `400 14px ${SANS}`, "#b8b8c0")

  // Lecture à distance
  const g = x.createLinearGradient(16, 244, 344, 420)
  g.addColorStop(0, p[0])
  g.addColorStop(1, p[1])
  rr(x, 16, 244, 328, 176, 20, g)
  tx(x, en ? "Playing on fedora" : "Lecture sur fedora", 36, 278, `500 13px ${SANS}`, "rgba(255,255,255,.85)")
  rr(x, 36, 294, 72, 72, 12, "rgba(255,255,255,.25)")
  tx(x, "Nightline", 124, 324, `600 19px ${SANS}`, "#ffffff")
  tx(x, en ? "Local file" : "Fichier local", 124, 348, `400 14px ${SANS}`, "rgba(255,255,255,.85)")
  rr(x, 36, 390, 288, 6, 3, "rgba(255,255,255,.3)")
  rr(x, 36, 390, Math.max(6, 288 * ((t % 40) / 40)), 6, 3, "#ffffff")

  // Événements synchronisés, qui arrivent l'un après l'autre
  EVENTS[lang].forEach((l, i) => {
    const s = ease((t - 0.5 - i * 0.5) / 0.5)
    const Y = 444 + i * 74 + (1 - s) * 16
    rr(x, 16, Y, 328, 62, 16, `rgba(255,255,255,${0.08 * s})`)
    x.beginPath()
    x.arc(42, Y + 31, 7, 0, 7)
    x.fillStyle = `rgba(51,209,122,${s})`
    x.fill()
    tx(x, l, 62, Y + 37, `500 15px ${SANS}`, `rgba(255,255,255,${s})`)
  })
  pbar(x, "#ffffff")
}
