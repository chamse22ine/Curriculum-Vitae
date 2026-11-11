import { LH, LW } from "../dims"
import { pKpi } from "../phone/kpi"
import type { ScreenApp } from "../types"
import { appHeat } from "./heat"

/**
 * Moniteur de la station Data (1216×786, appDash du prototype) : matrice de corrélation agrandie
 * à gauche, chiffre d'affaires du jour (l'app du téléphone, sans ses barres) à droite.
 */
export const appDash: ScreenApp = (x, t, env) => {
  x.fillStyle = "#160d0a"
  x.fillRect(0, 0, LW, LH)
  x.save()
  x.translate(30, 18)
  x.scale(1.25, 1.25)
  appHeat(x, t, env)
  x.restore()
  x.save()
  x.translate(826, 13)
  pKpi(x, t, { ...env, bare: true })
  x.restore()
}
