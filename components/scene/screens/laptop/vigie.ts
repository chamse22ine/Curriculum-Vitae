import { LH, LW } from "../dims"
import { ease, rr, tx } from "../shared"
import type { ScreenApp } from "../types"

/*
 * 5 — Systèmes : Vigie, app GNOME native (fenêtre au style sombre de libadwaita).
 * Maquette : la disposition et tous les chiffres (batterie, stockage, paquets, nettoyage) sont
 * inventés, à remplacer par la vraie interface.
 */
const NAV = {
  fr: ["Vue d’ensemble", "Batterie", "Stockage", "Paquets", "Nettoyage"],
  en: ["Overview", "Battery", "Storage", "Packages", "Cleanup"],
}
const PACKAGES: [string, number][] = [
  ["RPM", 1842],
  ["Flatpak", 37],
  ["Cargo", 12],
  ["pip", 58],
  ["npm", 9],
]
const CLEANUP = {
  fr: [
    ["Cache DNF", "1,2 Go"],
    ["Runtimes Flatpak inutilisés", "860 Mo"],
    ["Journaux système", "310 Mo"],
  ],
  en: [
    ["DNF cache", "1.2 GB"],
    ["Unused Flatpak runtimes", "860 MB"],
    ["System journals", "310 MB"],
  ],
}

export const appVigie: ScreenApp = (x, t, { lang, fonts: { sans: SANS, mono: MONO } }) => {
  const tt = t % 14
  const en = lang === "en"
  // k : remplissage des jauges et compteurs ; p : avancement du nettoyage
  const k = ease(tt / 1.6)
  const p = ease((tt - 6) / 3)
  const G = en ? " GB" : " Go"

  x.fillStyle = "#242424"
  x.fillRect(0, 0, LW, LH)
  x.fillStyle = "#303030"
  x.fillRect(0, 0, LW, 50)
  tx(x, "Vigie", LW / 2, 32, `600 17px ${SANS}`, "#ffffff", "center")
  for (let i = 0; i < 3; i++) {
    x.beginPath()
    x.arc(LW - 34 - i * 34, 25, 11, 0, 7)
    x.fillStyle = "#454545"
    x.fill()
  }
  rr(x, 16, 10, 30, 30, 8, "#3d3d3d")

  // Barre latérale
  x.fillStyle = "#2a2a2a"
  x.fillRect(0, 50, 250, LH)
  NAV[lang].forEach((n, i) => {
    if (!i) rr(x, 12, 66, 226, 42, 8, "#3d3d3d")
    rr(x, 28, 79 + i * 48, 16, 16, 4, i ? "#5e5e5e" : "#3584e4")
    tx(x, n, 58, 93 + i * 48, `500 16px ${SANS}`, i ? "#c0bfbc" : "#ffffff")
  })
  tx(x, "Fedora Linux · GNOME", 28, LH - 24, `400 13px ${SANS}`, "#8a8a8a")

  // Batterie
  rr(x, 274, 70, 450, 250, 14, "#363636")
  tx(x, en ? "Battery" : "Batterie", 298, 106, `600 17px ${SANS}`, "#ffffff")
  x.lineWidth = 16
  x.strokeStyle = "#4a4a4a"
  x.beginPath()
  x.arc(384, 208, 70, 0, 7)
  x.stroke()
  x.lineCap = "round"
  x.strokeStyle = "#33d17a"
  x.beginPath()
  x.arc(384, 208, 70, -1.5708, -1.5708 + 6.2832 * 0.86 * Math.max(0.01, k))
  x.stroke()
  x.lineCap = "butt"
  tx(x, `${Math.round(86 * k)} %`, 384, 218, `600 30px ${SANS}`, "#ffffff", "center")
  ;[
    [en ? "Health" : "Santé", "94 %"],
    [en ? "Remaining" : "Autonomie", "6 h 40"],
    ["Cycles", "212"],
  ].forEach((r, i) => {
    tx(x, r[0], 494, 170 + i * 44, `400 15px ${SANS}`, "#b0b0b0")
    tx(x, r[1], 700, 170 + i * 44, `600 16px ${SANS}`, "#ffffff", "right")
  })

  // Stockage
  rr(x, 744, 70, 452, 250, 14, "#363636")
  tx(x, en ? "Storage" : "Stockage", 768, 106, `600 17px ${SANS}`, "#ffffff")
  tx(x, `182 / 512${G}`, 1172, 106, `500 15px ${MONO}`, "#b0b0b0", "right")
  rr(x, 768, 134, 404, 22, 8, "#4a4a4a")
  let X = 768
  ;(
    [
      [0.14, "#3584e4", en ? "System" : "Système", "72"],
      [0.12, "#9141ac", "Applications", "61"],
      [0.095, "#ff7800", en ? "Home folder" : "Dossier personnel", "49"],
    ] as const
  ).forEach((r, i) => {
    const w = 404 * r[0] * k
    const w2 = Math.max(2, w - 3)
    rr(x, X, 134, w2, 22, Math.min(5, w2 / 2), r[1])
    X += w
    x.beginPath()
    x.arc(776, 196 + i * 40, 7, 0, 7)
    x.fillStyle = r[1]
    x.fill()
    tx(x, r[2], 796, 202 + i * 40, `400 15px ${SANS}`, "#d0d0d0")
    tx(x, r[3] + G, 1172, 202 + i * 40, `500 15px ${MONO}`, "#ffffff", "right")
  })

  // Paquets
  rr(x, 274, 340, 922, 150, 14, "#363636")
  tx(x, en ? "Packages · every source" : "Paquets · toutes les sources", 298, 376, `600 17px ${SANS}`, "#ffffff")
  PACKAGES.forEach((r, i) => {
    rr(x, 298 + i * 178, 396, 162, 74, 12, "#424242")
    tx(x, r[0], 314 + i * 178, 424, `400 14px ${SANS}`, "#b0b0b0")
    tx(x, String(Math.round(r[1] * k)), 314 + i * 178, 456, `600 24px ${MONO}`, "#ffffff")
  })

  // Nettoyage avec aperçu exact
  rr(x, 274, 510, 922, 252, 14, "#363636")
  tx(x, en ? "Cleanup · exact preview" : "Nettoyage · aperçu exact", 298, 546, `600 17px ${SANS}`, "#ffffff")
  CLEANUP[lang].forEach((r, i) => {
    const done = p > (i + 1) / 3 - 0.01
    const Y = 566 + i * 44
    rr(x, 298, Y, 20, 20, 5, done ? "#33d17a" : "#3584e4")
    x.strokeStyle = "#ffffff"
    x.lineWidth = 2.5
    x.beginPath()
    x.moveTo(303, Y + 10)
    x.lineTo(307, Y + 14)
    x.lineTo(314, Y + 6)
    x.stroke()
    tx(x, r[0], 332, Y + 16, `400 16px ${SANS}`, done ? "#8a8a8a" : "#e0e0e0")
    tx(x, r[1], 960, Y + 16, `500 15px ${MONO}`, done ? "#8a8a8a" : "#ffffff", "right")
  })
  rr(x, 298, 714, 662, 10, 5, "#4a4a4a")
  if (p > 0) rr(x, 298, 714, Math.max(10, 662 * p), 10, 5, "#33d17a")
  tx(x, en ? "2.37 GB" : "2,37 Go", 1172, 600, `600 30px ${SANS}`, p >= 1 ? "#33d17a" : "#ffffff", "right")
  tx(x, p >= 1 ? (en ? "freed" : "libérés") : en ? "can be freed" : "libérables", 1172, 626, `400 14px ${SANS}`, "#b0b0b0", "right")
  rr(x, 1010, 690, 162, 48, 24, p >= 1 ? "#26a269" : "#3584e4")
  const label = p >= 1 ? (en ? "Done ✓" : "Terminé ✓") : p > 0 ? (en ? "Cleaning…" : "Nettoyage…") : en ? "Clean up" : "Nettoyer"
  tx(x, label, 1091, 720, `600 16px ${SANS}`, "#ffffff", "center")
}
