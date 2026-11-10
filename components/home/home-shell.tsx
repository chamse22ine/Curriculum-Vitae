"use client"

import { useCallback, useMemo, useRef, useState, type MouseEvent, type ReactNode } from "react"
import { SECTIONS } from "@/content/sections"
import { paletteStyle } from "@/components/sections/section"
import { useScrollProgress } from "@/hooks/use-scroll-progress"
import { homeFontVariables } from "@/lib/home-fonts"
import { HomeScene } from "@/components/scene"
import { HomeContext } from "./home-context"
import { HomeHeader } from "./home-header"
import { Hud } from "./hud"
import { SectionKeys } from "./section-keys"
import { useSectionNav } from "./section-nav"

/**
 * Conteneur de l'accueil : suit la section active, applique sa palette (--p1..--p3, transition 0,6 s)
 * et fait défiler vers les ancres internes avec l'animation maison du prototype, sans modifier l'URL.
 */
export function HomeShell({ children }: Readonly<{ children: ReactNode }>) {
  const root = useRef<HTMLDivElement>(null)
  const { active, progress } = useScrollProgress(root)
  const value = useMemo(() => ({ active, progress }), [active, progress])
  const { scrollToSec, go, indexOf } = useSectionNav(root, progress)
  // Passe à "on" quand WebGL a démarré : le fond CSS de repli s'efface derrière le canvas
  const [sceneOn, setSceneOn] = useState(false)
  const onSceneReady = useCallback(() => setSceneOn(true), [])

  const onClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    const a = (e.target as Element).closest<HTMLAnchorElement>('a[href^="#"]')
    const i = a ? indexOf(a.getAttribute("href")!.slice(1)) : -1
    if (i < 0) return
    e.preventDefault()
    scrollToSec(i)
  }

  return (
    <HomeContext.Provider value={value}>
      <div
        ref={root}
        className={`home ${homeFontVariables}`}
        data-scene={sceneOn ? "on" : "off"}
        style={paletteStyle(SECTIONS[active].palette)}
        onClick={onClick}
      >
        <HomeScene progress={progress} onReady={onSceneReady} />
        <HomeHeader />
        {children}
        <Hud />
        <SectionKeys go={go} />
      </div>
    </HomeContext.Provider>
  )
}
