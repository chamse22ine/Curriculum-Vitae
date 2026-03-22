"use client"

import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { useLanguage } from "@/lib/language-context"
import { useEffect, useRef } from "react"
import { animate } from "animejs"

export function AboutSection() {
    const { t } = useLanguage()
    const [ref, inView] = useInView({
        triggerOnce: true,
        threshold: 0.1,
    })
    const avatarRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (inView && avatarRef.current) {
            animate(avatarRef.current, {
                scale: [0, 1],
                rotate: [180, 0],
                duration: 1000,
                ease: "outElastic(1, 0.5)",
            })
        }
    }, [inView])

    const scrollToProjects = () => {
        document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" })
    }

    return (
        <section id="about" className="relative py-24 px-4 z-10" ref={ref}>
            <div className="section-divider mb-24" />
            <div className="max-w-6xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8 }}
                    className="glass-card rounded-3xl p-8 md:p-12 space-y-8"
                >
                    <div className="flex flex-col md:flex-row gap-8 items-center">
                        <div className="relative" ref={avatarRef} style={{ transform: "scale(0)" }}>
                            <div className="w-48 h-48 rounded-full bg-linear-to-br from-primary via-accent to-secondary p-1 soft-glow">
                                <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                                    <div className="w-44 h-44 rounded-full bg-linear-to-br from-primary/10 to-secondary/10 flex items-center justify-center text-6xl font-bold gradient-text font-(family-name:--font-orbitron)">
                                        CA
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 space-y-6 text-center md:text-left">
                            <h2 className="text-4xl md:text-5xl font-bold gradient-text font-(family-name:--font-orbitron)">{t.about.title}</h2>

                            <p className="text-lg text-foreground/70 leading-relaxed">{t.about.description}</p>

                            {t.about.quote && (
                                <blockquote className="border-l-4 border-primary/40 pl-4 italic text-xl text-primary/70">
                                    {t.about.quote}
                                </blockquote>
                            )}

                            <Button
                                onClick={scrollToProjects}
                                className="bg-linear-to-r from-secondary to-primary text-white hover:shadow-lg hover:shadow-secondary/25 transition-all duration-500 hover:scale-105 font-medium rounded-full"
                            >
                                {t.about.projectsButton}
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
