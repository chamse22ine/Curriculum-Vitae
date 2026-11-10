"use client"

import { useEffect, useRef } from "react"
import { SECTIONS } from "@/content/sections"
import { UI } from "@/content/copy"
import { T } from "@/components/sections/text"
import { useLanguage } from "@/lib/language-context"
import { useHome } from "./home-context"

const NAV = SECTIONS.filter((s) => s.nav)

export function HomeHeader() {
  const { active } = useHome()
  const { language, setLanguage } = useLanguage()
  const links = useRef<HTMLDivElement>(null)
  const activeId = SECTIONS[active].id

  // Barre défilante (mobile) : recentre le lien actif
  useEffect(() => {
    const l = links.current
    if (!l) return
    const on = l.querySelector<HTMLElement>("a.on")
    l.scrollLeft = on ? on.offsetLeft - (l.clientWidth - on.offsetWidth) / 2 : 0
  }, [activeId])

  return (
    <header className="home-header">
      <a className="home-logo" href="#top">
        Chams<b>.</b>
      </a>
      <nav className="home-nav" aria-label="Sections">
        <div className="home-links" ref={links}>
          {NAV.map((s) => (
            <a key={s.id} href={`#${s.id}`} className={s.id === activeId ? "on" : undefined} aria-current={s.id === activeId ? "true" : undefined}>
              <T v={s.nav!} />
            </a>
          ))}
        </div>
        <button
          className="home-lang"
          type="button"
          aria-label={UI.langLabel}
          onClick={() => setLanguage(language === "en" ? "fr" : "en")}
        >
          <span data-l="fr">FR</span> / <span data-l="en">EN</span>
        </button>
      </nav>
    </header>
  )
}
