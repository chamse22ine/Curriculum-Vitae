"use client"

import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { ExternalLink, Brain, Plane, Gamepad2, Globe, Trophy, School } from "lucide-react"
import { useLanguage } from "@/lib/language-context"

const projectIcons = [Brain, Plane, Gamepad2, Globe, Trophy, School]
const projectGradients = [
    "from-c1 to-c1",
    "from-pink-500 to-rose-500",
    "from-cyan-500 to-blue-500",
    "from-amber-500 to-orange-500",
    "from-emerald-500 to-teal-500",
    "from-c5 to-c5",
]

export function ProjectsSection() {
    const { t } = useLanguage()
    const [ref, inView] = useInView({
        triggerOnce: true,
        threshold: 0.1,
    })

    return (
        <section id="projects" className="relative py-24 px-4 z-10" ref={ref}>
            <div className="h-px bg-hairline mb-24" />
            <div className="max-w-7xl mx-auto">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-4xl md:text-5xl font-bold text-center mb-16 text-primary font-display"
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
                                initial={{ opacity: 0, y: 40 }}
                                animate={inView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                className="bg-surface border border-hairline shadow-raise transition-colors duration-150 hover:border-hairline-strong rounded-2xl p-6 group cursor-pointer"
                            >
                                <div
                                    className={`w-14 h-14 rounded-xl bg-linear-to-br ${gradient} flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg`}
                                >
                                    <Icon className="h-7 w-7 text-white" />
                                </div>

                                <h3 className="text-xl font-bold mb-2 flex items-center gap-2 text-foreground">
                                    {project.title}
                                    <ExternalLink className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all duration-300 text-primary" />
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
