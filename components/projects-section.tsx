"use client"

import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { ExternalLink, Brain, Plane, Gamepad2, Globe, Trophy, School } from "lucide-react"
import { useLanguage } from "@/lib/language-context"

const projectIcons = [Brain, Plane, Gamepad2, Globe, Trophy, School]
const projectGradients = [
    "from-primary to-primary/50",
    "from-secondary to-secondary/50",
    "from-primary to-secondary",
    "from-secondary to-primary",
    "from-primary/80 to-secondary/80",
    "from-secondary/80 to-primary/80",
]

export function ProjectsSection() {
    const { t } = useLanguage()
    const [ref, inView] = useInView({
        triggerOnce: true,
        threshold: 0.1,
    })

    return (
        <section id="projects" className="relative py-24 px-4 z-10" ref={ref}>
            <div className="max-w-7xl mx-auto">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-4xl md:text-5xl font-bold text-center mb-16 text-glow-violet"
                >
                    {t.projects.title}
                </motion.h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {t.projects.list.map((project, index) => {
                        const Icon = projectIcons[index]
                        const gradient = projectGradients[index]

                        return (
                            <motion.div
                                key={project.title}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={inView ? { opacity: 1, scale: 1 } : {}}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="glassmorphism rounded-xl p-6 hover:neon-glow-cyan transition-all duration-300 group cursor-pointer hover:-translate-y-2"
                            >
                                <div
                                    className={`w-16 h-16 rounded-lg bg-linear-to-br ${gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                                >
                                    <Icon className="h-8 w-8 text-white" />
                                </div>

                                <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                                    {project.title}
                                    <ExternalLink className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </h3>

                                <p className="text-muted-foreground leading-relaxed">{project.description}</p>
                            </motion.div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
