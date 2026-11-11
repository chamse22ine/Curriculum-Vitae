"use client"

import { useEffect, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import {
  BoxGeometry,
  CircleGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  SphereGeometry,
  type BufferGeometry,
  type Material,
  type Texture,
} from "three"
import type { HomeFonts } from "@/lib/home-fonts"
import { sceneFontsReady } from "./fonts"
import { canvasTexture, mkCanvas, rplane, slab } from "./geometry"
import { applyEnv, type Materials } from "./materials"
import { ease, rng, tx } from "./screens/shared"
import { FRAME, grab, useSceneState } from "./state"

/** Station IA */
const STATION = 3
/** Côté de la carte imprimée (unités de scène) */
const BS = 3.16

type Pt = readonly [number, number]
interface Path {
  pts: Pt[]
  /** Longueurs cumulées le long des quatre points */
  L: number[]
}

/**
 * Pistes de la carte : quatre côtés × onze pistes qui partent du processeur, s'écartent en biais
 * puis filent vers le bord (PATHS du prototype).
 */
function buildPaths(): Path[] {
  const paths: Path[] = []
  for (let s = 0; s < 4; s++)
    for (let j = 0; j < 11; j++) {
      const o = (j - 5) * 0.115
      const dj = Math.abs(j - 5)
      const a = 0.14 + (5 - dj) * 0.075
      const b = 0.06 + dj * 0.075
      const dir = j < 5 ? -1 : j > 5 ? 1 : 0
      const c = Math.cos((s * Math.PI) / 2)
      const sn = Math.sin((s * Math.PI) / 2)
      const raw: Pt[] = [[0.8, o], [0.8 + a, o], [0.8 + a + b, o + dir * b], [1.46, o + dir * b]]
      const pts = raw.map(([x, y]) => [x * c - y * sn, x * sn + y * c] as const)
      const L = [0]
      for (let k = 1; k < 4; k++) L.push(L[k - 1] + Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]))
      paths.push({ pts, L })
    }
  return paths
}

/** Carte (couleurs) et carte des lueurs (pistes seules, pour l'émissif) */
function drawBoard(paths: Path[]) {
  const map = mkCanvas(1024, 1024)
  const glow = mkCanvas(1024, 1024)
  const m = map.getContext("2d")!
  const gx = glow.getContext("2d")!
  const px = (v: number) => (v / BS + 0.5) * 1024
  const py = (v: number) => (0.5 - v / BS) * 1024
  m.fillStyle = "#0a1613"
  m.fillRect(0, 0, 1024, 1024)
  m.strokeStyle = "rgba(255,255,255,.035)"
  m.lineWidth = 1
  for (let i = 0; i < 1024; i += 32) {
    m.beginPath()
    m.moveTo(i, 0)
    m.lineTo(i, 1024)
    m.moveTo(0, i)
    m.lineTo(1024, i)
    m.stroke()
  }
  gx.fillStyle = "#000000"
  gx.fillRect(0, 0, 1024, 1024)
  paths.forEach((p, n) => {
    ;[m, gx].forEach((x, w) => {
      x.beginPath()
      p.pts.forEach((q, k) => (k ? x.lineTo(px(q[0]), py(q[1])) : x.moveTo(px(q[0]), py(q[1]))))
      x.lineJoin = "round"
      x.lineWidth = w ? 3 : 5
      x.strokeStyle = w ? (n % 3 ? "#d24dff" : "#ff2db0") : "#7d6238"
      if (w) {
        x.shadowColor = "#d24dff"
        x.shadowBlur = 12
      }
      x.stroke()
      const e = p.pts[3]
      x.beginPath()
      x.arc(px(e[0]), py(e[1]), w ? 5 : 8, 0, 7)
      x.fillStyle = w ? "#ffffff" : "#c9a45c"
      x.fill()
    })
  })
  m.fillStyle = "rgba(255,255,255,.5)"
  m.font = "500 20px ui-monospace,monospace"
  m.textAlign = "left"
  m.fillText("CHAMS-M1   REV 2.6", 44, 60)
  m.fillText("U1", px(-0.76), py(0.86))
  m.fillText("C12", px(1.18), py(1.08))
  m.fillText("L3", px(-1.06), py(-0.86))
  m.fillText("JTAG", 860, 984)
  return { map, glow }
}

/** Marquage gravé sur le capot (drawChipText du prototype) */
function drawLid(c: HTMLCanvasElement, f: HomeFonts) {
  const x = c.getContext("2d")!
  const r = rng(3)
  x.clearRect(0, 0, 512, 512)
  x.textBaseline = "alphabetic"
  tx(x, "Chams.", 256, 210, `800 66px ${f.display}`, "rgba(18,20,28,.8)", "center")
  tx(x, "NEURAL ENGINE", 256, 262, `500 27px ${f.mono}`, "rgba(18,20,28,.8)", "center")
  tx(x, "M1 · 2026 · LILLE FR", 256, 300, `400 18px ${f.mono}`, "rgba(18,20,28,.7)", "center")
  x.fillStyle = "rgba(18,20,28,.75)"
  for (let i = 0; i < 7; i++) for (let j = 0; j < 7; j++) if (r() > 0.45) x.fillRect(396 + i * 10, 380 + j * 10, 9, 9)
}

/**
 * Processeur sur sa carte (station IA) : des signaux lumineux courent le long des pistes.
 * Au clic, le capot se soulève et les pistes s'illuminent.
 */
export function Chip({
  materials,
  env,
  anisotropy,
  fonts,
}: Readonly<{ materials: Materials; env: Texture | null; anisotropy: number; fonts: HomeFonts }>) {
  const s = useSceneState()

  const dev = useMemo(() => {
    const geos: BufferGeometry[] = []
    const mats: Material[] = []
    const texs: Texture[] = []
    const geo = <T extends BufferGeometry>(g: T) => (geos.push(g), g)
    const mat = <T extends Material>(m: T) => (mats.push(m), m)
    const tex = <T extends Texture>(t: T) => (texs.push(t), t)
    const chip = new Group()
    chip.name = "chip"
    const lid = new Group()
    const at = (mesh: Mesh, x: number, y: number, z: number, par: Group = chip) => {
      mesh.position.set(x, y, z)
      par.add(mesh)
      return mesh
    }

    const paths = buildPaths()
    const { map, glow } = drawBoard(paths)
    const GOLD = mat(new MeshStandardMaterial({ color: 0xd9ad52, metalness: 1, roughness: 0.3 }))
    const board = mat(
      new MeshStandardMaterial({
        map: tex(canvasTexture(map, anisotropy)),
        emissiveMap: tex(canvasTexture(glow, anisotropy)),
        emissive: 0xffffff,
        emissiveIntensity: 0.6,
        roughness: 0.55,
        metalness: 0.25,
      }),
    )
    chip.add(new Mesh(geo(slab(3.2, 3.2, 0.06, 0.12)), mat(new MeshStandardMaterial({ color: 0x0a1613, roughness: 0.6, metalness: 0.2 }))))
    at(new Mesh(geo(rplane(BS, BS, 0.1)), board), 0, 0, 0.0435)
    at(new Mesh(geo(slab(1.6, 1.6, 0.05, 0.07, 0.008, 4)), mat(new MeshStandardMaterial({ color: 0x15161a, roughness: 0.7 }))), 0, 0, 0.0765)
    at(new Mesh(geo(rplane(1.44, 1.44, 0.04)), GOLD), 0, 0, 0.111)
    at(new Mesh(geo(slab(1.34, 1.34, 0.02, 0.04, 0.005, 4)), mat(new MeshStandardMaterial({ color: 0x12382b, roughness: 0.5, metalness: 0.2 }))), 0, 0, 0.127)
    chip.add(lid)
    at(new Mesh(geo(slab(1, 1, 0.06, 0.1, 0.015, 6)), mat(new MeshStandardMaterial({ color: 0xb4b7c0, metalness: 1, roughness: 0.5, envMapIntensity: 0.45 }))), 0, 0, 0.187, lid)
    const lidCan = mkCanvas(512, 512)
    const lidTex = tex(canvasTexture(lidCan, anisotropy))
    at(new Mesh(geo(new PlaneGeometry(0.9, 0.9)), mat(new MeshStandardMaterial({ map: lidTex, transparent: true, roughness: 0.5, metalness: 0.3 }))), 0, 0, 0.2335, lid)

    // Condensateurs, plots de fixation et selfs aux quatre coins
    const capG = geo(new CylinderGeometry(0.095, 0.095, 0.17, 24))
    const capTopG = geo(new CircleGeometry(0.07, 20))
    const indG = geo(new BoxGeometry(0.24, 0.24, 0.11))
    const padG = geo(new CircleGeometry(0.065, 20))
    const holeG = geo(new CircleGeometry(0.032, 16))
    for (const [qx, qy] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) {
      const cap = new Mesh(capG, materials.ALU)
      cap.rotation.x = Math.PI / 2
      at(cap, qx * 1.3, qy * 1.3, 0.1285)
      at(new Mesh(capTopG, materials.KEYM), qx * 1.3, qy * 1.3, 0.2145)
      at(new Mesh(indG, materials.DARKALU), qx * 1.0, qy * 1.0, 0.0985)
      at(new Mesh(padG, GOLD), qx * 1.49, qy * 1.49, 0.0445)
      at(new Mesh(holeG, materials.BLACK), qx * 1.49, qy * 1.49, 0.0455)
    }

    // Signaux : 34 points lumineux, certains sortent du processeur, d'autres y entrent
    const pg = geo(new SphereGeometry(0.022, 8, 6))
    const pm = mat(new MeshBasicMaterial({ color: 0xffd6ff }))
    const pulses = Array.from({ length: 34 }, (_, i) => {
      const d = new Mesh(pg, pm)
      chip.add(d)
      return { d, p: paths[(i * 7) % paths.length], sp: 0.25 + (i % 5) * 0.07, ph: i * 0.37, out: i % 3 !== 0 }
    })

    chip.position.set(-0.8, -0.9, 0.9)
    chip.scale.setScalar(0.7)
    applyEnv(chip, env)
    // Clic : seul l'instant compte (kick, posé par les interactions) ; pas de tour complet
    const gr = grab(chip, () => {})
    return {
      chip,
      lid,
      board,
      pulses,
      gr,
      drawText: (f: HomeFonts) => {
        drawLid(lidCan, f)
        lidTex.needsUpdate = true
      },
      dispose() {
        chip.removeFromParent()
        geos.forEach((g) => g.dispose())
        mats.forEach((m) => m.dispose())
        texs.forEach((t) => t.dispose())
      },
    }
  }, [materials, env, anisotropy])

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

  // updaters[3] du prototype
  useFrame(() => {
    const parent = s.stations[STATION]
    if (parent && dev.chip.parent !== parent) parent.add(dev.chip)
    // Comme les updaters du prototype : rien à calculer quand la station n'est pas dessinée
    if (!parent?.visible) return
    const { time, clock, reduce } = s
    // À l'arrivée, la carte tourne en place, le capot descend et les pistes s'allument
    const a = s.act[STATION]
    const q = 1 - ease(a * 1.25)
    const on = 1 - q
    const bump = Math.sin(Math.PI * Math.min(1, Math.max(0, (clock - dev.gr.kick) / 1.3)))
    dev.chip.rotation.x = -0.95 + dev.gr.rx
    dev.chip.rotation.z = 0.25 + (reduce ? 0 : Math.sin(time * 0.35) * 0.1) + q * 1.2 + dev.gr.ry
    dev.lid.position.z = (q + bump * 0.5) * 1.4
    dev.board.emissiveIntensity = on * (0.6 + (reduce ? 0 : 0.3 * Math.sin(time * 2.2))) + bump * 0.7
    for (const u of dev.pulses) {
      let f = (time * u.sp + u.ph) % 1
      if (!u.out) f = 1 - f
      const { pts, L } = u.p
      const l = f * L[3]
      let k = 1
      while (k < 3 && l > L[k]) k++
      const g = (l - L[k - 1]) / (L[k] - L[k - 1])
      u.d.position.set(pts[k - 1][0] + (pts[k][0] - pts[k - 1][0]) * g, pts[k - 1][1] + (pts[k][1] - pts[k - 1][1]) * g, 0.06)
      u.d.visible = on > 0.6
    }
  }, FRAME.objects)

  return null
}
