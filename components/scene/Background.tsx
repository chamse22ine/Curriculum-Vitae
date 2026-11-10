"use client"

import { useEffect, useMemo } from "react"
import { Color, ShaderMaterial } from "three"
import type { Palette } from "@/content/types"

/** Uniformes du fond, mis à jour chaque image par la boucle de la scène */
export function createBackgroundUniforms(p: Palette) {
  return {
    uTime: { value: 0 },
    uAspect: { value: 1 },
    /** Côté de la scène (1 : à droite, -1 : à gauche, 0 : mobile) ; le motif s'atténue côté texte */
    uSide: { value: 1 },
    /** Défilement horizontal et vertical du motif, suivent la caméra */
    uPan: { value: 0 },
    uTilt: { value: 0 },
    /** 1 sur mobile (scène dans le haut de l'écran) */
    uMob: { value: 0 },
    /** Univers quitté, univers atteint et avancement du fondu entre les deux */
    uA: { value: 0 },
    uB: { value: 1 },
    uMix: { value: 0 },
    cA: { value: new Color(p[0]) },
    cB: { value: new Color(p[1]) },
    cC: { value: new Color(p[2]) },
  }
}

export type BackgroundUniforms = ReturnType<typeof createBackgroundUniforms>

const vertexShader = "varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}"

/*
 * Un univers par section, dans une seule fonction world(m, …) : 0 espace étoilé, 1 plan technique,
 * 2 histogramme et courbes, 3 réseau de neurones, 4 sol en grille néon, 5 pluie de code,
 * 6 courbes de niveau, 7 ondes concentriques. Shader du prototype, copié tel quel.
 * Pas de <colorspace_fragment> : comme en r128, les couleurs sortent sans conversion.
 * fwidth() est natif en WebGL 2 (l'ancienne extension « derivatives » n'est plus nécessaire).
 */
const fragmentShader = [
  'uniform float uTime,uAspect,uSide,uPan,uTilt,uMob,uA,uB,uMix;uniform vec3 cA,cB,cC;varying vec2 vUv;',
  'float h21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}',
  'float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h21(i),h21(i+vec2(1.,0.)),f.x),mix(h21(i+vec2(0.,1.)),h21(i+vec2(1.,1.)),f.x),f.y);}',
  'float seg(vec2 p,vec2 a,vec2 b){vec2 pa=p-a,ba=b-a;return length(pa-ba*clamp(dot(pa,ba)/dot(ba,ba),0.,1.));}',
  'float ln(float d,float w){return 1.-smoothstep(0.,w,d);}',
  'float stars(vec2 p,float dens){p*=dens;vec2 id=floor(p);float n=h21(id);vec2 o=(vec2(h21(id+7.3),h21(id+13.7))-.5)*.7;return ln(length(fract(p)-.5-o),.05+.05*n)*step(.8,n)*(.55+.45*sin(uTime*1.3+n*40.));}',
  'vec2 node(vec2 id){return id+.5+(vec2(h21(id+3.1),h21(id+9.7))-.5)*.6+.06*vec2(sin(uTime*.6+h21(id)*6.3),cos(uTime*.5+h21(id+1.)*6.3));}',
  'vec3 world(float m,vec2 uv,vec2 p,vec2 dv,float sd){',
  '  float r=length(dv);vec3 base=vec3(.012,.012,.03),halo=cA*.2*exp(-r*r*3.);float sy=mix(uv.y,(uv.y-.69)/.31,uMob);',
  '  if(m<.5){return base+halo*1.3+cB*.09*exp(-r*r*.8)+vec3(stars(p,34.)*.75*sd);}',
  '  if(m<1.5){vec2 g=abs(fract(p*20.)-.5),G=abs(fract(p*4.)-.5);float grid=ln(min(g.x,g.y),.03)*.07+ln(min(G.x,G.y),.012)*.16;',
  '    vec2 q=p*vec2(2.,2.8);vec2 id=floor(q);vec2 f=fract(q)-.5;float n=h21(id);vec2 hs=vec2(.22+.18*n,.16+.2*h21(id+5.));vec2 dq=abs(f)-hs;',
  '    float on=step(.35,n),card=ln(abs(max(dq.x,dq.y)),.012)*on,bar=ln(abs(f.y-hs.y+.07),.008)*step(abs(f.x),hs.x)*on*.6;',
  '    return base+halo+cA*grid*sd+mix(cB,cC,n)*(card+bar)*.4*(.6+.4*sin(uTime*.8+n*20.))*sd;}',
  '  if(m<2.5){float cw=.028,n=h21(vec2(floor(p.x/cw),3.)),fx=fract(p.x/cw);float h=.06+.26*n*(.65+.35*sin(uTime*.7+n*30.));',
  '    vec3 c=mix(cA,cB,n)*step(sy,h)*step(.12,fx)*step(fx,.88)*(.12+.5*smoothstep(h-.08,h,sy));',
  '    float y1=.66+.07*sin(p.x*5.+uTime*.5)+.03*sin(p.x*13.-uTime*.8),y2=.56+.06*sin(p.x*4.-uTime*.4+2.)+.025*sin(p.x*17.+uTime);',
  '    c+=cA*ln(abs(sy-y1),.006)*.55+cC*ln(abs(sy-y2),.005)*.4+vec3(.5)*ln(length(abs(fract(p*10.)-.5)),.03)*.12;return base+halo+c*sd;}',
  '  if(m<3.5){vec2 q=p*7.;vec2 id=floor(q);float acc=0.,pul=0.;',
  '    for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 c=id+vec2(float(i),float(j));vec2 a=node(c),b=node(c+vec2(1.,0.)),e=node(c+vec2(0.,1.));',
  '      float o1=step(.3,h21(c+20.)),o2=step(.3,h21(c+40.));acc=max(acc,ln(length(q-a),.09));acc=max(acc,ln(seg(q,a,b),.02)*.45*o1);acc=max(acc,ln(seg(q,a,e),.02)*.45*o2);',
  '      pul=max(pul,ln(length(q-mix(a,b,fract(uTime*.35+h21(c+60.)))),.07)*o1);pul=max(pul,ln(length(q-mix(a,e,fract(uTime*.3+h21(c+80.)))),.07)*o2);}',
  '    return base+halo+(cA*acc*.4+mix(cC,vec3(1.),.4)*pul*.7)*sd;}',
  '  if(m<4.5){float h0=mix(.4,.76,uMob),d=h0-uv.y;',
  '    if(d>0.){float z=.1/d;float gx=abs(fract((uv.x-.5)*uAspect*z*8.+uPan*5.)-.5),gz=abs(fract(z*6.+uTime*.12)-.5);',
  '      return base+cB*max(ln(gx,.004+z*.02),ln(gz,.02+z*z*.06))*.5*smoothstep(0.,.07,d)*sd+cA*exp(-d*16.)*.45;}',
  '    return base+cA*exp(d*9.)*.4+cC*exp(d*3.)*.07+vec3(stars(p,30.)*.5*sd);}',
  '  if(m<5.5){float cw=.02,rh=.026;vec2 cell=vec2(floor(p.x/cw),floor(uv.y/rh));float n=h21(vec2(cell.x,7.));',
  '    float v=fract((cell.y+.5)*rh*(1.2+n)+uTime*(.07+.2*n)+n*10.);vec2 sub=floor(fract(vec2(p.x/cw,uv.y/rh))*vec2(4.,6.));',
  '    float gl=step(.5,h21(cell*1.7+sub*.37+floor(uTime*2.*h21(cell))*.13))*step(.5,sub.x)*step(.5,sub.y);',
  '    return base+halo+(cA*pow(1.-v,5.)*.45+vec3(1.)*pow(1.-v,40.)*.4)*gl*sd;}',
  '  if(m<6.5){float n=vn(p*2.2+vec2(0.,uTime*.02))+.5*vn(p*4.7-vec2(uTime*.015,0.));float v=n*9.;float w=fwidth(v)*1.4+.01;',
  '    float l=ln(abs(fract(v)-.5),w),mj=step(2.5,mod(floor(v),4.));return base+halo+(cB*l*(.16+.34*mj)+cA*n*.04)*sd;}',
  '  float v=r*4.5-uTime*.35;float ring=ln(abs(fract(v)-.5),.03+r*.02)*exp(-r*1.1);float sw=pow(max(0.,cos(atan(dv.y,dv.x)-uTime*.5)),30.)*exp(-r*.8);',
  '  return base+halo*1.2+(cA*ring*.45+cC*sw*.25)*sd+vec3(stars(p,30.)*.4*sd);}',
  'void main(){vec2 uv=vUv;vec2 c=mix(vec2(.5+uSide*.21,.5),vec2(.5,.82),uMob);vec2 dv=(uv-c)*vec2(uAspect,1.);',
  '  float sd=mix(mix(.3,1.,smoothstep(-.3,.3,(uv.x-.5)*uSide)),1.,uMob);vec2 p=vec2(uv.x*uAspect+uPan*.5,uv.y+uTilt);',
  '  vec3 col=world(uA,uv,p,dv,sd);if(uMix>.002)col=mix(col,world(uB,uv,p,dv,sd),uMix);gl_FragColor=vec4(col,1.);}'
].join("\n")

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
