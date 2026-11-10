"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useSyncExternalStore, type ReactNode } from "react"
import { usePathname } from "next/navigation"
import type { Lang } from "@/content/types"

export type Language = Lang

/** Clé localStorage (inchangée depuis la première version du site) */
export const LANGUAGE_KEY = "language"

/** Pages dont le contenu suit la langue choisie. /calculator et /hours restent en français. */
const LOCALIZED_PATHS = new Set(["/"])

/**
 * Script inline exécuté avant le premier rendu : pose data-lang (et lang sur les pages localisées)
 * sur <html> depuis localStorage, pour que le CSS affiche la bonne langue sans flash.
 */
export const LANGUAGE_BOOT_SCRIPT = `(function(){try{var l=localStorage.getItem(${JSON.stringify(LANGUAGE_KEY)})==="en"?"en":"fr",d=document.documentElement;d.setAttribute("data-lang",l);if(${JSON.stringify([...LOCALIZED_PATHS])}.indexOf(location.pathname)>-1)d.setAttribute("lang",l)}catch(e){}})()`

interface LanguageContextType {
    language: Language
    setLanguage: (lang: Language) => void
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// La source de vérité est l'attribut data-lang de <html> : le script de démarrage l'initialise,
// setLanguage le modifie, et React s'y abonne.
const listeners = new Set<() => void>()
const subscribe = (cb: () => void) => {
    listeners.add(cb)
    return () => {
        listeners.delete(cb)
    }
}
const readLanguage = (): Language => (document.documentElement.getAttribute("data-lang") === "en" ? "en" : "fr")
const serverLanguage = (): Language => "fr"

export function LanguageProvider({ children }: { children: ReactNode }) {
    const language = useSyncExternalStore(subscribe, readLanguage, serverLanguage)
    const pathname = usePathname()

    // lang de <html> : la langue choisie sur les pages localisées, le français ailleurs
    useEffect(() => {
        document.documentElement.setAttribute("lang", LOCALIZED_PATHS.has(pathname) ? language : "fr")
    }, [language, pathname])

    const setLanguage = useCallback((lang: Language) => {
        try {
            localStorage.setItem(LANGUAGE_KEY, lang)
        } catch {
            // stockage indisponible (navigation privée) : la langue vaut pour la session
        }
        document.documentElement.setAttribute("data-lang", lang)
        listeners.forEach((l) => l())
    }, [])

    const value = useMemo(() => ({ language, setLanguage }), [language, setLanguage])

    return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
    const context = useContext(LanguageContext)
    if (context === undefined) {
        throw new Error("useLanguage must be used within a LanguageProvider")
    }
    return context
}
