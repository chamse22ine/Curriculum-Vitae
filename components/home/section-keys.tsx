"use client"

import { UI } from "@/content/copy"

/** Deux boutons fixes en bas à droite : section précédente / suivante (masqués sur mobile) */
export function SectionKeys({ go }: Readonly<{ go: (dir: number) => void }>) {
  return (
    <div className="home-keys">
      <button type="button" aria-label={UI.prevSection} onClick={() => go(-1)}>
        ↑
      </button>
      <button type="button" aria-label={UI.nextSection} onClick={() => go(1)}>
        ↓
      </button>
    </div>
  )
}
