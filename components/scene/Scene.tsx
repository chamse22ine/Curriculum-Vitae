"use client"

import { Component, useEffect, useMemo, useRef, type ReactNode } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Color, HemisphereLight, MathUtils, type Group } from "three"
import { PALETTES, SECTIONS } from "@/content/sections"
import type { ScrollProgress } from "@/hooks/use-scroll-progress"
import { MOBILE_MAX } from "@/hooks/use-scroll-progress"
import { homeFonts } from "@/lib/home-fonts"
import { Background, createBackgroundUniforms } from "./Background"
import { buildStudioEnvironment } from "./environment"
import { Laptop } from "./Laptop"
import { createMaterials } from "./materials"
import { Phone } from "./Phone"
import { createScreens } from "./screens"

/*
 * Fidélité des couleurs avec le prototype (three r128) :
 * - `legacy` : ColorManagement désactivé, les couleurs hex sont utilisées brutes comme en r128 ;
 * - `flat` : pas de tone mapping (R3F met ACES par défaut, r128 n'en avait pas) ;
 * - sortie sRGB (défaut R3F) + textures d'écran en SRGBColorSpace = outputEncoding / sRGBEncoding ;
 * - lumières × π : r128 utilisait les lumières « legacy » qui multipliaient l'éclairement par π.
 */
const LEGACY_LIGHT = Math.PI
/**
 * Le PMREM de r187 ne répartit pas l'énergie comme celui de r128 : à environnement identique,
 * l'aluminium sortait ~15 % plus sombre. 1,4 a été étalonné par capture contre le prototype
 * (luminosité moyenne de la base du portable : 86/91/124 dans le prototype, 83/93/122 ici).
 */
const ENV_INTENSITY = 1.4

const SIDES = SECTIONS.map((s) => s.side)
const HALF_FOV_TAN = Math.tan(MathUtils.degToRad(22.5))

interface SceneProps {
  progress: () => ScrollProgress
  onReady: () => void
}

function World({ progress }: Readonly<{ progress: () => ScrollProgress }>) {
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

  // Reflets : studio PMREM, ou à défaut métal atténué + lumière hémisphérique (comme le prototype)
  useEffect(() => {
    try {
      const env = buildStudioEnvironment(gl)
      scene.environment = env
      scene.environmentIntensity = ENV_INTENSITY
      return () => {
        scene.environment = null
        scene.environmentIntensity = 1
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

export default function Scene({ progress, onReady }: Readonly<SceneProps>) {
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
          <World progress={progress} />
        </Canvas>
      </SceneBoundary>
    </div>
  )
}
