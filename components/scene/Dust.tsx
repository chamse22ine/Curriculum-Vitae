"use client"

import { useEffect, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import { AdditiveBlending, BufferAttribute, BufferGeometry, Points, ShaderMaterial } from "three"
import { FRAME, useSceneState } from "./state"

const COUNT = 1600

const vertexShader =
  "attribute float aPhase;uniform float uTime,uSize;varying float vA;void main(){vec3 p=position;p.y+=sin(uTime*.2+aPhase)*.4;" +
  "vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;gl_PointSize=uSize*(.5+.5*sin(aPhase*5.))/-mv.z;vA=.35+.35*sin(uTime*.7+aPhase*3.);}"
const fragmentShader =
  "uniform vec3 uCol;varying float vA;void main(){float d=length(gl_PointCoord-.5);gl_FragColor=vec4(mix(uCol,vec3(1.),.5),smoothstep(.5,0.,d)*vA);}"

/**
 * Poussière en suspension autour de l'anneau : elle donne au voyage de caméra quelque chose
 * contre quoi bouger. Shaders du prototype ; couleur : troisième couleur de la palette.
 */
export function Dust() {
  const s = useSceneState()
  const dust = useMemo(() => {
    const p = new Float32Array(COUNT * 3)
    const ph = new Float32Array(COUNT)
    for (let i = 0; i < COUNT; i++) {
      const a = Math.random() * Math.PI * 2
      const r = 5 + Math.random() * 27
      p[i * 3] = r * Math.sin(a)
      p[i * 3 + 1] = (Math.random() - 0.5) * 18
      p[i * 3 + 2] = -r * Math.cos(a)
      ph[i] = Math.random() * 6.28
    }
    const geometry = new BufferGeometry()
    geometry.setAttribute("position", new BufferAttribute(p, 3))
    geometry.setAttribute("aPhase", new BufferAttribute(ph, 1))
    const material = new ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uSize: { value: 30 }, uCol: { value: s.cC } },
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
    })
    const points = new Points(geometry, material)
    points.frustumCulled = false
    return { points, geometry, material }
  }, [s])

  useEffect(
    () => () => {
      dust.geometry.dispose()
      dust.material.dispose()
    },
    [dust],
  )

  useFrame((st) => {
    const u = dust.material.uniforms
    u.uTime.value = s.time
    // Taille proportionnelle à la hauteur d'écran et à la densité de pixels (resize() du prototype)
    u.uSize.value = (26 * st.viewport.dpr * st.size.height) / 900
  }, FRAME.objects)

  return <primitive object={dust.points} />
}
