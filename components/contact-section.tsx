"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { Mail, Send, CheckCircle2 } from "lucide-react"
import { Linkedin } from "@/components/brand-icons"
import { useState } from "react"
import { toast } from "sonner"
import { useLanguage } from "@/lib/language-context"
import confetti from "canvas-confetti"

export function ContactSection() {
    const { t } = useLanguage()
    const [ref, inView] = useInView({
        triggerOnce: true,
        threshold: 0.1,
    })

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
    })
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            })

            const result = await res.json()

            if (result.success) {
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ["#6366f1", "#ec4899", "#8b5cf6", "#06b6d4"]
                })

                toast.success(
                    <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-emerald-500 animate-bounce" />
                        <div>
                            <p className="font-semibold">Message envoyé !</p>
                            <p className="text-sm text-muted-foreground">
                                Je vous répondrai très bientôt.
                            </p>
                        </div>
                    </div>,
                    {
                        duration: 5000,
                        style: {
                            background: "#ffffff",
                            border: "2px solid #6366f1",
                            boxShadow: "0 8px 32px rgba(99, 102, 241, 0.15)"
                        },
                    }
                )

                setFormData({ name: "", email: "", subject: "", message: "" })
            } else {
                toast.error("Erreur lors de l'envoi.")
            }
        } catch {
            toast.error("Une erreur inattendue s'est produite.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <section className="relative py-24 px-4 z-10" ref={ref}>
            <div className="section-divider mb-24" />
            <div className="max-w-4xl mx-auto">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-4xl md:text-5xl font-bold text-center mb-16 gradient-text font-(family-name:--font-orbitron)"
                >
                    {t.contact.title}
                </motion.h2>

                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8 }}
                    className="glass-card rounded-3xl p-8 md:p-12 space-y-8"
                >
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a
                            href="mailto:contact@chams.dev"
                            className="flex items-center gap-2 px-6 py-3 rounded-full bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 hover:border-indigo-400 transition-all duration-300 text-foreground hover:scale-105"
                        >
                            <Mail className="h-5 w-5 text-primary" />
                            <span>contact@chams.dev</span>
                        </a>

                        <a
                            href="https://www.linkedin.com/in/chamsedd1ne/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-6 py-3 rounded-full bg-pink-50 hover:bg-pink-100 border border-pink-200 hover:border-pink-400 transition-all duration-300 text-foreground hover:scale-105"
                        >
                            <Linkedin className="h-5 w-5 text-secondary" />
                            <span>LinkedIn</span>
                        </a>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <Input
                                placeholder={t.contact.namePlaceholder}
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="bg-white/50 border-border/50 focus:border-primary focus:ring-primary/20 text-foreground placeholder:text-muted-foreground rounded-xl"
                                required
                            />
                        </div>

                        <div>
                            <Input
                                type="email"
                                placeholder={t.contact.emailPlaceholder}
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="bg-white/50 border-border/50 focus:border-primary focus:ring-primary/20 text-foreground placeholder:text-muted-foreground rounded-xl"
                                required
                            />
                        </div>

                        <div>
                            <Input
                                placeholder={t.contact.subjectPlaceholder}
                                value={formData.subject}
                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                className="bg-white/50 border-border/50 focus:border-primary focus:ring-primary/20 text-foreground placeholder:text-muted-foreground rounded-xl"
                                required
                            />
                        </div>

                        <div>
                            <Textarea
                                placeholder={t.contact.messagePlaceholder}
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                rows={6}
                                className="bg-white/50 border-border/50 focus:border-primary focus:ring-primary/20 text-foreground placeholder:text-muted-foreground resize-none rounded-xl"
                                required
                            />
                        </div>

                        <Button
                            type="submit"
                            size="lg"
                            className="w-full bg-linear-to-r from-primary via-accent to-secondary text-white hover:shadow-lg hover:shadow-primary/25 transition-all duration-500 hover:scale-[1.02] font-medium rounded-xl"
                            disabled={isSubmitting}
                        >
                            <Send className="mr-2 h-5 w-5" />
                            {isSubmitting ? "Envoi en cours..." : "Envoyer le message"}
                        </Button>
                    </form>
                </motion.div>
            </div>
        </section>
    )
}
