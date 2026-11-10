"use client"

import { useCallback, useEffect, useRef, type RefObject } from "react"
import { activeIndex, MOBILE_MAX, type ScrollProgress } from "@/hooks/use-scroll-progress"

/** Sur mobile, la section s'arrête sous la scène fixée en haut (33 % de l'écran) */
const MOBILE_OFFSET = 0.33
/** Durée du défilement : 0,9 s + 0,7 ms par pixel, plafonnée à 2,6 s (≈ 1,5 s par section) */
const DUR_BASE = 900
const DUR_PER_PX = 0.7
const DUR_MAX = 2600
/** Appuis rapprochés : on continue depuis la cible précédente plutôt que la section active */
const KEY_CHAIN_MS = 1700

const easeInOutCubic = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2)

/**
 * Défilement animé d'une section à l'autre (scrollToSec et go() du prototype) :
 * plus lent que le défilement fluide du navigateur, annulé dès que l'utilisateur reprend la main.
 * Pilote aussi le clavier (↑ ↓, Page préc. / suiv., Début, Fin).
 */
export function useSectionNav(root: RefObject<HTMLElement | null>, progress: () => ScrollProgress) {
  const anim = useRef(0)
  const key = useRef({ idx: 0, t: 0 })

  const sections = useCallback(
    () => Array.from(root.current?.querySelectorAll<HTMLElement>("[data-section]") ?? []),
    [root],
  )

  const scrollToSec = useCallback(
    (i: number) => {
      const s = sections()[i]
      if (!s) return
      const mobile = window.innerWidth <= MOBILE_MAX
      const max = document.documentElement.scrollHeight - window.innerHeight
      let y = s.getBoundingClientRect().top + window.scrollY - (mobile ? window.innerHeight * MOBILE_OFFSET : 0)
      y = Math.max(0, Math.min(max, y))
      cancelAnimationFrame(anim.current)
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
        window.scrollTo(0, y)
        return
      }
      const y0 = window.scrollY
      const t0 = performance.now()
      const dur = Math.min(DUR_MAX, DUR_BASE + Math.abs(y - y0) * DUR_PER_PX)
      const step = (now: number) => {
        const p = Math.min(1, Math.max(0, (now - t0) / dur))
        window.scrollTo(0, y0 + (y - y0) * easeInOutCubic(p))
        if (p < 1) anim.current = requestAnimationFrame(step)
      }
      step(t0)
    },
    [sections],
  )

  const go = useCallback(
    (dir: number) => {
      const now = Date.now()
      const k = key.current
      const from = now - k.t < KEY_CHAIN_MS ? k.idx : activeIndex(progress())
      k.idx = Math.max(0, Math.min(sections().length - 1, from + dir))
      k.t = now
      scrollToSec(k.idx)
    },
    [progress, scrollToSec, sections],
  )

  useEffect(() => {
    const cancel = () => cancelAnimationFrame(anim.current)
    const events = ["wheel", "touchstart", "mousedown"] as const
    events.forEach((ev) => window.addEventListener(ev, cancel, { passive: true }))

    const onKey = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return
      const t = e.target as HTMLElement | null
      const tag = t?.tagName
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || t?.isContentEditable) return
      const d =
        e.key === "ArrowDown" || e.key === "PageDown" ? 1
        : e.key === "ArrowUp" || e.key === "PageUp" ? -1
        : e.key === "Home" ? -99
        : e.key === "End" ? 99
        : 0
      if (!d) return
      e.preventDefault()
      go(d)
    }
    window.addEventListener("keydown", onKey)

    return () => {
      cancel()
      events.forEach((ev) => window.removeEventListener(ev, cancel))
      window.removeEventListener("keydown", onKey)
    }
  }, [go])

  /** Index de la section ciblée par une ancre interne (#id), ou -1 */
  const indexOf = useCallback((id: string) => sections().findIndex((s) => s.id === id), [sections])

  return { scrollToSec, go, indexOf }
}
