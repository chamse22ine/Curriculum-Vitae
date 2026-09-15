import Link from "next/link"
import { ArrowRight, ArrowUpRight, Brain, Code, Database, Gamepad2, Globe, Mail, Plane, School, Trophy, type LucideIcon } from "lucide-react"
import { Github, Linkedin } from "@/components/brand-icons"
import { RevealLines } from "@/components/site/reveal-lines"
import { translations } from "@/lib/translations"

const SKILLS = [
  { icon: Code, title: "Web development", stack: "React · Next.js · TypeScript" },
  { icon: Database, title: "Data science", stack: "Python · SQL · Machine learning" },
  { icon: Brain, title: "AI & MLOps", stack: "Azure · Databricks · Models" },
]

// Même ordre que translations.en.projects.list
const PROJECT_META: { icon: LucideIcon; tags: string; color: string }[] = [
  { icon: Brain, tags: "Next.js · Quiz", color: "text-c1" },
  { icon: Plane, tags: "GCP · MLOps · Chatbot", color: "text-c2" },
  { icon: Gamepad2, tags: "C · Game", color: "text-c3" },
  { icon: Globe, tags: "Next.js · Tailwind", color: "text-c4" },
  { icon: Trophy, tags: "AI · Strategy game", color: "text-c5" },
  { icon: School, tags: "Web · University", color: "text-c1" },
]

const CONTACT_LINKS = [
  { icon: Github, label: "GitHub", handle: "chamse22ine", href: "https://github.com/chamse22ine" },
  { icon: Linkedin, label: "LinkedIn", handle: "chamseddine-adaadour", href: "https://linkedin.com/in/chamseddine-adaadour" },
  { icon: Mail, label: "Email", handle: "contact@chams.dev", href: "mailto:contact@chams.dev" },
]

function SectionHeading({ index, kicker, title, lead }: { index: string; kicker: string; title: string; lead?: string }) {
  return (
    <div className="max-w-2xl">
      <p className="num text-caption uppercase tracking-[0.14em] text-ink-muted">
        {index} — {kicker}
      </p>
      <h2 className="mt-3 font-display text-[2.25rem] leading-[1.1] text-ink sm:text-h2">{title}</h2>
      {lead && <p className="mt-4 text-lead text-ink-soft">{lead}</p>}
    </div>
  )
}

function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-20 pt-16 sm:px-6 sm:pb-28 sm:pt-24">
      <p className="num text-caption uppercase tracking-[0.14em] text-ink-muted">Computer science student · Lille, France</p>
      <h1 className="mt-6 font-display text-[2.5rem] leading-[1.05] text-ink sm:text-h1 lg:text-display">
        <RevealLines
          lines={[
            { text: "Hey, I'm Chams." },
            { text: "I build apps," },
            { text: "augmented with AI.", className: "italic text-primary" },
          ]}
        />
      </h1>
      <p className="mt-6 max-w-xl text-lead text-ink-soft">
        A web &amp; mobile computer science student. From web applications to data pipelines, I turn ideas into reality with
        clean code and modern technologies.
      </p>
      <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
        <a
          href="#contact"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-accent px-5 text-ui font-medium text-accent-foreground transition-colors duration-100 ease-out-ui hover:bg-accent-hover"
        >
          Get in touch
          <ArrowRight className="size-4" aria-hidden />
        </a>
        <Link
          href="/calculator"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-hairline-strong bg-surface px-5 text-ui font-medium text-primary transition-colors duration-100 ease-out-ui hover:border-primary"
        >
          Grade calculator
        </Link>
        <Link
          href="/hours"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-hairline-strong bg-surface px-5 text-ui font-medium text-primary transition-colors duration-100 ease-out-ui hover:border-primary"
        >
          Hours tracker
        </Link>
      </div>
    </section>
  )
}

function Skills() {
  return (
    <section id="skills" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 sm:px-6">
      <SectionHeading index="01" kicker="Skills" title="What I love doing" lead="Exploring the intersection of software engineering and data science." />
      <ul className="mt-12 grid gap-px overflow-hidden rounded-lg border border-hairline bg-hairline sm:grid-cols-3">
        {SKILLS.map((skill, i) => (
          <li key={skill.title} className="bg-surface p-6">
            <div className="flex items-center justify-between">
              <skill.icon className="size-5 text-primary" aria-hidden />
              <span className="num text-caption text-ink-muted">0{i + 1}</span>
            </div>
            <h3 className="mt-6 text-lg font-medium text-ink">{skill.title}</h3>
            <p className="num mt-2 text-caption text-ink-muted">{skill.stack}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}

function Projects() {
  return (
    <section id="projects" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 sm:px-6">
      <SectionHeading index="02" kicker="Projects" title="Selected projects" />
      <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {translations.en.projects.list.map((project, i) => {
          const meta = PROJECT_META[i]
          return (
            <li key={project.title}>
              <article className="group h-full overflow-hidden rounded-lg border border-hairline bg-surface transition-colors duration-180 ease-out-ui hover:border-accent">
                <div className="overflow-hidden border-b border-hairline bg-surface-sunk" aria-hidden>
                  <div className="flex aspect-[16/9] flex-col transition-transform duration-180 ease-out-ui group-hover:scale-[1.02]">
                    <div className="flex items-center gap-1.5 border-b border-hairline px-3 py-2">
                      <span className="size-1.5 rounded-full bg-hairline-strong" />
                      <span className="size-1.5 rounded-full bg-hairline-strong" />
                      <span className="size-1.5 rounded-full bg-hairline-strong" />
                      <span className="num ml-2 truncate text-caption text-ink-muted">
                        {project.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}
                      </span>
                    </div>
                    <div className="flex flex-1 items-center justify-center">
                      <meta.icon className={`size-10 ${meta.color}`} strokeWidth={1.25} />
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  <p className="num text-caption text-ink-muted">{meta.tags}</p>
                  <h3 className="mt-2 text-lg font-medium text-ink">{project.title}</h3>
                  <p className="mt-2 text-body text-ink-soft">{project.description}</p>
                </div>
              </article>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function VerdictPreview() {
  return (
    <div lang="fr" aria-hidden className="rounded-lg border border-hairline bg-surface p-5 shadow-float">
      <p className="num text-caption uppercase tracking-[0.14em] text-ink-muted">Verdict · M1</p>
      <p className="mt-3 font-display text-h3 text-success">Année validée</p>
      <p className="num mt-2 text-num-lg text-ink">12,40</p>
      <div className="relative mt-5 h-2 rounded-full bg-surface-sunk">
        <div className="absolute inset-y-0 left-0 w-[62%] rounded-full bg-success" />
        <div className="absolute -inset-y-1 left-1/2 w-px bg-ink" />
      </div>
      <div className="num mt-1.5 grid grid-cols-3 text-caption text-ink-muted">
        <span>0</span>
        <span className="text-center">10</span>
        <span className="text-right">20</span>
      </div>
      <ul className="mt-5 space-y-2 text-ui text-ink-soft">
        <li>
          <span className="text-success">●</span> C1 acquis · 13,20
        </li>
        <li>
          <span className="text-warning">◐</span> C3 compensé par l&apos;année
        </li>
      </ul>
    </div>
  )
}

function Tool() {
  return (
    <section id="calculator" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 sm:px-6">
      <div className="grid items-center gap-10 lg:grid-cols-[1fr_380px]">
        <div>
          <SectionHeading
            index="03"
            kicker="Tool"
            title="Grade calculator"
            lead="Built for computer science students at Université d'Artois: Licence L1–L3 and Master M1 with the official 2026–2027 rules, session 2 forecasts and automatic local save."
          />
          <Link
            href="/calculator"
            className="mt-8 inline-flex h-11 items-center gap-2 rounded-md bg-accent px-5 text-ui font-medium text-accent-foreground transition-colors duration-100 ease-out-ui hover:bg-accent-hover"
          >
            Open the calculator
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
        <VerdictPreview />
      </div>
    </section>
  )
}

function Contact() {
  return (
    <section id="contact" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 sm:px-6">
      <SectionHeading index="04" kicker="Contact" title="Let's connect" lead="Currently looking for an internship in Data Science. Feel free to reach out!" />
      <ul className="mt-10 max-w-2xl divide-y divide-hairline overflow-hidden rounded-lg border border-hairline bg-surface">
        {CONTACT_LINKS.map((link) => {
          const external = link.href.startsWith("http")
          return (
            <li key={link.label}>
              <a
                href={link.href}
                target={external ? "_blank" : undefined}
                rel={external ? "noopener noreferrer" : undefined}
                className="group flex items-center gap-4 px-5 py-4 transition-colors duration-100 ease-out-ui hover:bg-surface-sunk"
              >
                <link.icon className="size-5 shrink-0 text-primary" aria-hidden />
                <span className="font-medium text-ink">{link.label}</span>
                <span className="num ml-auto truncate text-caption text-ink-muted">{link.handle}</span>
                <ArrowUpRight className="size-4 shrink-0 text-ink-muted transition-colors duration-100 group-hover:text-accent" aria-hidden />
              </a>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

export default function Home() {
  return (
    <main>
      <Hero />
      <Skills />
      <Projects />
      <Tool />
      <Contact />
    </main>
  )
}
