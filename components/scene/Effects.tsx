"use client"

import { useEffect, useMemo } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { UnsignedByteType, Vector2, WebGLRenderTarget } from "three"
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js"
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js"
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js"
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js"

/** Halo du prototype : intensité, rayon, seuil. Les écrans (0,8) restent sous le seuil */
const STRENGTH = 0.55
const RADIUS = 0.6
const THRESHOLD = 0.82

/**
 * Halo (bloom) avec EffectComposer, RenderPass et UnrealBloomPass de three/examples.
 * - Cible en 8 bits et 4 échantillons, comme le WebGLMultisampleRenderTarget du prototype :
 *   par défaut r187 rend en demi-flottants, les valeurs > 1 (pistes, voyants) ne seraient plus
 *   plafonnées et le halo serait bien plus fort qu'en r128.
 * - OutputPass en dernier : il écrit à l'écran ; avec la sortie linéaire et sans tone mapping
 *   (voir Scene.tsx), il ne modifie pas les couleurs.
 * - Priorité 1 dans useFrame : R3F nous laisse le rendu de chaque image.
 */
function Bloom({ composer }: Readonly<{ composer: EffectComposer }>) {
  const size = useThree((s) => s.size)
  const dpr = useThree((s) => s.viewport.dpr)
  useEffect(() => {
    composer.setPixelRatio(dpr)
    composer.setSize(size.width, size.height)
  }, [composer, size, dpr])
  useFrame((_, delta) => composer.render(delta), 1)
  return null
}

export function Effects() {
  const gl = useThree((s) => s.gl)
  const scene = useThree((s) => s.scene)
  const camera = useThree((s) => s.camera)

  const composer = useMemo(() => {
    try {
      const target = new WebGLRenderTarget(1, 1, { type: UnsignedByteType, samples: 4 })
      const c = new EffectComposer(gl, target)
      c.addPass(new RenderPass(scene, camera))
      c.addPass(new UnrealBloomPass(new Vector2(256, 256), STRENGTH, RADIUS, THRESHOLD))
      c.addPass(new OutputPass())
      return c
    } catch {
      // Sans post-traitement, R3F garde son rendu habituel (sans halo)
      return null
    }
  }, [gl, scene, camera])

  useEffect(
    () => () => {
      if (!composer) return
      composer.passes.forEach((p) => p.dispose())
      composer.dispose()
    },
    [composer],
  )

  return composer ? <Bloom composer={composer} /> : null
}
