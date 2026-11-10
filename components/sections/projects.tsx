import type { CSSProperties } from "react"
import Link from "next/link"
import { PROJECTS_HEAD } from "@/content/copy"
import { PROJECTS, PROJECT_KIND_COLOR, type Project } from "@/content/projects"
import { Section } from "./section"
import { R, T } from "./text"

function Name({ p }: Readonly<{ p: Project }>) {
  const label = <T v={p.name} />
  if (!p.href) return label
  if ("internal" in p.href) return <Link href={p.href.internal}>{label}</Link>
  return (
    <a href={p.href.external} target="_blank" rel="noopener">
      {label}
    </a>
  )
}

export function Projects() {
  return (
    <Section id="projets" wide>
      <div className="eyebrow">
        <i />
        <span>
          <T v={PROJECTS_HEAD.eyebrow} />
        </span>
      </div>
      <h2>
        <R v={PROJECTS_HEAD.title} />
      </h2>
      <ul className="projects">
        {PROJECTS.map((p, i) => (
          <li key={i} style={{ "--k": PROJECT_KIND_COLOR[p.kind] } as CSSProperties}>
            <span className="tags">
              <T v={p.tags} />
            </span>
            <h3>
              <Name p={p} />
            </h3>
            <p>
              <T v={p.description} />
            </p>
          </li>
        ))}
      </ul>
    </Section>
  )
}
