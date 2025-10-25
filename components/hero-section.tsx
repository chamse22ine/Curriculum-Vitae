"use client"

import { Button } from "@/components/ui/button"
import { ChevronDown } from "lucide-react"
import { motion } from "framer-motion"
import { useLanguage } from "@/lib/language-context"

export function HeroSection() {
    const { t } = useLanguage()

    const scrollToAbout = () => {
        document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })
    }

    return (
        <section className="relative min-h-screen flex items-center justify-center px-4 z-10">
            <div className="max-w-5xl mx-auto text-center space-y-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="space-y-4"
                >
                    <h1 className="text-5xl md:text-8xl font-bold tracking-tight">
                        <span className="text-glow-violet bg-linear-to-r from-primary via-secondary to-primary bg-clip-text text-transparent animate-pulse">
                            {t.hero.title}
                        </span>
                    </h1>
                    <p className="text-xl md:text-2xl text-muted-foreground font-light">{t.hero.subtitle}</p>
                </motion.div>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    className="text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto font-light leading-relaxed"
                >
                    {t.hero.description}
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                >
                    <Button
                        size="lg"
                        onClick={scrollToAbout}
                        className="neon-glow-violet hover:neon-glow-cyan transition-all duration-300 hover:bg-primary bg-secondary text-white hover:text-black font-medium px-8"
                    >
                        {t.hero.exploreButton}
                        <ChevronDown className="ml-2 h-5 w-5" />
                    </Button>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 1, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2"
                >
                    <ChevronDown className="h-8 w-8 text-primary" />
                </motion.div>
            </div>
        </section>
    )
}
