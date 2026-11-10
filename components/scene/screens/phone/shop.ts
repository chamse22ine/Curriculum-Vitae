import { PH, PW } from "../dims"
import { jersey, rr, SWATCHES as SW, tx } from "../shared"
import type { ScreenApp } from "../types"
import { pbar, pstat } from "./chrome"

// 1 — Web : la boutique fictive en version mobile
export const pShop: ScreenApp = (x, t, { fonts: { sans: SANS, display: DISP } }) => {
  const sel = Math.floor(t / 2.4) % 4
  const col = SW[sel]
  x.fillStyle = "#ffffff"
  x.fillRect(0, 0, PW, PH)
  pstat(x, "#11131c", SANS)
  tx(x, "CLUB STORE", 24, 84, `800 15px ${DISP}`, "#11131c")
  rr(x, 286, 62, 50, 30, 15, "#11131c")
  tx(x, "2", 311, 83, `500 14px ${SANS}`, "#ffffff", "center")
  rr(x, 16, 108, 328, 330, 22, "#f0f1f6")
  jersey(x, 180, 270, 250, col, DISP, "CHAMS", "10")
  tx(x, "Custom match jersey", 24, 482, `600 21px ${SANS}`, "#11131c")
  tx(x, "€34.00", 24, 516, `600 19px ${SANS}`, "#11131c")
  SW.forEach((c, i) => {
    x.beginPath()
    x.arc(42 + i * 50, 568, 15, 0, 7)
    x.fillStyle = c
    x.fill()
    if (i === sel) {
      x.beginPath()
      x.arc(42 + i * 50, 568, 21, 0, 7)
      x.lineWidth = 2
      x.strokeStyle = "#11131c"
      x.stroke()
    }
  })
  rr(x, 20, 640, 320, 58, 29, "#11131c")
  tx(x, "Add to cart", 180, 676, `600 17px ${SANS}`, "#ffffff", "center")
  pbar(x, "#11131c")
}
