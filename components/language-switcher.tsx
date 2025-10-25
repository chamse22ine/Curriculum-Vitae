"use client"

import { Button } from "@/components/ui/button"
import { useLanguage } from "@/lib/language-context"
import { Languages } from "lucide-react"
import { motion } from "framer-motion"

export function LanguageSwitcher() {
    const { language, setLanguage } = useLanguage()

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
        >
            <div className="glassmorphism rounded-full p-1 flex gap-1 border border-primary/20">
                <Button
                    size="sm"
                    variant={language === "fr" ? "default" : "ghost"}
                    onClick={() => setLanguage("fr")}
                    className={`rounded-full px-4 transition-all duration-300 ${language === "fr"
                        ? "bg-primary text-black neon-glow-violet"
                        : "text-muted-foreground hover:text-foreground hover:bg-primary/10"
                        }`}
                >
                    <Languages className="h-4 w-4 mr-1" />
                    FR
                </Button>
                <Button
                    size="sm"
                    variant={language === "en" ? "default" : "ghost"}
                    onClick={() => setLanguage("en")}
                    className={`rounded-full px-4 transition-all duration-300 ${language === "en"
                        ? "text-black neon-glow-cyan"
                        : " hover:text-foreground hover:bg-secondary/10 "
                        }`}
                >
                    <Languages className="h-4 w-4 mr-1" />
                    EN
                </Button>
            </div>
        </motion.div>
    )
}
