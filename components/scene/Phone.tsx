"use client"

import { useEffect, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import { BoxGeometry, CylinderGeometry, Group, Mesh, TorusGeometry, type BufferGeometry, type Texture } from "three"
import type { HomeFonts } from "@/lib/home-fonts"
import { brandLogo } from "./brand"
import { sceneFontsReady } from "./fonts"
import { rplane, slab } from "./geometry"
import { applyEnv, glass, type Materials } from "./materials"
import { ease } from "./screens/shared"
import { PH, PW, screenCanvas, type Screen } from "./screens"
import { pHours } from "./screens/phone/hours"
import { pShop } from "./screens/phone/shop"
import { FRAME, grab, useSceneState } from "./state"

/** Téléphone (makePhone du prototype) : coque mate, dalle, boutons, bloc photo à trois objectifs */
export function buildPhone(mats: Materials, screen: Texture, anisotropy = 1) {
  const g = new Group()
  g.name = "phone"
  const geos: BufferGeometry[] = [
    slab(0.8, 1.62, 0.07, 0.13),
    rplane(0.74, 1.56, 0.11),
    slab(0.36, 0.38, 0.02, 0.1, 0.008, 5),
    new CylinderGeometry(0.062, 0.062, 0.02, 24),
    new TorusGeometry(0.062, 0.008, 8, 24),
  ]
  const [bodyG, scrG, islG, lensG, ringG] = geos as [BufferGeometry, BufferGeometry, BufferGeometry, BufferGeometry, BufferGeometry]
  g.add(new Mesh(bodyG, mats.PHONEM))
  const screenMaterial = glass(screen)
  const s = new Mesh(scrG, screenMaterial)
  s.position.z = 0.0485
  s.name = "pscr"
  g.add(s)
  for (const [x, y, h] of [[0.412, 0.28, 0.2], [-0.412, 0.38, 0.12], [-0.412, 0.2, 0.12]]) {
    const bg = new BoxGeometry(0.014, h, 0.03)
    geos.push(bg)
    const m = new Mesh(bg, mats.PHONEM)
    m.position.set(x, y, 0)
    g.add(m)
  }
  const isl = new Mesh(islG, mats.PHONEM)
  isl.position.set(-0.17, 0.53, -0.055)
  g.add(isl)
  for (const [x, y] of [[-0.25, 0.61], [-0.09, 0.61], [-0.17, 0.46]]) {
    const c = new Mesh(lensG, mats.BLACK)
    c.rotation.x = Math.PI / 2
    c.position.set(x, y, -0.075)
    g.add(c)
    const r = new Mesh(ringG, mats.ALU)
    r.position.set(x, y, -0.085)
    g.add(r)
  }
  // Logo au dos, sous le bloc photo (rotation : lisible de derrière)
  const brand = brandLogo(0.46, anisotropy)
  brand.mesh.rotation.y = Math.PI
  brand.mesh.position.set(0, -0.12, -0.048)
  g.add(brand.mesh)
  return {
    group: g,
    screenMaterial,
    drawText: brand.draw,
    brand,
    dispose() {
      geos.forEach((x) => x.dispose())
      screenMaterial.dispose()
      brand.dispose()
    },
  }
}

/** Station du grand téléphone selon l'avancement du voyage (bigSt du prototype) */
const bigStation = (F: number) => (F < 4 ? 1 : 7)

/**
 * Grand téléphone, en un seul exemplaire : boutique mobile (station 1) puis suivi d'heures
 * (station 7), à droite du portable dans les deux cas. Échelle 1,3, écran dessiné ×2.
 */
export function BigPhone({
  materials,
  env,
  anisotropy,
  fonts,
}: Readonly<{ materials: Materials; env: Texture | null; anisotropy: number; fonts: HomeFonts }>) {
  const s = useSceneState()
  const dev = useMemo(() => {
    const scr = screenCanvas(PW, PH, 2, anisotropy)
    const phone = buildPhone(materials, scr.texture, anisotropy)
    phone.group.scale.setScalar(1.3)
    applyEnv(phone.group, env)
    const st = { at: 1 }
    const screen: Screen = { ...scr, material: phone.screenMaterial, where: () => st.at, app: (i) => (i === 1 ? pShop : pHours) }
    const g = grab(phone.group)
    g.act = () => {
      g.ty += Math.PI * 2
      g.hold = 0
    }
    return { phone, scr, screen, st, g }
  }, [materials, env, anisotropy])

  useEffect(() => {
    let alive = true
    sceneFontsReady(fonts).then(() => alive && dev.phone.drawText(fonts))
    s.screens.push(dev.screen)
    s.grabs.push(dev.g)
    return () => {
      alive = false
      s.screens.splice(s.screens.indexOf(dev.screen), 1)
      s.grabs.splice(s.grabs.indexOf(dev.g), 1)
      dev.phone.group.removeFromParent()
      dev.phone.dispose()
      dev.scr.texture.dispose()
    }
  }, [s, dev, fonts])

  useFrame(() => {
    const at = bigStation(s.F)
    dev.st.at = at
    const parent = s.stations[at]
    if (parent && dev.phone.group.parent !== parent) parent.add(dev.phone.group)
    const { time, reduce } = s
    // Côté du grand téléphone : à droite dans les deux stations (le portable est à gauche)
    const m = 1
    // À l'arrivée, le téléphone pivote sur lui-même avant de se poser (q : 1 → 0)
    const q = 1 - ease(s.act[at] * 1.2)
    const p = dev.phone.group
    dev.phone.brand.light(s.act[at], s.clock, reduce)
    p.position.set(m * 0.95, -0.05 + (reduce ? 0 : Math.sin(time * 0.9) * 0.06), 0.8)
    p.rotation.set(-0.04 + dev.g.rx, -m * 0.3 - m * q * 5 + dev.g.ry, reduce ? 0 : Math.sin(time * 0.6) * 0.03)
  }, FRAME.objects)

  return null
}
