"use client"

import dynamic from "next/dynamic"
import { AnimatedBackground } from "@/components/animated-background"
import { Toaster } from "sonner"

const SectionLoader = () => (
  <section className="min-h-[50vh] flex items-center justify-center">
    <div className="animate-pulse space-y-4 w-full max-w-4xl px-4">
      <div className="h-8 bg-primary/5 rounded-xl w-3/4"></div>
      <div className="h-4 bg-primary/5 rounded-xl w-full"></div>
      <div className="h-4 bg-primary/5 rounded-xl w-5/6"></div>
    </div>
  </section>
)

const HeroSection = dynamic(() => import("@/components/hero-section").then((m) => ({ default: m.HeroSection })), {
  ssr: false,
  loading: SectionLoader,
})

const AboutSection = dynamic(() => import("@/components/about-section").then((m) => ({ default: m.AboutSection })), {
  ssr: false,
  loading: SectionLoader,
})

const SkillsSection = dynamic(() => import("@/components/skills-section").then((m) => ({ default: m.SkillsSection })), {
  ssr: false,
  loading: SectionLoader,
})

const ProjectsSection = dynamic(() => import("@/components/projects-section").then((m) => ({ default: m.ProjectsSection })), {
  ssr: false,
  loading: SectionLoader,
})

const CertificationsSection = dynamic(() => import("@/components/certifications-section").then((m) => ({ default: m.CertificationsSection })), {
  ssr: false,
  loading: SectionLoader,
})

const ContactSection = dynamic(() => import("@/components/contact-section").then((m) => ({ default: m.ContactSection })), {
  ssr: false,
  loading: SectionLoader,
})

const Footer = dynamic(() => import("@/components/footer").then((m) => ({ default: m.Footer })), {
  ssr: false,
})

const LanguageSwitcher = dynamic(() => import("@/components/language-switcher").then((m) => ({ default: m.LanguageSwitcher })), {
  ssr: false,
})

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <AnimatedBackground />
      <Toaster position="top-right" />

      <div className="sm:fixed relative top-6 right-6 sm:z-50 flex flex-col gap-4 items-end">
        <LanguageSwitcher />
      </div>

      <HeroSection />
      <AboutSection />
      <SkillsSection />
      <ProjectsSection />
      <CertificationsSection />
      <ContactSection />
      <Footer />
    </main>
  )
}
