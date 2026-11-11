"use client"

import { useEffect, useMemo, useRef } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { AmbientLight, DirectionalLight, MathUtils, PointLight, Vector3 } from "three"
import type { BackgroundUniforms } from "./Background"
import { damp, DTH, FRAME, RATE, RI, RO, useSceneState, YS } from "./state"

/*
 * Lumières du prototype (r128, éclairage « legacy »). three r187 n'a plus que l'éclairage physique :
 * - ambiante et directionnelle : × π pour retrouver le même éclairement ;
 * - ponctuelles : l'atténuation a changé de formule. r128 : (1 − d / 18) ; r187 avec decay 0 :
 *   (1 − (d / 18)⁴)². Le coefficient POINT_FIT les égale à la distance caméra → stations (≈ 8),
 *   rendu vérifié par captures comparées au prototype.
 */
const LEGACY = Math.PI
const POINT_FIT = (1 - 8 / 18) / Math.pow(1 - Math.pow(8 / 18, 4), 2)

/**
 * Voyage de caméra (frame() du prototype) : elle tourne d'une station à la suivante,
 * recule vers le centre et monte un peu à mi-parcours, avec un léger roulis.
 * Les lumières sont accrochées à la caméra, comme dans le prototype.
 */
export function CameraRig({ uniforms }: Readonly<{ uniforms: BackgroundUniforms }>) {
  const s = useSceneState()
  const camera = useThree((st) => st.camera)
  const scene = useThree((st) => st.scene)
  const first = useRef(true)
  const v = useMemo(() => ({ camP: new Vector3(), camT: new Vector3(), vP: new Vector3(), vT: new Vector3() }), [])

  const lights = useMemo(() => {
    const ambient = new AmbientLight(0xffffff, 0.42 * LEGACY)
    const sun = new DirectionalLight(0xffffff, 0.85 * LEGACY)
    sun.position.set(-3, 5, 2)
    sun.target.position.set(0, 0, -8)
    const pl1 = new PointLight(0xffffff, 1.3 * LEGACY * POINT_FIT, 18, 0)
    const pl2 = new PointLight(0xffffff, 1.1 * LEGACY * POINT_FIT, 18, 0)
    pl1.position.set(4.5, 2.5, -4)
    pl2.position.set(-4.5, -2, -4)
    return { ambient, sun, pl1, pl2 }
  }, [])

  // La caméra par défaut de R3F n'est pas dans la scène : on l'y ajoute pour que ses lumières comptent
  useEffect(() => {
    const { ambient, sun, pl1, pl2 } = lights
    scene.add(camera)
    scene.add(ambient)
    camera.add(sun, sun.target, pl1, pl2)
    return () => {
      camera.remove(sun, sun.target, pl1, pl2)
      scene.remove(ambient)
      scene.remove(camera)
      Object.values(lights).forEach((l) => l.dispose())
    }
  }, [camera, scene, lights])

  useFrame((st) => {
    const { k, t, F, wide, halfW, reduce } = s
    s.sc = wide ? Math.min(1.22, 0.3 + halfW * 0.155) : Math.min(0.74, halfW * 0.44)
    const b = Math.sin(Math.PI * t)
    const th = F * DTH
    const y = MathUtils.lerp(YS[k], YS[k + 1], t)
    const d = wide ? s.side * halfW * 0.4 : 0
    const dy = wide ? 0 : 2.3 - 172 / st.size.height
    const r = RI - b * 7.5
    const rx = Math.cos(th)
    const rz = Math.sin(th)
    v.vP.set(r * Math.sin(th) - rx * (d - s.smx * 0.7), y - dy + b * 0.9 - s.smy * 0.5, -r * Math.cos(th) - rz * (d - s.smx * 0.7))
    v.vT.set(RO * Math.sin(th) - rx * d, y - dy, -RO * Math.cos(th) - rz * d)
    if (first.current || reduce) {
      v.camP.copy(v.vP)
      v.camT.copy(v.vT)
      first.current = false
    } else {
      const e = damp(RATE.camera, s.dt)
      v.camP.lerp(v.vP, e)
      v.camT.lerp(v.vT, e)
    }
    camera.position.copy(v.camP)
    camera.lookAt(v.camT)
    camera.rotateZ(b * 0.08 * (k % 2 ? 1 : -1))
    uniforms.uPan.value = th * 1.4
    uniforms.uTilt.value = v.camP.y * 0.04
    lights.pl1.color.copy(s.cA)
    lights.pl2.color.copy(s.cC)
  }, FRAME.camera)

  return null
}
