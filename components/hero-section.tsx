"use client"

import { Button } from "@/components/ui/button"
import { ChevronDown } from "lucide-react"
import { useLanguage } from "@/lib/language-context"

export function HeroSection() {
    const { t } = useLanguage()

    const scrollToAbout = () => {
        document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })
    }

    return (
        <section className="relative flex min-h-screen items-center justify-center px-4">
            <div className="mx-auto max-w-5xl space-y-8 text-center">
                <div className="space-y-6">
                    <h1 className="font-display text-5xl tracking-tight text-ink md:text-8xl">{t.hero.title}</h1>
                    <p className="text-xl text-ink-muted md:text-2xl">{t.hero.subtitle}</p>
                </div>

                <p className="mx-auto max-w-2xl text-lg leading-relaxed text-ink-soft md:text-xl">{t.hero.description}</p>

                <div className="flex justify-center">
                    <Button size="lg" onClick={scrollToAbout} className="bg-accent px-8 text-accent-foreground hover:bg-accent-hover">
                        {t.hero.exploreButton}
                        <ChevronDown className="ml-2 h-5 w-5" />
                    </Button>
                </div>
            </div>
        </section>
    )
}
