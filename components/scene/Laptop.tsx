"use client"

import { useEffect, useMemo, type RefObject } from "react"
import {
  BoxGeometry,
  CircleGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  type BufferGeometry,
  type Material,
  type Texture,
} from "three"
import type { HomeFonts } from "@/lib/home-fonts"
import { sceneFontsReady } from "./fonts"
import { mkCanvas, plainTexture, rplane, slab, srgbTexture } from "./geometry"
import { glass, type Materials } from "./materials"

/** Largeur et profondeur de la base (unités de scène) */
const W = 3.2
const D = 2.2
const HALF_PI = Math.PI / 2

type KeyDef = string | readonly [string, number]

/** Clavier AZERTY : une touche = un mesh. [libellé, largeur en unités de touche] */
const ROWS: readonly (readonly KeyDef[])[] = [
  ["esc", "F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "F10", "F11", "F12", ["del", 1.5]],
  ["²", "&", "é", '"', "'", "(", "-", "è", "_", "ç", "à", ")", "=", ["back", 1.5]],
  [["tab", 1.5], "A", "Z", "E", "R", "T", "Y", "U", "I", "O", "P", "^", "$", ["enter", 1]],
  [["caps", 1.75], "Q", "S", "D", "F", "G", "H", "J", "K", "L", "M", "ù", "*", ["", 0.75]],
  [["shift", 1.25], "<", "W", "X", "C", "V", "B", "N", ",", ";", ":", "!", ["shift", 2.25]],
  ["ctrl", "fn", "super", "alt", ["", 5.5], "alt gr", "ctrl", "←", "↑↓", "→"],
]

function buildLaptop(mats: Materials, screen: Texture, anisotropy: number) {
  const geometries: BufferGeometry[] = []
  const materials: Material[] = []
  const textures: Texture[] = []
  const geo = <T extends BufferGeometry>(g: T) => (geometries.push(g), g)
  const mat = <T extends Material>(m: T) => (materials.push(m), m)
  const tex = <T extends Texture>(t: T) => (textures.push(t), t)

  const laptop = new Group()
  laptop.position.y = -1
  const add = (parent: Group, m: Mesh, x: number, y: number, z: number) => {
    m.position.set(x, y, z)
    parent.add(m)
    return m
  }
  /** Pièce posée à plat sur la base */
  const flat = (g: BufferGeometry, m: Material, x: number, y: number, z: number) => {
    const mesh = new Mesh(g, m)
    mesh.rotation.x = -HALF_PI
    return add(laptop, mesh, x, y, z)
  }

  const base = new Mesh(geo(slab(W, D, 0.1, 0.14)), mats.ALU)
  base.rotation.x = -HALF_PI
  laptop.add(base)

  // Clavier : cuvette, une touche par mesh, légendes rétroéclairées
  const Y0 = 0.062
  flat(geo(rplane(2.96, 1.18, 0.04)), mats.BLACK, 0, Y0 + 0.0006, -0.41)
  const U = 0.2
  const keys: [string, number, number, number][] = []
  const kgeo = new Map<string, BufferGeometry>()
  let zr = -0.97
  ROWS.forEach((row, r) => {
    const dep = r ? U : 0.12
    let xk = -1.45
    row.forEach((k) => {
      const lab = typeof k === "string" ? k : k[0]
      const w = (typeof k === "string" ? 1 : k[1]) * U
      const id = `${w.toFixed(3)}|${dep}`
      if (!kgeo.has(id)) kgeo.set(id, geo(slab(w - 0.02, dep - 0.02, 0.008, 0.018, 0.004, 3)))
      flat(kgeo.get(id)!, mats.KEYM, xk + w / 2, Y0 + 0.009, zr + dep / 2)
      keys.push([lab, (xk + w / 2 + 1.45) * 500, (zr + dep / 2 + 0.97) * 500, r])
      xk += w
    })
    zr += dep
  })
  const legc = mkCanvas(1450, 560)
  const legt = tex(srgbTexture(legc, anisotropy))
  flat(geo(new PlaneGeometry(2.9, 1.12)), mat(new MeshBasicMaterial({ map: legt, transparent: true, depthWrite: false })), 0, Y0 + 0.0178, -0.41)

  // Pavé tactile, grille de haut-parleur, charnière, ports, voyant
  flat(geo(rplane(1.32, 0.68, 0.06)), mats.BLACK, 0, Y0 + 0.0004, 0.61)
  flat(geo(rplane(1.3, 0.66, 0.055)), mats.PADM, 0, Y0 + 0.0009, 0.61)
  const spk = mkCanvas(1040, 16)
  {
    const x = spk.getContext("2d")!
    x.fillStyle = "rgba(0,0,0,.8)"
    for (let i = 0; i < 130; i++)
      for (let j = 0; j < 2; j++) {
        x.beginPath()
        x.arc(4 + i * 8, 4 + j * 8, 2.2, 0, 7)
        x.fill()
      }
  }
  flat(geo(new PlaneGeometry(2.6, 0.04)), mat(new MeshBasicMaterial({ map: tex(plainTexture(spk)), transparent: true })), 0, Y0 + 0.0006, -1.035)

  const hinge = new Mesh(geo(new CylinderGeometry(0.04, 0.04, W * 0.84, 24)), mats.DARKALU)
  hinge.rotation.z = HALF_PI
  add(laptop, hinge, 0, 0.072, -D / 2 - 0.004)
  const portGeo = geo(new BoxGeometry(0.006, 0.03, 0.11))
  for (const [sx, z] of [[-1, -0.62], [-1, -0.42], [1, -0.62]]) add(laptop, new Mesh(portGeo, mats.BLACK), sx * 1.6105, 0, z)
  const jack = new Mesh(geo(new CylinderGeometry(0.016, 0.016, 0.006, 16)), mats.BLACK)
  jack.rotation.z = HALF_PI
  add(laptop, jack, 1.6105, 0, -0.4)
  add(laptop, new Mesh(geo(new BoxGeometry(0.44, 0.012, 0.006)), mats.BLACK), 0, 0.04, D / 2 + 0.0105)
  add(laptop, new Mesh(geo(new BoxGeometry(0.05, 0.008, 0.004)), mat(new MeshBasicMaterial({ color: 0xffffff }))), 1.25, 0, D / 2 + 0.0125)

  // Écran : coque, bordure, webcam, dalle, logo au dos
  const lid = new Group()
  lid.position.set(0, 0.083, -D / 2)
  laptop.add(lid)
  const shell = new Mesh(geo(slab(W, D, 0.05, 0.14)), mats.ALU)
  shell.rotation.x = -HALF_PI
  add(lid, shell, 0, 0.04, D / 2)
  const bez = new Mesh(geo(rplane(W - 0.03, D - 0.03, 0.13)), mats.BLACK)
  bez.rotation.x = HALF_PI
  add(lid, bez, 0, 0.0015, D / 2)
  const webcam = new Mesh(geo(new CircleGeometry(0.013, 20)), mat(new MeshStandardMaterial({ color: 0x10204a, roughness: 0.1, metalness: 0.3 })))
  webcam.rotation.x = HALF_PI
  add(lid, webcam, 0, 0.0008, D - 0.055)
  const camLed = new Mesh(geo(new CircleGeometry(0.004, 10)), mat(new MeshBasicMaterial({ color: 0x3dff9e })))
  camLed.rotation.x = HALF_PI
  add(lid, camLed, 0.035, 0.0008, D - 0.055)
  const lscr = new Mesh(geo(rplane(W - 0.2, D - 0.26, 0.03)), mat(glass(screen)))
  lscr.rotation.x = HALF_PI
  add(lid, lscr, 0, 0, D / 2 + 0.03)
  const gcan = mkCanvas(520, 144)
  const gt = tex(srgbTexture(gcan, anisotropy))
  const logo = new Mesh(geo(new PlaneGeometry(1.3, 0.36)), mat(new MeshStandardMaterial({ map: gt, transparent: true, metalness: 0.9, roughness: 0.2 })))
  logo.rotation.x = -HALF_PI
  add(lid, logo, 0, 0.0785, D / 2)

  // Ombre portée douce sous la base
  const scan = mkCanvas(256, 256)
  {
    const x = scan.getContext("2d")!
    const g = x.createRadialGradient(128, 128, 10, 128, 128, 128)
    g.addColorStop(0, "rgba(3,2,14,.75)")
    g.addColorStop(0.6, "rgba(3,2,14,.3)")
    g.addColorStop(1, "rgba(3,2,14,0)")
    x.fillStyle = g
    x.fillRect(0, 0, 256, 256)
  }
  const shadow = new Mesh(geo(new PlaneGeometry(6.2, 4.6)), mat(new MeshBasicMaterial({ map: tex(plainTexture(scan)), transparent: true, depthWrite: false })))
  shadow.rotation.x = -HALF_PI
  add(laptop, shadow, 0, -0.12, 0)

  /** Légendes du clavier et logo « Chams. » : à redessiner une fois les polices chargées */
  const drawText = (f: HomeFonts) => {
    const x = legc.getContext("2d")!
    x.clearRect(0, 0, 1450, 560)
    x.textAlign = "center"
    x.textBaseline = "middle"
    x.fillStyle = "rgba(255,255,255,.92)"
    for (const k of keys) {
      x.font = `500 ${k[0].length > 1 ? (k[3] ? 17 : 14) : 30}px ${f.sans}`
      x.fillText(k[0], k[1], k[2] + 1)
    }
    legt.needsUpdate = true

    const y = gcan.getContext("2d")!
    y.clearRect(0, 0, 520, 144)
    y.font = `800 84px ${f.display}`
    y.textBaseline = "middle"
    y.textAlign = "center"
    const w = y.measureText("Chams.").width
    const w2 = y.measureText(".").width
    y.fillStyle = "#ffffff"
    y.fillText("Chams", 260 - w2 / 2, 76)
    y.fillStyle = "#ff3d81"
    y.fillText(".", 260 + w / 2 - w2 / 2, 76)
    gt.needsUpdate = true
  }

  const dispose = () => {
    geometries.forEach((g) => g.dispose())
    materials.forEach((m) => m.dispose())
    textures.forEach((t) => t.dispose())
  }

  return { group: laptop, lid, drawText, dispose }
}

export function Laptop({
  materials,
  screen,
  anisotropy,
  fonts,
  lidRef,
}: Readonly<{ materials: Materials; screen: Texture; anisotropy: number; fonts: HomeFonts; lidRef: RefObject<Group | null> }>) {
  const laptop = useMemo(() => buildLaptop(materials, screen, anisotropy), [materials, screen, anisotropy])

  useEffect(() => {
    lidRef.current = laptop.lid
    let alive = true
    sceneFontsReady(fonts).then(() => alive && laptop.drawText(fonts))
    return () => {
      alive = false
      lidRef.current = null
      laptop.dispose()
    }
  }, [laptop, fonts, lidRef])

  return <primitive object={laptop.group} />
}
