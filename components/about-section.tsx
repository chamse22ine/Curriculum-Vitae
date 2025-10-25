"use client"

import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { useLanguage } from "@/lib/language-context"

export function AboutSection() {
    const { t } = useLanguage()
    const [ref, inView] = useInView({
        triggerOnce: true,
        threshold: 0.1,
    })

    const scrollToProjects = () => {
        document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" })
    }

    return (
        <section id="about" className="relative py-24 px-4 z-10" ref={ref}>
            <div className="max-w-6xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8 }}
                    className="glassmorphism rounded-2xl p-8 md:p-12 space-y-8"
                >
                    <div className="flex flex-col md:flex-row gap-8 items-center">
                        <div className="relative">
                            <div className="w-48 h-48 rounded-full bg-linear-to-br from-primary to-secondary p-1 neon-glow-violet">
                                <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                                    <div className="w-44 h-44 rounded-full bg-linear-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-6xl font-bold text-primary">
                                        CA
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 space-y-6 text-center md:text-left">
                            <h2 className="text-4xl md:text-5xl font-bold text-glow-violet">{t.about.title}</h2>

                            <p className="text-lg text-foreground/80 leading-relaxed">{t.about.description}</p>

                            <blockquote className="border-l-4 border-primary pl-4 italic text-xl text-secondary">
                                {t.about.quote}
                            </blockquote>

                            <Button
                                onClick={scrollToProjects}
                                className="neon-glow-cyan bg-secondary hover:bg-primary transition-all duration-300 text-white hover:text-black  font-medium"
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
