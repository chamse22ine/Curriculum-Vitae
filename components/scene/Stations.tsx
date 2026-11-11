"use client"

import { useFrame } from "@react-three/fiber"
import type { Group } from "three"
import { damp, DTH, FIT, FRAME, NS, RATE, RO, SIDES, useSceneState, YS } from "./state"

const IDS = Array.from({ length: NS }, (_, i) => i)

/**
 * Les neuf stations posées sur l'anneau. Seules la station quittée et la station atteinte sont
 * dessinées (plus celle qui finit de s'effacer). Chaque station a une valeur `act` de 0 à 1 qui
 * pilote son animation d'arrivée ; les objets (portables, téléphones, moniteur, processeur, baie)
 * s'y accrochent eux-mêmes.
 */
export function Stations() {
  const s = useSceneState()

  useFrame(() => {
    const { k, cur, wide, sc, time, reduce } = s
    const e = reduce ? 1 : damp(RATE.act, s.dt)
    for (let i = 0; i < NS; i++) {
      s.act[i] += ((i === cur ? 1 : 0) - s.act[i]) * e
      const g = s.stations[i]
      if (!g) continue
      g.visible = i === k || i === k + 1 || s.act[i] > 0.01
      if (!g.visible) continue
      g.scale.setScalar(sc * (wide ? 1 : FIT[i]))
      g.rotation.y = -i * DTH + (wide ? -SIDES[i] * 0.1 : 0) + (reduce ? 0 : Math.sin(time * 0.3 + i) * 0.04)
    }
  }, FRAME.stations)

  return (
    <>
      {IDS.map((i) => (
        <group
          key={i}
          name={`station-${i}`}
          position={[RO * Math.sin(i * DTH), YS[i], -RO * Math.cos(i * DTH)]}
          ref={(g: Group | null) => {
            s.stations[i] = g
          }}
        />
      ))}
    </>
  )
}
