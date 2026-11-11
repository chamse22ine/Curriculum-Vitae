"use client"

import { useEffect, useMemo } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { Raycaster, Vector2, type Object3D } from "three"
import { MOBILE_MAX } from "@/hooks/use-scroll-progress"
import { damp, FRAME, type Grab, useSceneState } from "./state"

/** Zone tactile transparente au-dessus de la scène sur mobile (#home-stage, voir home.css) */
export const STAGE_ID = "home-stage"
/** Éléments au-dessus de la scène : le pointeur y appartient au texte ou aux commandes */
const UI_SELECTOR = ".home-col, .home-header, .home-keys, .home-hud, .home-footer"
/** Un clic : moins de 7 px de déplacement et moins de 450 ms */
const CLICK_PX = 7
const CLICK_MS = 450
/** Relâché, l'objet attend 1,4 s puis revient en place */
const HOLD_S = 1.4
const TURN = Math.PI * 2
const RATE_BACK = 0.07

const shown = (o: Object3D | null) => {
  for (; o; o = o.parent) if (!o.visible) return false
  return true
}

/** Le pointeur est-il sur la scène 3D plutôt que sur le texte ou les commandes ? (free du prototype) */
function free(e: PointerEvent) {
  const t = e.target as Element | null
  if (window.innerWidth <= MOBILE_MAX) return t?.id === STAGE_ID
  return !t?.closest?.(UI_SELECTOR)
}

/**
 * Interactions avec les objets, à la souris et au doigt, par lancer de rayon (pick du prototype) :
 * glisser tourne l'objet saisi, cliquer ou toucher déclenche son animation (act), le curseur
 * passe en main au survol. Les événements sont écoutés sur la fenêtre : le canvas est sous le
 * texte et ne reçoit pas le pointeur.
 */
export function Interactions() {
  const s = useSceneState()
  const camera = useThree((st) => st.camera)
  const ctx = useMemo(
    () => ({
      ray: new Raycaster(),
      ndc: new Vector2(),
      drag: null as null | { g: Grab; obj: Object3D; x: number; y: number; x0: number; y0: number; t: number; touch: boolean },
      ptr: { x: 0, y: 0, moved: false, free: false },
      pick: null as null | ((x: number, y: number) => { g: Grab; obj: Object3D } | null),
    }),
    [],
  )

  useEffect(() => {
    const root = document.documentElement
    const pick = (x: number, y: number) => {
      ctx.ndc.set((x / window.innerWidth) * 2 - 1, -(y / window.innerHeight) * 2 + 1)
      ctx.ray.setFromCamera(ctx.ndc, camera)
      const list = s.grabs.filter((g) => shown(g.o))
      const hits = ctx.ray.intersectObjects(list.map((g) => g.o), true)
      for (const h of hits) {
        if (!shown(h.object)) continue
        let o: Object3D | null = h.object
        while (o && !list.some((g) => g.o === o)) o = o.parent
        if (o) return { g: list.find((g) => g.o === o)!, obj: h.object }
      }
      return null
    }
    const down = (e: PointerEvent) => {
      if (e.button || !free(e)) return
      const h = pick(e.clientX, e.clientY)
      if (!h) return
      ctx.drag = { g: h.g, obj: h.obj, x: e.clientX, y: e.clientY, x0: e.clientX, y0: e.clientY, t: e.timeStamp, touch: e.pointerType !== "mouse" }
      if (!ctx.drag.touch) e.preventDefault()
      root.style.cursor = "grabbing"
    }
    const move = (e: PointerEvent) => {
      const p = ctx.ptr
      p.x = e.clientX
      p.y = e.clientY
      p.moved = true
      p.free = e.pointerType === "mouse" && free(e)
      const d = ctx.drag
      if (!d) return
      d.g.ry += (e.clientX - d.x) * 0.011
      if (!d.touch) d.g.rx = Math.max(-0.7, Math.min(0.7, d.g.rx + (e.clientY - d.y) * 0.006))
      d.x = e.clientX
      d.y = e.clientY
    }
    const drop = (e: PointerEvent) => {
      const d = ctx.drag
      if (!d) return
      const g = d.g
      const dist = Math.hypot(e.clientX - d.x0, e.clientY - d.y0)
      if (e.type === "pointerup" && dist < CLICK_PX && e.timeStamp - d.t < CLICK_MS) {
        g.kick = s.clock
        if (g.act) g.act(d.obj)
        else {
          g.ty += TURN
          g.hold = 0
        }
      } else {
        // Relâché : revient au tour entier le plus proche, après une pause
        g.ty = Math.round(g.ry / TURN) * TURN
        g.hold = s.clock + HOLD_S
      }
      ctx.drag = null
      root.style.cursor = ""
    }
    // Survol : la main n'apparaît qu'au-dessus d'un objet (test fait dans la boucle, une fois par image)
    ctx.pick = pick
    window.addEventListener("pointerdown", down)
    window.addEventListener("pointermove", move)
    window.addEventListener("pointerup", drop)
    window.addEventListener("pointercancel", drop)
    return () => {
      window.removeEventListener("pointerdown", down)
      window.removeEventListener("pointermove", move)
      window.removeEventListener("pointerup", drop)
      window.removeEventListener("pointercancel", drop)
      root.style.cursor = ""
      ctx.pick = null
    }
  }, [s, camera, ctx])

  useFrame(() => {
    const e = damp(RATE_BACK, s.dt)
    for (const g of s.grabs) {
      if (ctx.drag?.g === g) continue
      if (s.clock > g.hold) {
        g.ry += (g.ty - g.ry) * e
        g.rx -= g.rx * e
      }
    }
    const p = ctx.ptr
    if (p.moved && !ctx.drag && ctx.pick) {
      p.moved = false
      document.documentElement.style.cursor = p.free && ctx.pick(p.x, p.y) ? "grab" : ""
    }
  }, FRAME.grabs)

  return null
}
