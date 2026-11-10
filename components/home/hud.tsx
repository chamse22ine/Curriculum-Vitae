"use client"

import { SECTIONS } from "@/content/sections"
import { T } from "@/components/sections/text"
import { useHome } from "./home-context"

const pad = (n: number) => String(n).padStart(2, "0")

/** Indicateur bas d'écran : « 03 / 08 ▬ DATA » (masqué sur mobile) */
export function Hud() {
  const { active } = useHome()
  return (
    <div className="home-hud" aria-hidden="true">
      <span>
        {pad(active + 1)} / {pad(SECTIONS.length)}
      </span>
      <span className="bar">
        <i style={{ width: `${((active + 1) / SECTIONS.length) * 100}%` }} />
      </span>
      <span>
        <T v={SECTIONS[active].hud} />
      </span>
    </div>
  )
}
