"use client"

import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { Award } from "lucide-react"
import { useLanguage } from "@/lib/language-context"

const dotColors = [
    "bg-c1",
    "bg-pink-500",
    "bg-cyan-500",
    "bg-amber-500",
]

export function CertificationsSection() {
    const { t } = useLanguage()
    const [ref, inView] = useInView({
        triggerOnce: true,
        threshold: 0.1,
    })

    return (
        <section className="relative py-24 px-4 z-10" ref={ref}>
            <div className="h-px bg-hairline mb-24" />
            <div className="max-w-4xl mx-auto">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-4xl md:text-5xl font-bold text-center mb-16 text-primary font-display"
                >
                    {t.certifications.title}
                </motion.h2>

                <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-linear-to-b from-primary/40 via-secondary/40 to-accent/40" />

                    <div className="space-y-6">
                        {t.certifications.list.map((cert, index) => (
                            <motion.div
                                key={cert.title}
                                initial={{ opacity: 0, x: -50 }}
                                animate={inView ? { opacity: 1, x: 0 } : {}}
                                transition={{ duration: 0.6, delay: index * 0.15 }}
                                className="relative pl-20"
                            >
                                <div className={`absolute left-[22px] top-1/2 -translate-y-1/2 w-5 h-5 rounded-full ${dotColors[index % dotColors.length]} shadow-lg ring-4 ring-background`} />

                                <div className="bg-surface border border-hairline shadow-raise transition-colors duration-150 hover:border-hairline-strong rounded-2xl p-6">
                                    <div className="flex items-start gap-4">
                                        <div className="p-2.5 rounded-xl bg-linear-to-br from-primary/10 to-secondary/10">
                                            <Award className="h-5 w-5 text-primary" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-foreground mb-1">{cert.title}</h3>
                                            <p className="text-sm font-medium text-primary/70">{cert.year}</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
