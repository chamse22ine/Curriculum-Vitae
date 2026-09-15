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
            <div className="bg-surface border border-hairline shadow-raise rounded-full p-1 flex gap-1">
                <Button
                    size="sm"
                    variant={language === "fr" ? "default" : "ghost"}
                    onClick={() => setLanguage("fr")}
                    className={`rounded-full px-4 transition-all duration-300 ${language === "fr"
                        ? "bg-linear-to-r from-primary to-accent text-white shadow-md"
                        : "text-muted-foreground hover:text-foreground hover:bg-primary/5"
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
                        ? "bg-linear-to-r from-secondary to-pink-400 text-white shadow-md"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/5"
                        }`}
                >
                    <Languages className="h-4 w-4 mr-1" />
                    EN
                </Button>
            </div>
        </motion.div>
    )
}
