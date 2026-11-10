import type { CSSProperties, ReactNode } from "react"
import { sectionMeta, type SectionId } from "@/content/sections"
import type { Palette } from "@/content/types"

export function paletteStyle(p: Palette): CSSProperties {
  return { "--p1": p[0], "--p2": p[1], "--p3": p[2] } as CSSProperties
}

/** Une section de la page : id d'ancre, côté du texte et palette propre */
export function Section({ id, wide, children }: Readonly<{ id: SectionId; wide?: boolean; children: ReactNode }>) {
  const meta = sectionMeta(id)
  return (
    <section
      id={id}
      data-section
      className={meta.side === -1 ? "home-section alt" : "home-section"}
      style={paletteStyle(meta.palette)}
    >
      <div className={wide ? "home-col wide" : "home-col"}>{children}</div>
    </section>
  )
}
