import { LH, LW } from "../dims"
import { ease, jersey, rr, SWATCHES as SW, tx } from "../shared"
import type { ScreenApp } from "../types"
import { chrome, pointer } from "./chrome"

// 1 — Web : page produit d'une boutique fictive (« Club Store ») de maillots personnalisés
export const appShop: ScreenApp = (x, t, { fonts: { sans: SANS, mono: MONO, display: DISP } }) => {
  const sel = Math.floor(t / 2.4) % 4
  const u = (t % 2.4) / 2.4
  const col = SW[sel]
  x.fillStyle = "#ffffff"
  x.fillRect(0, 0, LW, LH)
  chrome(x, "", SANS, true)
  rr(x, 300, 9, 616, 28, 14, "#ffffff")
  tx(x, "club-store.app/kits/custom", 608, 28, `400 14px ${SANS}`, "#555a6e", "center")
  tx(x, "CLUB STORE", 48, 98, `800 22px ${DISP}`, "#11131c")
  ;["Kits", "Training", "Shoes", "Clubs"].forEach((s, i) => tx(x, s, 330 + i * 96, 97, `500 16px ${SANS}`, i ? "#6a6f85" : "#11131c"))
  rr(x, 1060, 74, 108, 36, 18, "#11131c")
  tx(x, "Cart · 2", 1114, 98, `500 15px ${SANS}`, "#ffffff", "center")
  rr(x, 48, 128, 560, 510, 24, "#f0f1f6")
  jersey(x, 328, 378, 400, col, DISP, "CHAMS", "10")
  tx(x, "Custom match jersey", 656, 178, `600 34px ${SANS}`, "#11131c")
  tx(x, "Club kit · 2026/27 season", 656, 210, `400 17px ${SANS}`, "#7a7f95")
  tx(x, "€34.00", 656, 264, `600 30px ${SANS}`, "#11131c")
  tx(x, "Colour", 656, 312, `500 15px ${SANS}`, "#7a7f95")
  SW.forEach((c, i) => {
    x.beginPath()
    x.arc(676 + i * 58, 346, 18, 0, 7)
    x.fillStyle = c
    x.fill()
    if (i === sel) {
      x.beginPath()
      x.arc(676 + i * 58, 346, 25, 0, 7)
      x.lineWidth = 2.5
      x.strokeStyle = "#11131c"
      x.stroke()
    }
  })
  tx(x, "Size", 656, 412, `500 15px ${SANS}`, "#7a7f95")
  ;["S", "M", "L", "XL"].forEach((s, i) => {
    rr(x, 656 + i * 70, 428, 58, 40, 10, i === 1 ? "#11131c" : "#ffffff", "#cfd2de")
    tx(x, s, 685 + i * 70, 454, `500 16px ${SANS}`, i === 1 ? "#ffffff" : "#11131c", "center")
  })
  tx(x, "Name & number", 656, 512, `500 15px ${SANS}`, "#7a7f95")
  rr(x, 656, 528, 330, 46, 10, "#ffffff", "#cfd2de")
  tx(x, "CHAMS".slice(0, Math.max(0, Math.floor((t % 9.6) * 3))), 672, 558, `500 18px ${MONO}`, "#11131c")
  rr(x, 1000, 528, 80, 46, 10, "#ffffff", "#cfd2de")
  tx(x, "10", 1040, 558, `500 18px ${MONO}`, "#11131c", "center")
  rr(x, 656, 598, 424, 58, 29, u > 0.52 && u < 0.78 ? col : "#11131c")
  tx(x, "Add to cart", 868, 634, `600 18px ${SANS}`, "#ffffff", "center")
  tx(x, "You may also like", 48, 676, `500 15px ${SANS}`, "#7a7f95")
  const more = ["Away kit", "Training top", "Keeper kit", "Warm-up", "Third kit"]
  for (let i = 0; i < 5; i++) {
    rr(x, 48 + i * 228, 690, 212, 84, 14, "#f0f1f6")
    jersey(x, 92 + i * 228, 734, 62, SW[(i + sel + 1) % 4], DISP)
    tx(x, more[i], 136 + i * 228, 728, `500 15px ${SANS}`, "#11131c")
    tx(x, `€${24 + i * 4}.00`, 136 + i * 228, 752, `400 14px ${SANS}`, "#7a7f95")
  }
  // Le curseur choisit une couleur, ajoute au panier, puis repart vers la couleur suivante
  const ax = 676 + sel * 58
  const ay = 350
  const nx = 676 + ((sel + 1) % 4) * 58
  const bx = 880
  const by = 630
  let cx: number
  let cy: number
  if (u < 0.25) {
    cx = ax
    cy = ay
  } else if (u < 0.55) {
    const q = ease((u - 0.25) / 0.3)
    cx = ax + (bx - ax) * q
    cy = ay + (by - ay) * q
  } else if (u < 0.75) {
    cx = bx
    cy = by
  } else {
    const q = ease((u - 0.75) / 0.25)
    cx = bx + (nx - bx) * q
    cy = by + (ay - by) * q
  }
  pointer(x, cx, cy)
}
