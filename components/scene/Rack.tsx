"use client"

import { useEffect, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import {
  BoxGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  type BufferGeometry,
  type Material,
  type Object3D,
  type Texture,
} from "three"
import type { HomeFonts } from "@/lib/home-fonts"
import { sceneFontsReady } from "./fonts"
import { brandLogo } from "./brand"
import { canvasTexture, mkCanvas } from "./geometry"
import { applyEnv, type Materials } from "./materials"
import { ease, rr, tx } from "./screens/shared"
import { FRAME, grab, useSceneState } from "./state"

/** Station DevOps */
const STATION = 4
/** Baie : largeur, hauteur, profondeur ; serveurs : largeur, hauteur, profondeur */
const RW = 1.9
const RH = 3.3
const RD = 1.3
const UW = RW - 0.22
const UH = 0.34
const UD = RD - 0.2
/** Cycle du déploiement suivi par les voyants (s), comme l'app CI/CD du portable */
const CYCLE = 13

/** Huit serveurs, de haut en bas. Noms décoratifs. sw : commutateur, gr : grille, gp : GPU, dk : disques */
const UNITS = [
  ["sw-core-01", "sw"],
  ["web-01", "gr"],
  ["web-02", "gr"],
  ["api-01", "gr"],
  ["ml-gpu-01", "gp"],
  ["db-01", "dk"],
  ["ci-runner-01", "gr"],
  ["monitor-01", "dk"],
] as const
type UnitType = (typeof UNITS)[number][1]

interface Unit {
  g: Group
  canvas: HTMLCanvasElement
  tex: Texture
  name: string
  type: UnitType
  /** Instant du dernier clic (le serveur sort puis rentre) */
  kick: number
}
interface Led {
  m: MeshBasicMaterial
  u: number
  type: "port" | "status" | "act"
  i: number
}

/** Façade d'un serveur, 840×170 (drawUnit du prototype) */
function drawUnit(u: Unit, mono: string) {
  const x = u.canvas.getContext("2d")!
  x.fillStyle = "#202229"
  x.fillRect(0, 0, 840, 170)
  x.strokeStyle = "rgba(255,255,255,.08)"
  x.lineWidth = 2
  x.strokeRect(1, 1, 838, 168)
  if (u.type === "sw") {
    for (let i = 0; i < 24; i++) {
      const X = 80 + (i % 12) * 44
      const Y = 38 + Math.floor(i / 12) * 58
      rr(x, X, Y, 36, 40, 4, "#07080a", "#3a3d47")
      x.fillStyle = "#16171c"
      x.fillRect(X + 10, Y + 28, 16, 8)
    }
  } else if (u.type === "dk") {
    for (let i = 0; i < 6; i++) {
      rr(x, 80 + i * 92, 24, 84, 122, 8, "#16171c", "#3a3d47", 2)
      for (let a = 0; a < 4; a++)
        for (let b = 0; b < 5; b++) {
          x.beginPath()
          x.arc(98 + i * 92 + a * 16, 48 + b * 16, 4, 0, 7)
          x.fillStyle = "#07080a"
          x.fill()
        }
      x.fillStyle = "#3a3d47"
      x.fillRect(92 + i * 92, 130, 60, 5)
    }
  } else {
    const n = u.type === "gp" ? 30 : 22
    for (let a = 0; a < n; a++)
      for (let b = 0; b < 7; b++) {
        x.beginPath()
        x.arc(84 + a * 18 + (b % 2) * 9, 26 + b * 20, 6, 0, 7)
        x.fillStyle = "#07080a"
        x.fill()
      }
  }
  x.textBaseline = "alphabetic"
  tx(x, u.name, 790, 152, `500 20px ${mono}`, "#c9cde0", "right")
  u.tex.needsUpdate = true
}

const hash = (n: number) => {
  const v = Math.sin(n * 12.9898) * 43758.5453
  return v - Math.floor(v)
}

/**
 * Baie de huit serveurs (station DevOps) : les voyants suivent le déploiement, les bandes
 * lumineuses prennent la couleur de la section. Au clic, le serveur visé sort puis rentre.
 */
export function Rack({
  materials,
  env,
  anisotropy,
  fonts,
}: Readonly<{ materials: Materials; env: Texture | null; anisotropy: number; fonts: HomeFonts }>) {
  const s = useSceneState()

  const dev = useMemo(() => {
    const geos: BufferGeometry[] = []
    const mats: Material[] = []
    const geo = <T extends BufferGeometry>(g: T) => (geos.push(g), g)
    const mat = <T extends Material>(m: T) => (mats.push(m), m)
    const rack = new Group()
    rack.name = "rack"
    const RM = mat(new MeshStandardMaterial({ color: 0x121318, metalness: 0.9, roughness: 0.45 }))
    const UM = mat(new MeshStandardMaterial({ color: 0x2a2c34, metalness: 0.85, roughness: 0.5 }))
    const lg = geo(new BoxGeometry(0.028, 0.028, 0.01))
    const box = (w: number, h: number, d: number, m: Material, x: number, y: number, z: number, par: Group = rack) => {
      const o = new Mesh(geo(new BoxGeometry(w, h, d)), m)
      o.position.set(x, y, z)
      par.add(o)
      return o
    }
    const leds: Led[] = []
    const ledAt = (u: Group, j: number, type: Led["type"], i: number, x: number, y: number) => {
      const m = mat(new MeshBasicMaterial({ color: 0x000000 }))
      const o = new Mesh(lg, m)
      o.position.set(x, y, UD / 2 + 0.006)
      u.add(o)
      leds.push({ m, u: j, type, i })
    }

    // Châssis : dessus, dessous, montants, flancs, fond
    box(RW, 0.09, RD, RM, 0, RH / 2 - 0.045, 0)
    box(RW, 0.09, RD, RM, 0, -RH / 2 + 0.045, 0)
    for (const [cx, cz] of [[-1, -1], [-1, 1], [1, -1], [1, 1]]) box(0.09, RH, 0.09, RM, cx * (RW / 2 - 0.045), 0, cz * (RD / 2 - 0.045))
    box(0.02, RH - 0.18, RD - 0.18, RM, -(RW / 2 - 0.02), 0, 0)
    box(0.02, RH - 0.18, RD - 0.18, RM, RW / 2 - 0.02, 0, 0)
    box(RW - 0.18, RH - 0.18, 0.02, RM, 0, 0, -(RD / 2 - 0.02))
    // Bandes lumineuses de part et d'autre de la façade
    const strips = [-1, 1].map((sd) => {
      const m = mat(new MeshBasicMaterial({ color: 0xffffff }))
      box(0.018, RH - 0.3, 0.018, m, sd * (RW / 2 - 0.045), 0, RD / 2 + 0.006)
      return m
    })

    const units: Unit[] = UNITS.map(([name, type], j) => {
      const g = new Group()
      g.position.y = RH / 2 - 0.3 - j * 0.385
      rack.add(g)
      const canvas = mkCanvas(840, 170)
      const u: Unit = { g, canvas, tex: canvasTexture(canvas, anisotropy), name, type, kick: -9 }
      box(UW, UH, UD, UM, 0, 0, 0, g)
      const face = new Mesh(geo(new PlaneGeometry(UW, UH)), mat(new MeshStandardMaterial({ map: u.tex, roughness: 0.6, metalness: 0.4 })))
      face.position.z = UD / 2 + 0.002
      g.add(face)
      for (const sd of [-1, 1]) box(0.035, 0.22, 0.06, materials.ALU, sd * (UW / 2 - 0.05), 0, UD / 2 + 0.03, g)
      if (j === 0) {
        for (let i = 0; i < 24; i++) ledAt(g, j, "port", i, (98 + (i % 12) * 44) / 500 - 0.84, (85 - (32 + Math.floor(i / 12) * 58)) / 500)
      } else {
        ledAt(g, j, "status", 0, 0.68, 0.09)
        for (let i = 0; i < 5; i++) ledAt(g, j, "act", i, 0.44 + i * 0.045, 0.09)
      }
      return u
    })

    // Logo sur la face arrière, entre les montants
    const brand = brandLogo(1.2, anisotropy)
    brand.mesh.rotation.y = Math.PI
    brand.mesh.position.set(0, RH / 2 - 0.55, -(RD / 2) + 0.009)
    rack.add(brand.mesh)

    rack.position.set(-1.2, 0, -0.4)
    rack.scale.setScalar(0.9)
    applyEnv(rack, env)

    // Clic : le serveur visé sort de la baie (un serveur au hasard si on vise le châssis)
    const gr = grab(rack, (hit: Object3D) => {
      let o: Object3D | null = hit
      let u: Unit | undefined
      while (o && !(u = units.find((x) => x.g === o))) o = o.parent
      ;(u ?? units[1 + Math.floor(Math.random() * 7)]).kick = s.clock
    })
    return {
      rack,
      units,
      leds,
      strips,
      gr,
      light: brand.light,
      drawText: (f: HomeFonts) => {
        units.forEach((u) => drawUnit(u, f.mono))
        brand.draw(f)
      },
      dispose() {
        rack.removeFromParent()
        geos.forEach((g) => g.dispose())
        mats.forEach((m) => m.dispose())
        units.forEach((u) => u.tex.dispose())
        brand.dispose()
      },
    }
  }, [materials, env, anisotropy, s])

  useEffect(() => {
    let alive = true
    sceneFontsReady(fonts).then(() => alive && dev.drawText(fonts))
    s.grabs.push(dev.gr)
    return () => {
      alive = false
      s.grabs.splice(s.grabs.indexOf(dev.gr), 1)
      dev.dispose()
    }
  }, [s, dev, fonts])

  // updaters[4] du prototype
  useFrame(() => {
    const parent = s.stations[STATION]
    if (parent && dev.rack.parent !== parent) parent.add(dev.rack)
    // Comme les updaters du prototype : rien à calculer quand la station n'est pas dessinée
    if (!parent?.visible) return
    const { clock } = s
    // Mouvement réduit : voyants figés sur l'état « déployé » (le prototype les laissait clignoter)
    const lc = s.reduce ? 30 : clock
    const tt = s.reduce ? CYCLE - 0.5 : (clock - s.startT[STATION]) % CYCLE
    // À l'arrivée, les serveurs s'enfichent un par un, de haut en bas
    const a = s.act[STATION]
    dev.light(a, clock, s.reduce)
    dev.units.forEach((u, j) => {
      const pull = Math.sin(Math.PI * Math.min(1, Math.max(0, (clock - u.kick) / 1.5)))
      u.g.position.z = (1 - ease(a * 1.9 - j * 0.09)) * 1.4 + pull * 0.75
    })
    dev.rack.rotation.set(dev.gr.rx * 0.4, 0.5 + dev.gr.ry, 0)
    dev.strips.forEach((m) => m.color.copy(s.cA))
    for (const l of dev.leds) {
      const c = l.m.color
      if (l.type === "status") {
        // Chaque serveur passe au vert à son tour : en attente, déploiement (orange clignotant), prêt
        const s0 = 0.6 + l.u * 1.2
        if (tt < s0) c.setHex(0x1a6b45)
        else if (tt < s0 + 1.2) c.setHex(Math.floor(lc * 6) % 2 ? 0xffb300 : 0x332400)
        else c.setHex(0x3dff9e)
      } else if (l.type === "act") {
        if (hash(l.u * 7 + l.i * 13 + Math.floor(lc * (5 + l.i))) > 0.45) c.copy(s.cA)
        else c.setHex(0x0a1f18)
      } else c.setHex(hash(l.i * 3.1 + Math.floor(lc * 9 + l.i)) > 0.5 ? (l.i % 5 ? 0x3dff9e : 0xffb300) : 0x0a1f18)
    }
  }, FRAME.objects)

  return null
}
