import { hhmm, rr, tx, type Ctx } from "../shared"

/** Barre d'état : heure, îlot, batterie */
export function pstat(x: Ctx, col: string, sans: string, bare = false) {
  if (bare) return
  tx(x, hhmm(), 30, 36, `600 15px ${sans}`, col)
  rr(x, 130, 14, 100, 26, 13, "#000000")
  rr(x, 304, 24, 26, 13, 4, null, col, 1.5)
  x.fillStyle = col
  x.fillRect(307, 27, 18, 7)
}

/** Barre d'accueil en bas de l'écran */
export function pbar(x: Ctx, col: string, bare = false) {
  if (bare) return
  rr(x, 120, 742, 120, 5, 2.5, col)
}
