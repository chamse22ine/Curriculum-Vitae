"use client"

import { useMemo, useRef, type MouseEvent, type ReactNode } from "react"
import { SECTIONS } from "@/content/sections"
import { paletteStyle } from "@/components/sections/section"
import { useScrollProgress } from "@/hooks/use-scroll-progress"
import { homeFontVariables } from "@/lib/home-fonts"
import { HomeContext } from "./home-context"
import { HomeHeader } from "./home-header"
import { Hud } from "./hud"

/**
 * Conteneur de l'accueil : suit la section active, applique sa palette (--p1..--p3, transition 0,6 s)
 * et fait défiler en douceur vers les ancres internes sans modifier l'URL (comme le prototype).
 */
export function HomeShell({ children }: Readonly<{ children: ReactNode }>) {
  const root = useRef<HTMLDivElement>(null)
  const { active, progress } = useScrollProgress(root)
  const value = useMemo(() => ({ active, progress }), [active, progress])

  const onClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    const a = (e.target as Element).closest<HTMLAnchorElement>('a[href^="#"]')
    const target = a && document.getElementById(a.getAttribute("href")!.slice(1))
    if (!target) return
    e.preventDefault()
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches
    target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" })
  }

  return (
    <HomeContext.Provider value={value}>
      <div
        ref={root}
        className={`home ${homeFontVariables}`}
        data-scene="off"
        style={paletteStyle(SECTIONS[active].palette)}
        onClick={onClick}
      >
        <HomeHeader />
        {children}
        <Hud />
      </div>
    </HomeContext.Provider>
  )
}
