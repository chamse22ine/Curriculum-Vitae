"use client"

import { Button } from "@/components/ui/button"
import { ChevronDown, Sparkles } from "lucide-react"
import { motion } from "framer-motion"
import { useLanguage } from "@/lib/language-context"
import { useEffect, useRef } from "react"
import { animate } from "animejs"

export function HeroSection() {
    const { t } = useLanguage()
    const titleRef = useRef<HTMLHeadingElement>(null)
    const subtitleRef = useRef<HTMLParagraphElement>(null)
    const descRef = useRef<HTMLParagraphElement>(null)
    const ctaRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        // Animate title letters with stagger
        if (titleRef.current) {
            const chars = titleRef.current.querySelectorAll(".char")
            animate(chars, {
                opacity: [0, 1],
                translateY: [40, 0],
                rotateX: [90, 0],
                delay: (_el: Element, i: number) => i * 40,
                duration: 1200,
                ease: "outExpo",
            } as Parameters<typeof animate>[1])
        }

        // Animate subtitle
        if (subtitleRef.current) {
            animate(subtitleRef.current, {
                opacity: [0, 1],
                translateY: [20, 0],
                duration: 800,
                delay: 600,
                ease: "outExpo",
            })
        }

        // Animate description
        if (descRef.current) {
            animate(descRef.current, {
                opacity: [0, 1],
                translateY: [20, 0],
                duration: 800,
                delay: 900,
                ease: "outExpo",
            })
        }

        // Animate CTA
        if (ctaRef.current) {
            animate(ctaRef.current, {
                opacity: [0, 1],
                translateY: [30, 0],
                scale: [0.9, 1],
                duration: 800,
                delay: 1100,
                ease: "outExpo",
            })
        }
    }, [])

    const scrollToAbout = () => {
        document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })
    }

    return (
        <section className="relative min-h-screen flex items-center justify-center px-4 z-10">
            {/* Decorative blobs */}
            <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-blob" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-blob" style={{ animationDelay: "2s" }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/5 rounded-full blur-3xl animate-blob" style={{ animationDelay: "4s" }} />

            <div className="max-w-5xl mx-auto text-center space-y-8">
                <div className="space-y-6">
                    <h1
                        ref={titleRef}
                        className="text-5xl md:text-8xl font-bold tracking-tight font-(family-name:--font-orbitron)"
                        style={{ perspective: "500px" }}
                    >
                        {t.hero.title.split(" ").map((word, wi) => (
                            <span key={wi} className="inline-block whitespace-nowrap">
                                {wi > 0 && <span className="inline-block">&nbsp;</span>}
                                {word.split("").map((char, ci) => (
                                    <span
                                        key={`${wi}-${ci}`}
                                        className="char inline-block gradient-text"
                                        style={{ opacity: 0 }}
                                    >
                                        {char}
                                    </span>
                                ))}
                            </span>
                        ))}
                    </h1>

                    <p
                        ref={subtitleRef}
                        className="text-xl md:text-2xl text-muted-foreground font-light flex items-center justify-center gap-2"
                        style={{ opacity: 0 }}
                    >
                        <Sparkles className="h-5 w-5 text-primary" />
                        {t.hero.subtitle}
                        <Sparkles className="h-5 w-5 text-secondary" />
                    </p>
                </div>

                <p
                    ref={descRef}
                    className="text-lg md:text-xl text-foreground/70 max-w-2xl mx-auto font-light leading-relaxed"
                    style={{ opacity: 0 }}
                >
                    {t.hero.description}
                </p>

                <div ref={ctaRef} style={{ opacity: 0 }} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Button
                        size="lg"
                        onClick={scrollToAbout}
                        className="bg-linear-to-r from-primary via-accent to-secondary text-white hover:shadow-lg hover:shadow-primary/25 transition-all duration-500 hover:scale-105 font-medium px-8 rounded-full"
                    >
                        {t.hero.exploreButton}
                        <ChevronDown className="ml-2 h-5 w-5" />
                    </Button>
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2, duration: 1, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2"
                >
                    <ChevronDown className="h-8 w-8 text-primary/50" />
                </motion.div>
            </div>
        </section>
    )
}
