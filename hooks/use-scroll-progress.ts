"use client"

import { useCallback, useEffect, useRef, useState, type RefObject } from "react"

/** Largeur sous laquelle la page passe en disposition mobile (scène en haut, texte dessous) */
export const MOBILE_MAX = 820

export interface ScrollProgress {
  /** Section de départ de la transition en cours */
  k: number
  /** Avancement lissé (smoothstep) de k vers k + 1, entre 0 et 1 */
  t: number
}

/**
 * Longueur de la transition entre deux sections, en fraction de la hauteur d'écran.
 * Le prototype utilise 0,5 (ordinateur) et 0,3 (mobile) ; allongée pour une bascule plus douce.
 * Le point de bascule de la section active (milieu de la transition) ne change pas.
 */
const SPAN_DESKTOP = 0.85
const SPAN_MOBILE = 0.45

/**
 * Indice flottant de la section qui croise la ligne de référence
 * (50 % de la hauteur sur ordinateur, 62 % sur mobile, sous la scène).
 * Reprise de progress() dans design/prototype-chams.html (seule la longueur de transition change).
 */
export function computeProgress(tops: readonly number[], scrollY: number, width: number, height: number): ScrollProgress {
  if (tops.length < 2) return { k: 0, t: 0 }
  const mobile = width <= MOBILE_MAX
  const y = scrollY + height * (mobile ? 0.62 : 0.5)
  const span = height * (mobile ? SPAN_MOBILE : SPAN_DESKTOP)
  let f = 0
  for (let i = 1; i < tops.length; i++) {
    const v = (y - tops[i]) / span + 0.5
    f += v < 0 ? 0 : v > 1 ? 1 : v
  }
  const k = Math.min(tops.length - 2, Math.floor(f))
  let t = f - k
  t = t > 1 ? 1 : t
  t = t * t * (3 - 2 * t)
  return { k, t }
}

/** Section considérée comme active pour une progression donnée */
export const activeIndex = (p: ScrollProgress) => (p.t > 0.5 ? p.k + 1 : p.k)

/**
 * Mesure les sections `[data-section]` du conteneur et suit le défilement.
 * - `active` : index de la section active (état React, change rarement)
 * - `progress()` : progression instantanée, à lire dans une boucle d'animation (scène 3D)
 */
export function useScrollProgress(container: RefObject<HTMLElement | null>) {
  const tops = useRef<number[]>([])
  const [active, setActive] = useState(0)

  const progress = useCallback(
    () => computeProgress(tops.current, window.scrollY, window.innerWidth, window.innerHeight),
    [],
  )

  useEffect(() => {
    const root = container.current
    if (!root) return
    const sections = Array.from(root.querySelectorAll<HTMLElement>("[data-section]"))

    const measure = () => {
      tops.current = sections.map((s) => s.getBoundingClientRect().top + window.scrollY)
    }
    const tick = () => setActive(activeIndex(progress()))
    const remeasure = () => {
      measure()
      tick()
    }

    measure()
    const raf = requestAnimationFrame(tick)
    window.addEventListener("scroll", tick, { passive: true })
    window.addEventListener("resize", remeasure)
    const ro = new ResizeObserver(remeasure)
    ro.observe(document.body)
    let alive = true
    document.fonts?.ready.then(() => alive && remeasure())

    return () => {
      alive = false
      cancelAnimationFrame(raf)
      window.removeEventListener("scroll", tick)
      window.removeEventListener("resize", remeasure)
      ro.disconnect()
    }
  }, [container, progress])

  return { active, progress }
}
