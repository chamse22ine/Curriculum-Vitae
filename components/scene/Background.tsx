"use client"

import { useEffect, useMemo } from "react"
import { Color, ShaderMaterial } from "three"
import type { Palette } from "@/content/types"

/** Uniformes du fond, mis à jour chaque image par la boucle de la scène */
export function createBackgroundUniforms(p: Palette) {
  return {
    uTime: { value: 0 },
    uAspect: { value: 1 },
    uSide: { value: 1 },
    cA: { value: new Color(p[0]) },
    cB: { value: new Color(p[1]) },
    cC: { value: new Color(p[2]) },
  }
}

export type BackgroundUniforms = ReturnType<typeof createBackgroundUniforms>

const vertexShader = "varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}"

// Champ de couleurs fluide, assombri du côté du texte. Shader du prototype, inchangé.
// Pas de <colorspace_fragment> : comme en r128, les couleurs de la palette sortent telles quelles.
const fragmentShader =
  "uniform float uTime,uAspect,uSide;uniform vec3 cA,cB,cC;varying vec2 vUv;void main(){" +
  "vec2 q=vec2(vUv.x*uAspect,vUv.y)*1.25;float t=uTime*.07;" +
  "for(int i=1;i<4;i++){float f=float(i);q+=.5/f*vec2(sin(q.y*f*1.7+t*3.+f),cos(q.x*f*1.4-t*2.+f*.5));}" +
  "float a=.5+.5*sin(q.x*1.2+q.y);float b=.5+.5*cos(q.y*1.5-q.x*.7+t*4.);" +
  "vec3 col=mix(cA,cB,a);col=mix(col,cC,b*.65);" +
  "float d=(vUv.x-.5)*uSide;float bright=mix(mix(.2,.8,smoothstep(.5,.75,vUv.y)),mix(.13,.78,smoothstep(-.3,.3,d)),abs(uSide));" +
  "gl_FragColor=vec4(col*bright+vec3(.025,.02,.07),1.);}"

/**
 * Plan plein écran dessiné avant tout le reste.
 * Le ShaderMaterial est créé à la main : avec <shaderMaterial uniforms={…}>, R3F travaille sur une
 * copie des uniformes et les mises à jour faites chaque image n'arrivent jamais au GPU.
 */
export function Background({ uniforms }: Readonly<{ uniforms: BackgroundUniforms }>) {
  const material = useMemo(
    () => new ShaderMaterial({ uniforms, vertexShader, fragmentShader, depthTest: false, depthWrite: false }),
    [uniforms],
  )
  useEffect(() => () => material.dispose(), [material])
  return (
    <mesh frustumCulled={false} renderOrder={-1} material={material}>
      <planeGeometry args={[2, 2]} />
    </mesh>
  )
}
