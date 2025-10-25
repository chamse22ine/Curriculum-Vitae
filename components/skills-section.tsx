"use client"

import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { Code2, Database, Cloud, Cpu } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

export function SkillsSection() {
    const { t } = useLanguage()
    const [ref, inView] = useInView({
        triggerOnce: true,
        threshold: 0.1,
    })

    const skillCategories = [
        {
            title: t.skills.languages,
            icon: Code2,
            skills: t.skills.skillsList.languages,
            color: "from-primary to-primary/50",
        },
        {
            title: t.skills.frameworks,
            icon: Cpu,
            skills: t.skills.skillsList.frameworks,
            color: "from-secondary to-secondary/50",
        },
        {
            title: t.skills.dataScience,
            icon: Database,
            skills: t.skills.skillsList.dataScience,
            color: "from-primary to-secondary",
        },
        {
            title: t.skills.other,
            icon: Cloud,
            skills: t.skills.skillsList.other,
            color: "from-secondary to-primary",
        },
    ]

    return (
        <section className="relative py-24 px-4 z-10" ref={ref}>
            <div className="max-w-7xl mx-auto">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-4xl md:text-5xl font-bold text-center mb-16 text-glow-cyan"
                >
                    {t.skills.title}
                </motion.h2>

                <TooltipProvider delayDuration={200}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {skillCategories.map((category, index) => (
                            <motion.div
                                key={category.title}
                                initial={{ opacity: 0, y: 50 }}
                                animate={inView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                className="glassmorphism rounded-xl p-6 hover:neon-glow-violet transition-all duration-300 group"
                            >
                                <div className="flex items-center gap-4 mb-4">
                                    <div className={`p-3 rounded-lg bg-linear-to-br ${category.color}`}>
                                        <category.icon className="h-6 w-6 text-white" />
                                    </div>
                                    <h3 className="text-2xl font-bold">{category.title}</h3>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {category.skills.map((skill) => (
                                        <Tooltip key={skill}>
                                            <TooltipTrigger asChild>
                                                <span className="px-3 py-1 rounded-full bg-muted text-sm font-medium border border-primary/30 hover:border-primary hover:bg-primary/10 hover:scale-105 transition-all duration-300 cursor-help">
                                                    {skill}
                                                </span>
                                            </TooltipTrigger>
                                            <TooltipContent
                                                side="top"
                                                className="max-w-xs glassmorphism border-primary/30 text-white"
                                            >
                                                <p className="text-sm">
                                                    {t.skills.skillsDescriptions?.[skill] || `Compétence en ${skill}`}
                                                </p>
                                            </TooltipContent>
                                        </Tooltip>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </TooltipProvider>
            </div>
        </section>
    )
}
