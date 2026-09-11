"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import { animate } from "animejs"
import { ArrowRight, Calculator, Mail, Code, Database, Brain, Sparkles } from "lucide-react"
import { Github, Linkedin } from "@/components/brand-icons"
import { AnimatedBackground } from "@/components/animated-background"
import { ThemeToggle } from "@/components/theme-toggle"

// Pill component for floating badges
function Pill({
  title,
  subtitle,
  year,
  className = ""
}: {
  title: string
  subtitle?: string
  year?: number
  className?: string
}) {
  const currentYear = new Date().getFullYear()
  const yearsAgo = year ? currentYear - year : null

  return (
    <div className={`bg-surface border border-hairline shadow-float px-4 py-2.5 rounded-full ${className}`}>
      <div className="flex flex-col">
        {subtitle && (
          <span className="text-[10px] text-muted-foreground font-medium">{subtitle}</span>
        )}
        <span className="text-xs font-bold text-primary">{title}</span>
        {yearsAgo !== null && (
          <span className="text-[10px] text-muted-foreground text-right">
            {yearsAgo === 0 ? "This year" : `${yearsAgo} year${yearsAgo > 1 ? "s" : ""} ago`}
          </span>
        )}
      </div>
    </div>
  )
}

// Avatar placeholder with floating pills
function AvatarWithPills() {
  return (
    <div className="relative w-[320px] h-[400px] md:w-[380px] md:h-[480px]">
      {/* Avatar placeholder */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-48 h-48 md:w-64 md:h-64 rounded-full bg-gradient-to-br from-primary/20 via-accent/20 to-secondary/20 border-2 border-primary/30 flex items-center justify-center overflow-hidden shadow-2xl">
          {/* Placeholder silhouette */}
          <div className="w-full h-full bg-gradient-to-b from-transparent via-primary/10 to-primary/30 flex items-end justify-center">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-primary/40 to-accent/40 -mb-8" />
          </div>
        </div>
      </div>

      {/* Floating pills */}
      <Pill
        title="Computer Science"
        subtitle="Student"
        year={2022}
        className="absolute top-12 -left-4 md:top-16 md:-left-8 animate-float-pill"
      />
      <Pill
        title="Data Science"
        subtitle="Passionate about"
        className="absolute top-32 -right-4 md:top-40 md:-right-12 animate-float-pill-delayed"
      />
      <Pill
        title="First Project"
        year={2020}
        className="absolute bottom-32 -left-8 md:bottom-40 md:-left-16 animate-float-pill-slow"
      />
      <Pill
        title="Web Development"
        subtitle="Building with"
        className="absolute bottom-16 right-0 md:bottom-20 md:-right-8 animate-float-pill-delayed-slow"
      />
    </div>
  )
}

// Main Hero Section
function HeroSection() {
  const titleRef = useRef<HTMLDivElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const bigTextRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    if (titleRef.current) {
      const chars = titleRef.current.querySelectorAll(".char")
      animate(chars, {
        opacity: [0, 1],
        translateY: [30, 0],
        delay: (_el?: unknown, i?: number) => (i ?? 0) * 35,
        duration: 800,
        easing: "easeOutExpo",
      })
    }

    if (subtitleRef.current) {
      animate(subtitleRef.current, {
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 800,
        delay: 400,
        easing: "easeOutExpo",
      })
    }

    if (bigTextRef.current) {
      animate(bigTextRef.current, {
        opacity: [0, 1],
        translateY: [30, 0],
        duration: 1000,
        delay: 800,
        easing: "easeOutExpo",
      })
    }
  }, [])

  const name = "Chams."
  const title = "Computer Science Student."

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 py-20">
      <div className="max-w-7xl mx-auto w-full">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8">
          {/* Text content */}
          <div className="flex-1 space-y-6 text-center lg:text-left">
            <div ref={titleRef} className="space-y-1">
              <p className="text-lg md:text-xl text-muted-foreground font-light">
                {"Hey,".split("").map((char, i) => (
                  <span key={i} className="char inline-block" style={{ opacity: 0 }}>
                    {char}
                  </span>
                ))}
              </p>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black">
                {"I'm ".split("").map((char, i) => (
                  <span key={i} className="char inline-block text-foreground" style={{ opacity: 0 }}>
                    {char === " " ? "\u00A0" : char}
                  </span>
                ))}
                {name.split("").map((char, i) => (
                  <span key={`name-${i}`} className="char inline-block text-primary" style={{ opacity: 0 }}>
                    {char}
                  </span>
                ))}
              </h1>
              <p
                ref={subtitleRef}
                className="text-lg md:text-xl text-muted-foreground"
                style={{ opacity: 0 }}
              >
                A Web & Mobile
              </p>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black">
                {title.split("").map((char, i) => (
                  <span key={i} className="char inline-block text-primary" style={{ opacity: 0 }}>
                    {char === " " ? "\u00A0" : char}
                  </span>
                ))}
              </h2>
              <p className="text-base md:text-lg text-muted-foreground italic font-light">
                Augmented with AI.
              </p>
            </div>

            <p
              ref={bigTextRef}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground/90 pt-8"
              style={{ opacity: 0 }}
            >
              I build{" "}
              <span className="text-primary">apps.</span>
            </p>
          </div>

          {/* Avatar with pills */}
          <div className="flex-shrink-0">
            <AvatarWithPills />
          </div>
        </div>
      </div>
    </section>
  )
}

// Skewed section with gradient background
function BuilderSection() {
  return (
    <section className="relative py-24 -my-12 overflow-hidden" style={{ transform: "skewY(2deg)" }}>
      <div className="absolute inset-0 bg-primary" />

      <div className="relative max-w-6xl mx-auto px-4" style={{ transform: "skewY(-2deg)" }}>
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-6 text-on-primary">
            <h2 className="text-4xl md:text-5xl font-black">
              You dream it.
              <br />
              I craft it.
            </h2>
            <p className="text-lg text-on-primary/70 max-w-lg">
              Passionate about building elegant solutions. From web applications to data pipelines,
              I love turning ideas into reality with clean code and modern technologies.
            </p>
            <Link
              href="/calculator"
              className="inline-flex items-center gap-2 bg-on-primary text-primary px-6 py-3 rounded-full font-semibold hover:bg-on-primary/90 transition-all hover:scale-105"
            >
              <Calculator className="w-5 h-5" />
              Grade Calculator
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mini app preview */}
          <div className="flex-shrink-0">
            <div className="w-64 h-80 bg-on-primary/10 rounded-3xl border border-on-primary/20 p-4 shadow-2xl">
              <div className="w-full h-full bg-on-primary/5 rounded-2xl flex flex-col items-center justify-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-on-primary/30 to-on-primary/10 flex items-center justify-center">
                  <Code className="w-8 h-8 text-on-primary" />
                </div>
                <p className="text-on-primary/80 text-sm font-medium">Projects & Apps</p>
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-on-primary/10 rounded-full text-xs text-on-primary/70">React</span>
                  <span className="px-3 py-1 bg-on-primary/10 rounded-full text-xs text-on-primary/70">Next.js</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// Skills/Interests Section
function SkillsSection() {
  const skills = [
    { icon: Code, title: "Web Development", desc: "React, Next.js, TypeScript" },
    { icon: Database, title: "Data Science", desc: "Python, SQL, Machine Learning" },
    { icon: Brain, title: "AI & MLOps", desc: "Azure, Databricks, Models" },
  ]

  return (
    <section className="py-32 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black mb-4">
            What I <span className="text-primary">love</span> doing
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Exploring the intersection of software engineering and data science
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {skills.map((skill, i) => (
            <div
              key={i}
              className="bg-surface border border-hairline shadow-raise transition-colors duration-150 hover:border-hairline-strong rounded-2xl p-8 text-center group"
            >
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <skill.icon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">{skill.title}</h3>
              <p className="text-muted-foreground text-sm">{skill.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Contact Section
function ContactSection() {
  const links = [
    { icon: Github, href: "https://github.com/chamse22ine", label: "GitHub" },
    { icon: Linkedin, href: "https://linkedin.com/in/chamseddine-adaadour", label: "LinkedIn" },
    { icon: Mail, href: "mailto:contact@chams.dev", label: "Email" },
  ]

  return (
    <section className="py-24 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-black mb-4">
          Let&apos;s <span className="text-primary">connect</span>
        </h2>
        <p className="text-muted-foreground mb-12 max-w-lg mx-auto">
          Currently looking for an internship in Data Science.
          Feel free to reach out!
        </p>

        <div className="flex justify-center gap-4 flex-wrap">
          {links.map((link, i) => (
            <a
              key={i}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-surface border border-hairline shadow-raise transition-colors duration-150 hover:border-hairline-strong px-6 py-4 rounded-2xl flex items-center gap-3 group"
            >
              <link.icon className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
              <span className="font-medium">{link.label}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

// Footer
function Footer() {
  return (
    <footer className="py-8 px-4 border-t border-border/50">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Chamseddine Adaadour
        </p>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="w-4 h-4 text-primary" />
          Built with Next.js & Tailwind
        </div>
      </div>
    </footer>
  )
}

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <AnimatedBackground />
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <div className="relative z-10">
        <HeroSection />
        <BuilderSection />
        <SkillsSection />
        <ContactSection />
        <Footer />
      </div>
    </main>
  )
}