"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { translations, type Language } from "./translations"

interface LanguageContextType {
    language: Language
    setLanguage: (lang: Language) => void
    t: typeof translations.fr
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<Language>(() => {
        if (typeof window === "undefined") return "fr"
        const savedLanguage = localStorage.getItem("language") as Language | null
        if (savedLanguage === "fr" || savedLanguage === "en") return savedLanguage
        return "fr"
    })

    const setLanguage = (lang: Language) => {
        setLanguageState(lang)
        localStorage.setItem("language", lang)
    }

    const t = translations[language]

    return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
    const context = useContext(LanguageContext)
    if (context === undefined) {
        throw new Error("useLanguage must be used within a LanguageProvider")
    }
    return context
}
