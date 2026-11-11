import type { Metadata } from "next"
import { Contact } from "@/components/sections/contact"
import { Hero } from "@/components/sections/hero"
import { Journey } from "@/components/sections/journey"
import { Projects } from "@/components/sections/projects"
import { Skill } from "@/components/sections/skill"
import { META } from "@/content/copy"

export const metadata: Metadata = {
  title: META.title,
  description: META.description,
}

// Ordre identique à content/sections.ts (le HUD et la palette active s'appuient sur l'index)
export default function Home() {
  return (
    <>
      <Hero />
      <Skill id="web" />
      <Skill id="data" />
      <Skill id="ia" />
      <Skill id="devops" />
      <Skill id="systemes" />
      <Projects />
      <Journey />
      <Contact />
    </>
  )
}
