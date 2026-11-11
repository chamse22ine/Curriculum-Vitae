"use client"

import { Component, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Color, HemisphereLight, MathUtils } from "three"
import { PALETTES } from "@/content/sections"
import type { Lang } from "@/content/types"
import { activeIndex, MOBILE_MAX, type ScrollProgress } from "@/hooks/use-scroll-progress"
import { homeFonts } from "@/lib/home-fonts"
import { useLanguage } from "@/lib/language-context"
import { Background, createBackgroundUniforms, type BackgroundUniforms } from "./Background"
import { CameraRig } from "./CameraRig"
import { Dust } from "./Dust"
import { Effects } from "./Effects"
import { buildStudioEnvironment } from "./environment"
import { sceneFontsReady } from "./fonts"
import { Interactions, STAGE_ID } from "./Interactions"
import { LaptopRigs } from "./Laptop"
import { createMaterials } from "./materials"
import { Chip } from "./Chip"
import { Monitor } from "./Monitor"
import { Rack } from "./Rack"
import { BigPhone } from "./Phone"
import { paintScreens } from "./screens"
import type { ScreenEnv } from "./screens/types"
import { Stations } from "./Stations"
import {
  createSceneState,
  damp,
  FRAME,
  HALF_FOV_TAN,
  RATE,
  SceneStateContext,
  SIDES,
  useSceneState,
} from "./state"

/*
 * Fidélité des couleurs avec le prototype (three r128, sans outputEncoding) :
 * - `legacy` : ColorManagement désactivé, les couleurs hex sont utilisées brutes comme en r128 ;
 * - `linear` : sortie linéaire, sans conversion sRGB (r128 : LinearEncoding par défaut) ;
 * - `flat` : pas de tone mapping (R3F met ACES par défaut, r128 n'en avait pas).
 * Les lumières sont ajustées dans CameraRig.tsx (r187 n'a plus l'éclairage « legacy »).
 */

interface SceneProps {
  progress: () => ScrollProgress
  onReady: () => void
}

/**
 * Pilote : premier calcul de chaque image (progression, palette lissée, côté, souris, fond),
 * lu ensuite par la caméra et les stations. Reprise du début de frame() dans le prototype.
 */
function Driver({ progress, uniforms }: Readonly<{ progress: () => ScrollProgress; uniforms: BackgroundUniforms }>) {
  const s = useSceneState()
  const pals = useMemo(() => PALETTES.map((p) => p.map((h) => new Color(h))), [])
  const tmp = useMemo(() => new Color(), [])
  const last = useMemo(() => ({ cur: -1 }), [])

  // Parallaxe à la souris (pas au doigt)
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (e.pointerType && e.pointerType !== "mouse") return
      s.mx = e.clientX / window.innerWidth - 0.5
      s.my = e.clientY / window.innerHeight - 0.5
    }
    window.addEventListener("pointermove", onMove, { passive: true })
    return () => window.removeEventListener("pointermove", onMove)
  }, [s])

  useFrame((st, delta) => {
    const { width: w, height: h } = st.size
    s.clock = st.clock.elapsedTime
    s.time = s.reduce ? 4 : s.clock
    s.dt = Math.min(delta, 0.1)
    s.wide = w > MOBILE_MAX
    s.halfW = HALF_FOV_TAN * 8 * (w / h)

    const p = progress()
    s.k = p.k
    s.t = p.t
    s.F = p.k + p.t
    s.cur = activeIndex(p)
    // onActive() du prototype : chaque station repart de zéro quand elle devient active
    if (s.cur !== last.cur) {
      s.startT[s.cur] = s.clock
      last.cur = s.cur
    }

    const { k, t } = s
    const e = s.reduce ? 1 : damp(RATE.palette, s.dt)
    ;[s.cA, s.cB, s.cC].forEach((c, j) => c.lerp(tmp.copy(pals[k][j]).lerp(pals[k + 1][j], t), e))
    s.side += (MathUtils.lerp(SIDES[k], SIDES[k + 1], t) - s.side) * (s.reduce ? 1 : damp(RATE.side, s.dt))
    const em = damp(RATE.mouse, s.dt)
    s.smx += (s.mx - s.smx) * em
    s.smy += (s.my - s.smy) * em

    const u = uniforms
    u.uTime.value = s.time
    u.uAspect.value = w / h
    u.cA.value.copy(s.cA)
    u.cB.value.copy(s.cB)
    u.cC.value.copy(s.cC)
    u.uSide.value = s.wide ? s.side : 0
    u.uMob.value = s.wide ? 0 : 1
    u.uA.value = k
    u.uB.value = k + 1
    u.uMix.value = t
  }, FRAME.driver)

  return null
}

/**
 * Objets des stations, avec leurs reflets (environnement PMREM, sans HDR externe) et le dessin
 * de leurs écrans.
 */
function Objects({ lang }: Readonly<{ lang: Lang }>) {
  const s = useSceneState()
  const gl = useThree((st) => st.gl)
  const scene = useThree((st) => st.scene)
  const anisotropy = gl.capabilities.getMaxAnisotropy()
  const env = useMemo(() => {
    try {
      return buildStudioEnvironment(gl)
    } catch {
      return null
    }
  }, [gl])
  const materials = useMemo(() => createMaterials(), [])

  useEffect(() => {
    // Sans environnement : métal atténué et lumière hémisphérique, comme le prototype
    if (env) return () => env.dispose()
    materials.dullMetals()
    const hemi = new HemisphereLight(0xffffff, 0x333344, 0.9 * Math.PI)
    scene.add(hemi)
    return () => {
      scene.remove(hemi)
      hemi.dispose()
    }
  }, [env, materials, scene])
  useEffect(() => () => materials.dispose(), [materials])

  // Écrans : dessinés une fois les polices chargées, une image sur deux
  const screenEnv = useRef<ScreenEnv>({ lang, palettes: PALETTES, fonts: homeFonts })
  useEffect(() => {
    screenEnv.current.lang = lang
  }, [lang])
  const paint = useRef({ ready: false, tick: 0 })
  useEffect(() => {
    let alive = true
    sceneFontsReady(homeFonts).then(() => {
      if (alive) paint.current.ready = true
    })
    return () => {
      alive = false
    }
  }, [])
  useFrame(() => {
    if (!paint.current.ready) return
    paintScreens(
      s.screens,
      paint.current.tick++,
      (st) => !!s.stations[st]?.visible,
      (st) => (s.reduce ? 30 : s.clock - s.startT[st]),
      screenEnv.current,
    )
  }, FRAME.screens)

  return (
    <>
      <LaptopRigs materials={materials} env={env} anisotropy={anisotropy} fonts={homeFonts} />
      <BigPhone materials={materials} env={env} anisotropy={anisotropy} fonts={homeFonts} />
      <Monitor materials={materials} env={env} anisotropy={anisotropy} fonts={homeFonts} />
      <Chip materials={materials} env={env} anisotropy={anisotropy} fonts={homeFonts} />
      <Rack materials={materials} env={env} anisotropy={anisotropy} fonts={homeFonts} />
      <Interactions />
    </>
  )
}

function World({ progress, lang }: Readonly<{ progress: () => ScrollProgress; lang: Lang }>) {
  const reduce = useMemo(() => matchMedia("(prefers-reduced-motion: reduce)").matches, [])
  const state = useMemo(() => createSceneState(reduce), [reduce])
  const uniforms = useMemo(() => createBackgroundUniforms(PALETTES[0]), [])
  return (
    <SceneStateContext.Provider value={state}>
      <Driver progress={progress} uniforms={uniforms} />
      <Background uniforms={uniforms} />
      <CameraRig uniforms={uniforms} />
      <Stations />
      <Objects lang={lang} />
      <Dust />
      <Effects />
    </SceneStateContext.Provider>
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

/** Densité de pixels plafonnée : 1,75 sur ordinateur, 1,5 sur mobile (resize() du prototype) */
const pixelRatio = () => Math.min(window.devicePixelRatio || 1, window.innerWidth > MOBILE_MAX ? 1.75 : 1.5)

function usePixelRatio() {
  const [dpr, setDpr] = useState(pixelRatio)
  useEffect(() => {
    const onResize = () => setDpr(pixelRatio())
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [])
  return dpr
}

export default function Scene({ progress, onReady }: Readonly<SceneProps>) {
  const { language } = useLanguage()
  const dpr = usePixelRatio()
  // Composant chargé uniquement côté client (ssr: false) : le test peut se faire au rendu
  const webgl = useMemo(hasWebGL, [])
  if (!webgl) return null
  return (
    <>
      {/* Mobile : zone transparente au-dessus de la scène, pour saisir les objets au doigt */}
      <div id={STAGE_ID} className="home-stage" aria-hidden="true" />
      <div className="home-field" aria-hidden="true">
        <SceneBoundary>
          <Canvas
            legacy
            linear
            flat
            dpr={dpr}
            gl={{ antialias: true, alpha: false }}
            camera={{ fov: 45, near: 0.3, far: 120, position: [0, 0, 0] }}
            onCreated={({ gl }) => {
              gl.domElement.setAttribute("aria-hidden", "true")
              onReady()
            }}
          >
            <World progress={progress} lang={language} />
          </Canvas>
        </SceneBoundary>
      </div>
    </>
  )
}
