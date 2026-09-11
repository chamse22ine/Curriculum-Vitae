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
            gradient: "from-c1 to-c1",
            bgLight: "bg-surface-sunk",
            borderColor: "border-hairline",
            badgeBg: "bg-surface-sunk hover:bg-surface border-hairline hover:border-primary",
        },
        {
            title: t.skills.frameworks,
            icon: Cpu,
            skills: t.skills.skillsList.frameworks,
            gradient: "from-pink-500 to-rose-500",
            bgLight: "bg-pink-50",
            borderColor: "border-pink-200",
            badgeBg: "bg-pink-50 hover:bg-pink-100 border-pink-200 hover:border-pink-400",
        },
        {
            title: t.skills.dataScience,
            icon: Database,
            skills: t.skills.skillsList.dataScience,
            gradient: "from-cyan-500 to-blue-500",
            bgLight: "bg-cyan-50",
            borderColor: "border-cyan-200",
            badgeBg: "bg-cyan-50 hover:bg-cyan-100 border-cyan-200 hover:border-cyan-400",
        },
        {
            title: t.skills.other,
            icon: Cloud,
            skills: t.skills.skillsList.other,
            gradient: "from-amber-500 to-orange-500",
            bgLight: "bg-amber-50",
            borderColor: "border-amber-200",
            badgeBg: "bg-amber-50 hover:bg-amber-100 border-amber-200 hover:border-amber-400",
        },
    ]

    return (
        <section className="relative py-24 px-4 z-10" ref={ref}>
            <div className="h-px bg-hairline mb-24" />
            <div className="max-w-7xl mx-auto">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-4xl md:text-5xl font-bold text-center mb-16 text-primary font-display"
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
                                transition={{ duration: 0.6, delay: index * 0.15 }}
                                className="bg-surface border border-hairline shadow-raise transition-colors duration-150 hover:border-hairline-strong rounded-2xl p-6 group"
                            >
                                <div className="flex items-center gap-4 mb-5">
                                    <div className={`p-3 rounded-xl bg-linear-to-br ${category.gradient} shadow-lg`}>
                                        <category.icon className="h-6 w-6 text-white" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-foreground">{category.title}</h3>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {category.skills.map((skill, skillIdx) => (
                                        <Tooltip key={skill}>
                                            <TooltipTrigger asChild>
                                                <motion.span
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={inView ? { opacity: 1, scale: 1 } : {}}
                                                    transition={{ duration: 0.4, delay: index * 0.15 + skillIdx * 0.05 }}
                                                    className={`px-4 py-1.5 rounded-full text-sm font-medium border ${category.badgeBg} hover:scale-105 transition-all duration-300 cursor-help text-foreground/80`}
                                                >
                                                    {skill}
                                                </motion.span>
                                            </TooltipTrigger>
                                            <TooltipContent
                                                side="top"
                                                className="bg-surface border border-hairline shadow-raise border-primary/20 text-foreground"
                                            >
                                                <p className="text-sm">
                                                    {t.skills.skillsDescriptions?.[skill] || `${skill}`}
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
