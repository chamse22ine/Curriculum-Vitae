"use client"

import dynamic from "next/dynamic"
import { AnimatedBackground } from "@/components/animated-background"

// Skeleton loader partagé
const SectionLoader = () => (
  <section className="min-h-[50vh] flex items-center justify-center">
    <div className="animate-pulse space-y-4 w-full max-w-4xl px-4">
      <div className="h-8 bg-primary/10 rounded w-3/4"></div>
      <div className="h-4 bg-primary/10 rounded w-full"></div>
      <div className="h-4 bg-primary/10 rounded w-5/6"></div>
    </div>
  </section>
)

// Composants dynamiques avec loader
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

const WeatherWidget = dynamic(() => import("@/components/weather-widget").then((m) => ({ default: m.WeatherWidget })), {
  ssr: false,
})

const LanguageSwitcher = dynamic(() => import("@/components/language-switcher").then((m) => ({ default: m.LanguageSwitcher })), {
  ssr: false,
})

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <AnimatedBackground />

      <div className="hidden lg:block relative top-6 left-6 z-50 max-w-xs">
        <WeatherWidget />
      </div>

      <div className=" sm:fixed relative top-6 right-6 sm:z-50 flex flex-col gap-4 items-end">
        <LanguageSwitcher />
        <div className="lg:hidden max-w-xs w-full">
          <WeatherWidget />
        </div>
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
