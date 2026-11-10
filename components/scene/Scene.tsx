"use client"

import { Component, useEffect, useMemo, useRef, type ReactNode } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Color, HemisphereLight, MathUtils, type Group, type Mesh, type MeshStandardMaterial } from "three"
import { PALETTES, SECTIONS } from "@/content/sections"
import { activeIndex, MOBILE_MAX, type ScrollProgress } from "@/hooks/use-scroll-progress"
import type { Lang } from "@/content/types"
import { useLanguage } from "@/lib/language-context"
import { homeFonts } from "@/lib/home-fonts"
import { Background, createBackgroundUniforms } from "./Background"
import { buildStudioEnvironment } from "./environment"
import { Laptop } from "./Laptop"
import { createMaterials } from "./materials"
import { Phone } from "./Phone"
import { sceneFontsReady } from "./fonts"
import { createPainter, createScreens } from "./screens"
import { LAPTOP_APPS } from "./screens/laptop"
import { PHONE_APPS } from "./screens/phone"
import type { ScreenEnv } from "./screens/types"

/*
 * Fidélité des couleurs avec le prototype (three r128) :
 * - `legacy` : ColorManagement désactivé, les couleurs hex sont utilisées brutes comme en r128 ;
 * - `flat` : pas de tone mapping (R3F met ACES par défaut, r128 n'en avait pas) ;
 * - sortie sRGB (défaut R3F) + textures d'écran en SRGBColorSpace = outputEncoding / sRGBEncoding ;
 * - lumières × π : r128 utilisait les lumières « legacy » qui multipliaient l'éclairement par π.
 */
const LEGACY_LIGHT = Math.PI

const SIDES = SECTIONS.map((s) => s.side)
const HALF_FOV_TAN = Math.tan(MathUtils.degToRad(22.5))

interface SceneProps {
  progress: () => ScrollProgress
  onReady: () => void
}

function World({ progress, lang }: Readonly<{ progress: () => ScrollProgress; lang: Lang }>) {
  const gl = useThree((s) => s.gl)
  const scene = useThree((s) => s.scene)
  const reduce = useMemo(() => matchMedia("(prefers-reduced-motion: reduce)").matches, [])

  // Créés ici, après la configuration du Canvas (legacy actif) : les couleurs restent brutes
  const materials = useMemo(() => createMaterials(), [])
  const uniforms = useMemo(() => createBackgroundUniforms(PALETTES[0]), [])
  const pals = useMemo(() => PALETTES.map((p) => p.map((h) => new Color(h))), [])
  const screens = useMemo(() => createScreens(gl.capabilities.getMaxAnisotropy()), [gl])
  const anisotropy = gl.capabilities.getMaxAnisotropy()

  useEffect(() => () => materials.dispose(), [materials])
  useEffect(() => () => screens.dispose(), [screens])

  // Écrans : un état commun (app courante + fondu), redessinés une image sur deux,
  // et seulement une fois les polices chargées
  const painter = useMemo(() => createPainter(LAPTOP_APPS.length, reduce), [reduce])
  const env = useRef<ScreenEnv>({ lang, palettes: PALETTES, fonts: homeFonts })
  useEffect(() => {
    env.current.lang = lang
  }, [lang])
  const fontsReady = useRef(false)
  const tick = useRef(0)
  useEffect(() => {
    let alive = true
    sceneFontsReady(homeFonts).then(() => {
      if (alive) fontsReady.current = true
    })
    return () => {
      alive = false
    }
  }, [])

  // Reflets : studio PMREM, ou à défaut métal atténué + lumière hémisphérique (comme le prototype).
  // La carte est posée sur chaque matériau (et non via scene.environment) : depuis r163, three ignore
  // material.envMapIntensity pour scene.environment, alors que le prototype règle ce reflet matériau
  // par matériau (0,06 sur les écrans, 0,15 sur le noir, 0,5 sur les touches).
  useEffect(() => {
    try {
      const env = buildStudioEnvironment(gl)
      const touched: MeshStandardMaterial[] = []
      scene.traverse((o) => {
        const m = (o as Mesh).material
        if (m && (m as MeshStandardMaterial).isMeshStandardMaterial && !touched.includes(m as MeshStandardMaterial)) {
          const sm = m as MeshStandardMaterial
          sm.envMap = env
          sm.needsUpdate = true
          touched.push(sm)
        }
      })
      return () => {
        touched.forEach((m) => {
          m.envMap = null
          m.needsUpdate = true
        })
        env.dispose()
      }
    } catch {
      materials.ALU.metalness = 0.3
      materials.TITAN.metalness = 0.3
      const hemi = new HemisphereLight(0xffffff, 0x333344, 0.9 * LEGACY_LIGHT)
      scene.add(hemi)
      return () => {
        scene.remove(hemi)
        hemi.dispose()
      }
    }
  }, [gl, scene, materials])

  const rig = useRef<Group>(null)
  const lid = useRef<Group>(null)
  const phone = useRef<Group>(null)
  const motion = useRef({ side: 1, open: 0, mx: 0, my: 0 })
  const tmp = useMemo(() => new Color(), [])

  // Parallaxe à la souris (pas au doigt)
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (e.pointerType && e.pointerType !== "mouse") return
      motion.current.mx = e.clientX / window.innerWidth - 0.5
      motion.current.my = e.clientY / window.innerHeight - 0.5
    }
    window.addEventListener("pointermove", onMove, { passive: true })
    return () => window.removeEventListener("pointermove", onMove)
  }, [])

  // Boucle d'animation : reprise de frame() dans design/prototype-chams.html
  useFrame((state) => {
    const m = motion.current
    const r = rig.current
    const p = phone.current
    if (!r || !p) return
    const clock = state.clock.elapsedTime
    const time = reduce ? 4 : clock
    const { k, t } = progress()
    const e = reduce ? 1 : 0.07
    const { width: w, height: h } = state.size

    uniforms.uTime.value = time
    uniforms.uAspect.value = w / h
    const cols = [uniforms.cA.value, uniforms.cB.value, uniforms.cC.value]
    cols.forEach((c, j) => c.lerp(tmp.copy(pals[k][j]).lerp(pals[k + 1][j], t), e))
    m.side += (MathUtils.lerp(SIDES[k], SIDES[k + 1], t) - m.side) * e

    const wide = w > MOBILE_MAX
    const halfW = HALF_FOV_TAN * 8 * (w / h)
    let sx: number
    let sc: number
    if (wide) {
      sx = m.side
      sc = Math.min(1.22, 0.3 + halfW * 0.155)
      r.position.set(m.side * halfW * 0.4, reduce ? 0 : Math.sin(time * 0.8) * 0.05, 0)
      uniforms.uSide.value = m.side
    } else {
      sx = 1
      sc = Math.min(0.74, halfW * 0.44)
      r.position.set((-0.2 * sc) / 0.72, 1.84 - 190 / h + (reduce ? 0 : Math.sin(time * 0.8) * 0.03), 0)
      uniforms.uSide.value = 0
    }
    r.scale.setScalar(sc)
    r.rotation.y += ((wide ? -m.side * 0.42 + m.mx * 0.35 : reduce ? 0 : Math.sin(time * 0.45) * 0.2) - r.rotation.y) * 0.06
    r.rotation.x += (0.24 + m.my * 0.2 - r.rotation.x) * 0.06

    m.open += ((clock > 0.7 ? 1.87 : 0) - m.open) * (reduce ? 1 : 0.045)
    if (lid.current) lid.current.rotation.x = -m.open

    p.position.set(sx * 1.8, 0.1 + (reduce ? 0 : Math.sin(time * 1.1) * 0.06), 0.75)
    p.rotation.set(-0.06, -sx * 0.32, reduce ? 0 : Math.sin(time * 0.7) * 0.03)

    painter.setActive(activeIndex({ k, t }), clock)
    if (fontsReady.current && (tick.current++ & 1) === 0) {
      painter.paint(screens.laptop, LAPTOP_APPS, clock, env.current)
      painter.paint(screens.phone, PHONE_APPS, clock, env.current)
    }
  })

  return (
    <>
      <Background uniforms={uniforms} />
      <ambientLight args={[0xffffff, 0.3 * LEGACY_LIGHT]} />
      <directionalLight args={[0xffffff, 0.7 * LEGACY_LIGHT]} position={[-3, 6, 5]} />
      <group ref={rig}>
        <Laptop materials={materials} screen={screens.laptop.texture} anisotropy={anisotropy} fonts={homeFonts} lidRef={lid} />
        <Phone ref={phone} materials={materials} screen={screens.phone.texture} />
      </group>
    </>
  )
}

/** Si WebGL est indisponible ou plante, on n'affiche rien : le fond CSS de repli reste en place */
class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

/** WebGL disponible ? Testé avant de monter le Canvas, pour ne pas provoquer d'erreur en console */
function hasWebGL() {
  try {
    const c = document.createElement("canvas")
    return !!(c.getContext("webgl2") || c.getContext("webgl"))
  } catch {
    return false
  }
}

export default function Scene({ progress, onReady }: Readonly<SceneProps>) {
  const { language } = useLanguage()
  // Composant chargé uniquement côté client (ssr: false) : le test peut se faire au rendu
  const webgl = useMemo(hasWebGL, [])
  if (!webgl) return null
  return (
    <div className="home-field" aria-hidden="true">
      <SceneBoundary>
        <Canvas
          legacy
          flat
          dpr={[1, 1.75]}
          gl={{ antialias: true, alpha: false }}
          camera={{ fov: 45, near: 0.1, far: 50, position: [0, 0, 8] }}
          onCreated={({ gl }) => {
            gl.domElement.setAttribute("aria-hidden", "true")
            onReady()
          }}
        >
          <World progress={progress} lang={language} />
        </Canvas>
      </SceneBoundary>
    </div>
  )
}
