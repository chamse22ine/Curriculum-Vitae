"use client"

import { useEffect, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import { BoxGeometry, Group, Mesh, type BufferGeometry, type Texture } from "three"
import { MOBILE_MAX } from "@/hooks/use-scroll-progress"
import { rplane, slab } from "./geometry"
import { applyEnv, glass, type Materials } from "./materials"
import { LH, LW, screenCanvas, type Screen } from "./screens"
import { appDash } from "./screens/monitor/dash"
import { FRAME, grab, useSceneState } from "./state"

/** Station du moniteur (Data) et taille de sa dalle, au ratio de l'écran du portable */
const STATION = 2
const SW = 2.5
const SH = 1.616

/**
 * Moniteur de bureau sur pied (makePanel + pied du prototype) : dos en titane, bordure noire,
 * dalle, cou et pied en aluminium. Au clic, il fait un tour complet.
 */
export function Monitor({ materials, env, anisotropy }: Readonly<{ materials: Materials; env: Texture | null; anisotropy: number }>) {
  const s = useSceneState()

  const dev = useMemo(() => {
    const geos: BufferGeometry[] = []
    const geo = <T extends BufferGeometry>(g: T) => (geos.push(g), g)
    const g = new Group()
    g.name = "monitor"
    g.add(new Mesh(geo(slab(SW + 0.08, SH + 0.08, 0.03, 0.07, 0.008, 6)), materials.TITAN))
    const bezel = new Mesh(geo(rplane(SW + 0.06, SH + 0.06, 0.06)), materials.BLACK)
    bezel.position.z = 0.0235
    g.add(bezel)
    // Même définition que l'écran du portable : 1216×786, 1024 de large sur mobile
    const scr = screenCanvas(LW, LH, window.innerWidth > MOBILE_MAX ? 1 : 1024 / LW, anisotropy)
    const screenMaterial = glass(scr.texture)
    const panel = new Mesh(geo(rplane(SW, SH, 0.03)), screenMaterial)
    panel.position.z = 0.025
    g.add(panel)
    const neck = new Mesh(geo(new BoxGeometry(0.14, 0.75, 0.05)), materials.ALU)
    neck.position.set(0, -1.1, -0.06)
    g.add(neck)
    const foot = new Mesh(geo(slab(0.95, 0.55, 0.03, 0.08, 0.008, 6)), materials.ALU)
    foot.rotation.x = -Math.PI / 2
    foot.position.set(0, -1.47, 0.05)
    g.add(foot)
    applyEnv(g, env)

    const screen: Screen = { ...scr, material: screenMaterial, where: () => STATION, app: () => appDash }
    const gr = grab(g)
    gr.act = () => {
      gr.ty += Math.PI * 2
      gr.hold = 0
    }
    return {
      g,
      screen,
      gr,
      dispose() {
        g.removeFromParent()
        geos.forEach((x) => x.dispose())
        screenMaterial.dispose()
        scr.texture.dispose()
      },
    }
  }, [materials, env, anisotropy])

  useEffect(() => {
    s.screens.push(dev.screen)
    s.grabs.push(dev.gr)
    return () => {
      s.screens.splice(s.screens.indexOf(dev.screen), 1)
      s.grabs.splice(s.grabs.indexOf(dev.gr), 1)
      dev.dispose()
    }
  }, [s, dev])

  useFrame(() => {
    const parent = s.stations[STATION]
    if (parent && dev.g.parent !== parent) parent.add(dev.g)
    // Arrivée en glissant depuis la droite (q = 1 − ease(act × 1,3)) : étape 6 ; pour l'instant en place
    const q = 0
    dev.g.position.set(1.05 + q * 3.5, 0.75, -0.9)
    dev.g.rotation.set(dev.gr.rx, -0.3 - q * 0.8 + dev.gr.ry, 0)
  }, FRAME.objects)

  return null
}
