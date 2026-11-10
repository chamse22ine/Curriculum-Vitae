import { LW } from "../dims"
import { tx, type Ctx } from "../shared"

/** Barre de fenêtre (trois pastilles + titre), sombre ou claire */
export function chrome(x: Ctx, title: string, sans: string, light = false) {
  x.fillStyle = light ? "#e8e9ef" : "#1a1b25"
  x.fillRect(0, 0, LW, 46)
  ;["#ff5f57", "#febc2e", "#28c840"].forEach((c, i) => {
    x.beginPath()
    x.arc(26 + i * 24, 23, 7.5, 0, 7)
    x.fillStyle = c
    x.fill()
  })
  if (title) tx(x, title, LW / 2, 29, `500 15px ${sans}`, light ? "#555a6e" : "#9499b5", "center")
}

/** Curseur de souris */
export function pointer(x: Ctx, X: number, Y: number) {
  x.beginPath()
  x.moveTo(X, Y)
  x.lineTo(X, Y + 23)
  x.lineTo(X + 6, Y + 18)
  x.lineTo(X + 10, Y + 27)
  x.lineTo(X + 14, Y + 25)
  x.lineTo(X + 10, Y + 16)
  x.lineTo(X + 18, Y + 16)
  x.closePath()
  x.fillStyle = "#11131c"
  x.fill()
  x.lineWidth = 1.5
  x.strokeStyle = "#ffffff"
  x.stroke()
}

/** Invite de terminal « chams@dev:dir$ » ; renvoie l'abscisse après l'invite */
export function prompt(x: Ctx, X: number, Y: number, f: string, dir: string) {
  x.font = f
  x.textAlign = "left"
  x.fillStyle = "#7dffd0"
  x.fillText("chams@dev", X, Y)
  let w = x.measureText("chams@dev").width
  x.fillStyle = "#3da5ff"
  x.fillText(`:${dir}`, X + w, Y)
  w += x.measureText(`:${dir}`).width
  x.fillStyle = "#ffffff"
  x.fillText("$ ", X + w, Y)
  return X + w + x.measureText("$ ").width
}
