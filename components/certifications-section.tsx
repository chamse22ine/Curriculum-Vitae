"use client"

import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { Award } from "lucide-react"
import { useLanguage } from "@/lib/language-context"

export function CertificationsSection() {
    const { t } = useLanguage()
    const [ref, inView] = useInView({
        triggerOnce: true,
        threshold: 0.1,
    })

    return (
        <section className="relative py-24 px-4 z-10" ref={ref}>
            <div className="max-w-4xl mx-auto">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-4xl md:text-5xl font-bold text-center mb-16 text-glow-cyan"
                >
                    {t.certifications.title}
                </motion.h2>

                <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-linear-to-b from-primary via-secondary to-primary" />

                    <div className="space-y-8">
                        {t.certifications.list.map((cert, index) => (
                            <motion.div
                                key={cert.title}
                                initial={{ opacity: 0, x: -50 }}
                                animate={inView ? { opacity: 1, x: 0 } : {}}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                className="relative pl-20"
                            >
                                <div className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-primary neon-glow-violet" />

                                <div className="glassmorphism rounded-xl p-6 hover:neon-glow-violet transition-all duration-300">
                                    <div className="flex items-start gap-4">
                                        <div className="p-2 rounded-lg bg-linear-to-br from-primary to-secondary">
                                            <Award className="h-5 w-5 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold mb-1">{cert.title}</h3>
                                            <p className="text-secondary font-medium">{cert.year}</p>
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
