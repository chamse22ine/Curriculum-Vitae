"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { Mail, Linkedin, Send, CheckCircle2 } from "lucide-react"
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
                // 🎉 Animation confetti
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ["#8b5cf6", "#06b6d4", "#10b981"]
                })

                // ✅ Toast stylisé
                toast.success(
                    <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-500 animate-bounce" />
                        <div>
                            <p className="font-semibold">Message envoyé ! 🎉</p>
                            <p className="text-sm text-muted-foreground">
                                Je vous répondrai très bientôt.
                            </p>
                        </div>
                    </div>,
                    {
                        duration: 5000,
                        style: {
                            background: "hsl(var(--background))",
                            border: "2px solid hsl(var(--primary))",
                            boxShadow: "0 0 20px rgba(139, 92, 246, 0.3)"
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
            <div className="max-w-4xl mx-auto">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-4xl md:text-5xl font-bold text-center mb-16 text-glow-violet"
                >
                    {t.contact.title}
                </motion.h2>

                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8 }}
                    className="glassmorphism rounded-2xl p-8 md:p-12 space-y-8"
                >
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a
                            href="mailto:contact@chams.dev"
                            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-muted hover:bg-primary/20 border border-primary/30 hover:border-primary transition-all duration-300"
                        >
                            <Mail className="h-5 w-5 text-primary" />
                            <span>contact@chams.dev</span>
                        </a>

                        <a
                            href="https://www.linkedin.com/in/chamsedd1ne/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-muted hover:bg-primary/20 border border-primary/30 hover:border-primary transition-all duration-300"
                        >
                            <Linkedin className="h-5 w-5 text-primary" />
                            <span>LinkedIn</span>
                        </a>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <Input
                                placeholder={t.contact.namePlaceholder}
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="bg-muted border-primary/30 focus:border-primary text-foreground placeholder:text-muted-foreground"
                                required
                            />
                        </div>

                        <div>
                            <Input
                                type="email"
                                placeholder={t.contact.emailPlaceholder}
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="bg-muted border-primary/30 focus:border-primary text-foreground placeholder:text-muted-foreground"
                                required
                            />
                        </div>

                        <div>
                            <Input
                                placeholder={t.contact.subjectPlaceholder}
                                value={formData.subject}
                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                className="bg-muted border-primary/30 focus:border-primary text-foreground placeholder:text-muted-foreground"
                                required
                            />
                        </div>

                        <div>
                            <Textarea
                                placeholder={t.contact.messagePlaceholder}
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                rows={6}
                                className="bg-muted border-primary/30 focus:border-primary text-foreground placeholder:text-muted-foreground resize-none"
                                required
                            />
                        </div>

                        <Button
                            type="submit"
                            size="lg"
                            className="w-full neon-glow-violet hover:neon-glow-cyan hover:bg-primary bg-secondary transition-all duration-300 text-white hover:text-black font-medium"
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
